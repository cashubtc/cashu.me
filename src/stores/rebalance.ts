import { defineStore } from "pinia";
import { useMintsStore, MintClass } from "./mints";
import { useSettingsStore } from "./settings";
import { useWalletStore } from "./wallet";
import { useSwapStore } from "./swap";

export type TargetConfig = { url: string; targetPct: number; enabled: boolean };
export type Allocation = { url: string; current: number; target: number; delta: number };
export type Transfer = { fromUrl: string; toUrl: string; amount: number };
export type Plan = { unit: string; transfers: Transfer[]; totalMove: number };

function normalizeTargets(targets: TargetConfig[]): TargetConfig[] {
  const enabled = targets.filter((t) => t.enabled);
  const sum = enabled.reduce((s, t) => s + t.targetPct, 0) || 1;
  return targets.map((t) =>
    t.enabled ? { ...t, targetPct: (t.targetPct / sum) * 100 } : t
  );
}

export const useRebalanceStore = defineStore("rebalance", {
  state: () => ({
    running: false as boolean,
    lastError: "" as string,
  }),
  actions: {
    getReliableTargets(unit: string): TargetConfig[] {
      const settings = useSettingsStore();
      const raw = settings.reliableMintsByUnit[unit] || [];
      // normalize to 100 across enabled
      return normalizeTargets(raw);
    },
    computeTotalBalance(unit: string): number {
      const mints = useMintsStore();
      return mints.totalUnitBalance; // already per activeUnit, but we assume caller uses active unit
    },
    currentBalances(unit: string): Record<string, number> {
      const mints = useMintsStore();
      const map: Record<string, number> = {};
      mints.mints.forEach((m) => {
        map[m.url] = new MintClass(m).unitBalance(unit);
      });
      return map;
    },
    targetsFromPct(total: number, targets: TargetConfig[]): Record<string, number> {
      const out: Record<string, number> = {};
      targets.forEach((t) => {
        if (t.enabled) out[t.url] = Math.round((total * t.targetPct) / 100);
      });
      return out;
    },
    deviations(
      current: Record<string, number>,
      targets: Record<string, number>
    ): Allocation[] {
      const urls = Array.from(new Set([...Object.keys(current), ...Object.keys(targets)]));
      return urls.map((url) => {
        const c = current[url] || 0;
        const tg = targets[url] || 0;
        return { url, current: c, target: tg, delta: c - tg };
      });
    },
    isUnbalanced(
      allocations: Allocation[],
      tolerancePct: number,
      total: number
    ): boolean {
      if (total <= 0) return false;
      for (const a of allocations) {
        const currentPct = (a.current / total) * 100;
        const targetPct = total > 0 ? (a.target / total) * 100 : 0;
        if (Math.abs(currentPct - targetPct) > tolerancePct) return true;
      }
      return false;
    },
    buildPlan(
      allocations: Allocation[],
      minAmount: number
    ): Plan {
      const over = allocations
        .filter((a) => a.delta > 0)
        .sort((a, b) => b.delta - a.delta);
      const under = allocations
        .filter((a) => a.delta < 0)
        .sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta));

      const transfers: Transfer[] = [];
      let totalMove = 0;

      let i = 0;
      let j = 0;
      while (i < over.length && j < under.length) {
        const o = over[i];
        const u = under[j];
        const need = Math.min(o.delta, Math.abs(u.delta));
        const amt = Math.floor(need);
        if (amt >= minAmount) {
          transfers.push({ fromUrl: o.url, toUrl: u.url, amount: amt });
          totalMove += amt;
        }
        o.delta -= amt;
        u.delta += amt;
        if (o.delta <= 0) i++;
        if (u.delta >= 0) j++;
      }
      const unit = useMintsStore().activeUnit;
      return { unit, transfers, totalMove };
    },
    async maybeRebalance(unit?: string) {
      const settings = useSettingsStore();
      const mints = useMintsStore();
      const wallet = useWalletStore();
      const swap = useSwapStore();

      if (!settings.autoRebalanceEnabled) return;
      if (this.running || settings.rebalanceBlocking) return;
      if (swap.swapBlocking) return;
      if (Date.now() - settings.lastRebalanceAt < settings.autoRebalanceThrottleSec * 1000)
        return;

      const activeUnit = unit || mints.activeUnit;
      const targets = this.getReliableTargets(activeUnit).filter((t) => t.enabled);
      if (targets.length < 2) return;

      const total = this.computeTotalBalance(activeUnit);
      if (total <= settings.autoRebalanceMinAmount) return;

      const current = this.currentBalances(activeUnit);
      const targetAmounts = this.targetsFromPct(total, targets);
      const allocs = this.deviations(current, targetAmounts);
      if (!this.isUnbalanced(allocs, settings.autoRebalanceTolerancePct, total)) return;

      const plan = this.buildPlan(allocs, settings.autoRebalanceMinAmount);
      if (plan.transfers.length === 0) return;

      this.running = true;
      settings.rebalanceBlocking = true;
      try {
        // Execute with simple fee-cap preflight per transfer
        for (const t of plan.transfers) {
          // Create destination invoice and source quote to check fee ratio
          const toWallet = wallet.mintWallet(t.toUrl, activeUnit);
          const fromWallet = wallet.mintWallet(t.fromUrl, activeUnit);
          const mintQuote = await wallet.requestMint(t.amount, toWallet);
          const meltQuote = await wallet.meltQuote(fromWallet, mintQuote.request);
          const feePct = (meltQuote.fee_reserve / t.amount) * 100;
          if (feePct > settings.autoRebalanceFeeCapPct) {
            // Skip this transfer if too expensive; leave pending invoice record as-is
            continue;
          }
          await swap.mintAmountSwap({ fromUrl: t.fromUrl, toUrl: t.toUrl, amount: t.amount });
        }
        settings.lastRebalanceAt = Date.now();
      } catch (e: any) {
        console.error("Auto-rebalance failed", e);
        this.lastError = e?.message || String(e);
        throw e;
      } finally {
        settings.rebalanceBlocking = false;
        this.running = false;
      }
    },
  },
});
