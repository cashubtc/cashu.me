import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { useWalletStore } from "./wallet";
import { useMintsStore } from "./mints";
import { useProofsStore } from "./proofs";
import { useLockedTokensStore, LockedToken } from "./lockedTokens";
import { DEFAULT_BUCKET_ID } from "./buckets";

export type DonationPreset = {
  months: number;
};

const DEFAULT_PRESETS: DonationPreset[] = [
  { months: 1 },
  { months: 3 },
  { months: 6 },
  { months: 12 },
];

export const useDonationPresetsStore = defineStore("donationPresets", {
  state: () => {
    const presets = useLocalStorage<DonationPreset[]>(
      "cashu.donationPresets",
      DEFAULT_PRESETS
    );
    if (!presets.value.find((p) => p.months === 1)) {
      presets.value.unshift({ months: 1 });
    }
    return { presets };
  },
  actions: {
    /**
     * Create a new donation preset by locking ecash. When `detailed` is
     * `true` an array of {@link LockedToken} entries is returned. Otherwise
     * the function returns the serialized token(s) as a single string.
     */
    async createDonationPreset(
      months: number | undefined,
      amount: number,
      pubkey: string,
      bucketId: string = DEFAULT_BUCKET_ID,
      startDate?: number,
      detailed = false
    ): Promise<string | LockedToken[]> {
      const walletStore = useWalletStore();
      const proofsStore = useProofsStore();
      const mintsStore = useMintsStore();
      const lockedStore = useLockedTokensStore();

      const wallet = walletStore.wallet;
      let proofs = mintsStore.activeProofs.filter(
        (p) => p.bucketId === bucketId
      );

      const totalAmount = !months || months <= 0 ? amount : amount * months;
      const available = proofs.reduce((s, p) => s + p.amount, 0);
      if (available < totalAmount) {
        throw new Error('Insufficient balance');
      }

      if (!months || months <= 0) {
        const { sendProofs } = await walletStore.sendToLock(
          proofs,
          wallet,
          amount,
          pubkey,
          bucketId
        );
        const token = proofsStore.serializeProofs(sendProofs);
        if (detailed) {
          return [
            lockedStore.addLockedToken({ amount, token, pubkey, bucketId }),
          ];
        }
        return token;
      }

      const tokens: LockedToken[] = [];
      const base = startDate ?? Math.floor(Date.now() / 1000);
      for (let i = 0; i < months; i++) {
        const locktime = base + i * 30 * 24 * 60 * 60;
        const { sendProofs } = await walletStore.sendToLock(
          proofs,
          wallet,
          amount,
          pubkey,
          bucketId,
          locktime
        );
        const token = proofsStore.serializeProofs(sendProofs);
        const locked = lockedStore.addLockedToken({
          amount,
          token,
          pubkey,
          locktime,
          bucketId,
        });
        tokens.push(locked);
        await proofsStore.updateActiveProofs();
        proofs = mintsStore.activeProofs.filter((p) => p.bucketId === bucketId);
      }
      return detailed ? tokens : tokens.map((t) => t.token).join("\n");
    },
  },
});

export const DEFAULT_DONATION_PRESETS = DEFAULT_PRESETS;
