import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
// wallet.ts creates stores at import time; load it first
import "src/stores/wallet";
import { createPinia, setActivePinia } from "pinia";
import { cashuDb, useDexieStore } from "src/stores/dexie";
import { useMintsStore, type StoredMint } from "src/stores/mints";
import { importLegacyMints } from "src/stores/mintStorage";
import { exportBackupTables, restoreBackupTable } from "src/stores/storage";
import { useMigrationsStore } from "src/stores/migrations";

function keys(id: string, unit = "sat") {
  return { id, unit, keys: { 1: `02${id}01`, 2: `02${id}02` } } as any;
}

function mint(url: string, keysetIds: string[]): StoredMint {
  return {
    url,
    keys: keysetIds.map((id) => keys(id)),
    keysets: keysetIds.map((id) => ({ id, unit: "sat", active: true })) as any,
    info: { name: url, version: "Nutshell/0.17.0" } as any,
    nickname: "",
  };
}

async function reloadedMints() {
  setActivePinia(createPinia());
  const store = useMintsStore();
  await store.init();
  return store;
}

describe("mints storage", () => {
  beforeEach(async () => {
    localStorage.clear();
    await useDexieStore().deleteAllTables();
  });

  it("splits legacy cashu.mints into mint rows and key rows", async () => {
    const legacy = [mint("https://a", ["00a1", "00a2"]), mint("https://b", [])];
    localStorage.setItem("cashu.mints", JSON.stringify(legacy));

    await importLegacyMints();

    expect(localStorage.getItem("cashu.mints")).toBeNull();
    expect(await cashuDb.mints.count()).toBe(2);
    expect(await cashuDb.mintKeys.count()).toBe(2);
    const row = await cashuDb.mints.get("https://a");
    expect(row).not.toHaveProperty("keys");
    expect(await cashuDb.mintKeys.get(["https://a", "00a2"])).toMatchObject({
      id: "00a2",
      mintUrl: "https://a",
    });

    const store = await reloadedMints();
    expect(store.mints).toEqual(legacy);
  });

  it("moves cashu.mints when the store loads", async () => {
    const legacy = [mint("https://a", ["00a1"])];
    localStorage.setItem("cashu.mints", JSON.stringify(legacy));
    const store = useMintsStore();
    await store.init();
    expect(store.mints).toEqual(legacy);
    expect(localStorage.getItem("cashu.mints")).toBeNull();
  });

  it("writes mint changes and new keysets through to the tables", async () => {
    const store = useMintsStore();
    await store.init();
    store.mints.push(mint("https://a", ["00a1"]));
    await store.mintsTable.flush();

    store.mints[0].motdDismissed = true;
    store.mints[0].keys = [...store.mints[0].keys, keys("00a2")];
    store.mints[0].keysets.push({
      id: "00a2",
      unit: "sat",
      active: true,
    } as any);
    await store.mintsTable.flush();

    const reloaded = await reloadedMints();
    expect(reloaded.mints[0].motdDismissed).toBe(true);
    expect(reloaded.mints[0].keys.map((k) => k.id)).toEqual(["00a1", "00a2"]);
    expect(reloaded.mints[0].keysets).toHaveLength(2);
  });

  it("deletes a removed mint and its keys", async () => {
    const store = useMintsStore();
    await store.init();
    store.mints.push(mint("https://a", ["00a1"]), mint("https://b", ["00b1"]));
    await store.mintsTable.flush();

    store.mints = store.mints.filter((m) => m.url !== "https://a");
    await store.mintsTable.flush();

    expect(await cashuDb.mints.get("https://a")).toBeUndefined();
    expect(await cashuDb.mintKeys.get(["https://a", "00a1"])).toBeUndefined();
    expect(await cashuDb.mintKeys.get(["https://b", "00b1"])).toBeTruthy();
  });

  it("keeps keys attached when a mint url changes", async () => {
    const store = useMintsStore();
    await store.init();
    store.mints.push(mint("https://old", ["00c1"]));
    await store.mintsTable.flush();

    store.mints[0].url = "https://new";
    await store.mintsTable.flush();

    const reloaded = await reloadedMints();
    expect(reloaded.mints.map((m) => m.url)).toEqual(["https://new"]);
    expect(reloaded.mints[0].keys.map((k) => k.id)).toEqual(["00c1"]);
    expect(await cashuDb.mintKeys.count()).toBe(1);
  });

  it("stores a keyset shared by two mint urls for both", async () => {
    const store = useMintsStore();
    await store.init();
    store.mints.push(mint("https://a", ["00d1"]), mint("https://b", ["00d1"]));
    await store.mintsTable.flush();

    const reloaded = await reloadedMints();
    expect(reloaded.mints.map((m) => m.keys.length)).toEqual([1, 1]);
  });

  it("survives a backup round trip", async () => {
    const legacy = [mint("https://a", ["00a1"]), mint("https://b", ["00b1"])];
    localStorage.setItem("cashu.mints", JSON.stringify(legacy));
    await importLegacyMints();

    const exported = await exportBackupTables();
    await useDexieStore().deleteAllTables();
    for (const name of ["mints", "mintKeys"]) {
      await restoreBackupTable(name, exported[`cashu.dexie.db.${name}`]);
    }

    const store = await reloadedMints();
    expect(store.mints).toEqual(legacy);
  });

  it("still renames the stablenut mint in migration v1", async () => {
    localStorage.setItem(
      "cashu.mints",
      JSON.stringify([mint("https://stablenut.umint.cash", ["00e1"])])
    );
    await useMigrationsStore().migrateStablenutsToCash();
    await useMintsStore().mintsTable.flush();

    const store = await reloadedMints();
    expect(store.mints.map((m) => m.url)).toEqual([
      "https://stablenut.cashu.network",
    ]);
    expect(store.mints[0].keys).toHaveLength(1);
  });
});
