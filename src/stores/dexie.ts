import { debug } from "src/js/logger";
import { defineStore } from "pinia";
import Dexie, { Table } from "dexie";
import { useLocalStorage } from "@vueuse/core";
import type { WalletProof } from "src/types/proofs";
import { useStorageStore } from "./storage";
import { useProofsStore } from "./proofs";
import { notifyError, notifySuccess } from "../js/notify";
import type { NostrEvent } from "@nostr-dev-kit/ndk";
import { frequencyToDays } from "src/constants/subscriptionFrequency";

export interface CachedProfileDexie {
  pubkey: string;
  profile: any;
  fetchedAt: number;
}

import type { Tier } from "./types";

export interface CreatorTierDefinition {
  creatorNpub: string;
  tiers: Tier[];
  eventId: string;
  updatedAt: number;
  /** Raw Nostr event JSON string */
  rawEventJson?: string;
}

export interface SubscriptionInterval {
  intervalKey: string;
  lockedTokenId: string;
  unlockTs: number;
  status: "pending" | "unlockable" | "claimed" | "expired";
  tokenString: string;
  autoRedeem?: boolean;
  redeemed?: boolean;
  subscriptionId?: string;
  tierId?: string;
  monthIndex?: number;
  totalPeriods?: number;
  htlcHash?: string | null;
  htlcSecret?: string | null;
}

export interface Subscription {
  id: string;
  creatorNpub: string;
  tierId: string;
  creatorP2PK: string;
  mintUrl: string;
  amountPerInterval: number;
  frequency: import("../constants/subscriptionFrequency").SubscriptionFrequency;
  /** Number of days between payments */
  intervalDays?: number;
  startDate: number;
  commitmentLength: number;
  tierName?: string;
  benefits?: string[];
  creatorName?: string;
  creatorAvatar?: string;
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
  creatorP2PK?: string;
  tierId: string;
  tierName?: string;
  intervalKey: string;
  unlockTs: number;
  status: "pending" | "unlockable" | "claimed" | "expired";
  subscriptionEventId: string | null;
  subscriptionId?: string;
  monthIndex?: number;
  totalPeriods?: number;
  frequency: import("../constants/subscriptionFrequency").SubscriptionFrequency;
  /** Number of days between payments */
  intervalDays?: number;
  label?: string;
  autoRedeem?: boolean;
  redeemed?: boolean;
  htlcHash?: string | null;
  htlcSecret?: string | null;
}

export interface SubscriberView {
  id: string;
  name: string;
  state: Record<string, unknown>;
}

export interface SubscriberViewPref {
  id: string;
  activeViewId: string | null;
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
  creatorsTierDefinitions!: Table<CreatorTierDefinition, string>;
  subscriptions!: Table<Subscription, string>;
  lockedTokens!: Table<LockedToken, string>;
  subscriberViews!: Table<SubscriberView, string>;
  subscriberViewPrefs!: Table<SubscriberViewPref, string>;

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
    this.version(7)
      .stores({
        proofs: "secret, id, C, amount, reserved, quote, bucketId, label",
        profiles: "pubkey",
        creatorsTierDefinitions: "&creatorNpub, eventId, updatedAt",
        subscriptions: "&id, creatorNpub, tierId, status, createdAt, updatedAt",
        lockedTokens:
          "&id, tokenString, owner, tierId, intervalKey, unlockTs, refundUnlockTs, status, subscriptionEventId, subscriptionId, monthIndex, totalMonths",
      })
      .upgrade(async (tx) => {
        await tx
          .table("lockedTokens")
          .toCollection()
          .modify((entry: any) => {
            if (entry.subscriptionId === undefined) {
              entry.subscriptionId = null;
            }
            if (entry.monthIndex === undefined) {
              entry.monthIndex = null;
            }
            if (entry.totalMonths === undefined) {
              entry.totalMonths = null;
            }
          });
        await tx
          .table("subscriptions")
          .toCollection()
          .modify((entry: any) => {
            entry.intervals?.forEach((i: any) => {
              if (i.subscriptionId === undefined) i.subscriptionId = entry.id;
              if (i.tierId === undefined) i.tierId = entry.tierId;
              if (i.monthIndex === undefined) i.monthIndex = null;
              if (i.totalMonths === undefined)
                i.totalMonths = entry.commitmentLength;
            });
          });
      });

