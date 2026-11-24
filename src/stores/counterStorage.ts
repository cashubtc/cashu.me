import { cashuDb, putKeysetCountersMax } from "src/stores/dexie";
import { moveLocalStorageKey } from "src/stores/legacyStorage";

/**
 * Moves `cashu.keysetCounters` (the current mnemonic's deterministic secret
 * counters) into the keysetCounters table, never lowering a stored counter.
 *
 * `cashu.oldMnemonicCounters` stays in localStorage: it holds old mnemonics,
 * only grows when the mnemonic is replaced, and moving secrets is out of
 * scope for this migration.
 */
export async function importLegacyKeysetCounters() {
  await moveLocalStorageKey<{ id: string; counter: number }[]>({
    key: "cashu.keysetCounters",
    tables: [cashuDb.keysetCounters],
    write: async (counters) => {
      await putKeysetCountersMax(counters || []);
    },
    verify: async (counters) => {
      const valid = (counters || []).filter((entry) => entry && entry.id);
      const stored = await cashuDb.keysetCounters.bulkGet(
        valid.map((entry) => entry.id)
      );
      return valid.every(
        (entry, index) => (stored[index]?.counter ?? -1) >= entry.counter
      );
    },
  });
}
