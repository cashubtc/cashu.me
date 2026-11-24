import { ref, watch, type Ref } from "vue";
import type { IndexableType, Table } from "dexie";
import { JSONInt } from "@cashu/cashu-ts";
import { notifyError } from "src/js/notify";
import { i18n } from "src/boot/i18n";

/**
 * An in-memory array that is written through to a Dexie table.
 *
 * Stores that used `useLocalStorage` for a list mutate it in place all over
 * the code (push, splice, `item.field = x`). A table mirror keeps that
 * synchronous array API: `items` is a plain reactive array, and every change
 * is diffed per row and written to IndexedDB (changed rows are put, removed
 * rows deleted). Array order is kept in a `_pos` field on each row.
 *
 * Nothing is written before `hydrate()` has loaded the table, so an empty
 * array during startup can never overwrite stored rows. Items added before
 * hydration are merged over the stored rows and then persisted.
 */
export const MIRROR_POSITION_FIELD = "_pos";

export type TableMirror<T> = {
  items: Ref<T[]>;
  /** Queue a write even when `items` did not change (see writeExtra). */
  touch: () => void;
  hydrated: () => boolean;
  /** Load the table into `items`. Safe to call more than once. */
  hydrate: () => Promise<void>;
  /** Resolves once every change made so far is committed. */
  flush: () => Promise<void>;
};

// Every live mirror, so code that is about to reload, navigate away or wipe
// the wallet can wait for (or stop) pending writes.
type PendingWrites = {
  flush: () => Promise<void>;
  suspend: () => void;
  resume: () => void;
};
const pendingWriters = new Set<PendingWrites>();

export function registerPendingWrites(writer: PendingWrites) {
  pendingWriters.add(writer);
}

/**
 * Wait until every change made so far is in IndexedDB. Rejects when a write
 * failed, so callers do not reload or navigate away over lost changes.
 */
export async function flushPendingWrites() {
  await Promise.all([...pendingWriters].map((writer) => writer.flush()));
}

/** Stop all mirrors from writing (before the wallet tables are wiped). */
export function suspendPendingWrites() {
  pendingWriters.forEach((writer) => writer.suspend());
}

/** For tests: undo suspendPendingWrites. */
export function resumePendingWritesForTests() {
  pendingWriters.forEach((writer) => writer.resume());
}

/** Tell the user once per failing table; the write retries on the next change. */
export function reportWriteFailure(tableName: string, error: unknown) {
  console.error(`Could not persist ${tableName}`, error);
  // notifications are unavailable outside the app (e.g. in tests)
  notifyError(
    i18n.global.t("WalletStorage.save_failed", { name: tableName })
  ).catch(() => {});
}

export type SerialWriter = {
  /** Queue a write; changes made before it runs are written together. */
  schedule: () => void;
  /** Wait for queued writes; retries a failed one once, then rejects. */
  flush: () => Promise<void>;
};

/**
 * Runs `write` one at a time, coalescing changes made before it starts.
 * Failures are reported once and retried on the next schedule or flush; the
 * writer registers itself for flushPendingWrites/suspendPendingWrites.
 */
export function createSerialWriter(
  name: string,
  write: () => Promise<void>,
  canWrite: () => boolean
): SerialWriter {
  let scheduled = false;
  let suspended = false;
  let failure: unknown = null;
  let chain: Promise<void> = Promise.resolve();

  const schedule = () => {
    if (!canWrite() || suspended || scheduled) return;
    scheduled = true;
    chain = chain
      .then(async () => {
        scheduled = false;
        await write();
        failure = null;
      })
      .catch((error) => {
        if (!failure) reportWriteFailure(name, error);
        failure = error;
      });
  };

  const flush = async () => {
    await chain;
    if (failure) {
      schedule();
      await chain;
      if (failure) throw failure;
    }
  };

  registerPendingWrites({
    flush,
    suspend: () => {
      suspended = true;
    },
    resume: () => {
      suspended = false;
    },
  });
  return { schedule, flush };
}

export type TableMirrorOptions<T> = {
  /** The row's primary key; must match the table's primary key. */
  keyOf: (item: T) => IndexableType;
  /** Turn an item into the stored row (defaults to the item itself). */
  toRow?: (item: T) => any;
  /** Turn a stored row back into an item (the position field is removed). */
  fromRow?: (row: any) => T;
  /**
   * Rows this mirror owns (defaults to the whole table). Several mirrors can
   * share a table when each loads a disjoint slice of it.
   */
  load?: (table: Table<any, any>) => Promise<any[]>;
  /** Writes changed rows inside the transaction (defaults to bulkPut). */
  writeRows?: (rows: any[]) => Promise<void>;
  /**
   * Combines two items with the same key (e.g. duplicate mint URLs) instead
   * of letting the later one overwrite the earlier one. The merged item takes
   * the first one's position.
   */
  mergeDuplicates?: (first: T, later: T) => T;
  /**
   * Further writes committed in the same transaction as the rows (over
   * `extraTables`). Returns a callback that runs once the transaction has
   * committed.
   */
  extraTables?: Table<any, any>[];
  writeExtra?: () => Promise<(() => void) | void>;
  /**
   * How an item added before hydration combines with a stored item of the
   * same key. Defaults to the in-memory item.
   */
  merge?: (stored: T, early: T) => T;
};

