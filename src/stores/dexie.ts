import { defineStore } from "pinia";
import Dexie, { Table } from 'dexie';
import { useLocalStorage } from "@vueuse/core";

export interface Proof {
  id: string
  C: string
  amount: number
  reserved: boolean
  secret: string
}

export class MySubClassedDexie extends Dexie {
  proofs!: Table<Proof>;
  spentProofs!: Table<Proof>;

  constructor() {
    super('db');
    this.version(1).stores({
      proofs: '++secret, id, C, amount, reserved',
      spentProofs: '++secret, id, C, amount, reserved',
    });
  }
}

export const db = new MySubClassedDexie();

export const useDexieStore = defineStore("dexie", {
  state: () => ({
    db: db,
    migratedToDexie: useLocalStorage<boolean>("cashu.dexie.migrated", false),
  }),
  getters: {
  },
  actions: {
    migrateToDexie: function () {
      if (this.migratedToDexie) {
        return;
      }
      // get all proofs from localstorage "cashu.proofs" ad migrate them to Dexie db.proofs
      const proofs = localStorage.getItem("cashu.proofs");
      if (proofs) {
        const parsedProofs = JSON.parse(proofs) as Proof[];
        parsedProofs.forEach((proof) => {
          this.db.proofs.add(proof);
        });
      }
      // do the same with spentProofs
      const spentProofs = localStorage.getItem("cashu.spentProofs");
      if (spentProofs) {
        const parsedSpentProofs = JSON.parse(spentProofs) as Proof[];
        parsedSpentProofs.forEach((proof) => {
          this.db.spentProofs.add(proof);
        });
      }
      this.migratedToDexie = true;
      // remove localstorage "cashu.proofs" and "cashu.spentProofs"
      // localStorage.removeItem("cashu.proofs");
      // localStorage.removeItem("cashu.spentProofs");
    }
  },
});
