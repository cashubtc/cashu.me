import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { useWalletStore } from "./wallet";
import { useMintsStore } from "./mints";
import { useProofsStore } from "./proofs";
import { useLockedTokensStore, LockedToken } from "./lockedTokens";
import { useSubscriptionsStore } from "./subscriptions";
import { useP2PKStore } from "./p2pk";
import { DEFAULT_BUCKET_ID } from "./buckets";

export type DonationPreset = {
  months: number;
};

const DEFAULT_PRESETS: DonationPreset[] = [
  { months: 1 },
  { months: 3 },
  { months: 6 },
  { months: 12 },
];

export const useDonationPresetsStore = defineStore("donationPresets", {
  state: () => {
    const presets = useLocalStorage<DonationPreset[]>(
      "cashu.donationPresets",
      DEFAULT_PRESETS
    );
    if (!presets.value.find((p) => p.months === 1)) {
      presets.value.unshift({ months: 1 });
    }
    return { presets };
  },
  actions: {
    /**
     * Create a new donation preset by locking ecash. When `detailed` is
     * `true` an array of {@link LockedToken} entries is returned. Otherwise
     * the function returns the serialized token(s) as a single string.
     */
    async createDonationPreset(
      months: number | undefined,
      amount: number,
      pubkey: string,
      bucketId: string = DEFAULT_BUCKET_ID,
      startDate?: number,
      detailed = false,
      subscription?: { tierName?: string; benefits?: string[]; frequency?: 'monthly' | 'weekly' }
    ): Promise<string | LockedToken[]> {
      const walletStore = useWalletStore();
      const proofsStore = useProofsStore();
      const mintsStore = useMintsStore();
      const lockedStore = useLockedTokensStore();
      const subscriptionsStore = useSubscriptionsStore();
      const p2pkStore = useP2PKStore();

      const convertedPubkey = p2pkStore.maybeConvertNpub(pubkey);

      const wallet = walletStore.wallet;
      let proofs = mintsStore.activeProofs.filter(
        (p) => p.bucketId === bucketId
      );

      const totalAmount = !months || months <= 0 ? amount : amount * months;
      const available = proofs.reduce((s, p) => s + p.amount, 0);
      if (available < totalAmount) {
        throw new Error('Insufficient balance');
      }

      if (!months || months <= 0) {
        const { sendProofs } = await walletStore.sendToLock(
          proofs,
          wallet,
          amount,
          convertedPubkey,
          bucketId
        );
        const token = proofsStore.serializeProofs(sendProofs);
        if (detailed) {
          return [
            lockedStore.addLockedToken({
              amount,
              token,
              pubkey: convertedPubkey,
              bucketId,
              label: subscription?.tierName
                ? `Subscription: ${subscription.tierName}`
                : undefined,
            }),
          ];
        }
        return token;
      }

      const tokens: LockedToken[] = [];
      const base = startDate ?? Math.floor(Date.now() / 1000);
      for (let i = 0; i < months; i++) {
        const locktime = base + i * 30 * 24 * 60 * 60;
        const { sendProofs } = await walletStore.sendToLock(
          proofs,
          wallet,
          amount,
          convertedPubkey,
          bucketId,
          locktime
        );
        const token = proofsStore.serializeProofs(sendProofs);
        const locked = lockedStore.addLockedToken({
          amount,
          token,
          pubkey: convertedPubkey,
          locktime,
          bucketId,
          label: subscription?.tierName
            ? `Subscription: ${subscription.tierName}`
            : undefined,
        });
        tokens.push(locked);
        await proofsStore.updateActiveProofs();
        proofs = mintsStore.activeProofs.filter((p) => p.bucketId === bucketId);
      }

      if (subscription) {
        await subscriptionsStore.addSubscription({
          creatorNpub: pubkey,
          tierId: bucketId,
          creatorP2PK: '',
          subscriberRefundP2PK: '',
          mintUrl: '',
          amountPerInterval: amount,
          frequency: subscription.frequency || 'monthly',
          startDate: base,
          commitmentLength: months,
          intervals: tokens.map((t, idx) => ({
            intervalKey: String(idx),
            lockedTokenId: t.id,
            unlockTs: t.locktime || 0,
            refundUnlockTs: 0,
            status: 'pending',
            tokenString: t.token,
          })),
          status: 'active',
          createdAt: 0,
          updatedAt: 0,
          ...(subscription.tierName ? { tierName: subscription.tierName } : {}),
          ...(subscription.benefits ? { benefits: subscription.benefits } : {}),
        } as any);
      }
      return detailed ? tokens : tokens.map((t) => t.token).join("\n");
    },
  },
});

export const DEFAULT_DONATION_PRESETS = DEFAULT_PRESETS;
