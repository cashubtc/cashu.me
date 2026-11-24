import { defineStore } from "pinia";
import Dexie, { Table } from "dexie";
import { useLocalStorage } from "@vueuse/core";
import { moveLocalStorageKey } from "./legacyStorage";
import type { WalletProof } from "./mints";
import type { SeenEventRow } from "./seenEvents";
import {
  cashuAmountToNumber,
  normalizeCashuQuoteAmounts,
} from "src/js/cashu-amount";

// export interface Proof {
//   id: string
//   C: string
//   amount: number
//   reserved: boolean
//   secret: string
//   quote?: string
// }

export class CashuDexie extends Dexie {
  proofs!: Table<WalletProof>;
  paymentHistory!: Table<any>;
  mintQuotes!: Table<any>;
  meltQuotes!: Table<any>;
  ecashHistory!: Table<any>;
  seenEvents!: Table<SeenEventRow, [string, string]>;
  paymentRequests!: Table<any, string>;
  mints!: Table<any, string>;
  mintKeys!: Table<any, [string, string]>;
  workerQueue!: Table<any, [string, string]>;
  keysetCounters!: Table<{ id: string; counter: number }, string>;
  p2pkKeys!: Table<any, string>;

  constructor(databaseName = "db") {
    super(databaseName);
    this.version(1).stores({
      proofs: "secret, id, C, amount, reserved, quote",
    });
    this.version(2).stores({
      proofs: "secret, id, C, amount, reserved, quote",
      paymentHistory:
        "id, direction, quote, parentQuote, method, status, mint, unit, date, paidDate, [direction+quote], [direction+status], [method+status]",
      mintQuotes: "quote, method, request, unit, state, expiry, pubkey",
      meltQuotes: "quote, method, request, unit, state, expiry",
    });
    this.version(3).stores({
      proofs: "secret, id, C, amount, reserved, quote",
      paymentHistory:
        "id, direction, quote, parentQuote, method, status, mint, unit, date, paidDate, [direction+quote], [direction+status], [method+status]",
      mintQuotes: "quote, method, request, unit, state, expiry, pubkey",
      meltQuotes: "quote, method, request, unit, state, expiry",
      ecashHistory:
        "id, status, token, mint, unit, date, paidDate, paymentRequestId, [status+date], [mint+unit]",
    });
    this.version(4)
      .stores({
        proofs: "secret, id, C, amount, reserved, quote",
        paymentHistory:
          "id, direction, quote, parentQuote, method, status, mint, unit, date, paidDate, [direction+quote], [direction+status], [method+status]",
        mintQuotes: "quote, method, request, unit, state, expiry, pubkey",
        meltQuotes: "quote, method, request, unit, state, expiry",
        ecashHistory:
          "id, status, token, mint, unit, date, paidDate, paymentRequestId, [status+date], [mint+unit]",
      })
      .upgrade(async (transaction) => {
        await transaction
          .table("proofs")
          .toCollection()
          .modify((proof) => {
            proof.amount = cashuAmountToNumber(proof.amount);
          });
        await transaction
          .table("mintQuotes")
          .toCollection()
          .modify((quote) => {
            Object.assign(quote, normalizeCashuQuoteAmounts(quote));
          });
        await transaction
          .table("meltQuotes")
          .toCollection()
          .modify((quote) => {
            Object.assign(quote, normalizeCashuQuoteAmounts(quote));
          });
      });
    // v5: data moved out of localStorage (see migrations.ts v6)
    this.version(5).stores({
      seenEvents: "[scope+id], scope, created_at",
      paymentRequests: "id",
    });
    // v6: mints split into mint rows and their (large, immutable) keys
    this.version(6).stores({
      mints: "url",
      mintKeys: "[mintUrl+id], mintUrl",
    });
    // v7: transaction worker queues (kind: bolt11 | bolt12 | onchain | outgoing)
    this.version(7).stores({
      workerQueue: "[kind+ref], kind",
    });
    // v8: deterministic secret counters (current mnemonic) and P2PK keys
    this.version(8).stores({
      keysetCounters: "id",
      p2pkKeys: "publicKey",
    });
  }
}

export const cashuDb = new CashuDexie();

/**
 * Every table in `cashuDb` must be listed here. Wallet backup, restore and
 * wipe all iterate over this list, so adding a table here is the only step
 * needed for it to be backed up.
 *
 * - `backup: true` tables are exported as `cashu.dexie.db.<name>` and
 *   restored with `bulkPut`. `normalize` runs on each restored row.
 * - `backup: false` tables are caches that can be rebuilt; they are only
 *   cleared on wipe.
 */
