import { defineStore } from "pinia";
import { cashuDb } from "./dexie";
import { liveQuery } from "dexie";
import { ref } from "vue";

export interface CreatorSubscription {
  subscriptionId: string;
  subscriberNpub: string;
  tierId: string;
  totalMonths: number;
  receivedMonths: number;
  status: "pending" | "active";
}

export const useCreatorSubscriptionsStore = defineStore(
  "creatorSubscriptions",
  () => {
    const subscriptions = ref<CreatorSubscription[]>([]);

    liveQuery(() =>
      cashuDb.lockedTokens
        .where("owner")
        .equals("creator")
        .and((t) => !!t.subscriptionId)
        .toArray()
    ).subscribe({
      next: (rows) => {
        const map = new Map<string, CreatorSubscription>();
        for (const row of rows) {
          const id = row.subscriptionId!;
          let sub = map.get(id);
          if (!sub) {
            sub = {
              subscriptionId: id,
              subscriberNpub: row.subscriberNpub || "",
              tierId: row.tierId,
              totalMonths: row.totalMonths || 0,
              receivedMonths: 0,
              status: "pending",
            };
            map.set(id, sub);
          }
          sub.receivedMonths += 1;
        }
        const arr = Array.from(map.values()).map((s) => {
          if (s.receivedMonths >= s.totalMonths) s.status = "active";
          return s;
        });
        subscriptions.value = arr;
      },
      error: (err) => console.error(err),
    });

    return { subscriptions };
  }
);
