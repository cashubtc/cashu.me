import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { v4 as uuidv4 } from "uuid";

export type LockedToken = {
  id: string;
  amount: number;
  token: string;
  pubkey: string;
  label?: string;
  locktime?: number;
  refundPubkey?: string;
  bucketId: string;
  date: string;
};

export const useLockedTokensStore = defineStore("lockedTokens", {
  state: () => ({
    lockedTokens: useLocalStorage<LockedToken[]>("cashu.lockedTokens", []),
  }),
  getters: {
    tokensByBucket: (state) => (bucketId: string) =>
      state.lockedTokens.filter((t) => t.bucketId === bucketId),
    validTokensForTier:
      (state) => (creatorPubkey: string, tierId: string) => {
        const now = Math.floor(Date.now() / 1000);
        return state.lockedTokens.filter(
          (t) =>
            t.bucketId === tierId &&
            t.pubkey === creatorPubkey &&
            (!t.locktime || t.locktime <= now)
        );
      },
  },
  actions: {
    addLockedToken(
      data: Omit<LockedToken, "id" | "date" | "label"> & {
        date?: string;
        label?: string;
      }
    ) {
      const token: LockedToken = {
        id: uuidv4(),
        date: data.date || new Date().toISOString(),
        ...data,
        label: data.label ?? "Locked tokens",
      };
      this.lockedTokens.push(token);
      return token;
    },
    deleteLockedToken(id: string) {
      const idx = this.lockedTokens.findIndex((t) => t.id === id);
      if (idx >= 0) this.lockedTokens.splice(idx, 1);
    },
  },
});
