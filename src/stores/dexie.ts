import { defineStore } from "pinia";
import Dexie, { Table } from "dexie";
import { useLocalStorage } from "@vueuse/core";
import { WalletProof } from "./mints";
import { useStorageStore } from "./storage";
import { useProofsStore } from "./proofs";
import { notifyError, notifySuccess } from "../js/ui-utils";

export interface CachedProfileDexie {
  pubkey: string;
  profile: any;
  fetchedAt: number;
}

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
  profiles!: Table<CachedProfileDexie>;

  constructor() {
    super("db");
    this.version(1).stores({
      proofs: "secret, id, C, amount, reserved, quote",
    });
    this.version(2)
      .stores({
        proofs: "secret, id, C, amount, reserved, quote, bucketId",
      })
      .upgrade(async (tx) => {
        await tx
          .table("proofs")
          .toCollection()
          .modify((proof: any) => {
            if (proof.bucketId === undefined) {
              proof.bucketId = "unassigned";
            }
          });
      });
    this.version(3)
      .stores({
        proofs: "secret, id, C, amount, reserved, quote, bucketId, label",
      })
      .upgrade(async (tx) => {
        await tx
          .table("proofs")
          .toCollection()
          .modify((proof: any) => {
            if (proof.label === undefined) {
              proof.label = "";
            }
          });
      });
    this.version(4).stores({
      proofs: "secret, id, C, amount, reserved, quote, bucketId, label",
      profiles: "pubkey",
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
    },
  },
});
