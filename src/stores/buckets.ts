import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { v4 as uuidv4 } from "uuid";
import { cashuDb } from "./dexie";
import { useProofsStore } from "./proofs";
import { useTokensStore } from "./tokens";
import { useLockedTokensStore } from "./lockedTokens";
import { ref, watch } from "vue";
import { notifySuccess } from "src/js/notify";
import { Bucket, BucketRule } from "src/types/buckets";
import { DEFAULT_BUCKET_ID, DEFAULT_BUCKET_NAME } from "@/constants/buckets";

export const COLOR_PALETTE = [
  "#ec4899",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
];

export function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % COLOR_PALETTE.length;
  return COLOR_PALETTE[idx];
}

function ensureDefaultBucket(buckets: { value: Bucket[] }) {
  if (!buckets.value.find((b) => b.id === DEFAULT_BUCKET_ID)) {
    buckets.value.unshift({
      id: DEFAULT_BUCKET_ID,
      name: DEFAULT_BUCKET_NAME,
      isArchived: false,
    });
  }
}

export const useBucketsStore = defineStore("buckets", {
  state: () => {
    const buckets = useLocalStorage<Bucket[]>("cashu.buckets", [
      { id: DEFAULT_BUCKET_ID, name: DEFAULT_BUCKET_NAME, isArchived: false },
    ]);
    const proofsStore = useProofsStore();
    const notifiedGoals = ref<Record<string, boolean>>({});
    const autoAssignRules = useLocalStorage<BucketRule[]>(
      "cashu.bucketRules",
      []
    );

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
      autoAssignRules,
    };
  },
  getters: {
    bucketList(state): Bucket[] {
      return state.buckets;
    },
    activeBuckets(state): Bucket[] {
      return state.buckets.filter((b) => !b.isArchived);
    },
    archivedBuckets(state): Bucket[] {
      return state.buckets.filter((b) => b.isArchived);
    },
    bucketBalance:
      () =>
      (bucketId: string): number => {
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
    lockedBucketBalance:
      () =>
      (bucketId: string): number => {
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
    totalActiveBalance(): number {
      const balances = this.bucketBalances;
      return this.activeBuckets.reduce(
        (sum, b) => sum + (balances[b.id] || 0),
        0
      );
    },
    activeCount(): number {
      return this.activeBuckets.length;
    },
    autoBucketFor:
      (state) =>
      (mint?: string, memo?: string): string | undefined => {
        return state.autoAssignRules.find((r) => {
          const mintMatch = r.mint ? r.mint === mint : true;
          const memoMatch = r.memo
            ? r.memo.toLowerCase() === (memo ?? "").toLowerCase()
            : true;
          return mintMatch && memoMatch;
        })?.bucketId;
      },
  },
  actions: {
    /** Ensure we have (or create) a bucket dedicated to a creator npub */
    ensureCreatorBucket(creatorPubkey: string): string {
      const existing = this.buckets.find(
        (b) => b.creatorPubkey === creatorPubkey
      );
      if (existing) return existing.id;

      const id = uuidv4();
      this.buckets.push({
        id,
        name: creatorPubkey.slice(0, 8), // short label
        creatorPubkey,
        isArchived: false,
      });
      return id;
    },
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

      const newBucket: Bucket = {
        id: uuidv4(),
        isArchived: false,
        color: bucket.color || hashColor(bucket.name),
        ...bucket,
      };
      this.buckets.push(newBucket);
      return newBucket;
    },
    editBucket(id: string, updates: Partial<Omit<Bucket, "id">>) {
      const index = this.buckets.findIndex((b) => b.id === id);
      if (index === -1) return;
      if (id === DEFAULT_BUCKET_ID) return;
      const current = this.buckets[index];
      const next: Bucket = {
        ...current,
        ...updates,
        isArchived:
          updates.isArchived !== undefined
            ? updates.isArchived
            : current.isArchived ?? false,
      };
      this.buckets[index] = next;
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
      this.autoAssignRules = this.autoAssignRules.filter(
        (r) => r.bucketId !== id
      );
    },
    addAutoRule(rule: Omit<BucketRule, "id">): BucketRule | undefined {
      if (!rule.bucketId) return;
      if (!this.buckets.find((b) => b.id === rule.bucketId)) return;
      if (!rule.mint && !rule.memo) return;
      const newRule: BucketRule = { id: uuidv4(), ...rule };
      this.autoAssignRules.push(newRule);
      return newRule;
    },
    deleteAutoRule(id: string) {
      const idx = this.autoAssignRules.findIndex((r) => r.id === id);
      if (idx >= 0) this.autoAssignRules.splice(idx, 1);
    },
    editAutoRule(id: string, updates: Partial<Omit<BucketRule, "id">>) {
      const idx = this.autoAssignRules.findIndex((r) => r.id === id);
      if (idx === -1) return;
      this.autoAssignRules[idx] = { ...this.autoAssignRules[idx], ...updates };
    },
  },
});
