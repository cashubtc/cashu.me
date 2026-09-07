import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { cashuDb } from "src/stores/dexie";
import { persistentCounterSource } from "src/js/paymentCounters";

const seed = new Uint8Array(64).fill(7);
describe("durable deterministic counters", () => {
  beforeEach(async () => {
    await cashuDb.paymentCounters.clear();
  });
  it("reserves disjoint ranges across concurrent wallet instances and reloads", async () => {
    const a = persistentCounterSource(seed, { keyset: 20 });
    const b = persistentCounterSource(seed, { keyset: 3 });
    const ranges = await Promise.all([
      a.reserve("keyset", 3),
      b.reserve("keyset", 2),
    ]);
    expect(ranges).toEqual([
      { start: 20, count: 3 },
      { start: 23, count: 2 },
    ]);
    expect(
      await persistentCounterSource(seed, {}).reserve("keyset", 1)
    ).toEqual({ start: 25, count: 1 });
  });
  it("does not write on peek and rejects reused manual ranges", async () => {
    const source = persistentCounterSource(seed, { keyset: 10 });
    expect(await source.reserve("keyset", 0)).toEqual({ start: 10, count: 0 });
    expect(await cashuDb.paymentCounters.count()).toBe(0);
    await source.reserveAt("keyset", 12, 2);
    await expect(source.reserveAt("keyset", 13, 2)).rejects.toThrow(
      "already reserved"
    );
    await source.advanceToAtLeast("keyset", 1);
    expect((await source.reserve("keyset", 0)).start).toBe(14);
  });
  it("separates seeds and never stores seed material in identifiers", async () => {
    await persistentCounterSource(seed, {}).reserve("keyset", 1);
    expect(
      (
        await persistentCounterSource(new Uint8Array(64).fill(8), {}).reserve(
          "keyset",
          1
        )
      ).start
    ).toBe(0);
    expect(
      (await cashuDb.paymentCounters.toArray()).every(
        (r) => !r.id.includes(seed.toString())
      )
    ).toBe(true);
  });
});
