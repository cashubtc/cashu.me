import { defineStore } from "pinia";
import { cashuDb } from "./dexie";
import { liveQuery } from "dexie";
import { ref } from "vue";
import { useCreatorsStore } from "./creators";

export interface CreatorSubscription {
  subscriptionId: string;
  subscriberNpub: string;
  tierId: string;
  tierName: string;
  totalMonths: number;
  receivedMonths: number;
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
                "",
              totalMonths: row.totalMonths || 0,
              receivedMonths: 0,
              status: "pending",
              nextRenewal: null,
              startDate: null,
              endDate: null,
              earliestUnlock: row.unlockTs ?? null,
              latestUnlock: row.unlockTs ?? null,
            };
            map.set(id, sub);
          }
          sub.receivedMonths += 1;
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
        const monthSeconds = 30 * 24 * 60 * 60;
        const arr = Array.from(map.values()).map((s) => {
          const nextRenewal =
            s.latestUnlock != null ? s.latestUnlock + monthSeconds : null;
          return {
            subscriptionId: s.subscriptionId,
            subscriberNpub: s.subscriberNpub,
            tierId: s.tierId,
            tierName: s.tierName,
            totalMonths: s.totalMonths,
            receivedMonths: s.receivedMonths,
            status:
              s.receivedMonths >= s.totalMonths ? "active" : "pending",
            nextRenewal,
            startDate: s.earliestUnlock,
            endDate: s.latestUnlock,
          } as CreatorSubscription;
        });
        subscriptions.value = arr;
        loading.value = false;
      },
      error: (err) => {
        console.error(err);
        loading.value = false;
      },
    });

    return { subscriptions, loading };
  }
);
