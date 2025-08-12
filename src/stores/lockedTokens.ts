import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { v4 as uuidv4 } from "uuid";
import { cashuDb } from "./dexie";

export type LockedToken = {
  id: string;
  amount: number;
  token: string;
  tokenString: string;
  pubkey: string;
  creatorP2PK?: string;
  unlockTs?: number;
  label?: string;
  locktime?: number;
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
    validTokensForTier: (state) => (creatorPubkey: string, tierId: string) => {
      const now = Math.floor(Date.now() / 1000);
      return state.lockedTokens.filter(
        (t) =>
          t.bucketId === tierId &&
          t.pubkey === creatorPubkey &&
          (!t.locktime || t.locktime <= now),
      );
    },
  },
  actions: {
    addLockedToken(
      data: Omit<LockedToken, "id" | "date" | "label"> & {
        date?: string;
        label?: string;
      },
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
    async addMany(arr: LockedToken[]) {
      await cashuDb.lockedTokens.bulkAdd(arr as any);
    },
    deleteLockedToken(id: string) {
      const idx = this.lockedTokens.findIndex((t) => t.id === id);
      if (idx >= 0) this.lockedTokens.splice(idx, 1);
    },
  },
});
