<template>
  <div
    v-if="hasQuote"
    class="mint-quote-information q-mt-md"
    :class="containerTextClass"
  >
    <div v-if="showAmount && hasValidAmount" class="detail-item q-mb-md">
      <div class="detail-label">
        <ZapIcon :size="20" :color="iconColor" class="detail-icon" />
        <div class="detail-name">Amount</div>
      </div>
      <div class="detail-value">{{ amountDisplay }}</div>
    </div>

    <div class="detail-item q-mb-md">
      <div class="detail-label">
        <BanknoteIcon :size="20" :color="iconColor" class="detail-icon" />
        <div class="detail-name">Unit</div>
      </div>
      <div class="detail-value">{{ unitDisplay }}</div>
    </div>

    <div v-if="stateDisplay" class="detail-item q-mb-md">
      <div class="detail-label">
        <InfoIcon :size="20" :color="iconColor" class="detail-icon" />
        <div class="detail-name">State</div>
      </div>
      <div class="detail-value" :class="{ 'text-positive': isPaidState }">
        {{ stateDisplay }}
      </div>
    </div>

    <div class="detail-item q-mb-md">
      <div class="detail-label">
        <QrCodeIcon :size="20" :color="iconColor" class="detail-icon" />
        <div class="detail-name">Method</div>
      </div>
      <div class="detail-value">{{ methodDisplay }}</div>
    </div>

    <div v-if="networkDisplay" class="detail-item q-mb-md">
      <div class="detail-label">
        <InfoIcon :size="20" :color="iconColor" class="detail-icon" />
        <div class="detail-name">Network</div>
      </div>
      <div class="detail-value">{{ networkDisplay }}</div>
    </div>

    <div v-if="isOnchain && onchainMetadata" class="detail-item q-mb-md">
      <div class="detail-label">
        <InfoIcon :size="20" :color="iconColor" class="detail-icon" />
        <div class="detail-name">Chain Status</div>
      </div>
      <div
        class="detail-value"
        :class="{ 'text-positive': onchainMetadata.confirmed }"
      >
        {{ onchainStatusDisplay }}
      </div>
    </div>

    <div v-if="isOnchain && onchainMetadata" class="detail-item q-mb-md">
      <div class="detail-label">
        <HashIcon :size="20" :color="iconColor" class="detail-icon" />
        <div class="detail-name">Transaction ID</div>
      </div>
      <a class="detail-value" :href="onchainMetadata.url" target="_blank">
        {{ shortTxid(onchainMetadata.txid) }}
      </a>
    </div>

    <div v-if="paidAtDisplay" class="detail-item q-mb-md">
      <div class="detail-label">
        <ClockIcon :size="20" :color="iconColor" class="detail-icon" />
        <div class="detail-name">Time Paid</div>
      </div>
      <div class="detail-value">{{ paidAtDisplay }}</div>
    </div>

    <div v-if="mintDisplay" class="detail-item">
      <div class="detail-label">
        <BuildingIcon :size="20" :color="iconColor" class="detail-icon" />
        <div class="detail-name">Mint</div>
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
  Banknote as BanknoteIcon,
  Info as InfoIcon,
  Clock as ClockIcon,
  Building as BuildingIcon,
  QrCode as QrCodeIcon,
  Hash as HashIcon,
} from "lucide-vue-next";
import { LightningMethod } from "src/stores/walletTypes";
import {
  fetchAddressTxMetadata,
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
    BanknoteIcon,
    InfoIcon,
    ClockIcon,
    BuildingIcon,
    QrCodeIcon,
    HashIcon,
  },
  props: {
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
      default: LightningMethod.Bolt11,
    },
  },
  computed: {
    ...mapState(useMintsStore, ["activeMintUrl", "activeUnit"]),
    hasQuote(): boolean {
      return Boolean(this.mintQuote && this.mintQuote.quote);
    },
    iconColor(): string {
      return this.$q.dark.isActive ? "#9E9E9E" : "#616161";
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
      return this.unit?.toUpperCase?.() || "";
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
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    },
    isPaidState(): boolean {
      const state = (this.invoice?.status as string) || this.mintQuote?.state;
      return state?.toLowerCase() === "paid";
    },
    methodDisplay(): string {
      const method = this.method || LightningMethod.Bolt11;
      if (method === LightningMethod.Onchain) {
        return "On-chain";
      }
      if (
        method === LightningMethod.Bolt12 ||
        method === LightningMethod.Bolt12Subpayment
      ) {
        return "Bolt12";
      }
      return "Bolt11";
    },
    isOnchain(): boolean {
      return this.method === LightningMethod.Onchain;
    },
    networkDisplay(): string {
      if (!this.isOnchain || !this.invoice?.request) return "";
      const network =
        this.invoice.network || onchainNetwork(this.invoice.request);
      return network === "mutinynet" ? onchainNetworkDisplay(network) : "";
    },
    onchainStatusDisplay(): string {
      if (!this.onchainMetadata) return "";
      const status = this.onchainMetadata.confirmed ? "Confirmed" : "Pending";
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
      return new Intl.DateTimeFormat(undefined, {
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
    mintConfirmations(): number {
      const mintStore = useMintsStore();
      const mint = mintStore.mints.find((m: any) => m.url === this.mintUrl);
      const methods =
        mint?.info?.nuts?.[4]?.methods || mint?.info?.nuts?.["4"]?.methods;
      const method = methods?.find(
        (m: any) => m.method === LightningMethod.Onchain && m.unit === this.unit
      );
      return Number(method?.options?.confirmations || 1);
    },
    async loadOnchainMetadata() {
      if (!this.isOnchain || !this.invoice?.request) return;
      try {
        this.onchainMetadata = await fetchAddressTxMetadata(
          this.invoice.request,
          this.mintConfirmations()
        );
      } catch (error) {
        console.error("Could not fetch on-chain metadata", error);
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
    };
  },
  watch: {
    "invoice.request": function () {
      this.loadOnchainMetadata();
    },
    method: function () {
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
  font-size: 14px;
  font-weight: 600;
  color: var(--q-color-grey-6);
}

.detail-value {
  font-size: 16px;
  font-weight: 600;
  color: inherit;
  text-align: right;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
