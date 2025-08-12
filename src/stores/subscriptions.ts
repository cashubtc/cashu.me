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
      intervalDays: data.intervalDays ?? 30,
      tierName: data.tierName ?? null,
      benefits: data.benefits ?? [],
      creatorName: data.creatorName ?? null,
      creatorAvatar: data.creatorAvatar ?? null,
      intervals: data.intervals.map((i) => ({
        ...i,
        redeemed: i.redeemed ?? false,
      })),
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

  async function markIntervalRedeemed(
    subscriptionId: string,
    monthIndex: number | null | undefined
  ) {
    const sub = await cashuDb.subscriptions.get(subscriptionId);
    const idx = sub?.intervals.findIndex((i) => i.monthIndex === monthIndex);
    if (sub && idx !== undefined && idx >= 0) {
      sub.intervals[idx].status = "claimed";
      sub.intervals[idx].redeemed = true;
      await cashuDb.subscriptions.update(sub.id, { intervals: sub.intervals });
    }
  }

  return {
    subscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    cancelSubscription,
    markIntervalRedeemed,
  };
});
