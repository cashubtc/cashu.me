import { defineStore } from "pinia";
import { watch } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { useWalletStore } from "./wallet";
import { useP2PKStore } from "./p2pk";
import { cashuDb, type LockedToken as DexieLockedToken } from "./dexie";
import token, { createP2PKHTLC } from "src/js/token";
import { v4 as uuidv4 } from "uuid";
import { useMintsStore } from "./mints";
import { useProofsStore } from "./proofs";
import { useMessengerStore } from "./messenger";
import { useSubscriptionsStore } from "./subscriptions";
import type { CreatorIdentity, SubscribeTierOptions } from "src/types/creator";
import { isValidCashuP2pk } from "src/types/creator";
import {
  fetchNutzapProfile,
  subscribeToNutzaps,
  useNostrStore,
  RelayConnectionError,
} from "./nostr";
import { NdkBootError } from "src/boot/ndk";
import { useBootErrorStore } from "./bootError";
import type { NostrEvent, NDKSubscription } from "@nostr-dev-kit/ndk";
import {
  addMinutes,
  addDays,
  fromUnixTime,
  isAfter,
  startOfDay,
} from "date-fns";
import { notifyError, notifyWarning } from "src/js/notify";
import { subscriptionPayload } from "src/utils/receipt-utils";
import {
  frequencyToDays,
  type SubscriptionFrequency,
} from "src/constants/subscriptionFrequency";

export function calcUnlock(base: number, i: number, intervalDays = 30): number {
  const first = addMinutes(startOfDay(fromUnixTime(base)), 30);
  const now = addMinutes(new Date(), 30);
  const ref = isAfter(first, now) ? first : now;
  return Math.floor(addDays(ref, i * intervalDays).getTime() / 1000);
}

interface SendParams {
  npub: string; // receiver's npub (Bech32)
  amount: number; // sats per period
  months: number; // number of periods
  startDate: number; // unix timestamp for first unlock
  intervalDays?: number; // days between periods
}

export interface NutzapQueuedSend {
  npub: string;
  token: string;
  unlockTime: number;
  createdAt: number;
}

