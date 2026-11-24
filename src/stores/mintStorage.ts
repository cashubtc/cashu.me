import { watch } from "vue";
import type { MintKeys } from "@cashu/cashu-ts";
import { cashuDb } from "src/stores/dexie";
import {
  createTableMirror,
  createSerialWriter,
  toMirrorRows,
  toPlainRow,
  type TableMirror,
} from "src/stores/tableMirror";
import { moveLocalStorageKey } from "src/stores/legacyStorage";
import type { StoredMint } from "src/stores/mints";

/**
 * Persistence for the mints store.
 *
 * In memory, `useMintsStore().mints` stays a `StoredMint[]` with every
 * keyset's keys attached, so its many readers are unchanged. On disk a mint is
 * split in two:
 *
 * - `mints` (key `url`): the mint without `keys`; small, changes often
 *   (info, flags, timestamps).
 * - `mintKeys` (key `[mintUrl+id]`): one row per keyset's keys; large and
 *   immutable, written once when a keyset is first seen. Two mint URLs can
 *   share a keyset, hence the compound key.
 */
export type MintKeysRow = MintKeys & { mintUrl: string };

export function mintToRow(mint: StoredMint): Omit<StoredMint, "keys"> {
  const row: Partial<StoredMint> = { ...mint };
  delete row.keys;
  return row as Omit<StoredMint, "keys">;
}

export function mintKeysRows(mints: StoredMint[]): MintKeysRow[] {
  return mints.flatMap((mint) =>
    (mint.keys || []).map((keys) => ({
      ...toPlainRow(keys),
      mintUrl: mint.url,
    }))
  );
}

// A serialized [mintUrl, id] tuple, so the key boundary is unambiguous.
const keysKey = (mintUrl: string, id: string) => JSON.stringify([mintUrl, id]);

export type MintsTable = TableMirror<StoredMint>;

export function createMintsTable(): MintsTable {
  const mirror = createTableMirror<StoredMint>(cashuDb.mints, {
    keyOf: (mint) => mint.url,
    toRow: mintToRow,
    fromRow: (row) => ({ ...row, keys: [] }),
  });

  let keysHydrated = false;
  let persistedKeys = new Set<string>();

  const writeKeys = async () => {
    const current = new Map<string, MintKeysRow>();
    for (const row of mintKeysRows(mirror.items.value)) {
      current.set(keysKey(row.mintUrl, row.id), row);
    }
    const puts = [...current.entries()]
      .filter(([key]) => !persistedKeys.has(key))
      .map(([, row]) => row);
    const deletes = [...persistedKeys]
      .filter((key) => !current.has(key))
      .map((key) => JSON.parse(key) as [string, string]);
    if (puts.length || deletes.length) {
      await cashuDb.transaction("rw", cashuDb.mintKeys, async () => {
        if (deletes.length) await cashuDb.mintKeys.bulkDelete(deletes);
        if (puts.length) await cashuDb.mintKeys.bulkPut(puts);
      });
    }
    persistedKeys = new Set(current.keys());
  };

  const keysWriter = createSerialWriter(
    "mintKeys",
    writeKeys,
    () => keysHydrated
  );

  // Keys of a keyset never change, so tracking (mint url, keyset id) pairs is
  // enough to know which rows to write or delete.
  watch(
    () =>
      mirror.items.value
        .flatMap((mint) =>
          (mint.keys || []).map((keys) => keysKey(mint.url, keys.id))
        )
        .join("\t"),
    keysWriter.schedule,
    { flush: "sync" }
  );

  const hydrate = async () => {
    if (keysHydrated) return;
    const keyRows = (await cashuDb.mintKeys.toArray()) as MintKeysRow[];
    await mirror.hydrate();
    if (keysHydrated) return;
    const byMint = new Map<string, MintKeys[]>();
    for (const { mintUrl, ...keys } of keyRows) {
      const list = byMint.get(mintUrl) || [];
      list.push(keys as MintKeys);
      byMint.set(mintUrl, list);
    }
    for (const mint of mirror.items.value) {
      const stored = byMint.get(mint.url) || [];
      // keys added in memory before hydration win
      const known = new Set((mint.keys || []).map((keys) => keys.id));
      mint.keys = [
        ...stored.filter((keys) => !known.has(keys.id)),
        ...(mint.keys || []),
      ];
    }
    persistedKeys = new Set(keyRows.map((row) => keysKey(row.mintUrl, row.id)));
    keysHydrated = true;
    keysWriter.schedule();
  };

  return {
    items: mirror.items,
    hydrated: () => keysHydrated,
    hydrate,
    flush: async () => {
      await mirror.flush();
      await keysWriter.flush();
    },
  };
}

/** Moves `cashu.mints` from localStorage into the mints and mintKeys tables. */
export async function importLegacyMints() {
  await moveLocalStorageKey<StoredMint[]>({
    key: "cashu.mints",
    tables: [cashuDb.mints, cashuDb.mintKeys],
    write: async (mints) => {
      const valid = (mints || []).filter((mint) => mint && mint.url);
      // A mint already in the table (e.g. restored twice) keeps its position.
      await cashuDb.mints.bulkPut(toMirrorRows(valid, mintToRow));
      await cashuDb.mintKeys.bulkPut(mintKeysRows(valid));
    },
    verify: async (mints) => {
      const valid = (mints || []).filter((mint) => mint && mint.url);
      const stored = await cashuDb.mints.bulkGet(valid.map((m) => m.url));
      if (!stored.every(Boolean)) return false;
      const keyRows = mintKeysRows(valid);
      const storedKeys = await cashuDb.mintKeys.bulkGet(
        keyRows.map((row) => [row.mintUrl, row.id])
      );
      return storedKeys.every(Boolean);
    },
  });
}
