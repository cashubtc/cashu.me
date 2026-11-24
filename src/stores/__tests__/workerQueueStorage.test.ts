import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
// wallet.ts creates stores at import time; load it first
import "src/stores/wallet";
import { createPinia, setActivePinia } from "pinia";
import { cashuDb } from "src/stores/dexie";
import { useTransactionWorkerStore } from "src/stores/transactionWorker";
import {
  importLegacyWorkerQueues,
  LEGACY_WORKER_QUEUE_KEYS,
} from "src/stores/workerQueueStorage";
import { importLegacyLocalStorageKeys } from "src/stores/legacyImporters";

const quote = (id: string, checkCount = 0) => ({
  quote: id,
  addedAt: 1000,
  lastChecked: 0,
  checkCount,
});

async function reloadedWorker() {
  setActivePinia(createPinia());
  const store = useTransactionWorkerStore();
  await store.init();
  return store;
}

const flushAll = (store: ReturnType<typeof useTransactionWorkerStore>) =>
  Promise.all(store.queueTables.map((table) => table.flush()));

describe("transaction worker queue storage", () => {
  beforeEach(async () => {
    localStorage.clear();
    await cashuDb.workerQueue.clear();
  });

  it("moves the four legacy queues into their slices", async () => {
    localStorage.setItem(
      LEGACY_WORKER_QUEUE_KEYS.bolt11,
      JSON.stringify([quote("q1"), quote("q2")])
    );
    localStorage.setItem(
      LEGACY_WORKER_QUEUE_KEYS.bolt12,
      JSON.stringify([quote("offer")])
    );
    localStorage.setItem(
      LEGACY_WORKER_QUEUE_KEYS.outgoing,
      JSON.stringify([
        { id: "tok", type: "token", addedAt: 1, lastChecked: 0, checkCount: 0 },
      ])
    );

    await importLegacyWorkerQueues();

    for (const key of Object.values(LEGACY_WORKER_QUEUE_KEYS)) {
      expect(localStorage.getItem(key)).toBeNull();
    }
    const store = await reloadedWorker();
    expect(store.quotes).toEqual([quote("q1"), quote("q2")]);
    expect(store.bolt12Quotes).toEqual([quote("offer")]);
    expect(store.onchainQuotes).toEqual([]);
    expect(store.outgoingPayments.map((entry) => entry.id)).toEqual(["tok"]);
  });

  it("writes queue changes through and keeps kinds apart", async () => {
    const store = useTransactionWorkerStore();
    await store.init();
    store.quotes.push(quote("same"));
    store.onchainQuotes.push(quote("same"));
    await flushAll(store);

    store.quotes[0].checkCount = 3;
    store.onchainQuotes = [];
    await flushAll(store);

    const reloaded = await reloadedWorker();
    expect(reloaded.quotes).toEqual([quote("same", 3)]);
    expect(reloaded.onchainQuotes).toEqual([]);
    expect(await cashuDb.workerQueue.count()).toBe(1);
  });

  it("imports legacy queues from an old backup", async () => {
    localStorage.setItem(
      LEGACY_WORKER_QUEUE_KEYS.onchain,
      JSON.stringify([quote("chain")])
    );
    await importLegacyLocalStorageKeys();
    expect(await cashuDb.workerQueue.get(["onchain", "chain"])).toBeTruthy();
  });
});
