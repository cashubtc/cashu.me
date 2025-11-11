<template>
  <div class="token-information-container q-px-md">
    <!-- Amount Header -->
    <div v-if="!hideAmount" class="token-header-container">
      <div class="token-amount">
        {{ displayUnit }}
      </div>
    </div>

    <!-- Token Details Section -->
    <div class="token-details-section q-mt-md q-mb-lg">
      <!-- Fee (if applicable) -->
      <div v-if="receiveFee > 0 && !hideFee" class="detail-item q-mb-md">
        <div class="detail-label">
          <arrow-down-up-icon size="20" color="#9E9E9E" class="detail-icon" />
          <div class="detail-name">{{ $t("TokenInformation.fee") }}</div>
        </div>
        <div class="detail-value">
          {{ formatCurrency(receiveFee, tokenUnit, true) }}
        </div>
      </div>

      <!-- Unit -->
      <div v-if="!hideUnit" class="detail-item q-mb-md">
        <div class="detail-label">
          <banknote-icon size="20" color="#9E9E9E" class="detail-icon" />
          <div class="detail-name">{{ $t("TokenInformation.unit") }}</div>
        </div>
        <div class="detail-value">{{ tokenUnit.toUpperCase() }}</div>
      </div>

      <!-- Fiat -->
      <div v-if="showFiat && !hideFiat" class="detail-item q-mb-md">
        <div class="detail-label">
          <banknote-icon size="20" color="#9E9E9E" class="detail-icon" />
          <div class="detail-name">{{ $t("TokenInformation.fiat") }}</div>
        </div>
        <div class="detail-value">
          {{ formatCurrency(fiatAmount, bitcoinPriceCurrency, true) }}
        </div>
      </div>

      <!-- P2PK Lock Status (if locked) -->
      <div
        v-if="isLocked(proofsToShow) && !hideP2PK"
        class="detail-item q-mb-md"
      >
        <div class="detail-label">
          <lock-icon size="20" color="#9E9E9E" class="detail-icon" />
          <div class="detail-name">{{ $t("TokenInformation.p2pk") }}</div>
        </div>
        <div
          class="detail-value"
          :class="{
            'p2pk-locked-me': isLockedToUs(proofsToShow),
            'p2pk-locked-warning':
              isLocked(proofsToShow) && !isLockedToUs(proofsToShow),
          }"
        >
          {{
            isLockedToUs(proofsToShow)
              ? $t("TokenInformation.locked_to_you")
              : $t("TokenInformation.locked")
          }}
        </div>
      </div>

      <!-- Mint URL -->
      <div v-if="!hideMint" class="detail-item q-mb-md">
        <div class="detail-label">
          <building-icon size="20" color="#9E9E9E" class="detail-icon" />
          <div class="detail-name">{{ $t("TokenInformation.mint") }}</div>
        </div>
        <div class="detail-value">
          {{ tokenMintUrl }}
          <q-spinner v-if="addMintBlocking" size="sm" class="q-ml-xs" />
        </div>
      </div>

      <!-- Memo (if available) -->
      <div v-if="displayMemo && !hideMemo" class="detail-item q-mb-md">
        <div class="detail-label">
          <message-circle-icon size="20" color="#9E9E9E" class="detail-icon" />
          <div class="detail-name">{{ $t("TokenInformation.memo") }}</div>
        </div>
        <div
          class="detail-value"
          style="max-width: 60%; word-break: break-word; white-space: normal"
        >
          {{ displayMemo }}
        </div>
      </div>

      <!-- Payment Request (if applicable) -->
      <div v-if="paymentRequestId" class="detail-item">
        <div class="detail-label">
          <banknote-icon size="20" color="#9E9E9E" class="detail-icon" />
          <div class="detail-name">
            {{ $t("TokenInformation.payment_request") }}
          </div>
        </div>
        <div class="detail-value">{{ $t("TokenInformation.nostr") }}</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { getShortUrl } from "src/js/wallet-helpers";
