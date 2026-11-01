<template>
  <div
    v-if="hasQuote"
    class="mint-quote-information detail-table"
    :class="containerTextClass"
  >
    <DetailRow
      v-if="showAmount && hasValidAmount"
      :icon="CoinsIcon"
      :label="$t('QuoteInformation.amount')"
      :value="amountDisplay"
    />

    <DetailRow
      v-if="unit !== 'sat'"
      :icon="CircleDollarSignIcon"
      :label="$t('QuoteInformation.unit')"
      :value="unitDisplay"
    />

    <!-- The one status (owner 2026-10-29, item 10). -->
    <QuoteStatusRow
      v-if="stateDisplay && !(hidePaidStatus && isPaidState)"
      :tone="statusTone"
      :text="stateDisplay"
    />

    <DetailRow
      :icon="isOnchain ? BitcoinIcon : ZapIcon"
      :label="$t('QuoteInformation.method')"
      :value="methodDisplay"
    />

    <DetailRow
      v-if="networkDisplay"
      :icon="NetworkIcon"
      :label="$t('QuoteInformation.network')"
      :value="networkDisplay"
    />

    <!-- What the payer pays lives in the table, not as a line under the QR (owner
         2026-11-01): a Lightning invoice copies; the deposit address always shows, paid or
         pending, copying while it waits and linking to an explorer once paid (it came and
         went). -->
    <DetailRow
      v-if="!isOnchain && invoice?.request"
      :icon="ReceiptTextIcon"
      :label="$t('QuoteInformation.invoice')"
      :copy-value="invoice.request"
      ><bdi dir="ltr">{{ shortAddress(invoice.request) }}</bdi></DetailRow
    >
    <DetailRow
      v-if="isOnchain && invoice?.request"
      :icon="HashIcon"
      :label="$t('QuoteInformation.address')"
      :href="isPaidState ? addressExplorerUrl : null"
      :copy-value="isPaidState && addressExplorerUrl ? '' : invoice.request"
      ><bdi dir="ltr">{{ shortAddress(invoice.request) }}</bdi></DetailRow
    >

    <DetailRow
      v-if="isOnchain && onchainMetadata"
      :icon="HashIcon"
      :label="$t('QuoteInformation.transaction_id')"
      :href="onchainMetadata.url"
      ><bdi dir="ltr">{{ shortTxid(onchainMetadata.txid) }}</bdi></DetailRow
    >

    <DetailRow
      v-if="paidAtDisplay"
      :icon="ClockIcon"
      :label="$t('QuoteInformation.paid_at')"
      :value="paidAtDisplay"
    />

    <DetailRow
      v-if="mintDisplay"
      :icon="MintIcon"
      :label="$t('QuoteInformation.mint')"
      :value="mintDisplay"
    />
  </div>
</template>

<script lang="ts">
import { unitCode } from "src/js/format-currency";
import QuoteStatusRow, {
  type QuoteStatusTone,
} from "src/components/QuoteStatusRow.vue";
import { defineComponent, PropType } from "vue";
import { mapState } from "pinia";
import { useMintsStore } from "stores/mints";
import { getShortUrl } from "src/js/wallet-helpers";
import {
  Bitcoin as BitcoinIcon,
  CircleDollarSign as CircleDollarSignIcon,
  Clock as ClockIcon,
  Coins as CoinsIcon,
  Hash as HashIcon,
  Building2 as MintIcon,
  Network as NetworkIcon,
  ReceiptText as ReceiptTextIcon,
  Zap as ZapIcon,
} from "lucide-vue-next";
import DetailRow from "src/components/ui/DetailRow.vue";
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
  components: { QuoteStatusRow, DetailRow },
  setup() {
    return {
      BitcoinIcon,
      CircleDollarSignIcon,
      ClockIcon,
      CoinsIcon,
      HashIcon,
      MintIcon,
      NetworkIcon,
      ReceiptTextIcon,
      ZapIcon,
    };
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
      return this.unit ? unitCode(this.unit) : "";
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
      // On-chain, once the explorer sees the deposit, the same row counts its confirmations,
      // then says the ecash is being issued. Paid stays the store's word (ecash credited).
      if (["pending", "unpaid"].includes(lower)) {
        const tx = this.isOnchain ? this.onchainMetadata : null;
        if (tx?.confirmed) {
          return this.$t("QuoteInformation.states.issuing") as string;
        }
        if (tx) {
          return this.$t("QuoteInformation.states.confirming", {
            count: tx.confirmations,
            threshold: tx.confirmationThreshold,
          }) as string;
        }
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
    /** The Status row's look: which mark it shows and whether it reads muted or positive. */
    statusTone(): QuoteStatusTone {
      if (this.isPaidState) return "paid";
      if (!this.isWaitingState) return "other";
      const tx = this.isOnchain ? this.onchainMetadata : null;
      if (tx?.confirmed) return "issuing";
      if (tx) return "confirming";
      return "waiting";
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
    addressExplorerUrl(): string | null {
      if (!this.isOnchain || !this.invoice?.request) return null;
      return onchainAddressExplorerUrl(this.invoice.request);
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
      return `${txid.slice(0, 8)}…${txid.slice(-8)}`;
    },
    shortAddress(address: string): string {
      return `${address.slice(0, 8)}…${address.slice(-8)}`;
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
      // A refetch keeps the last value on screen (no flash back to Waiting).
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
      // A different address starts from Waiting, not from the last invoice's deposit.
      this.onchainMetadata = null;
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
</style>
