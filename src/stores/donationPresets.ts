import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { useWalletStore } from "./wallet";
import { useMintsStore } from "./mints";
import { useProofsStore } from "./proofs";
import { useLockedTokensStore } from "./lockedTokens";
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
    async createDonationPreset(
      months: number | undefined,
      amount: number,
      pubkey: string,
      bucketId: string = DEFAULT_BUCKET_ID,
      startDate?: number
    ): Promise<string> {
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
        return proofsStore.serializeProofs(sendProofs);
      }

      const tokens: string[] = [];
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
        tokens.push(token);
        lockedStore.addLockedToken({
          amount,
          token,
          pubkey,
          locktime,
          bucketId,
        });
        await proofsStore.updateActiveProofs();
        proofs = mintsStore.activeProofs.filter((p) => p.bucketId === bucketId);
      }
      return tokens.join("\n");
    },
  },
});

export const DEFAULT_DONATION_PRESETS = DEFAULT_PRESETS;
