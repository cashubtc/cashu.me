import { defineStore } from "pinia";
import { watch } from "vue";
import { useWalletStore } from "./wallet";
import { useP2PKStore } from "./p2pk";
import { useLockedTokensStore } from "./lockedTokens";
import type { LockedToken } from "./lockedTokens";
import { cashuDb } from "./dexie";
import token from "src/js/token";
import { v4 as uuidv4 } from "uuid";
import { useMintsStore } from "./mints";
import { useProofsStore } from "./proofs";
import { useMessengerStore } from "./messenger";
import {
  fetchNutzapProfile,
  subscribeToNutzaps,
  useNostrStore,
} from "./nostr";
import type { NostrEvent, NDKSubscription } from "@nostr-dev-kit/ndk";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { notifyError } from "src/js/notify";
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

export const useNutzapStore = defineStore("nutzap", {
  state: () => ({
    incoming: [] as NostrEvent[], // raw kind:9321 events waiting to be claimed
    loading: false,
    error: null as string | null,
    subscription: null as NDKSubscription | null,
    listenerStarted: false,
    watchInitialized: false,
  }),

  actions: {
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

    /** High-level entry from UI – fan pledges to creator */
    async send({ npub, amount, months, startDate }: SendParams) {
      try {
        this.loading = true;
        const profile = await fetchNutzapProfile(npub);
        const creatorP2pk = profile?.p2pkPubkey || (profile as any)?.p2pk;
        if (!profile || !creatorP2pk) {
          notifyError(
            "Creator's Nutzap profile is missing or does not contain a P2PK key."
          );
          return;
        }

        const trustedMints = profile.trustedMints || profile.mints || [];
        const trustedRelays = profile.relays;
        const wallet = useWalletStore();
        const p2pk = useP2PKStore();
        const mints = useMintsStore();
        const proofsStore = useProofsStore();
        const messenger = useMessengerStore();
        const subscriptionId = uuidv4();
        const lockedTokens: LockedToken[] = [];

        for (let i = 0; i < months; i++) {
          const unlockDate = calcUnlock(startDate, i);
          const mint = wallet.findSpendableMint(amount, trustedMints);
          if (!mint)
            throw new Error(
              "Insufficient balance in a mint that the creator trusts."
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
          undefined,
          hash
        );
        const token = proofsStore.serializeProofs(sendProofs);

          await messenger.sendDm(
            profile.hexPub,
            JSON.stringify({
              type: "cashu_subscription_payment",
            subscription_id: subscriptionId,
            tier_id: "nutzap",
            month_index: i + 1,
            total_months: months,
            token,
            }),
            trustedRelays
          );

          lockedTokens.push(locked);

          // DM Nutzap token to creator (one message per period)
          await proofsStore.updateActiveProofs();
        }

        // Persist into bucket store for progress UI
        const buckets = useLockedTokensStore();
        await buckets.addMany(lockedTokens);
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
        .where('tokenString')
        .equals(tokenString)
        .delete();

      // Optionally: send receipt (kind:9322) here …

      // Remove from pending list
      this.incoming = this.incoming.filter((ev) => ev.id !== event.id);
    },
  },
});
