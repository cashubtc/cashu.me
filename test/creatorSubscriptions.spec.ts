import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useCreatorSubscriptionsStore } from "../src/stores/creatorSubscriptions";
import { cashuDb } from "../src/stores/dexie";

vi.mock("../src/stores/creators", () => ({
  useCreatorsStore: () => ({ tiersMap: {} }),
}));

const WEEK = 7 * 24 * 60 * 60;
const BIWEEK = 14 * 24 * 60 * 60;

beforeEach(async () => {
  setActivePinia(createPinia());
  localStorage.clear();
  await cashuDb.close();
  await cashuDb.delete();
  await cashuDb.open();
});

describe("creatorSubscriptions store", () => {
  it("computes weekly and biweekly subscriptions correctly", async () => {
    const store = useCreatorSubscriptionsStore();

    await cashuDb.lockedTokens.bulkAdd([
      {
        id: "w1",
        tokenString: "tokw1",
        amount: 1,
        owner: "creator",
        subscriberNpub: "npub",
        tierId: "tier",
        tierName: "Tier",
        intervalKey: "wk1",
        unlockTs: 0,
        status: "unlockable",
        subscriptionEventId: null,
        subscriptionId: "subW",
        totalPeriods: 3,
        intervalDays: 7,
      },
      {
        id: "w2",
        tokenString: "tokw2",
        amount: 1,
        owner: "creator",
        subscriberNpub: "npub",
        tierId: "tier",
        tierName: "Tier",
        intervalKey: "wk2",
        unlockTs: WEEK,
        status: "unlockable",
        subscriptionEventId: null,
        subscriptionId: "subW",
        totalPeriods: 3,
        intervalDays: 7,
      },
      {
        id: "b1",
        tokenString: "tokb1",
        amount: 1,
        owner: "creator",
        subscriberNpub: "npub",
        tierId: "tier",
        tierName: "Tier",
        intervalKey: "bw1",
        unlockTs: 0,
        status: "unlockable",
        subscriptionEventId: null,
        subscriptionId: "subB",
        totalPeriods: 2,
        intervalDays: 14,
      },
      {
        id: "b2",
        tokenString: "tokb2",
        amount: 1,
        owner: "creator",
        subscriberNpub: "npub",
        tierId: "tier",
        tierName: "Tier",
        intervalKey: "bw2",
        unlockTs: BIWEEK,
        status: "unlockable",
        subscriptionEventId: null,
        subscriptionId: "subB",
        totalPeriods: 2,
        intervalDays: 14,
      },
    ] as any);

    await new Promise((r) => setTimeout(r, 20));

    const weekly = store.subscriptions.find((s) => s.subscriptionId === "subW");
    const biweekly = store.subscriptions.find(
      (s) => s.subscriptionId === "subB"
    );

    expect(weekly?.totalPeriods).toBe(3);
    expect(weekly?.receivedPeriods).toBe(2);
    expect(weekly?.nextRenewal).toBe(WEEK * 2);
    expect(weekly?.status).toBe("pending");

    expect(biweekly?.totalPeriods).toBe(2);
    expect(biweekly?.receivedPeriods).toBe(2);
    expect(biweekly?.nextRenewal).toBe(BIWEEK * 2);
    expect(biweekly?.status).toBe("active");
  });

  it("falls back to Unknown Tier when tier data is missing", async () => {
    const store = useCreatorSubscriptionsStore();

    await cashuDb.lockedTokens.add({
      id: "u1",
      tokenString: "tok",
      amount: 1,
      owner: "creator",
      subscriberNpub: "npub",
      tierId: "tier",
      intervalKey: "int1",
      unlockTs: 0,
      status: "unlockable",
      subscriptionEventId: null,
      subscriptionId: "subU",
      totalPeriods: 1,
      intervalDays: 30,
    } as any);

    await new Promise((r) => setTimeout(r, 20));

    const sub = store.subscriptions.find((s) => s.subscriptionId === "subU");
    expect(sub?.tierName).toBe("Unknown Tier");
  });
});
