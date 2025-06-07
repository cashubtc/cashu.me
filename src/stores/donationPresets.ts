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
  state: () => ({
    presets: useLocalStorage<DonationPreset[]>(
      "cashu.donationPresets",
      DEFAULT_PRESETS,
    ),
  }),
  actions: {
    async createDonationPreset(
      months: number | undefined,
      amount: number,
      pubkey: string,
      bucketId: string = DEFAULT_BUCKET_ID,
      startDate?: number,
    ): Promise<string> {
      const walletStore = useWalletStore();
      const proofsStore = useProofsStore();
      const mintsStore = useMintsStore();
      const lockedStore = useLockedTokensStore();

      const wallet = walletStore.wallet;
      const proofs = mintsStore.activeProofs.filter(
        (p) => p.bucketId === bucketId,
      );

      if (!months || months <= 0) {
        const { sendProofs } = await walletStore.sendToLock(
          proofs,
          wallet,
          amount,
          pubkey,
          bucketId,
        );
        return proofsStore.serializeProofs(sendProofs);
      }

      const tokens: string[] = [];
      const base =
        startDate ?? Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
      for (let i = 0; i < months; i++) {
        const locktime = base + i * 30 * 24 * 60 * 60;
        const { sendProofs } = await walletStore.sendToLock(
          proofs,
          wallet,
          amount,
          pubkey,
          bucketId,
          locktime,
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
      }
      return tokens.join("\n");
    },
  },
});

export const DEFAULT_DONATION_PRESETS = DEFAULT_PRESETS;
