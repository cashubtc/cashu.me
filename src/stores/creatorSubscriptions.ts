import { defineStore } from "pinia";
import { cashuDb } from "./dexie";
import { liveQuery } from "dexie";
import { ref, watch } from "vue";
import { useCreatorsStore } from "./creators";

function daysToFrequency(days: number): "weekly" | "biweekly" | "monthly" {
  if (days === 7) return "weekly";
  if (days === 14) return "biweekly";
  return "monthly";
}

export interface CreatorSubscription {
  subscriptionId: string;
  subscriberNpub: string;
  tierId: string;
  tierName: string;
  frequency: "weekly" | "biweekly" | "monthly";
  intervalDays: number;
  totalPeriods: number | null;
  receivedPeriods: number;
  remainingPeriods: number;
  totalAmount: number;
  status: "pending" | "active";
  nextRenewal: number | null;
  startDate: number | null;
  endDate: number | null;
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
        .toArray()
    ).subscribe({
      next: (rows) => {
        const map = new Map<
          string,
          CreatorSubscription & {
            earliestUnlock: number | null;
            latestUnlock: number | null;
          }
        >();
        for (const row of rows) {
          const id = row.subscriptionId!;
          const intervalDays = row.intervalDays ?? 30;
          let sub = map.get(id);
          if (!sub) {
            sub = {
              subscriptionId: id,
              subscriberNpub: row.subscriberNpub || "",
              tierId: row.tierId,
              tierName:
                row.tierName ||
                creatorsStore.tiersMap[row.creatorNpub || ""]?.find(
                  (t) => t.id === row.tierId
                )?.name ||
                FALLBACK_TIER_NAME,
              frequency: daysToFrequency(intervalDays),
              intervalDays,
              totalPeriods: row.totalPeriods ?? null,
              receivedPeriods: 0,
              remainingPeriods: 0,
              totalAmount: 0,
              status: "pending",
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
            if (sub.latestUnlock == null || row.unlockTs > sub.latestUnlock) {
              sub.latestUnlock = row.unlockTs;
            }
          }
        }
        const arr = Array.from(map.values()).map((s) => {
          const periodSeconds = s.intervalDays * 24 * 60 * 60;
          const nextRenewal =
            s.latestUnlock != null ? s.latestUnlock + periodSeconds : null;
          const total = s.totalPeriods ?? s.receivedPeriods;
          const remaining = total - s.receivedPeriods;
          return {
            subscriptionId: s.subscriptionId,
            subscriberNpub: s.subscriberNpub,
            tierId: s.tierId,
            tierName: s.tierName,
            frequency: s.frequency,
            intervalDays: s.intervalDays,
            totalPeriods: s.totalPeriods,
            receivedPeriods: s.receivedPeriods,
            remainingPeriods: remaining,
            totalAmount: s.totalAmount,
            status: remaining <= 0 ? "active" : "pending",
            nextRenewal,
            startDate: s.earliestUnlock,
            endDate: s.latestUnlock,
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
      { deep: true }
    );

    return { subscriptions, loading };
  }
);
