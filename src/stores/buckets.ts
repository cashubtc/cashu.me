import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { v4 as uuidv4 } from "uuid";
import { cashuDb } from "./dexie";
import { useProofsStore } from "./proofs";

export type Bucket = {
  id: string;
  name: string;
  color?: string;
  description?: string;
  goal?: number;
};

export const DEFAULT_BUCKET_ID = "unassigned";
export const DEFAULT_BUCKET_NAME = "Unassigned";

export const useBucketsStore = defineStore("buckets", {
  state: () => ({
    buckets: useLocalStorage<Bucket[]>("cashu.buckets", [
      { id: DEFAULT_BUCKET_ID, name: DEFAULT_BUCKET_NAME },
    ]),
  }),
  getters: {
    bucketList(state): Bucket[] {
      // ensure default bucket always exists
      if (!state.buckets.find((b) => b.id === DEFAULT_BUCKET_ID)) {
        state.buckets.unshift({
          id: DEFAULT_BUCKET_ID,
          name: DEFAULT_BUCKET_NAME,
        });
      }
      return state.buckets;
    },
    bucketBalance: () => (bucketId: string): number => {
      const proofsStore = useProofsStore();
      return proofsStore.proofs
        .filter((p) => p.bucketId === bucketId && !p.reserved)
        .reduce((sum, p) => sum + p.amount, 0);
    },
    bucketBalances(): Record<string, number> {
      const proofsStore = useProofsStore();
      const balances: Record<string, number> = {};
      this.bucketList.forEach((bucket) => {
        balances[bucket.id] = proofsStore.proofs
          .filter((p) => p.bucketId === bucket.id && !p.reserved)
          .reduce((sum, p) => sum + p.amount, 0);
      });
      return balances;
    },
  },
  actions: {
    addBucket(bucket: Omit<Bucket, "id">): Bucket {
      const newBucket: Bucket = { id: uuidv4(), ...bucket };
      this.buckets.push(newBucket);
      return newBucket;
    },
    editBucket(id: string, updates: Partial<Omit<Bucket, "id">>) {
      const index = this.buckets.findIndex((b) => b.id === id);
      if (index === -1) return;
      if (id === DEFAULT_BUCKET_ID) return;
      this.buckets[index] = { ...this.buckets[index], ...updates };
    },
    async deleteBucket(id: string) {
      if (id === DEFAULT_BUCKET_ID) return;
      const index = this.buckets.findIndex((b) => b.id === id);
      if (index === -1) return;
      // reassign proofs to default bucket
      const proofsStore = useProofsStore();
      const proofs = proofsStore.proofs.filter((p) => p.bucketId === id);
      if (proofs.length) {
        await cashuDb.transaction("rw", cashuDb.proofs, async () => {
          for (const proof of proofs) {
            await cashuDb.proofs.update(proof.secret, {
              bucketId: DEFAULT_BUCKET_ID,
            });
          }
        });
      }
      this.buckets.splice(index, 1);
    },
  },
});
