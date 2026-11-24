import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
// wallet.ts creates stores at import time; load it first
import { useWalletStore } from "src/stores/wallet";
import { createPinia, setActivePinia } from "pinia";
import { cashuDb } from "src/stores/dexie";
import { importLegacyKeysetCounters } from "src/stores/counterStorage";
import { importLegacyP2PKKeys, useP2PKStore } from "src/stores/p2pk";
import { exportBackupTables, restoreBackupTable } from "src/stores/storage";

async function reloadedWallet() {
  setActivePinia(createPinia());
  const store = useWalletStore();
  await store.initKeysetCounters();
  return store;
}

describe("keyset counter storage", () => {
  beforeEach(async () => {
    localStorage.clear();
    await cashuDb.keysetCounters.clear();
  });

  it("moves legacy counters without lowering stored ones", async () => {
    await cashuDb.keysetCounters.put({ id: "ks1", counter: 50 });
    localStorage.setItem(
      "cashu.keysetCounters",
      JSON.stringify([
        { id: "ks1", counter: 10 },
        { id: "ks2", counter: 7 },
      ])
    );

    await importLegacyKeysetCounters();

    expect(localStorage.getItem("cashu.keysetCounters")).toBeNull();
    expect((await cashuDb.keysetCounters.get("ks1"))?.counter).toBe(50);
    expect((await cashuDb.keysetCounters.get("ks2"))?.counter).toBe(7);
  });

  it("loads counters at startup and persists reservations", async () => {
    localStorage.setItem(
      "cashu.keysetCounters",
      JSON.stringify([{ id: "ks1", counter: 10 }])
    );
    const store = useWalletStore();
    await store.initKeysetCounters();
    expect(store.keysetCounter("ks1")).toBe(10);

    store.syncCounterToStorage("ks1", 15);
    store.syncCounterToStorage("ks1", 12); // never goes back
    store.syncCounterToStorage("ks2", 3);
    await store.keysetCountersTable.flush();

    const reloaded = await reloadedWallet();
    expect(reloaded.keysetCounter("ks1")).toBe(15);
    expect(reloaded.keysetCounter("ks2")).toBe(3);
  });

  it("keeps the higher counter when one was reserved before loading", async () => {
    await cashuDb.keysetCounters.put({ id: "ks1", counter: 100 });
    const store = useWalletStore();
    store.syncCounterToStorage("ks1", 5);
    store.syncCounterToStorage("ks2", 4);
    await store.initKeysetCounters();
    await store.keysetCountersTable.flush();

    expect(store.keysetCounter("ks1")).toBe(100);
    expect(store.keysetCounter("ks2")).toBe(4);
    expect((await cashuDb.keysetCounters.get("ks1"))?.counter).toBe(100);
  });

  it("moves an early counter source up to the stored counters", async () => {
    await cashuDb.keysetCounters.put({ id: "ks1", counter: 100 });
    const store = useWalletStore();
    const source = store.getOrCreateCounterSource();
    const advance = vi.spyOn(source, "advanceToAtLeast");
    await store.initKeysetCounters();
    expect(advance).toHaveBeenCalledWith("ks1", 100);
  });

  it("does not lower counters when an older backup is restored", async () => {
    await cashuDb.keysetCounters.put({ id: "ks1", counter: 5 });
    const exported = await exportBackupTables();
    await cashuDb.keysetCounters.put({ id: "ks1", counter: 40 });

    await restoreBackupTable(
      "keysetCounters",
      exported["cashu.dexie.db.keysetCounters"]
    );
    expect((await cashuDb.keysetCounters.get("ks1"))?.counter).toBe(40);
  });
});

describe("P2PK key storage", () => {
  beforeEach(async () => {
    localStorage.clear();
    await cashuDb.p2pkKeys.clear();
  });

  const key = (n: number) => ({
    publicKey: `02pub${n}`,
    privateKey: `priv${n}`,
    used: false,
    usedCount: 0,
  });

  it("moves legacy keys and keeps their order", async () => {
    localStorage.setItem("cashu.P2PKKeys", JSON.stringify([key(2), key(1)]));
    await importLegacyP2PKKeys();
    expect(localStorage.getItem("cashu.P2PKKeys")).toBeNull();

    const store = useP2PKStore();
    await store.init();
    expect(store.p2pkKeys).toEqual([key(2), key(1)]);
  });

  it("persists generated keys and usage", async () => {
    const store = useP2PKStore();
    await store.init();
    store.generateKeypair();
    const generated = store.p2pkKeys[0];
    store.setPrivateKeyUsed(generated.privateKey);
    await store.p2pkKeysTable.flush();

    setActivePinia(createPinia());
    const reloaded = useP2PKStore();
    await reloaded.init();
    expect(reloaded.p2pkKeys).toHaveLength(1);
    expect(reloaded.p2pkKeys[0]).toMatchObject({
      publicKey: generated.publicKey,
      used: true,
      usedCount: 1,
    });
  });
});
