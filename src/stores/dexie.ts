import { defineStore } from "pinia";
import Dexie, { Table } from "dexie";
import { useLocalStorage } from "@vueuse/core";
import type { WalletProof } from "./mints";

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

  constructor() {
    super("db");
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
    deleteAllTables: function () {
      cashuDb.proofs.clear();
      cashuDb.paymentHistory.clear();
      cashuDb.mintQuotes.clear();
      cashuDb.meltQuotes.clear();
      cashuDb.ecashHistory.clear();
    },
  },
});
