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
import {
  fetchNutzapProfile,
  subscribeToNutzaps,
  useNostrStore,
  RelayConnectionError,
} from "./nostr";
import { NdkBootError } from "src/boot/ndk";
import { useBootErrorStore } from "./bootError";
import type { NostrEvent, NDKSubscription } from "@nostr-dev-kit/ndk";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { notifyError, notifyWarning } from "src/js/notify";
dayjs.extend(utc);

export function calcUnlock(base: number, i: number): number {
  const first = dayjs.unix(base).utc().startOf("day").add(30, "minute");
  const now = dayjs().add(30, "minute");
  return (first.isAfter(now) ? first : now).add(i, "month").unix();
}

interface SendParams {
  npub: string; // receiver's npub (Bech32)
  amount: number; // sats per period
  months: number; // number of periods
  startDate: number; // unix timestamp for first unlock
}

export interface NutzapQueuedSend {
  npub: string;
  token: string;
  subscriptionId: string;
  tierId: string;
  monthIndex: number;
  totalMonths: number;
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
      [],
    ),
  }),

  actions: {
    queueSend(data: NutzapQueuedSend) {
      this.sendQueue.push(data);
    },

    async resendQueued(item: NutzapQueuedSend) {
      const messenger = useMessengerStore();
      const payload = {
        type: "cashu_subscription_payment",
        subscription_id: item.subscriptionId,
        tier_id: item.tierId,
        month_index: item.monthIndex,
        total_months: item.totalMonths,
        token: item.token,
      } as const;
      const { success } = await messenger.sendDm(
        item.npub,
        JSON.stringify(payload),
      );
      if (success) {
        const idx = this.sendQueue.findIndex(
          (q) => q.createdAt === item.createdAt,
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
          },
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
          intervalKey: ev.id,
          unlockTs,
          refundUnlockTs: 0,
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
    }: {
      creator: { npub: string; p2pk: string };
      tierId: string;
      months: number;
      price: number;
      startDate: number;
      relayList: string[];
    }): Promise<boolean> {
      const wallet = useWalletStore();
      const mints = useMintsStore();
      if (!wallet || mints.activeBalance < price) {
        throw new Error("Insufficient balance");
      }

      const { hash } = createP2PKHTLC(
        price,
        creator.p2pk,
        months,
        startDate,
      );
      const subscriptionId = uuidv4();

      const messenger = useMessengerStore();
      const p2pk = useP2PKStore();
      if (!p2pk.firstKey) await p2pk.generateKeypair();
      const refundKey = p2pk.firstKey!.publicKey;
      const proofsStore = useProofsStore();
      const lockedTokens: DexieLockedToken[] = [];

      for (let i = 0; i < months; i++) {
        const unlockDate = calcUnlock(startDate, i);
        const mint = wallet.findSpendableMint(price);
        if (!mint)
          throw new Error(
            "Insufficient balance in a mint that the creator trusts.",
          );
        const mintWallet = wallet.mintWallet(mint.url, mints.activeUnit);
        const proofs = mints.mintUnitProofs(mint, mints.activeUnit);
        const { sendProofs, locked } = await wallet.sendToLock(
          proofs,
          mintWallet,
          price,
          creator.p2pk,
          "nutzap",
          unlockDate,
          refundKey,
          hash,
        );

        const tokenStr = proofsStore.serializeProofs(sendProofs);
        try {
          const { success } = await messenger.sendDm(
            creator.npub,
            JSON.stringify({
              type: "cashu_subscription_payment",
              subscription_id: subscriptionId,
              tier_id: tierId,
              month_index: i + 1,
              total_months: months,
              token: tokenStr,
            }),
            relayList,
          );
          if (!success) {
            this.queueSend({
              npub: creator.npub,
              token: tokenStr,
              subscriptionId,
              tierId,
              monthIndex: i + 1,
              totalMonths: months,
              createdAt: Math.floor(Date.now() / 1000),
            });
          }
        } catch (err) {
          if (err instanceof NdkBootError) {
            useBootErrorStore().set(err);
          }
          this.queueSend({
            npub: creator.npub,
            token: tokenStr,
            subscriptionId,
            tierId,
            monthIndex: i + 1,
            totalMonths: months,
            createdAt: Math.floor(Date.now() / 1000),
          });
        }

        const entry: DexieLockedToken = {
          id: locked.id,
          tokenString: locked.tokenString,
          amount: price,
          owner: "subscriber",
          creatorNpub: creator.npub,
          tierId,
          intervalKey: String(i + 1),
          unlockTs: unlockDate,
          refundUnlockTs: 0,
          status:
            unlockDate > Math.floor(Date.now() / 1000)
              ? "pending"
              : "unlockable",
          subscriptionEventId: null,
          subscriptionId,
          monthIndex: i + 1,
          totalMonths: months,
          label: "Subscription payment",
        };
        lockedTokens.push(entry);
        await proofsStore.updateActiveProofs();
      }

      await cashuDb.lockedTokens.bulkAdd(lockedTokens as any);

      const subStore = useSubscriptionsStore();
      await subStore.addSubscription({
        id: subscriptionId,
        creatorNpub: creator.npub,
        tierId,
        creatorP2PK: creator.p2pk,
        subscriberRefundP2PK: refundKey,
        mintUrl: mints.activeMintUrl,
        amountPerInterval: price,
        frequency: "monthly",
        startDate,
        commitmentLength: months,
        intervals: lockedTokens.map((t, idx) => ({
          intervalKey: String(idx + 1),
          lockedTokenId: t.id,
          unlockTs: t.unlockTs,
          refundUnlockTs: 0,
          status: "pending",
          tokenString: t.tokenString,
          subscriptionId,
          tierId,
          monthIndex: idx + 1,
          totalMonths: months,
        })),
        status: "active",
      } as any);
      return true;
    },

    /** High-level entry from UI – fan pledges to creator */
    async send({ npub, amount, months, startDate }: SendParams) {
      try {
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
            "Creator's Nutzap profile is missing or does not contain a P2PK key.",
          );
        }
        const creatorP2pk = profile.p2pkPubkey;

        const trustedMints = profile.trustedMints || profile.mints || [];
        const trustedRelays = profile.relays;
        const wallet = useWalletStore();
        const p2pk = useP2PKStore();
        if (!p2pk.firstKey) await p2pk.generateKeypair();
        const refundKey = p2pk.firstKey!.publicKey;
        const mints = useMintsStore();
        const proofsStore = useProofsStore();
        const messenger = useMessengerStore();
        const subscriptionId = uuidv4();
        const lockedTokens: DexieLockedToken[] = [];

        for (let i = 0; i < months; i++) {
          const unlockDate = calcUnlock(startDate, i);
          const mint = wallet.findSpendableMint(amount, trustedMints);
          if (!mint)
            throw new Error(
              "Insufficient balance in a mint that the creator trusts.",
            );

          // ----- HTLC-locked pledge with refund capability --------------
          const { hash } = p2pk.generateRefundSecret();
          const mintWallet = wallet.mintWallet(mint.url, mints.activeUnit);
          const proofs = mints.mintUnitProofs(mint, mints.activeUnit);
          const { sendProofs, locked } = await wallet.sendToLock(
            proofs,
            mintWallet,
            amount,
            creatorP2pk,
            "nutzap",
            unlockDate,
            refundKey,
            hash,
          );
          const token = proofsStore.serializeProofs(sendProofs);

          try {
            const { success } = await messenger.sendDm(
              profile.hexPub,
              JSON.stringify({
                type: "cashu_subscription_payment",
                subscription_id: subscriptionId,
                tier_id: "nutzap",
                month_index: i + 1,
                total_months: months,
                token,
              }),
              trustedRelays,
            );
            if (!success) {
              this.queueSend({
                npub: profile.hexPub,
                token,
                subscriptionId,
                tierId: "nutzap",
                monthIndex: i + 1,
                totalMonths: months,
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
              subscriptionId,
              tierId: "nutzap",
              monthIndex: i + 1,
              totalMonths: months,
              createdAt: Math.floor(Date.now() / 1000),
            });
          }

          const entry: DexieLockedToken = {
            id: locked.id,
            tokenString: locked.tokenString,
            amount,
            owner: "subscriber",
            creatorNpub: npub,
            tierId: "nutzap",
            intervalKey: String(i + 1),
            unlockTs: unlockDate,
            refundUnlockTs: 0,
            status:
              unlockDate > Math.floor(Date.now() / 1000)
                ? "pending"
                : "unlockable",
            subscriptionEventId: null,
            subscriptionId,
            monthIndex: i + 1,
            totalMonths: months,
            label: "Subscription payment",
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
          creatorP2PK: creatorP2pk,
          subscriberRefundP2PK: refundKey,
          mintUrl: mints.activeMintUrl,
          amountPerInterval: amount,
          frequency: "monthly",
          startDate,
          commitmentLength: months,
          intervals: lockedTokens.map((t, idx) => ({
            intervalKey: String(idx + 1),
            lockedTokenId: t.id,
            unlockTs: t.unlockTs,
            refundUnlockTs: 0,
            status: "pending",
            tokenString: t.tokenString,
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
