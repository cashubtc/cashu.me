import type { CounterSource } from "@cashu/cashu-ts";
import { cashuDb } from "src/stores/dexie";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";

/** Reservations are committed before the SDK derives outputs, including across tabs. */
export function persistentCounterSource(
  seed: Uint8Array,
  legacy: Record<string, number>
): CounterSource {
  const identity = bytesToHex(sha256(seed));
  const valid = (n: number) => {
    if (!Number.isSafeInteger(n) || n < 0)
      throw new Error("Invalid deterministic counter");
  };
  const update = async (key: string, fn: (next: number) => number) => {
    const id = `${identity}:${key}`;
    return cashuDb.transaction("rw", cashuDb.paymentCounters, async () => {
      const current = Math.max(
        (await cashuDb.paymentCounters.get(id))?.next ?? 0,
        legacy[key] ?? 0
      );
      valid(current);
      const next = fn(current);
      valid(next);
      if (next > current) await cashuDb.paymentCounters.put({ id, next });
      return current;
    });
  };
  return {
    async reserve(key, count) {
      valid(count);
      return { start: await update(key, (next) => next + count), count };
    },
    async reserveAt(key, start, count) {
      valid(start);
      valid(count);
      await update(key, (next) => {
        if (start < next)
          throw new Error("Deterministic counter range is already reserved");
        return start + count;
      });
      return { start, count };
    },
    async advanceToAtLeast(key, minNext) {
      valid(minNext);
      await update(key, (next) => Math.max(next, minNext));
    },
  };
}