export type WalletTableSpec = {
  name: string;
  backup: boolean;
  normalize?: (row: any) => any;
  /** Custom restore instead of bulkPut (e.g. merge without going backwards). */
  restore?: (rows: any[]) => Promise<void>;
};

/**
 * Store keyset counters, never lowering one that is already stored: a counter
 * that goes backwards re-derives outputs the mint has already signed.
 */
export async function putKeysetCountersMax(
  counters: { id: string; counter: number }[]
) {
  const valid = counters.filter(
    (entry) => entry && entry.id && Number.isFinite(entry.counter)
  );
  await cashuDb.transaction("rw", cashuDb.keysetCounters, async () => {
    const existing = await cashuDb.keysetCounters.bulkGet(
      valid.map((entry) => entry.id)
    );
    const rows = new Map<string, any>();
    valid.forEach((entry, index) => {
      const stored = existing[index];
      const previous = rows.get(entry.id);
      const counter = Math.max(
        entry.counter,
        stored?.counter ?? 0,
        previous?.counter ?? 0
      );
      rows.set(entry.id, { ...(stored || {}), ...entry, counter });
    });
    await cashuDb.keysetCounters.bulkPut([...rows.values()]);
  });
}

export const BACKUP_TABLE_KEY_PREFIX = "cashu.dexie.db.";

export const WALLET_TABLES: WalletTableSpec[] = [
  // proofs are exported and restored through the proofs store (see storage.ts)
  { name: "proofs", backup: true },
  { name: "paymentHistory", backup: true },
  { name: "mintQuotes", backup: true, normalize: normalizeCashuQuoteAmounts },
  { name: "meltQuotes", backup: true, normalize: normalizeCashuQuoteAmounts },
  { name: "ecashHistory", backup: true },
  // backed up so a restored wallet does not handle old DMs and NWC requests again
  { name: "seenEvents", backup: true },
  { name: "paymentRequests", backup: true },
  { name: "mints", backup: true },
  { name: "mintKeys", backup: true },
  // pending payments to check, so a restored wallet still claims them
  { name: "workerQueue", backup: true },
  {
    name: "keysetCounters",
    backup: true,
    restore: (rows) => putKeysetCountersMax(rows),
  },
  // losing these loses access to ecash locked to them
  { name: "p2pkKeys", backup: true },
];

export function walletTableSpec(name: string): WalletTableSpec | undefined {
  return WALLET_TABLES.find((spec) => spec.name === name);
}

export const useDexieStore = defineStore("dexie", {
  state: () => ({
    migratedToDexie: useLocalStorage<boolean>("cashu.dexie.migrated", false),
  }),
  getters: {},
  actions: {
    migrateToDexie: async function () {
      const { useProofsStore } = await import("./proofs");
      const proofsStore = useProofsStore();
      if (this.migratedToDexie) {
        return;
      }
      console.log("Migrating to Dexie");
      const proofs = localStorage.getItem("cashu.proofs");
      let parsedProofs: WalletProof[] = [];
      if (!proofs) {
        console.log("No cashu.proofs in localStorage to migrate");
        this.migratedToDexie = true;
        return;
      }
      parsedProofs = JSON.parse(proofs) as WalletProof[];
      if (!parsedProofs.length) {
        console.log("No proofs to migrate");
        this.migratedToDexie = true;
        return;
      }
      // start migration
      const { useStorageStore } = await import("./storage");
      await useStorageStore().exportWalletState();
      // Commit every proof before the legacy key is removed.
      await moveLocalStorageKey<WalletProof[]>({
        key: "cashu.proofs",
        tables: [cashuDb.proofs],
        write: async (rows) => {
          await cashuDb.proofs.bulkPut(rows);
        },
        verify: async (rows) => {
          const stored = await cashuDb.proofs.bulkGet(
            rows.map((proof) => proof.secret)
          );
          return stored.every(Boolean);
        },
      });
      const migrated = await proofsStore.getProofs();
      console.log(
        `Migrated proofs. Before: ${parsedProofs.length} proofs, After: ${migrated.length} proofs`
      );
      console.log(
        `Proofs sum before: ${proofsStore.sumProofs(
          parsedProofs
        )}, after: ${proofsStore.sumProofs(migrated)}`
      );
      this.migratedToDexie = true;
    },
    deleteAllTables: async function () {
      await Promise.all(cashuDb.tables.map((table) => table.clear()));
    },
  },
});
