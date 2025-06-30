import { defineStore } from "pinia";
import { cashuDb } from "./dexie";
import type { Subscription } from "./dexie";
import { liveQuery } from "dexie";
import { ref } from "vue";
import { v4 as uuidv4 } from "uuid";

export const useSubscriptionsStore = defineStore("subscriptions", () => {
  const subscriptions = ref<Subscription[]>([]);

  liveQuery(() => cashuDb.subscriptions.toArray()).subscribe({
    next: (rows) => {
      subscriptions.value = rows;
    },
    error: (err) => {
      console.error(err);
    },
  });

  async function addSubscription(
    data: Omit<Subscription, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ) {
    const now = Math.floor(Date.now() / 1000);
    const entry: Subscription = {
      id: data.id ?? uuidv4(),
      ...data,
      createdAt: now,
      updatedAt: now,
    } as Subscription;
    await cashuDb.subscriptions.put(entry);
    return entry;
  }

  async function updateSubscription(
    id: string,
    updates: Partial<Subscription>
  ) {
    await cashuDb.subscriptions.update(id, {
      ...updates,
      updatedAt: Math.floor(Date.now() / 1000),
    });
  }

  async function deleteSubscription(id: string) {
    await cashuDb.subscriptions.delete(id);
  }

  async function cancelSubscription(pubkey: string) {
    const now = Math.floor(Date.now() / 1000);
    const subs = subscriptions.value.filter((s) => s.creatorNpub === pubkey);
    for (const sub of subs) {
      const ids = sub.intervals
        .filter((i) => i.unlockTs > now)
        .map((i) => i.lockedTokenId);
      if (ids.length) {
        await cashuDb.lockedTokens.bulkDelete(ids);
      }
      await updateSubscription(sub.id, { status: "cancelled" });
    }
  }

  return {
    subscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    cancelSubscription,
  };
});
