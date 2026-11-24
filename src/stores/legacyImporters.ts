import { cashuDb } from "./dexie";
import { moveLocalStorageKey } from "./legacyStorage";
import { toMirrorRows } from "./tableMirror";
import type { SeenEventRow } from "./seenEvents";
import { importLegacyMints } from "./mintStorage";
import {
  importLegacyWorkerQueues,
  LEGACY_WORKER_QUEUE_KEYS,
} from "./workerQueueStorage";

/**
 * localStorage keys whose data now lives in IndexedDB, with the function
 * that moves them. Versioned migrations (migrations.ts) call these on
 * upgrade, and `restoreFromBackup` calls `importLegacyLocalStorageKeys` so
 * that backup files written by older versions land in the new tables instead
 * of in localStorage.
 *
 * Every importer is idempotent: it does nothing when its key is gone.
 */
export type LegacyKeyImporter = {
  key: string;
  run: () => Promise<void>;
};

const nowSeconds = () => Math.floor(Date.now() / 1000);

// ---- Phase 1 ---------------------------------------------------------------

/** A cache; rebuilt from the mintReviews DB. */
export async function importLegacyMintRecommendations() {
  localStorage.removeItem("cashu.ndk.mintRecommendations");
}

export async function importLegacyNip17SeenEvents() {
  await moveLocalStorageKey<{ id: string; created_at: number }[]>({
    key: "cashu.ndk.nip17EventIdsWeHaveSeen",
    tables: [cashuDb.seenEvents],
    write: async (events) => {
      const rows: SeenEventRow[] = (events || [])
        .filter((event) => event && typeof event.id === "string")
        .map((event) => ({
          scope: "nip17",
          id: event.id,
          created_at: event.created_at || nowSeconds(),
        }));
      await cashuDb.seenEvents.bulkPut(rows);
    },
  });
}

/** Moves `processedRequestIds` off the NWC connections (which stay put). */
export async function importLegacyNwcProcessedRequestIds() {
  const raw = localStorage.getItem("cashu.nwc.connections");
  if (!raw) return;
  const connections = JSON.parse(raw) as {
    connectionPublicKey: string;
    processedRequestIds?: string[];
  }[];
  if (!connections.some((conn) => conn.processedRequestIds)) return;
  // Their created_at is unknown; "now" keeps them for one more pruning window.
  const seenAt = nowSeconds();
  const rows: SeenEventRow[] = connections.flatMap((conn) =>
    (conn.processedRequestIds || []).map((id) => ({
      scope: `nwc:${conn.connectionPublicKey}`,
      id,
      created_at: seenAt,
    }))
  );
  await cashuDb.seenEvents.bulkPut(rows);
  // Write through the store so its in-memory copy drops the ids as well.
  const { useNWCStore } = await import("./nwc");
  useNWCStore().connections = connections.map(
    ({ processedRequestIds: _ids, ...conn }) => conn
  ) as any;
}

export async function importLegacyPaymentRequests() {
  await moveLocalStorageKey<any[]>({
    key: "cashu.pr.ours",
    tables: [cashuDb.paymentRequests],
    write: async (requests) => {
      await cashuDb.paymentRequests.bulkPut(
        toMirrorRows((requests || []).filter((request) => request?.id))
      );
    },
  });
}

// ---- Phase 2 ---------------------------------------------------------------

export { importLegacyMints };

// ---- Phase 3 ---------------------------------------------------------------

export { importLegacyWorkerQueues };

export const LEGACY_KEY_IMPORTERS: LegacyKeyImporter[] = [
  {
    key: "cashu.ndk.mintRecommendations",
    run: importLegacyMintRecommendations,
  },
  {
    key: "cashu.ndk.nip17EventIdsWeHaveSeen",
    run: importLegacyNip17SeenEvents,
  },
  { key: "cashu.nwc.connections", run: importLegacyNwcProcessedRequestIds },
  { key: "cashu.pr.ours", run: importLegacyPaymentRequests },
  { key: "cashu.mints", run: importLegacyMints },
  ...Object.values(LEGACY_WORKER_QUEUE_KEYS).map((key) => ({
    key,
    run: importLegacyWorkerQueues,
  })),
];

export async function importLegacyLocalStorageKeys() {
  for (const importer of LEGACY_KEY_IMPORTERS) {
    if (localStorage.getItem(importer.key) == null) continue;
    await importer.run();
  }
}
