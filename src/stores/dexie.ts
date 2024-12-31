import { defineStore } from "pinia";
import Dexie, { Table } from "dexie";
import { useLocalStorage } from "@vueuse/core";
import { WalletProof } from "./mints";
import { useStorageStore } from "./storage";
import { useProofsStore } from "./proofs";
import { notifyError, notifySuccess } from "../js/notify";

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
    migrateToDexie: async function () {
      const proofsStore = useProofsStore();
      if (this.migratedToDexie) {
        return;
      }
      console.log("Migrating to Dexie");
      await useStorageStore().exportWalletState();
      // migrate proofs from localstorage to Dexie
      const proofs = localStorage.getItem("cashu.proofs");
      let parsedProofs: WalletProof[] = [];
      if (proofs) {
        parsedProofs = JSON.parse(proofs) as WalletProof[];
        parsedProofs.forEach((proof) => {
          cashuDb.proofs.add(proof);
        });
      }
      console.log(`Migrated ${cashuDb.proofs.count()} proofs`);
      this.migratedToDexie = true;
      // remove proofs from localstorage
      localStorage.removeItem("cashu.proofs");
      notifySuccess("Database migration complete");
    },
    deleteAllTables: function () {
      cashuDb.proofs.clear();
    },
  },
});