import { mapActions, mapState } from "pinia";
import { useMintsStore } from "stores/mints";
import { useWalletStore } from "stores/wallet";
import { useP2PKStore } from "src/stores/p2pk";
import { usePriceStore } from "src/stores/price";
import { useSettingsStore } from "src/stores/settings";
import token from "src/js/token";
import {
  ArrowDownUp as ArrowDownUpIcon,
  Building as BuildingIcon,
  Lock as LockIcon,
  Banknote as BanknoteIcon,
  MessageCircle as MessageCircleIcon,
} from "lucide-vue-next";

export default defineComponent({
  name: "TokenInformation",
  mixins: [windowMixin],
  components: {
    ArrowDownUpIcon,
    BuildingIcon,
    LockIcon,
    BanknoteIcon,
    MessageCircleIcon,
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
    return {};
  },
  watch: {
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
      return token.getProofs(token.decode(this.encodedToken));
    },
    sumProofs: function () {
      let proofs = token.getProofs(token.decode(this.encodedToken));
      return proofs.flat().reduce((sum, el) => (sum += el.amount), 0);
    },
    displayUnit: function () {
      let display = this.formatCurrency(this.sumProofs, this.tokenUnit, true);
      return display;
    },
    tokenUnit: function () {
      return token.getUnit(token.decode(this.encodedToken));
    },
    tokenMintUrl: function () {
      let mint = token.getMint(token.decode(this.encodedToken));
      return getShortUrl(mint);
    },
    displayMemo: function () {
      return token.getMemo(token.decode(this.encodedToken));
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
      try {
        const tokenJson = token.decode(this.encodedToken);
        const proofs = token.getProofs(tokenJson);
        if (!proofs?.length) {
          return 0;
        }
        const mintUrl = token.getMint(tokenJson);
        const unit = token.getUnit(tokenJson);
        const walletStore = useWalletStore();
        const wallet = walletStore.mintWallet(mintUrl, unit);
        const fee = wallet.getFeesForProofs(proofs);
        return fee || 0;
      } catch (e) {
        return 0;
      }
    },
  },
  methods: {
    ...mapActions(useP2PKStore, ["isLocked", "isLockedToUs"]),
    getProofsMint: function (proofs) {
      // unique keyset IDs of proofs
      let uniqueIds = [...new Set(proofs.map((p) => p.id))];
      // mints that have any of the keyset IDs
      let mints_keysets = this.mints.filter((m) =>
        m.keysets.some((r) => uniqueIds.indexOf(r) >= 0)
      );
      // what we put into the JSON
      let mints = mints_keysets.map((m) => [{ url: m.url, ids: m.keysets }][0]);
      if (mints.length == 0) {
        return "";
      } else {
        return getShortUrl(mints[0].url);
      }
    },
    mintKnownToUs: function (proofs) {
      // unique keyset IDs of proofs
      let uniqueIds = [...new Set(proofs.map((p) => p.id))];
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
        this.$q.notify({
          message: this.$t("TokenInformation.token_copied"),
          color: "positive",
          position: "top",
          timeout: 1000,
        });
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
  color: white;
}

/* Token Header - matches mint-header-container from MintDetailsPage */
.token-header-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.token-amount {
  font-size: 36px;
  font-weight: 700;
  text-align: center;
}

/* Action Buttons Section */
.action-buttons-section {
  width: 100%;
}

/* Token Details Section - exact match from MintDetailsPage */
.token-details-section {
  width: 100%;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.detail-label {
  display: flex;
  align-items: center;
}

.detail-icon {
  margin-right: 10px;
}

.detail-name {
  font-size: 16px;
  font-weight: 600;
  color: #9e9e9e;
}

.detail-value {
  font-size: 16px;
  font-weight: 600;
  color: white;
  text-align: right;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Golden shine for P2PK locked-to-you */
.p2pk-locked-me {
  color: #ffd700;
  background: linear-gradient(
    90deg,
    #b8860b 0%,
    #ffd700 40%,
    #fff6b7 50%,
    #ffd700 60%,
    #b8860b 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shine 2.5s linear infinite;
  text-shadow: 0 0 6px rgba(255, 215, 0, 0.35);
}

/* Warning colors for P2PK locked (not to us) */
.p2pk-locked-warning {
  color: #ff9800;
  text-shadow: 0 0 6px rgba(255, 152, 0, 0.4);
}

@keyframes shine {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: 200px 0;
  }
}
</style>
