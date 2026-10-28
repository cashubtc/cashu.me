<template>
  <div class="token-information-container q-px-md">
    <!-- Amount Header -->
    <div v-if="!hideAmount" class="token-header-container">
      <div class="amount-headline">
        {{ displayUnit }}
      </div>
    </div>

    <!-- Token Details Section -->
    <div class="token-details-section q-mt-md q-mb-lg">
      <!-- Fee (if applicable) -->
      <DetailRow
        v-if="receiveFee > 0 && !hideFee"
        class="q-mb-md"
        :icon="ReceiptTextIcon"
        :label="$t('TokenInformation.fee')"
        :value="formatCurrency(receiveFee, tokenUnit, true)"
      />

      <!-- Unit -->
      <DetailRow
        v-if="!hideUnit && tokenUnit !== 'sat'"
        class="q-mb-md"
        :icon="CircleDollarSignIcon"
        :label="$t('TokenInformation.unit')"
        :value="tokenUnit === 'sat' ? 'sat' : tokenUnit.toUpperCase()"
      />

      <!-- Fiat -->
      <DetailRow
        v-if="showFiat && !hideFiat"
        class="q-mb-md"
        :icon="BanknoteIcon"
        :label="$t('TokenInformation.fiat')"
        :value="formatCurrency(fiatAmount, bitcoinPriceCurrency, true)"
      />

      <!-- P2PK Lock Status (if locked) -->
      <DetailRow
        v-if="isLocked(proofsToShow) && !hideP2PK"
        class="q-mb-md"
        :icon="LockIcon"
        :label="$t('TokenInformation.p2pk')"
        :value="
          isLockedToUs(proofsToShow)
            ? $t('TokenInformation.locked_to_you')
            : $t('TokenInformation.locked')
        "
        :value-class="{
          'p2pk-locked-me': isLockedToUs(proofsToShow),
          'p2pk-locked-warning':
            isLocked(proofsToShow) && !isLockedToUs(proofsToShow),
        }"
      />

      <!-- Mint URL -->
      <DetailRow
        v-if="!hideMint"
        class="q-mb-md"
        :icon="LandmarkIcon"
        :label="$t('TokenInformation.mint')"
      >
        {{ tokenMintUrl }}
        <PendingDots v-if="addMintBlocking" class="q-ml-xs" />
      </DetailRow>

      <!-- Memo (if available) -->
      <DetailRow
        v-if="displayMemo && !hideMemo"
        class="q-mb-md"
        :icon="MessageCircleIcon"
        :label="$t('TokenInformation.memo')"
        :value="displayMemo"
        value-class="token-memo-value"
      />

      <!-- Payment Request (if applicable) -->
      <DetailRow
        v-if="paymentRequestId"
        :icon="FileTextIcon"
        :label="$t('TokenInformation.payment_request')"
        :value="$t('TokenInformation.nostr')"
      />
    </div>
  </div>
</template>
<script lang="ts">
import PendingDots from "src/components/ui/PendingDots.vue";
import { defineComponent } from "vue";
import { notifyCopied } from "src/js/notify";
import { type Token } from "@cashu/cashu-ts";
import { getShortUrl } from "src/js/wallet-helpers";
import { mapActions, mapState } from "pinia";
import { useMintsStore } from "stores/mints";
import { useWalletStore } from "stores/wallet";
import { useP2PKStore } from "src/stores/p2pk";
import { usePriceStore } from "src/stores/price";
import { useSettingsStore } from "src/stores/settings";
import token from "src/js/token";
import {
  Banknote as BanknoteIcon,
  CircleDollarSign as CircleDollarSignIcon,
  FileText as FileTextIcon,
  Landmark as LandmarkIcon,
  Lock as LockIcon,
  MessageCircle as MessageCircleIcon,
  ReceiptText as ReceiptTextIcon,
} from "lucide-vue-next";
import DetailRow from "src/components/ui/DetailRow.vue";

