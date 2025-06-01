import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { v4 as uuidv4 } from "uuid";
import { cashuDb } from "./dexie";
import { useProofsStore } from "./proofs";
import { useTokensStore } from "./tokens";
import { useLockedTokensStore } from "./lockedTokens";
import { ref, watch } from "vue";
import { notifySuccess } from "src/js/notify";

export type Bucket = {
  id: string;
  name: string;
  color?: string;
  description?: string;
  goal?: number;
};

export const DEFAULT_BUCKET_ID = "unassigned";
export const DEFAULT_BUCKET_NAME = "Default";

function ensureDefaultBucket(buckets: { value: Bucket[] }) {
  if (!buckets.value.find((b) => b.id === DEFAULT_BUCKET_ID)) {
    buckets.value.unshift({ id: DEFAULT_BUCKET_ID, name: DEFAULT_BUCKET_NAME });
  }
}

export const useBucketsStore = defineStore("buckets", {
  state: () => {
    const buckets = useLocalStorage<Bucket[]>("cashu.buckets", [
      { id: DEFAULT_BUCKET_ID, name: DEFAULT_BUCKET_NAME },
    ]);
    const proofsStore = useProofsStore();
    const notifiedGoals = ref<Record<string, boolean>>({});

    ensureDefaultBucket(buckets);

    watch(
      () => proofsStore.proofs,
      () => {
        buckets.value.forEach((bucket) => {
          if (!bucket.goal) return;
          const sum = proofsStore.proofs
            .filter((p) => p.bucketId === bucket.id && !p.reserved)
            .reduce((s, p) => s + p.amount, 0);
          if (sum >= bucket.goal && !notifiedGoals.value[bucket.id]) {
            notifySuccess(`Bucket ${bucket.name} goal reached!`);
            notifiedGoals.value[bucket.id] = true;
          }
        });
      },
      { deep: true }
    );

    watch(
      buckets,
      (newBuckets, oldBuckets) => {
        newBuckets.forEach((bucket) => {
          if (bucket.goal === undefined || bucket.goal === null) return;
          const previous = oldBuckets.find((b) => b.id === bucket.id);
          if (!previous || previous.goal === bucket.goal) return;
          const sum = proofsStore.proofs
            .filter((p) => p.bucketId === bucket.id && !p.reserved)
            .reduce((s, p) => s + p.amount, 0);
          if (bucket.goal <= sum) {
            notifiedGoals.value[bucket.id] = false;
          }
        });
      },
      { deep: true }
    );

    return {
      buckets,
      notifiedGoals,
    };
  },
  getters: {
    bucketList(state): Bucket[] {
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
    lockedBucketBalance: () => (bucketId: string): number => {
      const ltStore = useLockedTokensStore();
      return ltStore.lockedTokens
        .filter((t) => t.bucketId === bucketId)
        .reduce((sum, t) => sum + t.amount, 0);
    },
    lockedBucketBalances(): Record<string, number> {
      const ltStore = useLockedTokensStore();
      const balances: Record<string, number> = {};
      this.bucketList.forEach((bucket) => {
        balances[bucket.id] = ltStore.lockedTokens
          .filter((t) => t.bucketId === bucket.id)
          .reduce((sum, t) => sum + t.amount, 0);
      });
      return balances;
    },
  },
  actions: {
    addBucket(bucket: Omit<Bucket, "id">): Bucket | undefined {
      // basic validation
      if (!bucket.name || bucket.name.trim().length === 0) {
        return;
      }
      if (
        typeof bucket.goal === "number" &&
        bucket.goal !== null &&
        bucket.goal < 0
      ) {
        return;
      }

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
        const tokensStore = useTokensStore();
        tokensStore.changeHistoryTokenBucket({
          oldBucketId: id,
          newBucketId: DEFAULT_BUCKET_ID,
        });
      }
      this.buckets.splice(index, 1);
    },
  },
});
