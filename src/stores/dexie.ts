import { defineStore } from "pinia";
import Dexie, { Table } from "dexie";
import { useLocalStorage } from "@vueuse/core";
import type {
  OwnedPaymentRequest,
  PaymentJob,
  PaymentEnvelope,
  RelayCheckpoint,
} from "src/js/paymentRequestRepository";
import type { WalletProof } from "./mints";
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
  paymentRequests!: Table<OwnedPaymentRequest>;
  paymentJobs!: Table<PaymentJob>;
  paymentEnvelopes!: Table<PaymentEnvelope>;
  paymentCheckpoints!: Table<RelayCheckpoint>;
  paymentCounters!: Table<{ id: string; next: number }>;
  paymentProofClaims!: Table<{ id: string; jobId: string }>;
  paymentLocks!: Table<{ id: string; owner: string; expires: number }>;

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
    this.version(5).stores({
      paymentRequests: "id, identity, createdAt",
      paymentJobs:
        "id, identity, direction, state, requestId, historyId, fingerprint, retryAt, [identity+direction]",
      paymentEnvelopes: "id, identity, state, created_at",
      paymentCheckpoints: "id, identity, relay",
      paymentCounters: "id",
      paymentProofClaims: "id, jobId",
      paymentLocks: "id",
    });
  }
}

export const cashuDb = new CashuDexie();

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
      parsedProofs.forEach((proof) => {
        cashuDb.proofs.add(proof);
      });
      console.log(
        `Migrated ${cashuDb.proofs.count()} proofs. Before: ${
          parsedProofs.length
        } proofs, After: ${(await proofsStore.getProofs()).length} proofs`
      );
      console.log(
        `Proofs sum before: ${proofsStore.sumProofs(
          parsedProofs
        )}, after: ${proofsStore.sumProofs(await proofsStore.getProofs())}`
      );
      this.migratedToDexie = true;
      // remove proofs from localstorage
      localStorage.removeItem("cashu.proofs");
    },
    deleteAllTables: async function () {
      await Promise.all([
        cashuDb.proofs.clear(),
        cashuDb.paymentHistory.clear(),
        cashuDb.mintQuotes.clear(),
        cashuDb.meltQuotes.clear(),
        cashuDb.ecashHistory.clear(),
        cashuDb.paymentRequests.clear(),
        cashuDb.paymentJobs.clear(),
        cashuDb.paymentEnvelopes.clear(),
        cashuDb.paymentCheckpoints.clear(),
        cashuDb.paymentCounters.clear(),
        cashuDb.paymentProofClaims.clear(),
        cashuDb.paymentLocks.clear(),
      ]);
    },
  },
});
