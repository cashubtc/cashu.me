import { watch } from "vue";
import type { MintKeys } from "@cashu/cashu-ts";
import { cashuDb } from "src/stores/dexie";
import {
  createTableMirror,
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

function unionById<T extends { id: string }>(first: T[] = [], later: T[] = []) {
  const known = new Set(first.map((item) => item.id));
  return [...first, ...later.filter((item) => !known.has(item.id))];
}

/**
 * Two entries with the same URL (possible after editing a mint's URL) are
 * stored as one mint with the keysets and keys of both, so no keyset (and
 * the balance of its proofs) disappears. The first entry's metadata wins.
 */
export function mergeDuplicateMint(
  first: StoredMint,
  later: StoredMint
): StoredMint {
  return {
    ...first,
    keysets: unionById(first.keysets, later.keysets),
    keys: unionById(first.keys, later.keys),
  };
}

export function mergeDuplicateMints(mints: StoredMint[]): StoredMint[] {
  const byUrl = new Map<string, StoredMint>();
  for (const mint of mints) {
    const previous = byUrl.get(mint.url);
    byUrl.set(mint.url, previous ? mergeDuplicateMint(previous, mint) : mint);
  }
  return [...byUrl.values()];
}

export function createMintsTable(): MintsTable {
  let keysHydrated = false;
  let persistedKeys = new Set<string>();

  // Computed from the same snapshot as the mint rows and applied inside their
  // transaction, so a mint row and its keys always describe one revision (a
  // URL change moves both or neither).
  const prepareKeys = (mints: StoredMint[]) => {
    if (!keysHydrated) return undefined;
    const current = new Map<string, MintKeysRow>();
    for (const row of mintKeysRows(mints)) {
      current.set(keysKey(row.mintUrl, row.id), row);
    }
    const puts = [...current.entries()]
      .filter(([key]) => !persistedKeys.has(key))
      .map(([, row]) => row);
    const deletes = [...persistedKeys]
      .filter((key) => !current.has(key))
      .map((key) => JSON.parse(key) as [string, string]);
    return {
      apply: async () => {
        if (deletes.length) await cashuDb.mintKeys.bulkDelete(deletes);
        if (puts.length) await cashuDb.mintKeys.bulkPut(puts);
      },
      afterCommit: () => {
        persistedKeys = new Set(current.keys());
      },
    };
  };

  const mirror = createTableMirror<StoredMint>(cashuDb.mints, {
    keyOf: (mint) => mint.url,
    toRow: mintToRow,
    fromRow: (row) => ({ ...row, keys: [] }),
    mergeDuplicates: mergeDuplicateMint,
    extraTables: [cashuDb.mintKeys],
    prepareExtra: prepareKeys,
  });

  // Keys of a keyset never change, so tracking (mint url, keyset id) pairs is
  // enough to know when the keys need writing.
  watch(
    () =>
      mirror.items.value
        .flatMap((mint) =>
          (mint.keys || []).map((keys) => keysKey(mint.url, keys.id))
        )
        .join("\t"),
    mirror.touch,
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
    mirror.touch();
  };

  return {
    items: mirror.items,
    touch: mirror.touch,
    hydrated: () => keysHydrated,
    hydrate,
    flush: mirror.flush,
  };
}

/**
 * Moves `cashu.mints` from localStorage into the mints and mintKeys tables.
 * Entries with the same URL (in the legacy list, or already in the table
 * from an earlier restore) are merged, never overwritten, so every keyset
 * stays attached to a mint.
 */
export async function importLegacyMints() {
  const validMints = (mints: StoredMint[]) =>
    (mints || []).filter((mint) => mint && mint.url);
  await moveLocalStorageKey<StoredMint[]>({
    key: "cashu.mints",
    tables: [cashuDb.mints, cashuDb.mintKeys],
    write: async (mints) => {
      const legacy = mergeDuplicateMints(validMints(mints));
      const existing = await cashuDb.mints.bulkGet(legacy.map((m) => m.url));
      const merged = legacy.map((mint, index) => {
        const stored = existing[index];
        if (!stored) return { row: mint, position: index };
        // keep the stored row's position and metadata, add legacy keysets
        const { _pos, ...storedMint } = stored;
        return {
          row: mergeDuplicateMint({ ...storedMint, keys: [] }, mint),
          position: _pos ?? index,
        };
      });
      await cashuDb.mints.bulkPut(
        merged.map(({ row, position }) => ({
          ...toMirrorRows([row], mintToRow)[0],
          _pos: position,
        }))
      );
      await cashuDb.mintKeys.bulkPut(mintKeysRows(legacy));
    },
    verify: async (mints) => {
      const valid = validMints(mints);
      const stored = await cashuDb.mints.bulkGet(valid.map((m) => m.url));
      // every legacy keyset must be attached to its stored mint
      const complete = valid.every((mint, index) => {
        const row = stored[index];
        if (!row) return false;
        const keysetIds = new Set((row.keysets || []).map((k: any) => k.id));
        return (mint.keysets || []).every((k) => keysetIds.has(k.id));
      });
      if (!complete) return false;
      const keyRows = mintKeysRows(valid);
      const storedKeys = await cashuDb.mintKeys.bulkGet(
        keyRows.map((row) => [row.mintUrl, row.id])
      );
      return storedKeys.every(Boolean);
    },
  });
}
