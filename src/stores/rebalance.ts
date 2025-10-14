import { defineStore } from "pinia";
import { useMintsStore, MintClass } from "./mints";
import { useSettingsStore } from "./settings";
import { useWalletStore } from "./wallet";
import { useSwapStore } from "./swap";
import { notifyWarning, notifySuccess } from "../js/notify";
import { i18n } from "../boot/i18n";

export type TargetConfig = { url: string; targetPct: number; enabled: boolean };
export type Allocation = {
  url: string;
  current: number;
  target: number;
  delta: number;
};
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
    showRebalancePrompt: false as boolean,
    rebalancePlan: null as Plan | null,
    rebalanceInProgress: false as boolean,
    currentTransferStatus: "" as string,
    completedTransfers: 0 as number,
    totalTransfers: 0 as number,
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
    targetsFromPct(
      total: number,
      targets: TargetConfig[]
    ): Record<string, number> {
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
      const urls = Array.from(
        new Set([...Object.keys(current), ...Object.keys(targets)])
      );
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
    buildPlan(allocations: Allocation[], minAmount: number): Plan {
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
    /**
     * Detects if rebalancing is needed and prompts the user
     * Called after mint/melt/receive operations
     */
    async checkAndPromptRebalance(unit?: string) {
      const settings = useSettingsStore();
      const mints = useMintsStore();
      const swap = useSwapStore();

      // Don't prompt if feature is disabled or conditions aren't met
      if (!settings.autoRebalanceEnabled) return;
      if (this.running || settings.rebalanceBlocking) return;
      if (swap.swapBlocking) return;
      if (this.showRebalancePrompt) return; // Already showing prompt
      if (
        Date.now() - settings.lastRebalanceAt <
        settings.autoRebalanceThrottleSec * 1000
      )
        return;

      const activeUnit = unit || mints.activeUnit;
      const targets = this.getReliableTargets(activeUnit).filter(
        (t) => t.enabled
      );
      if (targets.length < 2) return;

      const total = this.computeTotalBalance(activeUnit);
      if (total <= settings.autoRebalanceMinAmount) return;

      const current = this.currentBalances(activeUnit);
      const targetAmounts = this.targetsFromPct(total, targets);
      const allocs = this.deviations(current, targetAmounts);
      if (!this.isUnbalanced(allocs, settings.autoRebalanceTolerancePct, total))
        return;

      const plan = this.buildPlan(allocs, settings.autoRebalanceMinAmount);
      if (plan.transfers.length === 0) return;

      // Store the plan and show the prompt
      this.rebalancePlan = plan;
      this.showRebalancePrompt = true;
    },

    /**
     * Execute the rebalance plan
     * Called when user accepts the rebalance prompt
     */
    async executeRebalance() {
      if (!this.rebalancePlan || this.rebalancePlan.transfers.length === 0) {
        console.error("No rebalance plan to execute");
        return;
      }

      const settings = useSettingsStore();
      const wallet = useWalletStore();
      const swap = useSwapStore();

      this.rebalanceInProgress = true;
      this.running = true;
      settings.rebalanceBlocking = true;
      this.completedTransfers = 0;
      this.totalTransfers = this.rebalancePlan.transfers.length;

      try {
        const activeUnit = this.rebalancePlan.unit;

        // Step 1: Get all quotes sequentially (can't be parallelized)
        this.currentTransferStatus = "Getting quotes from mints...";
        const quotePairs: Array<{
          transfer: Transfer;
          mintQuote: any;
          meltQuote: any;
          feePct: number;
        }> = [];
        const skippedTransfers: Array<{ index: number; reason: string }> = [];

        for (let i = 0; i < this.rebalancePlan.transfers.length; i++) {
          const t = this.rebalancePlan.transfers[i];
          this.currentTransferStatus = `Getting quote ${i + 1}/${
            this.rebalancePlan.transfers.length
          }...`;

          try {
            // Create destination invoice
            const toWallet = wallet.mintWallet(t.toUrl, activeUnit);
            const mintQuote = await wallet.requestMint(t.amount, toWallet);

            // Get source quote to check fee ratio
            const fromWallet = wallet.mintWallet(t.fromUrl, activeUnit);
            const meltQuote = await wallet.meltQuote(
              fromWallet,
              mintQuote.request
            );
            const feePct = (meltQuote.fee_reserve / t.amount) * 100;

            if (feePct > settings.autoRebalanceFeeCapPct) {
              const errorMsg = `Transfer ${i + 1} skipped: fee ${feePct.toFixed(
                2
              )}% exceeds cap of ${settings.autoRebalanceFeeCapPct}%`;
              console.error(errorMsg);
              skippedTransfers.push({
                index: i + 1,
                reason: `High fee: ${feePct.toFixed(2)}%`,
              });
              continue; // Skip transfers that exceed fee cap, but continue with others
            }

            quotePairs.push({ transfer: t, mintQuote, meltQuote, feePct });
          } catch (e) {
            const errorMsg = `Failed to get quotes for transfer ${i + 1}: ${e}`;
            console.error(errorMsg);
            skippedTransfers.push({
              index: i + 1,
              reason: `Quote failed: ${e}`,
            });
            // Continue with other transfers
          }
        }

        // Step 2: Execute all transfers sequentially (swapBlocking prevents parallel execution)
        this.currentTransferStatus = "Executing transfers...";
        const results: Array<{ success: boolean; index: number; error?: any }> =
          [];

        for (let i = 0; i < quotePairs.length; i++) {
          const pair = quotePairs[i];
          this.currentTransferStatus = `Transfer ${i + 1}/${
            quotePairs.length
          }: ${pair.transfer.amount} from ${pair.transfer.fromUrl
            .split("/")
            .pop()} to ${pair.transfer.toUrl.split("/").pop()}...`;

          try {
            // Label the invoices for crash recovery
            // The mintQuote invoice already exists in invoiceHistory from requestMint()
            // We need to add a label so we know it's part of a rebalance
            const mintInvoice = wallet.invoiceHistory.find(
              (inv) => inv.quote === pair.mintQuote.quote
            );
            if (mintInvoice) {
              mintInvoice.label = `Rebalance: → ${pair.transfer.toUrl
                .split("/")
                .pop()}`;
            }

            // Execute the melt with the pre-fetched quotes
            const fromWallet = wallet.mintWallet(
              pair.transfer.fromUrl,
              activeUnit
            );
            const mints = useMintsStore();
            const mint = mints.mints.find(
              (m) => m.url === pair.transfer.fromUrl
            );
            if (!mint) {
              throw new Error("Source mint not found");
            }
            const mintProofs = mints.mintUnitProofs(mint, fromWallet.unit);

            // Set payInvoiceData so melt() can use it for history tracking
            wallet.payInvoiceData.input.request = pair.mintQuote.request;

            // Execute melt (this will add the meltQuote to invoiceHistory)
            await wallet.melt(mintProofs, pair.meltQuote, fromWallet, true); // silent=true

            // Label the melt invoice entry for crash recovery
            const meltInvoice = wallet.invoiceHistory.find(
              (inv) => inv.quote === pair.meltQuote.quote
            );
            if (meltInvoice) {
              meltInvoice.label = `Rebalance: ${pair.transfer.fromUrl
                .split("/")
                .pop()} →`;
            }

            // Check if the destination mint received the payment
            await wallet.checkInvoice(pair.mintQuote.quote, false, false); // verbose=false, hideInvoiceDetailsOnMint=false

            this.completedTransfers++;
            results.push({ success: true, index: i });
          } catch (e) {
            console.error(`Transfer ${i + 1} failed:`, e);
            results.push({ success: false, index: i, error: e });
            // Continue with remaining transfers even if one fails
          }
        }

        const successCount = results.filter((r) => r.success).length;
        const failedCount = results.filter((r) => !r.success).length;
        const totalPlanned = this.rebalancePlan.transfers.length;

        console.log(
          `Rebalance completed: ${successCount}/${quotePairs.length} transfers successful`
        );
        if (skippedTransfers.length > 0) {
          console.error(
            `${skippedTransfers.length} transfers skipped:`,
            skippedTransfers
          );
        }

        settings.lastRebalanceAt = Date.now();
        this.lastError = "";

        // Build success message with warnings if applicable
        let statusMsg = `✓ Rebalance completed: ${successCount}/${totalPlanned} transfers successful`;
        if (skippedTransfers.length > 0 || failedCount > 0) {
          const issues = [];
          if (skippedTransfers.length > 0)
            issues.push(`${skippedTransfers.length} skipped`);
          if (failedCount > 0) issues.push(`${failedCount} failed`);
          statusMsg = `⚠ Rebalance completed with warnings: ${successCount}/${totalPlanned} successful (${issues.join(
            ", "
          )})`;
        }
        this.currentTransferStatus = statusMsg;

        // Delay closing the dialog so user can see the success message
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Close the dialog
        this.showRebalancePrompt = false;

        // Show notification based on results
        if (successCount === totalPlanned) {
          notifySuccess(
            i18n.global.t("rebalance.notifications.completed_success", {
              count: successCount,
            })
          );
        } else if (successCount > 0) {
          // Build details string
          const details = [];
          if (skippedTransfers.length > 0) {
            details.push(
              `${skippedTransfers.length} skipped due to high fees.`
            );
          }
          if (failedCount > 0) {
            details.push(`${failedCount} failed.`);
          }
          notifyWarning(
            i18n.global.t("rebalance.notifications.completed_with_issues", {
              successCount,
              totalPlanned,
              details: details.join(" "),
            })
          );
        } else {
          const reason =
            skippedTransfers.length > 0
              ? `All ${skippedTransfers.length} transfer(s) skipped due to high fees.`
              : "Check console for details.";
          notifyWarning(
            i18n.global.t("rebalance.notifications.completed_failed", {
              reason,
            })
          );
        }
      } catch (e: any) {
        console.error("Rebalance execution failed", e);
        this.lastError = e?.message || String(e);
        throw e;
      } finally {
        settings.rebalanceBlocking = false;
        this.running = false;
        this.rebalanceInProgress = false;
        this.rebalancePlan = null;
        this.currentTransferStatus = "";
        this.completedTransfers = 0;
        this.totalTransfers = 0;
      }
    },

    /**
     * Manual rebalance trigger (for settings button)
     */
    async manualRebalance(unit?: string) {
      await this.checkAndPromptRebalance(unit);
    },
  },
});
