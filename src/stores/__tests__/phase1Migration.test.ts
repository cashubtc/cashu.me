import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
// wallet.ts creates stores at import time; load it before nwc/payment-request
import "src/stores/wallet";
import { cashuDb } from "src/stores/dexie";
import { SeenEventLog } from "src/stores/seenEvents";
import {
  importLegacyLocalStorageKeys,
  importLegacyNip17SeenEvents,
  importLegacyNwcProcessedRequestIds,
  importLegacyPaymentRequests,
} from "src/stores/legacyImporters";
import { usePRStore } from "src/stores/payment-request";
import { useNWCStore } from "src/stores/nwc";

const now = () => Math.floor(Date.now() / 1000);

describe("seen event log", () => {
  beforeEach(async () => {
    await cashuDb.seenEvents.clear();
  });

  it("lets the first copy of an event through and records it", async () => {
    const log = new SeenEventLog("test", 3600);
    await log.load();
    expect(log.markSeen("e1", now())).toBe(true);
    expect(log.markSeen("e1", now())).toBe(false);

    const reloaded = new SeenEventLog("test", 3600);
    // the write is in flight; wait for it
    await new Promise((resolve) => setTimeout(resolve, 0));
    await reloaded.load();
    expect(reloaded.has("e1")).toBe(true);
  });

  it("keeps scopes apart and forgets expired events", async () => {
    await cashuDb.seenEvents.bulkPut([
      { scope: "a", id: "old", created_at: now() - 7200 },
      { scope: "a", id: "new", created_at: now() },
      { scope: "b", id: "other", created_at: now() - 7200 },
    ]);
    const log = new SeenEventLog("a", 3600);
    await log.load();
    expect(log.has("old")).toBe(false);
    expect(log.has("new")).toBe(true);
    expect(log.has("other")).toBe(false);
    expect(await cashuDb.seenEvents.get(["b", "other"])).toBeTruthy();
    expect(await cashuDb.seenEvents.get(["a", "old"])).toBeUndefined();
  });
});

describe("phase 1 legacy imports", () => {
  beforeEach(async () => {
    localStorage.clear();
    await cashuDb.seenEvents.clear();
    await cashuDb.paymentRequests.clear();
  });

  it("moves NIP-17 seen events", async () => {
    localStorage.setItem(
      "cashu.ndk.nip17EventIdsWeHaveSeen",
      JSON.stringify([{ id: "dm1", created_at: now() }])
    );
    await importLegacyNip17SeenEvents();
    expect(
      localStorage.getItem("cashu.ndk.nip17EventIdsWeHaveSeen")
    ).toBeNull();
    expect(await cashuDb.seenEvents.get(["nip17", "dm1"])).toBeTruthy();
  });

  it("moves NWC processed request ids off the connections", async () => {
    const connection = {
      walletPublicKey: "wpk",
      walletPrivateKey: "wsk",
      connectionSecret: "secret",
      connectionPublicKey: "cpk",
      allowanceLeft: 1000,
      processedRequestIds: ["r1", "r2"],
    };
    localStorage.setItem("cashu.nwc.connections", JSON.stringify([connection]));
    await importLegacyNwcProcessedRequestIds();

    expect(await cashuDb.seenEvents.get(["nwc:cpk", "r1"])).toBeTruthy();
    expect(await cashuDb.seenEvents.get(["nwc:cpk", "r2"])).toBeTruthy();
    const { processedRequestIds: _ids, ...rest } = connection;
    expect(useNWCStore().connections).toEqual([rest]);
    expect(JSON.parse(localStorage.getItem("cashu.nwc.connections")!)).toEqual([
      rest,
    ]);
  });

  it("moves our payment requests and keeps their order", async () => {
    const requests = [
      {
        id: "b",
        encoded: "creqB",
        createdAt: "2026-01-02",
        receivedPaymentIds: ["t1"],
      },
      {
        id: "a",
        encoded: "creqA",
        createdAt: "2026-01-01",
        receivedPaymentIds: [],
      },
    ];
    localStorage.setItem("cashu.pr.ours", JSON.stringify(requests));
    await importLegacyPaymentRequests();
    expect(localStorage.getItem("cashu.pr.ours")).toBeNull();

    const store = usePRStore();
    await store.init();
    expect(store.ourPaymentRequests).toEqual(requests);
  });

  it("imports legacy keys from an old backup", async () => {
    localStorage.setItem("cashu.ndk.mintRecommendations", "[]");
    localStorage.setItem(
      "cashu.pr.ours",
      JSON.stringify([
        { id: "x", encoded: "creqX", createdAt: "", receivedPaymentIds: [] },
      ])
    );
    await importLegacyLocalStorageKeys();
    expect(localStorage.getItem("cashu.ndk.mintRecommendations")).toBeNull();
    expect(localStorage.getItem("cashu.pr.ours")).toBeNull();
    expect(await cashuDb.paymentRequests.get("x")).toBeTruthy();
  });

  it("persists payment request changes once loaded", async () => {
    const store = usePRStore();
    await store.init();
    store.ourPaymentRequests.push({
      id: "p1",
      encoded: "creq1",
      createdAt: "",
      receivedPaymentIds: [],
    });
    store.registerIncomingPaymentForRequest("p1", "token-1");
    await store.ourPaymentRequestsTable.flush();
    expect(await cashuDb.paymentRequests.get("p1")).toMatchObject({
      receivedPaymentIds: ["token-1"],
    });
  });
});
