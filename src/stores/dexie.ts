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
};

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
