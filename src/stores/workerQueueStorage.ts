import { cashuDb } from "src/stores/dexie";
import { moveLocalStorageKey } from "src/stores/legacyStorage";
import { createTableMirror, toMirrorRows } from "src/stores/tableMirror";

/**
 * Persistence for the transaction worker's queues. All four share the
 * workerQueue table; each queue is the slice with its `kind`, and `ref` is the
 * entry's quote id (incoming) or payment id (outgoing).
 */
export type WorkerQueueKind = "bolt11" | "bolt12" | "onchain" | "outgoing";

/** localStorage keys the queues used before they moved to IndexedDB. */
export const LEGACY_WORKER_QUEUE_KEYS: Record<WorkerQueueKind, string> = {
  bolt11: "cashu.worker.invoices.quotesQueue",
  bolt12: "cashu.worker.invoices.bolt12QuotesQueue",
  onchain: "cashu.worker.invoices.onchainQuotesQueue",
  outgoing: "cashu.worker.outgoing.queue",
};

type QueueEntry = { quote: string } | { id: string };

const queueRef = (entry: QueueEntry) =>
  "quote" in entry ? entry.quote : entry.id;

/** The stored row for a queue entry; used by migrations and the mirror. */
const toQueueRow = (kind: WorkerQueueKind) => (entry: QueueEntry) => ({
  ...entry,
  kind,
  ref: queueRef(entry),
});

export function workerQueueRows(kind: WorkerQueueKind, entries: QueueEntry[]) {
  return toMirrorRows(entries, toQueueRow(kind));
}

export function createWorkerQueueTable<T extends QueueEntry>(
  kind: WorkerQueueKind
) {
  return createTableMirror<T>(cashuDb.workerQueue, {
    keyOf: (entry) => [kind, queueRef(entry)],
    toRow: toQueueRow(kind),
    fromRow: ({ kind: _kind, ref: _ref, ...entry }) => entry as T,
    load: (table) => table.where("kind").equals(kind).toArray(),
  });
}

/** Moves the four legacy localStorage queues into the workerQueue table. */
export async function importLegacyWorkerQueues() {
  for (const [kind, key] of Object.entries(LEGACY_WORKER_QUEUE_KEYS) as [
    WorkerQueueKind,
    string
  ][]) {
    await moveLocalStorageKey<QueueEntry[]>({
      key,
      tables: [cashuDb.workerQueue],
      write: async (entries) => {
        const valid = (entries || []).filter(
          (entry) => entry && queueRef(entry)
        );
        await cashuDb.workerQueue.bulkPut(workerQueueRows(kind, valid));
      },
    });
  }
}