export const useNutzapStore = defineStore("nutzap", {
  state: () => ({
    incoming: [] as NostrEvent[], // raw kind:9321 events waiting to be claimed
    loading: false,
    error: null as string | null,
    subscription: null as NDKSubscription | null,
    listenerStarted: false,
    watchInitialized: false,
    sendQueue: useLocalStorage<NutzapQueuedSend[]>(
      "cashu.nutzap.sendQueue",
      []
    ),
  }),

  actions: {
    queueSend(data: NutzapQueuedSend) {
      this.sendQueue.push(data);
    },

    clearSendQueue() {
      this.sendQueue.splice(0, this.sendQueue.length);
    },

    async resendQueued(item: NutzapQueuedSend) {
      const messenger = useMessengerStore();
      const payload = subscriptionPayload(item.token, item.unlockTime, {
        subscription_id: "",
        tier_id: "",
        month_index: 0,
        total_months: 0,
      });
      const { success } = await messenger.sendDm(
        item.npub,
        JSON.stringify(payload)
      );
      if (success) {
        const idx = this.sendQueue.findIndex(
          (q) => q.createdAt === item.createdAt
        );
        if (idx >= 0) this.sendQueue.splice(idx, 1);
      }
      return success;
    },

    async retryQueuedSends() {
      for (const item of [...this.sendQueue]) {
        const ok = await this.resendQueued(item);
        if (!ok) break;
      }
    },
    /** Called once on app start (e.g. from MainLayout.vue) */
    async initListener(myHex: string) {
      if (!this.watchInitialized) {
        watch(
          () => useNostrStore().pubkey,
          (pubkey) => {
            if (this.listenerStarted) {
              this.subscription?.stop();
              this.listenerStarted = false;
              this.initListener(pubkey);
            }
          }
        );
        this.watchInitialized = true;
      }
      if (this.listenerStarted) return;
      this.subscription = await subscribeToNutzaps(myHex, (ev: NostrEvent) => {
        this._onZap(ev);
      });
      this.listenerStarted = true;
    },

    async _onZap(ev: NostrEvent) {
      if (this.incoming.some((e) => e.id === ev.id)) return;

      const tokenString = ev.content.trim();

      const exists = await cashuDb.lockedTokens
        .where("tokenString")
        .equals(tokenString)
        .first();
      if (exists) return;

      this.incoming.push(ev);

      try {
        const decoded = token.decode(tokenString);
        const amount = decoded
          ? token.getProofs(decoded).reduce((s, p) => (s += p.amount), 0)
          : 0;
        const unlockTs = useP2PKStore().getTokenLocktime(tokenString) || 0;
        const creator = useNostrStore();
        const entry = {
          id: uuidv4(),
          tokenString,
          amount,
          owner: "creator",
          creatorNpub: creator.pubkey,
          subscriberNpub: ev.pubkey,
          tierId: "nutzap",
          tierName: "Nutzap",
          intervalKey: ev.id,
          unlockTs,
          status:
            unlockTs && unlockTs > Math.floor(Date.now() / 1000)
              ? "pending"
              : "unlockable",
          subscriptionEventId: null,
          label: "Nutzap",
        } as const;
        await cashuDb.lockedTokens.put(entry as any);
      } catch (e) {
        console.error("Failed to handle zap", e);
      }
    },

    /** Subscribe to a creator tier via HTLC */
    async subscribeToTier({
      creator,
      tierId,
      months,
      price,
      startDate,
      relayList,
      htlc,
      tierName,
      benefits,
      creatorName,
      creatorAvatar,
      frequency,
      intervalDays,
    }: SubscribeTierOptions): Promise<boolean> {
      intervalDays =
        intervalDays ??
        frequencyToDays((frequency as SubscriptionFrequency) || "monthly");
      const wallet = useWalletStore();
      const mints = useMintsStore();
      if (!wallet || mints.activeBalance < price) {
        throw new Error("Insufficient balance");
      }

      const p2pkStore = useP2PKStore();
      if (!isValidCashuP2pk(creator.cashuP2pk)) {
        throw new Error("Creator profile missing Cashu P2PK key");
      }

      const subscriptionId = uuidv4();

      const messenger = useMessengerStore();
      const p2pk = useP2PKStore();
      if (!p2pk.firstKey) await p2pk.generateKeypair();
      const proofsStore = useProofsStore();
      const lockedTokens: DexieLockedToken[] = [];

      for (let i = 0; i < months; i++) {
        const unlockDate = calcUnlock(startDate, i, intervalDays);
        const mint = wallet.findSpendableMint(price);
        if (!mint)
          throw new Error(
            "Insufficient balance in a mint that the creator trusts."
          );
        const { sendProofs, locked } = await useP2PKStore().sendToLock(
          price,
          creator.cashuP2pk,
          unlockDate
        );

        const htlcData = htlc
          ? createP2PKHTLC(price, creator.cashuP2pk, months, startDate)
          : null;

        const tokenStr = proofsStore.serializeProofs(sendProofs);
        try {
          const { success, event } = await messenger.sendDm(
            creator.nostrPubkey,
            JSON.stringify(
              subscriptionPayload(
                tokenStr,
                unlockDate,
                {
                  subscription_id: subscriptionId,
                  tier_id: tierId,
                  month_index: i + 1,
                  total_months: months,
                },
                htlcData?.hash
              )
            ),
            relayList
          );
          if (!success) {
            this.queueSend({
              npub: creator.nostrPubkey,
              token: tokenStr,
              unlockTime: unlockDate,
              createdAt: Math.floor(Date.now() / 1000),
            });
          }
        } catch (err) {
          if (err instanceof NdkBootError) {
            useBootErrorStore().set(err);
          }
          this.queueSend({
            npub: creator.nostrPubkey,
            token: tokenStr,
            unlockTime: unlockDate,
            createdAt: Math.floor(Date.now() / 1000),
          });
        }

        const entry: DexieLockedToken = {
          id: locked.id,
          tokenString: locked.tokenString,
          amount: price,
          owner: "subscriber",
          creatorNpub: creator.nostrPubkey,
          autoRedeem: false,
          tierId,
          ...(tierName ? { tierName } : {}),
          intervalKey: String(i + 1),
          unlockTs: unlockDate,
          status:
            unlockDate > Math.floor(Date.now() / 1000)
              ? "pending"
              : "unlockable",
          subscriptionEventId: null,
          subscriptionId,
          monthIndex: i + 1,
          totalPeriods: months,
          frequency: (frequency as SubscriptionFrequency) || "monthly",
          intervalDays,
          label: "Subscription payment",
          htlcHash: htlcData?.hash ?? null,
          htlcSecret: htlcData?.token ?? null,
        };
        lockedTokens.push(entry);
        await proofsStore.updateActiveProofs();
      }

      await cashuDb.lockedTokens.bulkAdd(lockedTokens as any);

      const subStore = useSubscriptionsStore();
      await subStore.addSubscription({
        id: subscriptionId,
        creatorNpub: creator.nostrPubkey,
        tierId,
        creatorP2PK: creator.cashuP2pk,
        mintUrl: mints.activeMintUrl,
        amountPerInterval: price,
        frequency: (frequency as SubscriptionFrequency) || "monthly",
        intervalDays,
        startDate,
        commitmentLength: months,
        ...(tierName ? { tierName } : {}),
        ...(benefits ? { benefits } : {}),
        ...(creatorName ? { creatorName } : {}),
        ...(creatorAvatar ? { creatorAvatar } : {}),
        intervals: lockedTokens.map((t, idx) => ({
          intervalKey: String(idx + 1),
          lockedTokenId: t.id,
          unlockTs: t.unlockTs,
          status: "pending",
          tokenString: t.tokenString,
          autoRedeem: false,
          redeemed: false,
          subscriptionId,
          tierId,
          monthIndex: idx + 1,
          totalPeriods: months,
          htlcHash: t.htlcHash ?? null,
          htlcSecret: t.htlcSecret ?? null,
        })),
        status: "active",
      } as any);
      return true;
    },

    /** High-level entry from UI – fan pledges to creator */
    async send({ npub, amount, months, startDate, intervalDays }: SendParams) {
      try {
        intervalDays = intervalDays ?? 30;
        this.loading = true;
        let profile = null;
        try {
          profile = await fetchNutzapProfile(npub);
        } catch (e: any) {
          if (e instanceof RelayConnectionError) {
            notifyError("Unable to connect to Nostr relays");
            return;
          }
          throw e;
        }
        if (!profile || !profile.p2pkPubkey) {
          throw new Error(
            "Creator's Nutzap profile is missing or does not contain a P2PK key."
          );
        }
        const creatorP2pk = profile.p2pkPubkey;

        const trustedMints = profile.trustedMints || profile.mints || [];
        const trustedRelays = profile.relays;
        const wallet = useWalletStore();
        const p2pk = useP2PKStore();
        if (!p2pk.firstKey) await p2pk.generateKeypair();
        const mints = useMintsStore();
        const proofsStore = useProofsStore();
        const messenger = useMessengerStore();
        const subscriptionId = uuidv4();
        const lockedTokens: DexieLockedToken[] = [];

        for (let i = 0; i < months; i++) {
          const unlockDate = calcUnlock(startDate, i, intervalDays);
          const mint = wallet.findSpendableMint(amount, trustedMints);
          if (!mint)
            throw new Error(
              "Insufficient balance in a mint that the creator trusts."
            );

          const { sendProofs, locked } = await useP2PKStore().sendToLock(
            amount,
            creatorP2pk,
            unlockDate
          );
          const token = proofsStore.serializeProofs(sendProofs);

          try {
            const { success, event } = await messenger.sendDm(
              profile.hexPub,
              JSON.stringify(
                subscriptionPayload(token, unlockDate, {
                  subscription_id: subscriptionId,
                  tier_id: "nutzap",
                  month_index: i + 1,
                  total_months: months,
                })
              ),
              trustedRelays
            );
            if (!success) {
              this.queueSend({
                npub: profile.hexPub,
                token,
                unlockTime: unlockDate,
                createdAt: Math.floor(Date.now() / 1000),
              });
            }
          } catch (err) {
            if (err instanceof NdkBootError) {
              useBootErrorStore().set(err);
            }
            this.queueSend({
              npub: profile.hexPub,
              token,
              unlockTime: unlockDate,
              createdAt: Math.floor(Date.now() / 1000),
            });
          }

          const entry: DexieLockedToken = {
            id: locked.id,
            tokenString: locked.tokenString,
            amount,
            owner: "subscriber",
            creatorNpub: npub,
            autoRedeem: false,
            tierId: "nutzap",
            intervalKey: String(i + 1),
            unlockTs: unlockDate,
            status:
              unlockDate > Math.floor(Date.now() / 1000)
                ? "pending"
                : "unlockable",
            subscriptionEventId: null,
            subscriptionId,
            monthIndex: i + 1,
            totalPeriods: months,
            frequency: "monthly",
            intervalDays,
            label: "Subscription payment",
            tierName: "Nutzap",
          };
          lockedTokens.push(entry);

          // DM Nutzap token to creator (one message per period)
          await proofsStore.updateActiveProofs();
        }

        // Persist into Dexie
        await cashuDb.lockedTokens.bulkAdd(lockedTokens as any);

        const subStore = useSubscriptionsStore();
        await subStore.addSubscription({
          creatorNpub: npub,
          tierId: "nutzap",
          tierName: "Nutzap",
          creatorP2PK: creatorP2pk,
          mintUrl: mints.activeMintUrl,
          amountPerInterval: amount,
          frequency: "monthly",
          intervalDays,
          startDate,
          commitmentLength: months,
          intervals: lockedTokens.map((t, idx) => ({
            intervalKey: String(idx + 1),
            lockedTokenId: t.id,
            unlockTs: t.unlockTs,
            status: "pending",
            tokenString: t.tokenString,
            autoRedeem: false,
            redeemed: false,
          })),
          status: "active",
        } as any);

        return lockedTokens;
      } catch (e: any) {
        this.error = e.message;
        throw e;
      } finally {
        this.loading = false;
      }
    },

    /** User clicks “Claim” on an inbound Nutzap */
    async claim(event: NostrEvent) {
      const p2pk = useP2PKStore();
      const wallet = useWalletStore();

      const tokenString = event.content.trim();
      await p2pk.claimLockedToken(tokenString); // verifies, swaps, updates proofs store

      // delete any matching locked token entries from dexie
      await cashuDb.lockedTokens
        .where("tokenString")
        .equals(tokenString)
        .delete();

      // Optionally: send receipt (kind:9322) here …

      // Remove from pending list
      this.incoming = this.incoming.filter((ev) => ev.id !== event.id);
    },
  },
});
