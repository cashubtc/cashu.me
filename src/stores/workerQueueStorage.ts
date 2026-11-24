import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils.js";
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

type QueueEntry = { quote: string } | { id: string; type: "invoice" | "token" };

/**
 * One classification for both identifiers: an incoming entry is its quote
 * id; an outgoing check is (type, id), keyed by a hash because a token
 * check's id is the whole serialized token.
 */
function classify(entry: QueueEntry): { rawId: unknown; ref: () => string } {
  if ("quote" in entry) return { rawId: entry.quote, ref: () => entry.quote };
  return {
    rawId: entry.id,
    ref: () => `${entry.type}:${bytesToHex(sha256(utf8ToBytes(entry.id)))}`,
  };
}

const rawId = (entry: QueueEntry) => classify(entry).rawId;
const queueRef = (entry: QueueEntry) => classify(entry).ref();

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
          (entry) => entry && typeof rawId(entry) === "string" && rawId(entry)
        );
        await cashuDb.workerQueue.bulkPut(workerQueueRows(kind, valid));
      },
      verify: async (entries) => {
        const valid = (entries || []).filter(
          (entry) => entry && typeof rawId(entry) === "string" && rawId(entry)
        );
        const stored = await cashuDb.workerQueue.bulkGet(
          valid.map((entry) => [kind, queueRef(entry)])
        );
        return stored.every(Boolean);
      },
    });
  }
}