    this.version(8)
      .stores({
        proofs: "secret, id, C, amount, reserved, quote, bucketId, label",
        profiles: "pubkey",
        creatorsTierDefinitions: "&creatorNpub, eventId, updatedAt",
        subscriptions: "&id, creatorNpub, tierId, status, createdAt, updatedAt",
        lockedTokens:
          "&id, tokenString, owner, tierId, intervalKey, unlockTs, refundUnlockTs, status, subscriptionEventId, subscriptionId, monthIndex, totalMonths",
      })
      .upgrade(async (tx) => {
        await tx
          .table("lockedTokens")
          .toCollection()
          .modify((entry: any) => {
            if (entry.creatorP2PK === undefined) {
              entry.creatorP2PK = null;
            }
          });
      });

    this.version(9)
      .stores({
        proofs: "secret, id, C, amount, reserved, quote, bucketId, label",
        profiles: "pubkey",
        creatorsTierDefinitions: "&creatorNpub, eventId, updatedAt",
        subscriptions: "&id, creatorNpub, tierId, status, createdAt, updatedAt",
        lockedTokens:
          "&id, tokenString, owner, tierId, intervalKey, unlockTs, refundUnlockTs, status, subscriptionEventId, subscriptionId, monthIndex, totalMonths",
      })
      .upgrade(async (tx) => {
        await tx
          .table("subscriptions")
          .toCollection()
          .modify((entry: any) => {
            entry.intervals?.forEach((i: any) => {
              if (i.redeemed === undefined) i.redeemed = false;
            });
          });
      });

    this.version(10).stores({
      proofs: "secret, id, C, amount, reserved, quote, bucketId, label",
      profiles: "pubkey",
      creatorsTierDefinitions: "&creatorNpub, eventId, updatedAt",
      subscriptions: "&id, creatorNpub, tierId, status, createdAt, updatedAt",
      lockedTokens:
        "&id, tokenString, owner, tierId, intervalKey, unlockTs, refundUnlockTs, status, subscriptionEventId, subscriptionId, monthIndex, totalMonths",
    });

    this.version(11)
      .stores({
        proofs: "secret, id, C, amount, reserved, quote, bucketId, label",
        profiles: "pubkey",
        creatorsTierDefinitions: "&creatorNpub, eventId, updatedAt",
        subscriptions: "&id, creatorNpub, tierId, status, createdAt, updatedAt",
        lockedTokens:
          "&id, tokenString, owner, tierId, intervalKey, unlockTs, refundUnlockTs, status, subscriptionEventId, subscriptionId, monthIndex, totalMonths, autoRedeem",
      })
      .upgrade(async (tx) => {
        await tx
          .table("lockedTokens")
          .toCollection()
          .modify((entry: any) => {
            if (entry.autoRedeem === undefined) entry.autoRedeem = false;
          });
        await tx
          .table("subscriptions")
          .toCollection()
          .modify((entry: any) => {
            entry.intervals?.forEach((i: any) => {
              if (i.autoRedeem === undefined) i.autoRedeem = false;
            });
          });
      });

    this.version(12)
      .stores({
        proofs: "secret, id, C, amount, reserved, quote, bucketId, label",
        profiles: "pubkey",
        creatorsTierDefinitions: "&creatorNpub, eventId, updatedAt",
        subscriptions: "&id, creatorNpub, tierId, status, createdAt, updatedAt",
        lockedTokens:
          "&id, tokenString, owner, tierId, intervalKey, unlockTs, refundUnlockTs, status, subscriptionEventId, subscriptionId, monthIndex, totalMonths, autoRedeem",
      })
      .upgrade(async (tx) => {
        await tx
          .table("lockedTokens")
          .toCollection()
          .modify((entry: any) => {
            const pField = ["pre", "image"].join("");
            const hField = "hash" + "lock";
            delete (entry as any)[pField];
            delete (entry as any)[hField];
          });
        await tx
          .table("subscriptions")
          .toCollection()
          .modify((entry: any) => {
            entry.intervals?.forEach((i: any) => {
              const pField = ["pre", "image"].join("");
              const hField = "hash" + "lock";
              delete i[pField];
              delete i[hField];
            });
          });
      });

    this.version(13)
      .stores({
        proofs: "secret, id, C, amount, reserved, quote, bucketId, label",
        profiles: "pubkey",
        creatorsTierDefinitions: "&creatorNpub, eventId, updatedAt",
        subscriptions: "&id, creatorNpub, tierId, status, createdAt, updatedAt",
        lockedTokens:
          "&id, tokenString, owner, tierId, intervalKey, unlockTs, status, subscriptionEventId, subscriptionId, monthIndex, totalMonths, autoRedeem",
      })
      .upgrade(async (tx) => {
        await tx
          .table("lockedTokens")
          .toCollection()
          .modify((entry: any) => {
            delete (entry as any).refundUnlockTs;
          });
        await tx
          .table("subscriptions")
          .toCollection()
          .modify((entry: any) => {
            delete (entry as any).subscriberRefundP2PK;
            entry.intervals?.forEach((i: any) => {
              delete i.refundUnlockTs;
            });
          });
      });

