import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { useWalletStore } from "./wallet";
import { useMintsStore } from "./mints";
import { useProofsStore } from "./proofs";
import { LockedToken } from "./lockedTokens";
import { useSubscriptionsStore } from "./subscriptions";
import { useP2PKStore } from "./p2pk";
import { DEFAULT_BUCKET_ID } from "@/constants/buckets";
import { ensureCompressed } from "src/utils/ecash";
import {
  frequencyToDays,
  type SubscriptionFrequency,
} from "src/constants/subscriptionFrequency";

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
      subscription?: {
        tierName?: string;
        benefits?: string[];
        frequency?: SubscriptionFrequency;
        intervalDays?: number;
      }
    ): Promise<string | LockedToken[]> {
      const walletStore = useWalletStore();
      const proofsStore = useProofsStore();
      const mintsStore = useMintsStore();
      const subscriptionsStore = useSubscriptionsStore();
      const p2pkStore = useP2PKStore();

      const convertedPubkey = ensureCompressed(pubkey);

      const wallet = walletStore.wallet;
      let proofs = mintsStore.activeProofs.filter(
        (p) => p.bucketId === bucketId
      );

      const totalAmount = !months || months <= 0 ? amount : amount * months;
      const available = proofs.reduce((s, p) => s + p.amount, 0);
      if (available < totalAmount) {
        throw new Error("Insufficient balance");
      }

      const tokens: LockedToken[] = [];

      if (!months || months <= 0) {
        const { locked } = await p2pkStore.sendToLock(
          amount,
          convertedPubkey,
          0
        );
        tokens.push(locked);
        return detailed ? tokens : locked.tokenString;
      }
      const base = startDate ?? Math.floor(Date.now() / 1000);
      const interval = subscription?.intervalDays
        ? subscription.intervalDays
        : subscription?.frequency
        ? frequencyToDays(subscription.frequency)
        : frequencyToDays('monthly');
      for (let i = 0; i < months; i++) {
        const locktime = base + i * interval * 24 * 60 * 60;
        const { locked } = await p2pkStore.sendToLock(
          amount,
          convertedPubkey,
          locktime
        );
        tokens.push(locked);
        await proofsStore.updateActiveProofs();
        proofs = mintsStore.activeProofs.filter((p) => p.bucketId === bucketId);
      }

      if (subscription) {
        await subscriptionsStore.addSubscription({
          creatorNpub: pubkey,
          tierId: bucketId,
          creatorP2PK: "",
          mintUrl: "",
          amountPerInterval: amount,
          frequency: subscription.frequency || 'monthly',
          intervalDays:
            subscription.intervalDays ??
            (subscription.frequency
              ? frequencyToDays(subscription.frequency)
              : frequencyToDays('monthly')),
          startDate: base,
          commitmentLength: months,
          intervals: tokens.map((t, idx) => ({
            intervalKey: String(idx),
            lockedTokenId: t.id,
            unlockTs: t.locktime || 0,
            status: "pending",
            tokenString: t.tokenString,
          })),
          status: "active",
          createdAt: 0,
          updatedAt: 0,
          ...(subscription.tierName ? { tierName: subscription.tierName } : {}),
          ...(subscription.benefits ? { benefits: subscription.benefits } : {}),
        } as any);
      }
      return detailed ? tokens : tokens.map((t) => t.tokenString).join("\n");
    },
  },
});

export const DEFAULT_DONATION_PRESETS = DEFAULT_PRESETS;
