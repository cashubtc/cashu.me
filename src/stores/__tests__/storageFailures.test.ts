import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("src/js/notify", () => ({
  notifyApiError: vi.fn(async () => {}),
  notifyError: vi.fn(async () => {}),
  notifySuccess: vi.fn(async () => {}),
  notifyWarning: vi.fn(async () => {}),
  notify: vi.fn(async () => {}),
}));

// wallet.ts creates stores at import time; load it first
import { useWalletStore } from "src/stores/wallet";
import { notifyError } from "src/js/notify";
import { cashuDb, useDexieStore } from "src/stores/dexie";
import {
  createTableMirror,
  flushPendingWrites,
  resumePendingWritesForTests,
  suspendPendingWrites,
  toMirrorRows,
} from "src/stores/tableMirror";
import { SeenEventLog } from "src/stores/seenEvents";
import { useStorageStore } from "src/stores/storage";
import {
  resetWalletDataReadyForTests,
  walletDataReady,
} from "src/stores/bootstrap";

type Item = { id: string; value: number };

describe("table mirror write failures", () => {
  beforeEach(async () => {
    await cashuDb.paymentRequests.clear();
    vi.mocked(notifyError).mockClear();
  });

  it("rejects flush and tells the user when a write fails, then retries", async () => {
    const mirror = createTableMirror<Item>(cashuDb.paymentRequests, {
      keyOf: (item) => item.id,
    });
    await mirror.hydrate();
    const bulkPut = vi
      .spyOn(cashuDb.paymentRequests, "bulkPut")
      .mockRejectedValueOnce(new Error("quota"))
      .mockRejectedValueOnce(new Error("quota"));

    mirror.items.value.push({ id: "a", value: 1 });
    await expect(mirror.flush()).rejects.toThrow("quota");
    expect(notifyError).toHaveBeenCalledOnce();
    expect(await cashuDb.paymentRequests.get("a")).toBeUndefined();

    // the next flush retries the unsaved change
    await mirror.flush();
    expect(await cashuDb.paymentRequests.get("a")).toMatchObject({ value: 1 });
    bulkPut.mockRestore();
  });

  it("stops writing once suspended (before a wipe)", async () => {
    const mirror = createTableMirror<Item>(cashuDb.paymentRequests, {
      keyOf: (item) => item.id,
    });
    await mirror.hydrate();
    mirror.items.value.push({ id: "a", value: 1 });
    await flushPendingWrites();

    suspendPendingWrites();
    await cashuDb.paymentRequests.clear();
    mirror.items.value[0].value = 2;
    mirror.items.value.push({ id: "b", value: 3 });
    await mirror.flush();
    expect(await cashuDb.paymentRequests.count()).toBe(0);
    resumePendingWritesForTests();
  });
});

describe("keyset counter writes", () => {
  beforeEach(async () => {
    localStorage.clear();
    await cashuDb.keysetCounters.clear();
  });

  it("never lower a counter raised in the table after loading", async () => {
    const store = useWalletStore();
    await store.initKeysetCounters();
    store.syncCounterToStorage("ks1", 10);
    await store.keysetCountersTable.flush();

    await cashuDb.keysetCounters.put({ id: "ks1", counter: 50 });
    store.syncCounterToStorage("ks1", 11);
    await store.keysetCountersTable.flush();

    expect((await cashuDb.keysetCounters.get("ks1"))?.counter).toBe(50);
  });
});

