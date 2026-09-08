import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cashuDb } from "src/stores/dexie";
import { useStorageStore } from "src/stores/storage";
import { notifySuccess } from "src/js/notify";

vi.mock("src/js/notify", () => ({
  notifyError: vi.fn(),
  notifySuccess: vi.fn(),
}));

const proof = {
  id: "keyset",
  secret: "backup-proof",
  C: "signature",
  amount: 8,
};
const backup = (proofs = [proof], key = "cashu.dexie.db.proofs") => ({
  "cashu.testSetting": "imported",
  [key]: JSON.stringify(proofs),
});

describe("idempotent backup proof import", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    localStorage.clear();
    await cashuDb.proofs.clear();
    await cashuDb.ecashHistory.clear();
    vi.spyOn(window.location, "reload").mockImplementation(() => {});
  });

  it.each(["cashu.dexie.db.proofs", "cashu.proofs"])(
    "imports %s twice while preserving existing reservations",
    async (key) => {
      const store = useStorageStore();
      await store.restoreFromBackup(backup([proof], key));
      await cashuDb.proofs.update(proof.secret, {
        reserved: true,
        quote: "pending-payment",
      });
      const reserved = await cashuDb.proofs.get(proof.secret);
      await store.restoreFromBackup(backup([proof, proof], key));
      expect(await cashuDb.proofs.toArray()).toEqual([reserved]);
      expect(window.location.reload).toHaveBeenCalledTimes(2);
    }
  );

  it.each([{ amount: 16 }, { id: "other-keyset" }, { C: "other-signature" }])(
    "rejects conflicting proof data before writes: %j",
    async (changes) => {
      await cashuDb.proofs.add({
        ...proof,
        reserved: true,
        quote: "pending-payment",
      });
      const store = useStorageStore();
      const writes = vi.spyOn(localStorage, "setItem");
      await expect(
        store.restoreFromBackup(backup([{ ...proof, ...changes }]))
      ).rejects.toThrow("Conflicting proof");
      expect(writes).not.toHaveBeenCalled();
      expect(await cashuDb.proofs.toArray()).toEqual([
        { ...proof, reserved: true, quote: "pending-payment" },
      ]);
      expect(notifySuccess).not.toHaveBeenCalled();
    }
  );

  it("rejects conflicting entries within a backup before inserting any proofs", async () => {
    const store = useStorageStore();
    await expect(
      store.restoreFromBackup(backup([proof, { ...proof, amount: 16 }]))
    ).rejects.toThrow("Conflicting proof");
    expect(await cashuDb.proofs.count()).toBe(0);
  });

  it("does not duplicate legacy history rows without IDs on reimport", async () => {
    const store = useStorageStore();
    const data = {
      ...backup(),
      "cashu.historyTokens": JSON.stringify([
        {
          status: "paid",
          amount: 8,
          date: "2026-01-01",
          token: "cashu-token",
          mint: "https://mint.example",
          unit: "sat",
        },
      ]),
    };
    await store.restoreFromBackup(data);
    await store.restoreFromBackup(data);
    expect(await cashuDb.ecashHistory.count()).toBe(1);
  });

  it("propagates persistence failures without reporting success or reloading", async () => {
    vi.spyOn(cashuDb.proofs, "add").mockRejectedValue(
      new Error("Persistence failed")
    );
    await expect(useStorageStore().restoreFromBackup(backup())).rejects.toThrow(
      "Persistence failed"
    );
    expect(notifySuccess).not.toHaveBeenCalled();
    expect(window.location.reload).not.toHaveBeenCalled();
  });
});
