import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDexieStore, cashuDb } from "../../../src/stores/dexie";

vi.mock("../../../src/stores/storage", () => ({
  useStorageStore: () => ({
    exportWalletState: vi.fn(),
  }),
}));

vi.mock("../../../src/stores/proofs", () => ({
  useProofsStore: () => ({
    getProofs: vi.fn(async () => []),
    sumProofs: vi.fn(() => 0),
  }),
}));

beforeEach(async () => {
  localStorage.clear();
  await cashuDb.close(); // close() is safe under fake-indexeddb
  await cashuDb.open();
});

describe("Dexie store", () => {
  it("marks migrated when there is nothing to migrate", async () => {
    const store = useDexieStore();
    await store.migrateToDexie();
    expect(store.migratedToDexie).toBe(true);
  });

  it("migrates proofs from localStorage", async () => {
    const proofs = [
      { id: "1", secret: "s", C: "c", amount: 1, reserved: false },
    ];
    localStorage.setItem("cashu.proofs", JSON.stringify(proofs));
    const store = useDexieStore();
    await store.migrateToDexie();
    // wait for Dexie writes
    const stored = await cashuDb.proofs.toArray();
    expect(stored.length).toBe(1);
    expect(store.migratedToDexie).toBe(true);
    expect(localStorage.getItem("cashu.proofs")).toBeNull();
  });

  it("deletes all tables", async () => {
    await cashuDb.proofs.add({
      id: "1",
      secret: "s",
      C: "c",
      amount: 1,
      reserved: false,
    });
    const store = useDexieStore();
    store.deleteAllTables();
    const stored = await cashuDb.proofs.toArray();
    expect(stored.length).toBe(0);
  });
});