describe("seen event pruning", () => {
  beforeEach(async () => {
    await cashuDb.seenEvents.clear();
  });

  it("keeps pruning expired ids in a long-running session", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    try {
      const log = new SeenEventLog("prune-test", 60);
      await log.load();
      const start = Math.floor(Date.now() / 1000);
      log.markSeen("old", start);

      vi.setSystemTime(Date.now() + 2 * 60 * 60 * 1000);
      log.markSeen("new", Math.floor(Date.now() / 1000));
      await vi.waitFor(async () => {
        expect(log.has("old")).toBe(false);
        expect(
          await cashuDb.seenEvents.get(["prune-test", "old"])
        ).toBeUndefined();
      });
      expect(log.has("new")).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("legacy proof migration", () => {
  beforeEach(async () => {
    localStorage.clear();
    await cashuDb.proofs.clear();
  });

  it("does not overwrite a proof already in IndexedDB", async () => {
    const exportSpy = vi
      .spyOn(useStorageStore(), "exportWalletState")
      .mockResolvedValue(undefined);
    const current = {
      id: "00ab",
      amount: 1,
      C: "02aa",
      secret: "s1",
      reserved: true,
    };
    await cashuDb.proofs.put(current);
    localStorage.setItem(
      "cashu.proofs",
      JSON.stringify([
        { ...current, reserved: false },
        { id: "00ab", amount: 2, C: "02bb", secret: "s2", reserved: false },
      ])
    );

    await useDexieStore().migrateToDexie();

    expect(exportSpy).toHaveBeenCalled();
    expect((await cashuDb.proofs.get("s1"))?.reserved).toBe(true);
    expect(await cashuDb.proofs.get("s2")).toBeTruthy();
    expect(localStorage.getItem("cashu.proofs")).toBeNull();
  });
});

describe("backup restore failures", () => {
  it("reports a failed restore instead of rejecting unseen", async () => {
    vi.mocked(notifyError).mockClear();
    await expect(
      useStorageStore().restoreFromBackup({
        "cashu.dexie.db.paymentHistory": "not json",
      })
    ).resolves.toBeUndefined();
    expect(notifyError).toHaveBeenCalled();
    // restore suspends writers until the page reloads; undo that here
    resumePendingWritesForTests();
  });
});

describe("startup gate", () => {
  it("rejects and reports a failed load, then retries", async () => {
    vi.mocked(notifyError).mockClear();
    resetWalletDataReadyForTests();
    const dexie = useDexieStore();
    vi.spyOn(dexie, "migrateToDexie").mockRejectedValueOnce(
      new Error("db unavailable")
    );

    await expect(walletDataReady()).rejects.toThrow("db unavailable");
    expect(notifyError).toHaveBeenCalled();

    await expect(walletDataReady()).resolves.toBeUndefined();
    resetWalletDataReadyForTests();
  });
});

describe("round 2 failure handling", () => {
  beforeEach(async () => {
    localStorage.clear();
    vi.mocked(notifyError).mockClear();
  });

  it("restores the same proofs twice without failing", async () => {
    const { useProofsStore } = await import("src/stores/proofs");
    await cashuDb.proofs.clear();
    const proofs = [{ id: "00ab", amount: 4, C: "02cc", secret: "dup-1" }];
    await useProofsStore().addMissingProofs(proofs as any);
    await useProofsStore().addMissingProofs(proofs as any);
    expect(await cashuDb.proofs.count()).toBe(1);
  });

  it("refuses an incomplete backup when one is required (wallet wipe)", async () => {
    const mirror = createTableMirror<Item>(cashuDb.paymentRequests, {
      keyOf: (item) => item.id,
    });
    await mirror.hydrate();
    const bulkPut = vi
      .spyOn(cashuDb.paymentRequests, "bulkPut")
      .mockRejectedValue(new Error("quota"));
    mirror.items.value.push({ id: "unsaved", value: 1 });

    await expect(
      useStorageStore().exportWalletState({ requireSaved: true })
    ).rejects.toThrow("quota");
    expect(notifyError).toHaveBeenCalled();

    bulkPut.mockRestore();
    await mirror.flush();
    mirror.items.value = [];
    await mirror.flush();
  });

  it("sends a second tab away without loading or notifying", async () => {
    const { WalletOpenInAnotherTabError } = await import(
      "src/stores/bootstrap"
    );
    resetWalletDataReadyForTests();
    const locks = {
      request: vi.fn(async (_name: string, _opts: unknown, cb: any) =>
        cb(null)
      ),
    };
    vi.stubGlobal("navigator", { ...globalThis.navigator, locks });
    const migrate = vi.spyOn(useDexieStore(), "migrateToDexie");
    try {
      await expect(walletDataReady()).rejects.toBeInstanceOf(
        WalletOpenInAnotherTabError
      );
      expect(migrate).not.toHaveBeenCalled();
      expect(notifyError).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
      migrate.mockRestore();
      resetWalletDataReadyForTests();
    }
  });

  it("keeps outgoing token and invoice checks with the same id apart", async () => {
    const { createWorkerQueueTable } = await import(
      "src/stores/workerQueueStorage"
    );
    await cashuDb.workerQueue.clear();
    const queue = createWorkerQueueTable<any>("outgoing");
    await queue.hydrate();
    const entry = { id: "same", addedAt: 1, lastChecked: 0, checkCount: 0 };
    queue.items.value.push(
      { ...entry, type: "token" },
      { ...entry, type: "invoice" }
    );
    await queue.flush();
    expect(await cashuDb.workerQueue.count()).toBe(2);

    const reloaded = createWorkerQueueTable<any>("outgoing");
    await reloaded.hydrate();
    expect(reloaded.items.value.map((e: any) => e.type)).toEqual([
      "token",
      "invoice",
    ]);
  });

  it("does not finish migration v1 before its write commits", async () => {
    const { useMigrationsStore } = await import("src/stores/migrations");
    const { useMintsStore } = await import("src/stores/mints");
    const mints = useMintsStore();
    await mints.init();
    const flush = vi
      .spyOn(mints.mintsTable, "flush")
      .mockRejectedValueOnce(new Error("quota"));
    await expect(
      useMigrationsStore().migrateStablenutsToCash()
    ).rejects.toThrow("quota");
    flush.mockRestore();
  });
});

describe("round 4 failure handling", () => {
  beforeEach(() => {
    vi.mocked(notifyError).mockClear();
  });

  it("does not start when a migration failed", async () => {
    const { useMigrationsStore } = await import("src/stores/migrations");
    resetWalletDataReadyForTests();
    const run = vi
      .spyOn(useMigrationsStore(), "runMigrations")
      .mockResolvedValueOnce(false);
    try {
      await expect(walletDataReady()).rejects.toThrow("migration failed");
    } finally {
      run.mockRestore();
      resetWalletDataReadyForTests();
    }
  });

  it("waits for every writer even when one of them fails", async () => {
    await cashuDb.paymentRequests.clear();
    await cashuDb.p2pkKeys.clear();
    const failing = createTableMirror<Item>(cashuDb.paymentRequests, {
      keyOf: (item) => item.id,
    });
    const slow = createTableMirror<{ publicKey: string }>(cashuDb.p2pkKeys, {
      keyOf: (item) => item.publicKey,
    });
    await Promise.all([failing.hydrate(), slow.hydrate()]);
    const fail = vi
      .spyOn(cashuDb.paymentRequests, "bulkPut")
      .mockRejectedValue(new Error("quota"));
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    const realPut = cashuDb.p2pkKeys.bulkPut.bind(cashuDb.p2pkKeys);
    const delay = vi
      .spyOn(cashuDb.p2pkKeys, "bulkPut")
      .mockImplementation(async (...args: any[]) => {
        await gate;
        return (realPut as any)(...args);
      });

    failing.items.value.push({ id: "a", value: 1 });
    slow.items.value.push({ publicKey: "02slow" });
    let settled = false;
    const flushing = flushPendingWrites()
      .catch(() => {})
      .finally(() => (settled = true));
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(settled).toBe(false);
    release();
    await flushing;
    expect(await cashuDb.p2pkKeys.get("02slow")).toBeTruthy();

    fail.mockRestore();
    delay.mockRestore();
    failing.items.value = [];
    slow.items.value = [];
    await flushPendingWrites();
  });

  it("refuses late writes once the wallet database is deleted", async () => {
    const { CashuDexie } = await import("src/stores/dexie");
    const db = new CashuDexie("wipe-test");
    await db.open();
    await db.delete({ disableAutoOpen: true });
    await expect(
      db.ecashHistory.put({ id: "late", status: "paid" })
    ).rejects.toBeTruthy();
  });

  it("reports a failed recommendations load and retries later", async () => {
    const { useMintRecommendationsStore } = await import(
      "src/stores/mintRecommendations"
    );
    const store = useMintRecommendationsStore();
    const read = vi
      .spyOn(store, "ensureDbInitialized")
      .mockRejectedValueOnce(new Error("db unavailable"));
    await store.hydrateFromDb();
    expect(store.dbHydrated).toBe(false);
    expect(notifyError).toHaveBeenCalled();
    read.mockRestore();
  });
});

describe("round 5 failure handling", () => {
  beforeEach(async () => {
    localStorage.clear();
    vi.mocked(notifyError).mockClear();
    await cashuDb.keysetCounters.clear();
    await cashuDb.paymentRequests.clear();
  });

  const counters = (counter: number) =>
    JSON.stringify([{ id: "ks1", counter, _pos: 0 }]);

  it("replaces counters when the backup belongs to another mnemonic", async () => {
    localStorage.setItem("cashu.mnemonic", "current words");
    await cashuDb.keysetCounters.put({ id: "ks1", counter: 500 });
    await useStorageStore().restoreFromBackup({
      "cashu.mnemonic": "other words",
      "cashu.dexie.db.keysetCounters": counters(3),
    });
    resumePendingWritesForTests();
    expect((await cashuDb.keysetCounters.get("ks1"))?.counter).toBe(3);
  });

  it("keeps the higher counter when the backup has the same mnemonic", async () => {
    localStorage.setItem("cashu.mnemonic", "same words");
    await cashuDb.keysetCounters.put({ id: "ks1", counter: 500 });
    await useStorageStore().restoreFromBackup({
      "cashu.mnemonic": "same words",
      "cashu.dexie.db.keysetCounters": counters(3),
    });
    resumePendingWritesForTests();
    expect((await cashuDb.keysetCounters.get("ks1"))?.counter).toBe(500);
  });

  it("does not let a pending store write overwrite restored rows", async () => {
    const mirror = createTableMirror<Item>(cashuDb.paymentRequests, {
      keyOf: (item) => item.id,
    });
    await mirror.hydrate();
    const fail = vi
      .spyOn(cashuDb.paymentRequests, "bulkPut")
      .mockRejectedValueOnce(new Error("quota"))
      .mockRejectedValueOnce(new Error("quota"));
    mirror.items.value.push({ id: "pr", value: 1 });

    await useStorageStore().restoreFromBackup({
      "cashu.dexie.db.paymentRequests": JSON.stringify([
        { id: "pr", value: 2, _pos: 0 },
      ]),
    });
    await mirror.flush().catch(() => {});
    fail.mockRestore();
    expect(await cashuDb.paymentRequests.get("pr")).toMatchObject({
      value: 2,
    });
    resumePendingWritesForTests();
    mirror.items.value = [];
  });

  it("drops a P2PK key that could not be saved", async () => {
    const { useP2PKStore } = await import("src/stores/p2pk");
    await cashuDb.p2pkKeys.clear();
    const store = useP2PKStore();
    await store.init();
    const fail = vi
      .spyOn(cashuDb.p2pkKeys, "bulkPut")
      .mockRejectedValue(new Error("quota"));
    await expect(store.generateKeypair()).rejects.toThrow("quota");
    expect(store.p2pkKeys).toHaveLength(0);
    fail.mockRestore();

    const key = await store.generateKeypair();
    expect(await cashuDb.p2pkKeys.get(key.publicKey)).toBeTruthy();
  });

  it("keeps a legacy key when its rows did not all land", async () => {
    const { importLegacyPaymentRequests } = await import(
      "src/stores/legacyImporters"
    );
    localStorage.setItem(
      "cashu.pr.ours",
      JSON.stringify([{ id: "x", encoded: "creqX", receivedPaymentIds: [] }])
    );
    const lose = vi
      .spyOn(cashuDb.paymentRequests, "bulkPut")
      .mockResolvedValueOnce(undefined as any);
    await expect(importLegacyPaymentRequests()).rejects.toThrow(
      "Verification failed"
    );
    lose.mockRestore();
    expect(localStorage.getItem("cashu.pr.ours")).not.toBeNull();
  });

  it("moves the active mint pointer on a retry of migration v1", async () => {
    const { useMigrationsStore } = await import("src/stores/migrations");
    const { useMintsStore } = await import("src/stores/mints");
    await cashuDb.mints.clear();
    const mints = useMintsStore();
    await mints.init();
    // state after a first attempt whose write failed: renamed in memory,
    // pointer still on the old URL
    mints.mints.push({
      url: "https://stablenut.cashu.network",
      keys: [],
      keysets: [],
    } as any);
    mints.activeMintUrl = "https://stablenut.umint.cash";
    await useMigrationsStore().migrateStablenutsToCash();
    expect(mints.activeMintUrl).toBe("https://stablenut.cashu.network");
    mints.mints = [];
    await mints.mintsTable.flush();
  });
});