/** Plain, structured-clone-safe copy of an item (strips Vue proxies). */
export function toPlainRow<T>(item: T): any {
  return JSONInt.parse(JSONInt.stringify(item) as string);
}

/** Rows as a table mirror stores them, for migrations and restores. */
export function toMirrorRows<T>(
  items: T[],
  toRow: (item: T) => any = (item) => item
): any[] {
  return items.map((item, index) => ({
    ...toPlainRow(toRow(item)),
    [MIRROR_POSITION_FIELD]: index,
  }));
}

function stripPosition(row: any) {
  const { [MIRROR_POSITION_FIELD]: _pos, ...rest } = row;
  return rest;
}

export function createTableMirror<T>(
  table: Table<any, any>,
  options: TableMirrorOptions<T>
): TableMirror<T> {
  const items = ref([]) as Ref<T[]>;
  let isHydrated = false;
  let hydrating: Promise<void> | null = null;
  // serialized row per key, as last written to (or read from) the table
  let persisted = new Map<string, string>();
  const keyString = (key: IndexableType) => JSONInt.stringify(key) as string;

  const keyOfRow = (row: any): IndexableType => {
    const keyPath = table.schema.primKey.keyPath;
    if (Array.isArray(keyPath)) return keyPath.map((path) => row[path]);
    return row[keyPath as string];
  };

  const uniqueItems = () => {
    const byKey = new Map<string, T>();
    for (const item of items.value) {
      const key = keyString(options.keyOf(item));
      const previous = byKey.get(key);
      byKey.set(
        key,
        previous !== undefined && options.mergeDuplicates
          ? options.mergeDuplicates(previous, item)
          : item
      );
    }
    return [...byKey.values()];
  };

  const write = async () => {
    const unique = uniqueItems();
    const rows = toMirrorRows(unique, options.toRow);
    const next = new Map<string, string>();
    const puts: any[] = [];
    rows.forEach((row, index) => {
      const key = keyString(options.keyOf(unique[index]));
      const serialized = JSONInt.stringify(row) as string;
      next.set(key, serialized);
      if (persisted.get(key) !== serialized) puts.push(row);
    });
    const deletes = [...persisted.keys()]
      .filter((key) => !next.has(key))
      .map((key) => JSONInt.parse(key) as IndexableType);
    let afterCommit: (() => void) | undefined;
    if (puts.length || deletes.length || options.writeExtra) {
      await table.db.transaction(
        "rw",
        [table, ...(options.extraTables || [])],
        async () => {
          if (deletes.length) await table.bulkDelete(deletes);
          if (puts.length) {
            if (options.writeRows) await options.writeRows(puts);
            else await table.bulkPut(puts);
          }
          if (options.writeExtra) {
            afterCommit = (await options.writeExtra()) || undefined;
          }
        }
      );
    }
    afterCommit?.();
    // only after the commit, so a failed write is retried with the next change
    persisted = next;
  };

  const writer = createSerialWriter(table.name, write, () => isHydrated);
  watch(items, writer.schedule, { deep: true, flush: "sync" });

  const hydrate = () => {
    if (isHydrated) return Promise.resolve();
    if (!hydrating) {
      hydrating = (async () => {
        const rows = options.load
          ? await options.load(table)
          : await table.toArray();
        rows.sort(
          (a, b) =>
            (a[MIRROR_POSITION_FIELD] ?? 0) - (b[MIRROR_POSITION_FIELD] ?? 0)
        );
        persisted = new Map(
          rows.map((row) => [
            keyString(keyOfRow(row)),
            JSONInt.stringify(row) as string,
          ])
        );
        const stored = rows.map((row) =>
          options.fromRow
            ? options.fromRow(stripPosition(row))
            : (stripPosition(row) as T)
        );
        // Items added before hydration are merged over stored rows with the
        // same key (by default they win).
        const early = items.value;
        const storedByKey = new Map(
          stored.map((item) => [keyString(options.keyOf(item)), item])
        );
        const earlyKeys = new Set(
          early.map((item) => keyString(options.keyOf(item)))
        );
        items.value = [
          ...stored.filter(
            (item) => !earlyKeys.has(keyString(options.keyOf(item)))
          ),
          ...early.map((item) => {
            const match = storedByKey.get(keyString(options.keyOf(item)));
            return match && options.merge ? options.merge(match, item) : item;
          }),
        ];
        isHydrated = true;
        if (early.length) writer.schedule();
      })().finally(() => {
        hydrating = null;
      });
    }
    return hydrating;
  };

  return {
    items,
    touch: writer.schedule,
    hydrated: () => isHydrated,
    hydrate,
    // a change schedules its write synchronously, so flushing covers every
    // change made before this call
    flush: writer.flush,
  };
}
