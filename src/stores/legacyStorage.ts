import type { Table } from "dexie";

/**
 * Moving data from localStorage into IndexedDB.
 *
 * Every move goes through `moveLocalStorageKey`, which only removes the
 * localStorage key after the IndexedDB transaction has committed and the
 * optional verification passed. A move is idempotent: when the key is gone it
 * does nothing, and when it fails the key stays so the move can be retried.
 */
export type MoveLocalStorageKeyOptions<T> = {
  key: string;
  /** Tables the write touches. They must all belong to the same database. */
  tables: Table<any, any>[];
  /** Defaults to JSON.parse. */
  parse?: (raw: string) => T;
  /** Runs inside one rw transaction over `tables`. */
  write: (value: T) => Promise<void>;
  /** Runs after the transaction committed; return false to keep the key. */
  verify?: (value: T) => Promise<boolean>;
};

export async function moveLocalStorageKey<T>(
  opts: MoveLocalStorageKeyOptions<T>
): Promise<boolean> {
  const raw = localStorage.getItem(opts.key);
  if (raw == null) return false;
  const value = opts.parse ? opts.parse(raw) : (JSON.parse(raw) as T);
  if (opts.tables.length) {
    const db = opts.tables[0].db;
    await db.transaction("rw", opts.tables, () => opts.write(value));
  } else {
    await opts.write(value);
  }
  if (opts.verify && !(await opts.verify(value))) {
    throw new Error(`Verification failed while moving ${opts.key}`);
  }
  localStorage.removeItem(opts.key);
  console.log(`Moved ${opts.key} (${raw.length} bytes) to IndexedDB`);
  return true;
}

/**
 * localStorage keys that now live in IndexedDB, with the function that moves
 * them. Versioned migrations call these on upgrade, and `restoreFromBackup`
 * calls `importLegacyLocalStorageKeys` so that backup files written by older
 * versions land in the new tables instead of in localStorage.
 */
export type LegacyKeyImporter = {
  key: string;
  run: () => Promise<void>;
};

export const LEGACY_KEY_IMPORTERS: LegacyKeyImporter[] = [];

export async function importLegacyLocalStorageKeys() {
  for (const importer of LEGACY_KEY_IMPORTERS) {
    if (localStorage.getItem(importer.key) == null) continue;
    await importer.run();
  }
}