export default defineComponent({
  name: "TokenInformation",
  mixins: [windowMixin],
  components: { PendingDots, DetailRow },
  setup() {
    return {
      BanknoteIcon,
      CircleDollarSignIcon,
      FileTextIcon,
      LandmarkIcon,
      LockIcon,
      MessageCircleIcon,
      ReceiptTextIcon,
    };
  },
  props: {
    encodedToken: String,
    paymentRequestId: {
      type: String,
      required: false,
      default: undefined,
    },
    hideAmount: {
      type: Boolean,
      default: false,
    },
    hideUnit: {
      type: Boolean,
      default: false,
    },
    hideFiat: {
      type: Boolean,
      default: false,
    },
    hideMemo: {
      type: Boolean,
      default: false,
    },
    hideP2PK: {
      type: Boolean,
      default: false,
    },
    hideMint: {
      type: Boolean,
      default: false,
    },
    hideFee: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["notLockedToUs"],
  data: function () {
    return {
      fullToken: null as Token | null,
    };
  },
  watch: {
    encodedToken: {
      async handler(encoded: string) {
        if (!encoded) {
          this.fullToken = null;
          return;
        }
        try {
          const decoded = (await token.decodeFull(encoded)) ?? null;
          if (this.encodedToken !== encoded) return;
          this.fullToken = decoded;
        } catch {
          if (this.encodedToken !== encoded) return;
          this.fullToken = null;
        }
      },
      immediate: true,
    },
    proofsToShow: {
      handler(newProofs) {
        if (newProofs && newProofs.length > 0) {
          const locked = this.isLocked(newProofs);
          const lockedToUs = this.isLockedToUs(newProofs);
          // Emit true if locked but not locked to us, false otherwise
          this.$emit("notLockedToUs", locked && !lockedToUs);
        } else {
          this.$emit("notLockedToUs", false);
        }
      },
      immediate: true,
    },
  },
  computed: {
    ...mapState(useMintsStore, [
      "activeMintUrl",
      "activeProofs",
      "mints",
      "activeUnit",
      "addMintBlocking",
    ]),
    ...mapState(usePriceStore, ["bitcoinPrice", "currentCurrencyPrice"]),
    ...mapState(useSettingsStore, ["bitcoinPriceCurrency"]),
    proofsToShow: function () {
      if (!this.fullToken) return [];
      return token.getProofs(this.fullToken);
    },
    sumProofs: function () {
      return token.decodeMeta(this.encodedToken)?.amount ?? 0;
    },
    displayUnit: function () {
      const display = this.formatCurrency(this.sumProofs, this.tokenUnit, true);
      return display;
    },
    tokenUnit: function () {
      const decoded = token.decodeMeta(this.encodedToken);
      return decoded ? token.getUnit(decoded) : "";
    },
    tokenMintUrl: function () {
      const decoded = token.decodeMeta(this.encodedToken);
      return decoded ? getShortUrl(token.getMint(decoded)) : "";
    },
    displayMemo: function () {
      const decoded = token.decodeMeta(this.encodedToken);
      return decoded ? token.getMemo(decoded) : "";
    },
    showFiat: function () {
      return this.tokenUnit === "sat" && !!this.bitcoinPrice;
    },
    fiatAmount: function () {
      if (!this.showFiat) return 0;
      // sumProofs is in sats, currentCurrencyPrice is fiat per BTC
      return (this.currentCurrencyPrice / 100000000) * this.sumProofs;
    },
    receiveFee: function () {
      if (!this.fullToken) return 0;
      try {
        const proofs = token.getProofs(this.fullToken);
        if (!proofs?.length) return 0;
        const mintUrl = token.getMint(this.fullToken);
        const unit = token.getUnit(this.fullToken);
        const walletStore = useWalletStore();
        return walletStore.getFeesForProofs(proofs, mintUrl, unit);
      } catch (e) {
        return 0;
      }
    },
  },
  methods: {
    ...mapActions(useP2PKStore, ["isLocked", "isLockedToUs"]),
    getProofsMint: function (proofs) {
      // unique keyset IDs of proofs
      const uniqueIds = [...new Set(proofs.map((p) => p.id))];
      // mints that have any of the keyset IDs
      const mints_keysets = this.mints.filter((m) =>
        m.keysets.some((r) => uniqueIds.indexOf(r) >= 0)
      );
      // what we put into the JSON
      const mints = mints_keysets.map(
        (m) => [{ url: m.url, ids: m.keysets }][0]
      );
      if (mints.length == 0) {
        return "";
      } else {
        return getShortUrl(mints[0].url);
      }
    },
    mintKnownToUs: function (proofs) {
      // unique keyset IDs of proofs
      const uniqueIds = [...new Set(proofs.map((p) => p.id))];
      // mints that have any of the keyset IDs
      return (
        this.mints.filter((m) =>
          m.keysets.some((r) => uniqueIds.indexOf(r.id) >= 0)
        ).length > 0
      );
    },
    shareToken: async function () {
      if (navigator.share) {
        const shareData = {
          text: this.encodedToken,
        };
        try {
          await navigator.share(shareData);
        } catch (error: any) {
          if (error?.name !== "AbortError") {
            console.error("Error sharing token:", error);
          }
        }
      }
    },
    copyToken: async function () {
      try {
        await navigator.clipboard.writeText(this.encodedToken);
        notifyCopied(this.$t("TokenInformation.token_copied") as string);
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
      }
    },
  },
});
</script>

<style scoped>
.token-information-container {
  width: 100%;
  color: var(--app-text);
}

/* Token Header - matches mint-header-container from MintDetailsPage */
.token-header-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

/* Action Buttons Section */
.action-buttons-section {
  width: 100%;
}

/* Token Details Section - exact match from MintDetailsPage */
.token-details-section {
  width: 100%;
}

/* The value elements belong to DetailRow, so they are reached through the section. */
.token-details-section :deep(.token-memo-value) {
  word-break: break-word;
  white-space: normal;
}

/* Locked to your key: the success tone; locked to someone else: the warning tone. Plain
   colour, no shimmer or glow (round 57). */
.token-details-section :deep(.p2pk-locked-me) {
  color: var(--app-success);
  font-weight: 600;
}
.token-details-section :deep(.p2pk-locked-warning) {
  color: var(--app-warning);
  font-weight: 600;
}
</style>
