import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { v4 as uuidv4 } from "uuid";

export type LockedToken = {
  id: string;
  amount: number;
  token: string;
  pubkey: string;
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
  },
  actions: {
    addLockedToken(data: Omit<LockedToken, "id" | "date"> & { date?: string }) {
      const token: LockedToken = {
        id: uuidv4(),
        date: data.date || new Date().toISOString(),
        ...data,
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
