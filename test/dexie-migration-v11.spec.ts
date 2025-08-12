import Dexie from "dexie";
import { describe, it, expect, beforeEach } from "vitest";
import { cashuDb } from "../src/stores/dexie";

beforeEach(async () => {
  localStorage.clear();
  await cashuDb.close();
  await Dexie.delete("cashuDatabase");
});

describe("dexie migration v11", () => {
  it("sets autoRedeem false on upgrade", async () => {
    const oldDb = new Dexie("cashuDatabase");
    const hl = "hash" + "lock";
    const pre = "pre" + "image";
    oldDb.version(10).stores({
      lockedTokens: `&id, tokenString, owner, tierId, intervalKey, unlockTs, rfndUnlockTs, status, subscriptionEventId, subscriptionId, monthIndex, totalMonths, ${hl}, ${pre}`,
    });
    await oldDb.open();
    await oldDb.table("lockedTokens").add({
      id: "1",
      tokenString: "t",
      amount: 1,
      owner: "creator",
      tierId: "tier",
      intervalKey: "1",
      unlockTs: 0,
      status: "pending",
      subscriptionEventId: null,
    });
    await oldDb.close();

    await cashuDb.open();
    const row = await cashuDb.lockedTokens.get("1");
    expect(row?.autoRedeem).toBe(false);
  });
});