    this.version(14).upgrade(async (tx) => {
      await tx
        .table("lockedTokens")
        .toCollection()
        .modify((entry: any) => {
          const pField2 = ["pre", "image"].join("");
          const hField2 = "hash" + "lock";
          delete (entry as any)[pField2];
          delete (entry as any)[hField2];
          if (entry.redeemed === undefined) entry.redeemed = false;
        });
    });

    this.version(15).upgrade(async (tx) => {
      const pre = ["pre", "image"].join("");
      const hl = "hash" + "lock";
      const refundPk = "refund_" + "pubkey";
      const recvPk = "receiver_" + "p2pk";
      await tx
        .table("lockedTokens")
        .toCollection()
        .modify((entry: any) => {
          delete (entry as any)[pre];
          delete (entry as any)[hl];
          delete (entry as any)[refundPk];
          delete (entry as any)[recvPk];
          if (entry.redeemed === undefined) entry.redeemed = false;
          if (entry.status === undefined) entry.status = "pending";
        });
      await tx
        .table("subscriptions")
        .toCollection()
        .modify((entry: any) => {
          entry.intervals?.forEach((i: any) => {
            delete i[pre];
            delete i[hl];
            delete i[refundPk];
            delete i[recvPk];
            if (i.redeemed === undefined) i.redeemed = false;
          });
        });
    });

    this.version(16).upgrade(async (tx) => {
      const recvPk = "receiver_" + "p2pk";
      const hl = "hash" + "lock";
      const pre = ["pre", "image"].join("");
      await tx
        .table("lockedTokens")
        .toCollection()
        .modify((entry: any) => {
          delete (entry as any)[recvPk];
          delete (entry as any)[hl];
          delete (entry as any)[pre];
          if (entry.redeemed === undefined) entry.redeemed = false;
        });
      await tx
        .table("subscriptions")
        .toCollection()
        .modify((entry: any) => {
          entry.intervals?.forEach((i: any) => {
            delete i[recvPk];
            delete i[hl];
            delete i[pre];
            if (i.redeemed === undefined) i.redeemed = false;
          });
        });
    });

    this.version(17).upgrade(async (tx) => {
      await tx
        .table("lockedTokens")
        .toCollection()
        .modify((entry: any) => {
          if (entry.htlcHash === undefined) entry.htlcHash = null;
          if (entry.htlcSecret === undefined) entry.htlcSecret = null;
        });
      await tx
        .table("subscriptions")
        .toCollection()
        .modify((entry: any) => {
          entry.intervals?.forEach((i: any) => {
            if (i.htlcHash === undefined) i.htlcHash = null;
            if (i.htlcSecret === undefined) i.htlcSecret = null;
          });
        });
    });

    this.version(18).upgrade(async (tx) => {
      await tx
        .table("subscriptions")
        .toCollection()
        .modify((entry: any) => {
          if (entry.tierName === undefined) entry.tierName = null;
          if (entry.benefits === undefined) entry.benefits = [];
          if (entry.creatorName === undefined) entry.creatorName = null;
          if (entry.creatorAvatar === undefined) entry.creatorAvatar = null;
        });
    });

    this.version(19)
      .stores({
        proofs:
          "secret, id, C, amount, reserved, quote, bucketId, label, description",
        profiles: "pubkey",
        creatorsTierDefinitions: "&creatorNpub, eventId, updatedAt",
        subscriptions: "&id, creatorNpub, tierId, status, createdAt, updatedAt",
        lockedTokens:
          "&id, tokenString, owner, tierId, intervalKey, unlockTs, status, subscriptionEventId, subscriptionId, monthIndex, totalMonths, autoRedeem",
      })
      .upgrade(async (tx) => {
        await tx
          .table("proofs")
          .toCollection()
          .modify((entry: any) => {
            if (entry.description === undefined) entry.description = "";
          });
      });

