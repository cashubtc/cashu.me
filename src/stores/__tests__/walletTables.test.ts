import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cashuDb, useDexieStore, WALLET_TABLES } from "src/stores/dexie";
import {
  importLegacyLocalStorageKeys,
  LEGACY_KEY_IMPORTERS,
  moveLocalStorageKey,
} from "src/stores/legacyStorage";
import { exportBackupTables, restoreBackupTable } from "src/stores/storage";

describe("wallet table registry", () => {
  it("lists every table of the wallet database exactly once", () => {
    const dbTables = cashuDb.tables.map((table) => table.name).sort();
    const registered = WALLET_TABLES.map((spec) => spec.name).sort();
    expect(registered).toEqual(dbTables);
  });

  it("clears every table on wipe", async () => {
    await cashuDb.paymentHistory.put({ id: "p1", direction: "mint" });
    await cashuDb.ecashHistory.put({ id: "e1", status: "paid" });
    await useDexieStore().deleteAllTables();
    for (const table of cashuDb.tables) {
      expect(await table.count()).toBe(0);
    }
  });
});

describe("backup tables", () => {
  beforeEach(async () => {
    localStorage.clear();
    await useDexieStore().deleteAllTables();
  });

  it("exports every backed-up table and restores it", async () => {
    await cashuDb.paymentHistory.put({ id: "p1", direction: "mint" });
    await cashuDb.mintQuotes.put({ quote: "q1", amount: 21 });
    await cashuDb.ecashHistory.put({ id: "e1", status: "paid" });

    const exported = await exportBackupTables();
    for (const spec of WALLET_TABLES.filter((s) => s.backup)) {
      expect(exported).toHaveProperty(`cashu.dexie.db.${spec.name}`);
    }

    await useDexieStore().deleteAllTables();
    for (const [key, value] of Object.entries(exported)) {
      const name = key.replace("cashu.dexie.db.", "");
      if (name === "proofs") continue;
      await restoreBackupTable(name, value);
    }
    expect(await cashuDb.paymentHistory.get("p1")).toMatchObject({
      direction: "mint",
    });
    expect(await cashuDb.mintQuotes.get("q1")).toMatchObject({ amount: 21 });
    expect(await cashuDb.ecashHistory.get("e1")).toMatchObject({
      status: "paid",
    });
  });

  it("skips tables it does not know", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await restoreBackupTable("fromTheFuture", "[]");
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe("moveLocalStorageKey", () => {
  beforeEach(async () => {
    localStorage.clear();
    await cashuDb.ecashHistory.clear();
  });

  it("does nothing when the key is absent", async () => {
    const write = vi.fn();
    const moved = await moveLocalStorageKey({
      key: "cashu.absent",
      tables: [cashuDb.ecashHistory],
      write,
    });
    expect(moved).toBe(false);
    expect(write).not.toHaveBeenCalled();
  });

  it("removes the key only after the rows are committed", async () => {
    localStorage.setItem(
      "cashu.legacy",
      JSON.stringify([{ id: "a", status: "paid" }])
    );
    const moved = await moveLocalStorageKey<{ id: string }[]>({
      key: "cashu.legacy",
      tables: [cashuDb.ecashHistory],
      write: async (rows) => {
        await cashuDb.ecashHistory.bulkPut(rows);
      },
      verify: async (rows) =>
        (await cashuDb.ecashHistory.count()) === rows.length,
    });
    expect(moved).toBe(true);
    expect(localStorage.getItem("cashu.legacy")).toBeNull();
    expect(await cashuDb.ecashHistory.get("a")).toBeTruthy();
  });

  it("keeps the key when the write fails", async () => {
    localStorage.setItem("cashu.legacy", "[1]");
    await expect(
      moveLocalStorageKey({
        key: "cashu.legacy",
        tables: [cashuDb.ecashHistory],
        write: async () => {
          throw new Error("boom");
        },
      })
    ).rejects.toThrow("boom");
    expect(localStorage.getItem("cashu.legacy")).toBe("[1]");
  });

  it("keeps the key when verification fails", async () => {
    localStorage.setItem("cashu.legacy", "[]");
    await expect(
      moveLocalStorageKey({
        key: "cashu.legacy",
        tables: [cashuDb.ecashHistory],
        write: async () => {},
        verify: async () => false,
      })
    ).rejects.toThrow("Verification failed");
    expect(localStorage.getItem("cashu.legacy")).toBe("[]");
  });

  it("runs registered importers only for keys that are present", async () => {
    const present = vi.fn(async () => {});
    const absent = vi.fn(async () => {});
    LEGACY_KEY_IMPORTERS.push(
      { key: "cashu.test.present", run: present },
      { key: "cashu.test.absent", run: absent }
    );
    try {
      localStorage.setItem("cashu.test.present", "1");
      await importLegacyLocalStorageKeys();
      expect(present).toHaveBeenCalledOnce();
      expect(absent).not.toHaveBeenCalled();
    } finally {
      LEGACY_KEY_IMPORTERS.splice(-2, 2);
    }
  });
});

describe("legacy proofs migration", () => {
  beforeEach(async () => {
    localStorage.clear();
    await cashuDb.proofs.clear();
  });

  it("commits every proof before removing cashu.proofs", async () => {
    const storage = await import("src/stores/storage");
    const exportSpy = vi
      .spyOn(storage.useStorageStore(), "exportWalletState")
      .mockResolvedValue(undefined);
    const proofs = [
      { id: "00ab", amount: 1, C: "02aa", secret: "s1", reserved: false },
      { id: "00ab", amount: 2, C: "02bb", secret: "s2", reserved: false },
    ];
    localStorage.setItem("cashu.proofs", JSON.stringify(proofs));

    await useDexieStore().migrateToDexie();

    expect(exportSpy).toHaveBeenCalled();
    expect(await cashuDb.proofs.count()).toBe(2);
    expect(localStorage.getItem("cashu.proofs")).toBeNull();
    expect(useDexieStore().migratedToDexie).toBe(true);
  });
});
