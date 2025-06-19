import { defineStore } from "pinia";
import { useWalletStore } from "./wallet";
import { useP2PKStore } from "./p2pk";
import { useLockedTokensStore } from "./lockedTokens";
import { cashuDb } from "./dexie";
import token from "src/js/token";
import { v4 as uuidv4 } from "uuid";
import {
  fetchNutzapProfile,
  publishNutzap,
  subscribeToNutzaps,
  useNostrStore,
} from "./nostr";
import type { NostrEvent, NDKSubscription } from "@nostr-dev-kit/ndk";
import dayjs from "dayjs";

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
  }),

  actions: {
    /** Called once on app start (e.g. from MainLayout.vue) */
    initListener(myHex: string) {
      if (this.listenerStarted) return;
      this.subscription = subscribeToNutzaps(myHex, (ev: NostrEvent) => {
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
        if (!profile)
          throw new Error("Recipient has no Nutzap profile (kind:10019)");

        const { p2pkPubkey, trustedMints } = profile;
        const wallet = useWalletStore();
        const p2pk = useP2PKStore();
        interface LockedTokenPayload {
          tokenString: string;
          mintUrl: string;
          timelock: number;
          receiver: string;
        }
        const lockedTokens: LockedTokenPayload[] = [];

        for (let i = 0; i < months; i++) {
          const unlockDate = dayjs(startDate)
            .add(i, "month")
            .startOf("day")
            .unix();
          const mint = wallet.findSpendableMint(amount, trustedMints);
          if (!mint)
            throw new Error("Insufficient balance in recipient-trusted mints");

          const { token } = await p2pk.lockToPubKey({
            mintUrl: mint.url,
            amount,
            pubKey: p2pkPubkey,
            timelock: unlockDate,
          });

          // store locally for UI (buckets flow)
          lockedTokens.push({
            tokenString: token,
            mintUrl: mint.url,
            timelock: unlockDate,
            receiver: npub,
          });

          // Publish Nutzap (one event per period)
          await publishNutzap({
            content: token, // ← token string per NUT-11
            receiverHex: profile.hexPub,
            relayHints: profile.relays,
          });
        }

        // Persist into bucket store for progress UI
        const buckets = useLockedTokensStore();
        await buckets.addMany(lockedTokens as any);
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