    this.version(20)
      .stores({
        proofs:
          "secret, id, C, amount, reserved, quote, bucketId, label, description",
        profiles: "pubkey",
        creatorsTierDefinitions: "&creatorNpub, eventId, updatedAt",
        subscriptions: "&id, creatorNpub, tierId, status, createdAt, updatedAt",
        lockedTokens:
          "&id, tokenString, owner, tierId, intervalKey, unlockTs, status, subscriptionEventId, subscriptionId, monthIndex, totalMonths, autoRedeem",
      })
      .upgrade(async (tx) => {
        await tx
          .table("creatorsTierDefinitions")
          .toCollection()
          .modify((entry: any) => {
            entry.tiers?.forEach((t: any) => {
              if (t.intervalDays === undefined) t.intervalDays = null;
            });
          });
        await tx
          .table("subscriptions")
          .toCollection()
          .modify((entry: any) => {
            if (entry.intervalDays === undefined) entry.intervalDays = null;
          });
      });

    this.version(21)
      .stores({
        proofs:
          "secret, id, C, amount, reserved, quote, bucketId, label, description",
        profiles: "pubkey",
        creatorsTierDefinitions: "&creatorNpub, eventId, updatedAt",
        subscriptions:
          "&id, creatorNpub, tierId, status, createdAt, updatedAt, frequency, intervalDays",
        lockedTokens:
          "&id, tokenString, owner, tierId, intervalKey, unlockTs, status, subscriptionEventId, subscriptionId, monthIndex, totalPeriods, autoRedeem, frequency, intervalDays",
      })
      .upgrade(async (tx) => {
        await tx
          .table("lockedTokens")
          .toCollection()
          .modify((entry: any) => {
            if (
              entry.totalPeriods === undefined &&
              entry.totalMonths !== undefined
            )
              entry.totalPeriods = entry.totalMonths;
            if (entry.frequency === undefined) entry.frequency = "monthly";
            if (entry.intervalDays === undefined)
              entry.intervalDays = frequencyToDays(entry.frequency);
            delete (entry as any).totalMonths;
          });
        await tx
          .table("subscriptions")
          .toCollection()
          .modify((entry: any) => {
            if (
              entry.totalPeriods === undefined &&
              entry.totalMonths !== undefined
            )
              entry.totalPeriods = entry.totalMonths;
            if (
              entry.receivedPeriods === undefined &&
              entry.receivedMonths !== undefined
            )
              entry.receivedPeriods = entry.receivedMonths;
            if (entry.frequency === undefined) entry.frequency = "monthly";
            if (entry.intervalDays === undefined)
              entry.intervalDays = frequencyToDays(entry.frequency);
            entry.intervals?.forEach((i: any) => {
              if (i.totalPeriods === undefined && i.totalMonths !== undefined)
                i.totalPeriods = i.totalMonths;
              if (
                i.receivedPeriods === undefined &&
                i.receivedMonths !== undefined
              )
                i.receivedPeriods = i.receivedMonths;
              if (i.frequency === undefined)
                i.frequency = entry.frequency || "monthly";
              if (i.intervalDays === undefined)
                i.intervalDays = frequencyToDays(i.frequency);
              delete i.totalMonths;
              delete i.receivedMonths;
            });
            delete (entry as any).totalMonths;
            delete (entry as any).receivedMonths;
          });
      });

    this.version(22).stores({
      proofs:
        "secret, id, C, amount, reserved, quote, bucketId, label, description",
      profiles: "pubkey",
      creatorsTierDefinitions: "&creatorNpub, eventId, updatedAt",
      subscriptions:
        "&id, creatorNpub, tierId, status, createdAt, updatedAt, frequency, intervalDays",
      lockedTokens:
        "&id, tokenString, owner, tierId, intervalKey, unlockTs, status, subscriptionEventId, subscriptionId, monthIndex, totalPeriods, autoRedeem, frequency, intervalDays",
      subscriberViews: "&name",
    });

    this.version(23).stores({
      proofs:
        "secret, id, C, amount, reserved, quote, bucketId, label, description",
      profiles: "pubkey",
      creatorsTierDefinitions: "&creatorNpub, eventId, updatedAt",
      subscriptions:
        "&id, creatorNpub, tierId, status, createdAt, updatedAt, frequency, intervalDays",
      lockedTokens:
        "&id, tokenString, owner, tierId, intervalKey, unlockTs, status, subscriptionEventId, subscriptionId, monthIndex, totalPeriods, autoRedeem, frequency, intervalDays",
      subscriberViews: "&name",
      subscriberViewPrefs: "&id",
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
        } proofs, After: ${(await proofsStore.getProofs()).length} proofs`,
      );
      debug(
        `Proofs sum before: ${proofsStore.sumProofs(
          parsedProofs,
        )}, after: ${proofsStore.sumProofs(await proofsStore.getProofs())}`,
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
