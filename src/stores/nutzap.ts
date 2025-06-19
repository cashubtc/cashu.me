import { defineStore } from "pinia";
import { useWalletStore } from "./wallet";
import { useP2PKStore } from "./p2pk";
import { useLockedTokensStore } from "./lockedTokens";
import {
  fetchNutzapProfile,
  publishNutzap,
  subscribeToNutzaps,
} from "./nostr";
import type { NostrEvent, NDKSubscription } from "@nostr-dev-kit/ndk";
import dayjs from "dayjs";

interface SendParams {
  npub: string; // receiver's npub (Bech32)
  amount: number; // sats per period
  months: number; // number of periods
}

export const useNutzapStore = defineStore("nutzap", {
  state: () => ({
    incoming: [] as NostrEvent[], // raw kind:9321 events waiting to be claimed
    loading: false,
    error: null as string | null,
    subscription: null as NDKSubscription | null,
  }),

  actions: {
    /** Called once on app start (e.g. from MainLayout.vue) */
    initListener(myHex: string) {
      this.subscription = subscribeToNutzaps(myHex, (ev: NostrEvent) => {
        this.incoming.push(ev);
      });
    },

    /** High-level entry from UI – fan pledges to creator */
    async send({ npub, amount, months }: SendParams) {
      try {
        this.loading = true;
        const profile = await fetchNutzapProfile(npub);
        if (!profile)
          throw new Error("Recipient has no Nutzap profile (kind:10019)");

        const { p2pkPubkey, trustedMints } = profile;
        const wallet = useWalletStore();
        const p2pk = useP2PKStore();
        interface LockedTokenPayload {
          token: string;
          mintUrl: string;
          timelock: number;
          receiver: string;
        }
        const lockedTokens: LockedTokenPayload[] = [];

        for (let i = 0; i < months; i++) {
          const unlockDate = dayjs().add(i, "month").startOf("day").unix();
          const mint = wallet.findSpendableMint(amount, trustedMints);
          if (!mint) throw new Error("Insufficient balance in recipient-trusted mints");

          const { token } = await p2pk.lockToPubKey({
            mintUrl: mint.url,
            amount,
            pubKey: p2pkPubkey,
            timelock: unlockDate,
          });

          // store locally for UI (buckets flow)
          lockedTokens.push({
            token,
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
        buckets.addMany(lockedTokens as any);
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

      // Optionally: send receipt (kind:9322) here …

      // Remove from pending list
      this.incoming = this.incoming.filter((ev) => ev.id !== event.id);
    },
  },
});

