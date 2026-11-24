import { cashuDb } from "src/stores/dexie";
import { i18n } from "src/boot/i18n";
import { notifyError } from "src/js/notify";
import { createSerialWriter, reportWriteFailure } from "src/stores/tableMirror";

/**
 * Nostr event ids we already handled, per scope ("nip17", "nwc:<pubkey>").
 *
 * The check must be synchronous: relays deliver the same event several times
 * in quick succession, and an async lookup would let two copies through
 * before either is recorded. So the ids of a scope are loaded into a Set once
 * (`load()`), `markSeen()` checks and records in that Set synchronously, and
 * the row is written to IndexedDB in the background through a serial writer
 * (so failures are reported, retried, and make flushPendingWrites reject).
 */
export type SeenEventRow = {
  scope: string;
  id: string;
  created_at: number;
};

const PRUNE_INTERVAL_MS = 60 * 60 * 1000;

// rows recorded in memory but not yet committed, keyed by "scope\nid"
const unsaved = new Map<string, SeenEventRow>();
const seenEventsWriter = createSerialWriter(
  "seenEvents",
  async () => {
    const rows = [...unsaved.entries()];
    if (!rows.length) return;
    await cashuDb.seenEvents.bulkPut(rows.map(([, row]) => row));
    // only forget rows that were not recorded again meanwhile
    for (const [key, row] of rows) {
      if (unsaved.get(key) === row) unsaved.delete(key);
    }
  },
  () => true
);

/**
 * Moves the legacy localStorage ids of a scope into the table before they are
 * loaded, so a failed move stops the listener instead of letting it handle
 * old events again.
 */
async function importLegacySeenEvents(scope: string) {
  const legacy = await import("src/stores/legacyImporters");
  if (scope === "nip17") await legacy.importLegacyNip17SeenEvents();
  if (scope.startsWith("nwc:")) {
    await legacy.importLegacyNwcProcessedRequestIds();
  }
}

export class SeenEventLog {
  private ids = new Set<string>();
  private loaded: Promise<void> | null = null;
  private lastPrunedAt = 0;

  constructor(
    readonly scope: string,
    /** Events older than this many seconds are forgotten. */
    readonly maxAgeSeconds: number
  ) {}

  load(): Promise<void> {
    if (!this.loaded) {
      this.loaded = (async () => {
        await importLegacySeenEvents(this.scope);
        await this.prune();
        const rows = await cashuDb.seenEvents
          .where("scope")
          .equals(this.scope)
          .toArray();
        rows.forEach((row) => this.ids.add(row.id));
      })().catch((error) => {
        this.loaded = null;
        // the caller does not subscribe without its seen ids (fails closed)
        console.error(`Could not load seen events (${this.scope})`, error);
        notifyError(i18n.global.t("WalletStorage.load_failed")).catch(() => {});
        throw error;
      });
    }
    return this.loaded;
  }

  has(id: string): boolean {
    return this.ids.has(id);
  }

  /** Returns false when the event was seen before. */
  markSeen(id: string, createdAt?: number): boolean {
    if (this.ids.has(id)) return false;
    this.ids.add(id);
    const row: SeenEventRow = {
      scope: this.scope,
      id,
      created_at: createdAt ?? Math.floor(Date.now() / 1000),
    };
    unsaved.set(`${this.scope}\n${id}`, row);
    seenEventsWriter.schedule();
    // long-running sessions keep forgetting expired ids, not only on load
    if (Date.now() - this.lastPrunedAt > PRUNE_INTERVAL_MS) {
      this.lastPrunedAt = Date.now();
      // prune after pending writes, so it also sees the rows just recorded
      seenEventsWriter
        .flush()
        .catch(() => {})
        .then(() => this.prune())
        .catch((error) => reportWriteFailure("seenEvents", error));
    }
    return true;
  }

  async prune() {
    this.lastPrunedAt = Date.now();
    const cutoff = Math.floor(Date.now() / 1000) - this.maxAgeSeconds;
    const expired = await cashuDb.seenEvents
      .where("scope")
      .equals(this.scope)
      .filter((row) => row.created_at < cutoff)
      .primaryKeys();
    if (!expired.length) return;
    await cashuDb.seenEvents.bulkDelete(expired);
    // keep the in-memory set in step with the table
    expired.forEach((key) => this.ids.delete((key as [string, string])[1]));
  }
}
