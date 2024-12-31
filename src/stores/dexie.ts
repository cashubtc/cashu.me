import { defineStore } from "pinia";
import Dexie, { Table } from "dexie";
import { useLocalStorage } from "@vueuse/core";
import { WalletProof } from "./mints";

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

  constructor() {
    super("db");
    this.version(1).stores({
      proofs: "secret, id, C, amount, reserved, quote",
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
    migrateToDexie: function () {
      if (this.migratedToDexie) {
        return;
      }
      console.log("Migrating to Dexie");
      // get all proofs from localstorage "cashu.proofs" ad migrate them to Dexie db.proofs
      const proofs = localStorage.getItem("cashu.proofs");
      if (proofs) {
        const parsedProofs = JSON.parse(proofs) as WalletProof[];
        parsedProofs.forEach((proof) => {
          cashuDb.proofs.add(proof);
        });
      }
      console.log(`Migrated ${cashuDb.proofs.count()} proofs`);
      this.migratedToDexie = true;
      // remove localstorage "cashu.proofs"
      localStorage.removeItem("cashu.proofs");
    },
    deleteAllTables: function () {
      cashuDb.proofs.clear();
    },
  },
});
