import { ref, watch, type Ref } from "vue";
import type { IndexableType, Table } from "dexie";
import { JSONInt } from "@cashu/cashu-ts";

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
  hydrated: () => boolean;
  /** Load the table into `items`. Safe to call more than once. */
  hydrate: () => Promise<void>;
  /** Resolves once every change made so far is committed. */
  flush: () => Promise<void>;
};

export type TableMirrorOptions<T> = {
  /** The row's primary key; must match the table's primary key. */
  keyOf: (item: T) => IndexableType;
  /** Turn a stored row back into an item (the position field is removed). */
  fromRow?: (row: any) => T;
};

/** Plain, structured-clone-safe copy of an item (strips Vue proxies). */
export function toPlainRow<T>(item: T): any {
  return JSONInt.parse(JSONInt.stringify(item) as string);
}

/** Rows as a table mirror stores them, for migrations and restores. */
export function toMirrorRows<T>(items: T[]): any[] {
  return items.map((item, index) => ({
    ...toPlainRow(item),
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
  let scheduled = false;
  let chain: Promise<void> = Promise.resolve();

  const keyString = (key: IndexableType) => JSONInt.stringify(key) as string;

  const keyOfRow = (row: any): IndexableType => {
    const keyPath = table.schema.primKey.keyPath;
    if (Array.isArray(keyPath)) return keyPath.map((path) => row[path]);
    return row[keyPath as string];
  };

  const write = async () => {
    scheduled = false;
    const rows = toMirrorRows(items.value);
    const next = new Map<string, string>();
    const puts: any[] = [];
    rows.forEach((row, index) => {
      const key = keyString(options.keyOf(items.value[index]));
      const serialized = JSONInt.stringify(row) as string;
      next.set(key, serialized);
      if (persisted.get(key) !== serialized) puts.push(row);
    });
    const deletes = [...persisted.keys()]
      .filter((key) => !next.has(key))
      .map((key) => JSONInt.parse(key) as IndexableType);
    if (puts.length || deletes.length) {
      await table.db.transaction("rw", table, async () => {
        if (deletes.length) await table.bulkDelete(deletes);
        if (puts.length) await table.bulkPut(puts);
      });
    }
    // only after the commit, so a failed write is retried with the next change
    persisted = next;
  };

  const schedule = () => {
    if (!isHydrated || scheduled) return;
    scheduled = true;
    chain = chain.then(write).catch((error) => {
      console.error(`Could not persist ${table.name}`, error);
    });
  };

  watch(items, schedule, { deep: true, flush: "sync" });

  const hydrate = () => {
    if (isHydrated) return Promise.resolve();
    if (!hydrating) {
      hydrating = (async () => {
        const rows = await table.toArray();
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
        // Items added before hydration win over stored rows with the same key.
        const early = items.value;
        const earlyKeys = new Set(
          early.map((item) => keyString(options.keyOf(item)))
        );
        items.value = [
          ...stored.filter(
            (item) => !earlyKeys.has(keyString(options.keyOf(item)))
          ),
          ...early,
        ];
        isHydrated = true;
        if (early.length) schedule();
      })().finally(() => {
        hydrating = null;
      });
    }
    return hydrating;
  };

  return {
    items,
    hydrated: () => isHydrated,
    hydrate,
    // a change schedules its write synchronously, so awaiting the chain
    // covers every change made before this call
    flush: () => chain,
  };
}
