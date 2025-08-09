import { defineStore } from "pinia";
import { cashuDb } from "./dexie";
import { liveQuery } from "dexie";
import { computed, ref, watch } from "vue";
import { useCreatorsStore } from "./creators";
import type { NDKUserProfile } from "@nostr-dev-kit/ndk";

export type Frequency = "weekly" | "biweekly" | "monthly";
export type Status = "active" | "pending" | "ended";

function daysToFrequency(days: number): Frequency {
  if (days === 7) return "weekly";
  if (days === 14) return "biweekly";
  return "monthly";
}

export interface CreatorSubscription {
  subscriptionId: string;
  subscriberNpub: string;
  profile?: NDKUserProfile;
  tierId: string;
  tierName: string;
  amountPerInterval?: number;
  totalAmount: number;
  intervalDays: 7 | 14 | 30;
  frequency: Frequency;
  status: Status;
  startDate: number | null;
  nextRenewal: number | null;
  endDate: number | null;

  // computed for UI
  nextRenewalProgress?: number;
  dueSoon?: boolean;

  // legacy fields (still used for calculation)
  totalPeriods: number | null;
  receivedPeriods: number;
  remainingPeriods: number;
}

export const useCreatorSubscriptionsStore = defineStore(
  "creatorSubscriptions",
  () => {
    const subscriptions = ref<CreatorSubscription[]>([]);
    const loading = ref(true);
    const creatorsStore = useCreatorsStore();

    const FALLBACK_TIER_NAME = "Unknown Tier";

    function resolveTierName(tierId: string): string {
      for (const tiers of Object.values(creatorsStore.tiersMap)) {
        const match = tiers.find((t) => t.id === tierId);
        if (match) return match.name;
      }
      return FALLBACK_TIER_NAME;
    }

    function fillMissingTierNames() {
      subscriptions.value.forEach((sub) => {
        if (!sub.tierName || sub.tierName === FALLBACK_TIER_NAME) {
          sub.tierName = resolveTierName(sub.tierId);
        }
      });
    }

    liveQuery(() =>
      cashuDb.lockedTokens
        .where("owner")
        .equals("creator")
        .and((t) => !!t.subscriptionId)
        .toArray(),
    ).subscribe({
      next: (rows) => {
        const map = new Map<
          string,
          Omit<
            CreatorSubscription,
            | "status"
            | "nextRenewalProgress"
            | "dueSoon"
            | "amountPerInterval"
            | "frequency"
          > & {
            earliestUnlock: number | null;
            latestUnlock: number | null;
            status_temp: "pending" | "active";
          }
        >();
        for (const row of rows) {
          const id = row.subscriptionId!;
          const intervalDays = (row.intervalDays ?? 30) as 7 | 14 | 30;
          let sub = map.get(id);
          if (!sub) {
            sub = {
              subscriptionId: id,
              subscriberNpub: row.subscriberNpub || "",
              tierId: row.tierId,
              tierName:
                row.tierName ||
                creatorsStore.tiersMap[row.creatorNpub || ""]?.find(
                  (t) => t.id === row.tierId,
                )?.name ||
                FALLBACK_TIER_NAME,
              intervalDays,
              totalPeriods: row.totalPeriods ?? null,
              receivedPeriods: 0,
              remainingPeriods: 0,
              totalAmount: 0,
              status_temp: "pending",
              nextRenewal: null,
              startDate: null,
              endDate: null,
              earliestUnlock: row.unlockTs ?? null,
              latestUnlock: row.unlockTs ?? null,
            };
            map.set(id, sub);
          }
          sub.receivedPeriods += 1;
          sub.totalAmount += row.amount;
          if (row.unlockTs != null) {
            if (
              sub.earliestUnlock == null ||
              row.unlockTs < sub.earliestUnlock
            ) {
              sub.earliestUnlock = row.unlockTs;
            }
            if (
              sub.latestUnlock == null ||
              row.unlockTs > sub.latestUnlock
            ) {
              sub.latestUnlock = row.unlockTs;
            }
          }
        }
        const now = Math.floor(Date.now() / 1000);
        const arr = Array.from(map.values()).map((s) => {
          const periodSeconds = s.intervalDays * 24 * 60 * 60;
          const nextRenewal =
            s.latestUnlock != null ? s.latestUnlock + periodSeconds : null;
          const total = s.totalPeriods ?? s.receivedPeriods;
          const remaining = total - s.receivedPeriods;

          let status: Status;
          if (nextRenewal && nextRenewal < now) {
            status = "ended";
          } else if (remaining > 0 && s.totalPeriods !== null) {
            status = "pending";
          } else {
            status = "active";
          }

          let nextRenewalProgress;
          if (nextRenewal) {
            const start = nextRenewal - periodSeconds;
            const ratio = (now - start) / (nextRenewal - start);
            nextRenewalProgress = Math.max(0, Math.min(1, ratio));
          }

          const dueSoon = nextRenewal ? nextRenewal - now < 72 * 3600 : false;

          const amountPerInterval =
            s.receivedPeriods > 0
              ? s.totalAmount / s.receivedPeriods
              : undefined;

          return {
            subscriptionId: s.subscriptionId,
            subscriberNpub: s.subscriberNpub,
            tierId: s.tierId,
            tierName: s.tierName,
            frequency: daysToFrequency(s.intervalDays),
            intervalDays: s.intervalDays,
            totalPeriods: s.totalPeriods,
            receivedPeriods: s.receivedPeriods,
            remainingPeriods: remaining,
            totalAmount: s.totalAmount,
            status,
            nextRenewal,
            startDate: s.earliestUnlock,
            endDate: nextRenewal && nextRenewal < now ? nextRenewal : null, // Set endDate if ended
            nextRenewalProgress,
            dueSoon,
            amountPerInterval,
          } as CreatorSubscription;
        });
        subscriptions.value = arr;
        fillMissingTierNames();
        loading.value = false;
      },
      error: (err) => {
        console.error(err);
        loading.value = false;
      },
    });

    watch(
      () => creatorsStore.tiersMap,
      () => {
        fillMissingTierNames();
      },
      { deep: true },
    );

    // GETTERS
    const itemsSortedByNextRenewal = computed(() =>
      [...subscriptions.value].sort(
        (a, b) => (a.nextRenewal || Infinity) - (b.nextRenewal || Infinity),
      ),
    );

    const weekly = computed(() =>
      itemsSortedByNextRenewal.value.filter((i) => i.frequency === "weekly"),
    );
    const biweekly = computed(() =>
      itemsSortedByNextRenewal.value.filter((i) => i.frequency === "biweekly"),
    );
    const monthly = computed(() =>
      itemsSortedByNextRenewal.value.filter((i) => i.frequency === "monthly"),
    );
    const pending = computed(() =>
      itemsSortedByNextRenewal.value.filter((i) => i.status === "pending"),
    );
    const ended = computed(() =>
      itemsSortedByNextRenewal.value.filter((i) => i.status === "ended"),
    );

    // METHODS
    function sliceBy(filters: {
      query?: string;
      tiers?: string[];
      statuses?: Status[];
      frequency?: Frequency | "all";
      sortKey?:
        | "nextRenewal"
        | "lifetime"
        | "amountPerInterval"
        | "startDate";
    }) {
      let result = [...subscriptions.value];

      // filter by frequency
      if (filters.frequency && filters.frequency !== "all") {
        result = result.filter((s) => s.frequency === filters.frequency);
      }

      // filter by statuses
      if (filters.statuses && filters.statuses.length > 0) {
        result = result.filter((s) => filters.statuses!.includes(s.status));
      }

      // filter by tiers
      if (filters.tiers && filters.tiers.length > 0) {
        result = result.filter((s) => filters.tiers!.includes(s.tierName));
      }

      // filter by query
      if (filters.query) {
        const q = filters.query.toLowerCase();
        result = result.filter(
          (s) =>
            s.subscriberNpub.toLowerCase().includes(q) ||
            s.profile?.name?.toLowerCase().includes(q) ||
            s.profile?.displayName?.toLowerCase().includes(q) ||
            s.profile?.nip05?.toLowerCase().includes(q),
        );
      }

      // sort
      switch (filters.sortKey) {
        case "lifetime":
          result.sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0));
          break;
        case "amountPerInterval":
          result.sort(
            (a, b) => (b.amountPerInterval || 0) - (a.amountPerInterval || 0),
          );
          break;
        case "startDate":
          result.sort((a, b) => (a.startDate || 0) - (b.startDate || 0));
          break;
        case "nextRenewal":
        default:
          result.sort(
            (a, b) => (a.nextRenewal || Infinity) - (b.nextRenewal || Infinity),
          );
          break;
      }

      return result;
    }

    return {
      subscriptions,
      loading,
      // getters
      all: itemsSortedByNextRenewal,
      weekly,
      biweekly,
      monthly,
      pending,
      ended,
      // methods
      sliceBy,
    };
  },
);
