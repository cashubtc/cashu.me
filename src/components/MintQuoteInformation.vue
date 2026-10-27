<template>
  <div
    v-if="hasQuote"
    class="mint-quote-information q-mt-md"
    :class="containerTextClass"
  >
    <div v-if="showAmount && hasValidAmount" class="detail-item q-mb-md">
      <div class="detail-label">
        <ZapIcon :size="20" class="detail-icon" />
        <div class="detail-name">{{ $t("QuoteInformation.amount") }}</div>
      </div>
      <div class="detail-value">{{ amountDisplay }}</div>
    </div>

    <div v-if="unit !== 'sat'" class="detail-item q-mb-md">
      <div class="detail-label">
        <CoinsIcon :size="20" class="detail-icon" />
        <div class="detail-name">{{ $t("QuoteInformation.unit") }}</div>
      </div>
      <div class="detail-value">{{ unitDisplay }}</div>
    </div>

    <div
      v-if="stateDisplay && !(hidePaidStatus && isPaidState)"
      class="detail-item q-mb-md"
    >
      <div class="detail-label">
        <InfoIcon :size="20" class="detail-icon" />
        <div class="detail-name">{{ $t("QuoteInformation.status") }}</div>
      </div>
      <div class="detail-value" :class="{ 'text-positive': isPaidState }">
        <!-- A pulsing dot while the wallet waits for payment, so a pending invoice reads as live. -->
        <span v-if="isWaitingState" class="waiting-dot" aria-hidden="true" />
        {{ stateDisplay }}
      </div>
    </div>

    <div class="detail-item q-mb-md">
      <div class="detail-label">
        <ZapIcon :size="20" class="detail-icon" />
        <div class="detail-name">{{ $t("QuoteInformation.method") }}</div>
      </div>
      <div class="detail-value">{{ methodDisplay }}</div>
    </div>

    <div v-if="networkDisplay" class="detail-item q-mb-md">
      <div class="detail-label">
        <InfoIcon :size="20" class="detail-icon" />
        <div class="detail-name">{{ $t("QuoteInformation.network") }}</div>
      </div>
      <div class="detail-value">{{ networkDisplay }}</div>
    </div>

    <div v-if="isOnchain && onchainExplorerUrl" class="detail-item q-mb-md">
      <div class="detail-label">
        <HashIcon :size="20" class="detail-icon" />
        <div class="detail-name">
          {{ onchainMetadata ? "Transaction ID" : "Address" }}
        </div>
      </div>
      <a class="detail-value" :href="onchainExplorerUrl" target="_blank">
        {{
          onchainMetadata
            ? shortTxid(onchainMetadata.txid)
            : shortAddress(invoice.request)
        }}
      </a>
    </div>

    <div
      v-if="isOnchain && (onchainMetadata || loadingOnchainMetadata)"
      class="detail-item q-mb-md"
    >
      <div class="detail-label">
        <InfoIcon :size="20" class="detail-icon" />
        <div class="detail-name">{{ $t("QuoteInformation.chain_status") }}</div>
      </div>
      <div class="detail-value detail-value-with-spinner">
        <q-spinner
          v-if="loadingOnchainMetadata"
          size="14px"
          color="grey-6"
          class="q-mr-xs"
        />
        <transition name="chain-status-fade" mode="out-in">
          <span
            v-if="onchainMetadata"
            :key="onchainStatusDisplay"
            :class="{ 'text-positive': onchainMetadata.confirmed }"
          >
            {{ onchainStatusDisplay }}
          </span>
          <span v-else key="loading" class="text-grey-6">{{
            $t("QuoteInformation.fetching")
          }}</span>
        </transition>
      </div>
    </div>

    <div v-if="paidAtDisplay" class="detail-item q-mb-md">
      <div class="detail-label">
        <ClockIcon :size="20" class="detail-icon" />
        <div class="detail-name">{{ $t("QuoteInformation.paid_at") }}</div>
      </div>
      <div class="detail-value">{{ paidAtDisplay }}</div>
    </div>

    <div v-if="mintDisplay" class="detail-item">
      <div class="detail-label">
        <LandmarkIcon :size="20" class="detail-icon" />
        <div class="detail-name">{{ $t("QuoteInformation.mint") }}</div>
      </div>
      <div class="detail-value">{{ mintDisplay }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { mapState } from "pinia";
import { useMintsStore } from "stores/mints";
import { getShortUrl } from "src/js/wallet-helpers";
import {
  Zap as ZapIcon,
  Coins as CoinsIcon,
  Info as InfoIcon,
  Clock as ClockIcon,
  Landmark as LandmarkIcon,
  Hash as HashIcon,
} from "lucide-vue-next";
import { PaymentMethod } from "src/stores/walletTypes";
import {
  fetchAddressTxMetadata,
  onchainAddressExplorerUrl,
  onchainNetwork,
  onchainNetworkDisplay,
  type MempoolTxMetadata,
} from "src/js/onchain";

declare const windowMixin: any;
declare const formatCurrency: any;

type MintQuote = {
  request: string;
  quote: string;
  state?: string;
  expiry?: number;
  unit?: string;
  amount?: number;
};

export default defineComponent({
  name: "MintQuoteInformation",
  mixins: [windowMixin],
  components: {
    ZapIcon,
    CoinsIcon,
    InfoIcon,
    ClockIcon,
    LandmarkIcon,
    HashIcon,
  },
  props: {
    hidePaidStatus: {
      type: Boolean,
      default: false,
    },
    mintQuote: {
      type: Object as PropType<MintQuote | null>,
      default: null,
    },
    invoice: {
      type: Object as PropType<any | null>,
      default: null,
    },
    mintUrl: {
      type: String,
      default: "",
    },
    showAmount: {
      type: Boolean,
      default: true,
    },
    method: {
      type: String,
      default: PaymentMethod.Bolt11,
    },
    refreshTrigger: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    ...mapState(useMintsStore, ["activeMintUrl", "activeUnit"]),
    hasQuote(): boolean {
      return Boolean(this.mintQuote && this.mintQuote.quote);
    },
    containerTextClass(): string {
      return this.$q.dark.isActive ? "text-white" : "text-dark";
    },
    unit(): string {
      if (this.mintQuote?.unit) return this.mintQuote.unit;
      if (this.activeUnit) return this.activeUnit as string;
      return "sat";
    },
    unitDisplay(): string {
      return this.unit === "sat" ? "sat" : this.unit?.toUpperCase?.() || "";
    },
    hasValidAmount(): boolean {
      const amount =
        (this.mintQuote?.amount as number | undefined) ??
        (typeof this.invoice?.amount === "number"
          ? Math.abs(this.invoice.amount)
          : undefined);
      return typeof amount === "number" && amount > 0;
    },
    amountDisplay(): string {
      const amount =
        (this.mintQuote?.amount as number | undefined) ??
        (typeof this.invoice?.amount === "number"
          ? Math.abs(this.invoice.amount)
          : undefined);
      if (typeof amount !== "number") return "";
      return (this as any).formatCurrency(amount, this.unit);
    },
    stateDisplay(): string {
      const state = (this.invoice?.status as string) || this.mintQuote?.state;
      if (!state) return "";
      const lower = state.toLowerCase();
      // An incoming invoice that is not paid yet is waiting on the payer, not on the wallet.
      if (["pending", "unpaid"].includes(lower)) {
        return this.$t("QuoteInformation.states.waiting") as string;
      }
      const key = `QuoteInformation.states.${lower}`;
      if (this.$te(key)) return this.$t(key) as string;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    },
    isWaitingState(): boolean {
      const state = (this.invoice?.status as string) || this.mintQuote?.state;
      return ["pending", "unpaid"].includes(state?.toLowerCase() ?? "");
    },
    isPaidState(): boolean {
      const state = (this.invoice?.status as string) || this.mintQuote?.state;
      return state?.toLowerCase() === "paid";
    },
    methodDisplay(): string {
      const method = this.method || PaymentMethod.Bolt11;
      if (
        method === PaymentMethod.Onchain ||
        method === PaymentMethod.OnchainSubpayment
      ) {
        return this.$t("common.on_chain") as string;
      }
      if (
        method === PaymentMethod.Bolt12 ||
        method === PaymentMethod.Bolt12Subpayment
      ) {
        return this.$t("QuoteInformation.lightning_offer") as string;
      }
      return "Lightning";
    },
    isOnchain(): boolean {
      return (
        this.method === PaymentMethod.Onchain ||
        this.method === PaymentMethod.OnchainSubpayment
      );
    },
    networkDisplay(): string {
      if (!this.isOnchain || !this.invoice?.request) return "";
      const network =
        this.invoice.network || onchainNetwork(this.invoice.request);
      return network === "mutinynet" ? onchainNetworkDisplay(network) : "";
    },
    onchainExplorerUrl(): string | null {
      if (!this.isOnchain || !this.invoice?.request) return null;
      return (
        this.onchainMetadata?.url ||
        onchainAddressExplorerUrl(this.invoice.request)
      );
    },
    onchainStatusDisplay(): string {
      if (!this.onchainMetadata) return "";
      const status = this.$t(
        this.onchainMetadata.confirmed
          ? "QuoteInformation.chain_confirmed"
          : "QuoteInformation.chain_pending"
      );
      return `${status} (${this.onchainMetadata.confirmations}/${this.onchainMetadata.confirmationThreshold})`;
    },
    paidAtTimestamp(): number | null {
      if (this.invoice?.paidDate) {
        return this.normalizeToTimestamp(this.invoice.paidDate);
      }
      return null;
    },
    paidAtDisplay(): string {
      if (!this.paidAtTimestamp) return "";
      return new Intl.DateTimeFormat(this.$i18n.locale, {
        numberingSystem: "latn",
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(this.paidAtTimestamp));
    },
    mintDisplay(): string {
      const url = this.mintUrl || (this.activeMintUrl as string) || "";
      return url ? getShortUrl(url) : "";
    },
  },
  methods: {
    shortTxid(txid: string): string {
      return `${txid.slice(0, 8)}...${txid.slice(-8)}`;
    },
    shortAddress(address: string): string {
      return `${address.slice(0, 8)}...${address.slice(-8)}`;
    },
    mintConfirmations(): number {
      const mintStore = useMintsStore();
      const mint = mintStore.mints.find((m: any) => m.url === this.mintUrl);
      const methods =
        mint?.info?.nuts?.[4]?.methods || mint?.info?.nuts?.["4"]?.methods;
      const method = methods?.find(
        (m: any) => m.method === PaymentMethod.Onchain && m.unit === this.unit
      );
      return Number(method?.options?.confirmations || 1);
    },
    async loadOnchainMetadata() {
      if (!this.isOnchain || !this.invoice?.request) return;
      this.loadingOnchainMetadata = true;
      this.onchainMetadata = null;
      try {
        this.onchainMetadata = await fetchAddressTxMetadata(
          this.invoice.request,
          this.mintConfirmations()
        );
      } catch (error) {
        console.error("Could not fetch on-chain metadata", error);
      } finally {
        this.loadingOnchainMetadata = false;
      }
    },
    normalizeToTimestamp(value: string | number | Date | null | undefined) {
      if (value === null || value === undefined) return null;
      if (typeof value === "number") {
        if (!Number.isFinite(value) || value <= 0) return null;
        return value > 1e12 ? value : value * 1000;
      }
      if (typeof value === "string") {
        const numeric = Number(value);
        if (!Number.isNaN(numeric) && numeric > 0) {
          return numeric > 1e12 ? numeric : numeric * 1000;
        }
        const parsed = Date.parse(value);
        if (!Number.isNaN(parsed)) return parsed;
      }
      if (value instanceof Date) return value.getTime();
      return null;
    },
  },
  data: function () {
    return {
      onchainMetadata: null as MempoolTxMetadata | null,
      loadingOnchainMetadata: false,
    };
  },
  watch: {
    "invoice.request": function () {
      this.loadOnchainMetadata();
    },
    "invoice.status": function (status: string) {
      if (status === "paid") this.loadOnchainMetadata();
    },
    method: function () {
      this.loadOnchainMetadata();
    },
    refreshTrigger: function () {
      this.loadOnchainMetadata();
    },
  },
  mounted() {
    this.loadOnchainMetadata();
  },
});
</script>

<style scoped>
.mint-quote-information {
  width: 100%;
}

.detail-value-with-spinner {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.waiting-dot {
  animation: waiting-pulse 1.6s ease-in-out infinite;
  background: var(--q-primary);
  border-radius: 50%;
  display: inline-block;
  height: 8px;
  margin-inline-end: 8px;
  vertical-align: middle;
  width: 8px;
}
@keyframes waiting-pulse {
  50% {
    opacity: 0.3;
  }
}
@media (prefers-reduced-motion: reduce) {
  .waiting-dot {
    animation: none;
  }
}

.chain-status-fade-enter-active,
.chain-status-fade-leave-active {
  transition: opacity 0.2s ease;
}

.chain-status-fade-enter-from,
.chain-status-fade-leave-to {
  opacity: 0;
}
</style>
