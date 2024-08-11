import { defineStore } from "pinia";
import Dexie, { Table } from 'dexie';

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
  }),
  getters: {
  },
  actions: {
  },
});
