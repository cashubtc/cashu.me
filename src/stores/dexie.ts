import { debug } from "src/js/logger";
import { defineStore } from "pinia";
import Dexie, { Table } from "dexie";
import { useLocalStorage } from "@vueuse/core";
import { WalletProof } from "./mints";
import { useStorageStore } from "./storage";
import { useProofsStore } from "./proofs";
import { notifyError, notifySuccess } from "../js/notify";

export interface CachedProfileDexie {
  pubkey: string;
  profile: any;
  fetchedAt: number;
}

export interface NutzapProfileDexie {
  hexPub: string;
  profile: any;
  fetchedAt: number;
}

export interface CreatorTierDefinition {
  creatorNpub: string;
  tiers: {
    id: string;
    name: string;
    price_sats: number;
    description: string;
    benefits: string[];
  }[];
  eventId: string;
  updatedAt: number;
}

export interface SubscriptionInterval {
  intervalKey: string;
  lockedTokenId: string;
  unlockTs: number;
  refundUnlockTs: number;
  status: "pending" | "unlockable" | "claimed" | "expired";
  tokenString: string;
}

export interface Subscription {
  id: string;
  creatorNpub: string;
  tierId: string;
  creatorP2PK: string;
  subscriberRefundP2PK: string;
  mintUrl: string;
  amountPerInterval: number;
  frequency: "monthly" | "weekly";
  startDate: number;
  commitmentLength: number;
  intervals: SubscriptionInterval[];
  status: "active" | "pending_renewal" | "cancelled" | "completed";
  createdAt: number;
  updatedAt: number;
}

export interface LockedToken {
  id: string;
  tokenString: string;
  amount: number;
  owner: "subscriber" | "creator";
  subscriberNpub?: string;
  creatorNpub?: string;
  tierId: string;
  intervalKey: string;
  unlockTs: number;
  refundUnlockTs: number;
  status: "pending" | "unlockable" | "claimed" | "expired";
  subscriptionEventId: string | null;
  label?: string;
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
  nutzapProfiles!: Table<NutzapProfileDexie>;
  creatorsTierDefinitions!: Table<CreatorTierDefinition, string>;
  subscriptions!: Table<Subscription, string>;
  lockedTokens!: Table<LockedToken, string>;

  constructor() {
    super("cashuDatabase");
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
    this.version(5).stores({
      proofs: "secret, id, C, amount, reserved, quote, bucketId, label",
      profiles: "pubkey",
      creatorsTierDefinitions: "&creatorNpub, eventId, updatedAt",
      subscriptions: "&id, creatorNpub, tierId, status, createdAt, updatedAt",
      lockedTokens:
        "&id, owner, tierId, intervalKey, unlockTs, refundUnlockTs, status, subscriptionEventId",
    });
    this.version(6)
      .stores({
        proofs: "secret, id, C, amount, reserved, quote, bucketId, label",
        profiles: "pubkey",
        creatorsTierDefinitions: "&creatorNpub, eventId, updatedAt",
        subscriptions: "&id, creatorNpub, tierId, status, createdAt, updatedAt",
        lockedTokens:
          "&id, tokenString, owner, tierId, intervalKey, unlockTs, refundUnlockTs, status, subscriptionEventId",
      })
      .upgrade(async (tx) => {
        await tx
          .table("lockedTokens")
          .toCollection()
          .modify((entry: any) => {
            if (entry.tokenString === undefined && entry.token) {
              entry.tokenString = entry.token;
            }
          });
      });
    this.version(7).stores({
      proofs: "secret, id, C, amount, reserved, quote, bucketId, label",
      profiles: "pubkey",
      nutzapProfiles: "hexPub",
      creatorsTierDefinitions: "&creatorNpub, eventId, updatedAt",
      subscriptions: "&id, creatorNpub, tierId, status, createdAt, updatedAt",
      lockedTokens:
        "&id, tokenString, owner, tierId, intervalKey, unlockTs, refundUnlockTs, status, subscriptionEventId",
    });
  }
}

export const cashuDb = new CashuDexie();
export const db = cashuDb;

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
      debug("Migrating to Dexie");
      const proofs = localStorage.getItem("cashu.proofs");
      let parsedProofs: WalletProof[] = [];
      if (!proofs) {
        debug("No cashu.proofs in localStorage to migrate");
        this.migratedToDexie = true;
        return;
      }
      parsedProofs = JSON.parse(proofs) as WalletProof[];
      if (!parsedProofs.length) {
        debug("No proofs to migrate");
        this.migratedToDexie = true;
        return;
      }
      // start migration
      await useStorageStore().exportWalletState();
      parsedProofs.forEach((proof) => {
        cashuDb.proofs.add(proof);
      });
      debug(
        `Migrated ${cashuDb.proofs.count()} proofs. Before: ${
          parsedProofs.length
        } proofs, After: ${(await proofsStore.getProofs()).length} proofs`
      );
      debug(
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
