<template>
  <div
    v-if="hasQuote"
    class="melt-quote-information detail-table q-mt-md"
    :class="containerTextClass"
  >
    <DetailRow
      v-if="showAmount"
      :icon="CoinsIcon"
      :label="$t('QuoteInformation.amount')"
      :value="amountDisplay"
    />

    <DetailRow
      v-if="hasFeeReserve && !hasFeePaid"
      :icon="ReceiptTextIcon"
      :label="$t('QuoteInformation.fee_reserve')"
      :value="feeReserveDisplay"
    />

    <DetailRow
      v-if="hasFeePaid"
      :icon="ReceiptTextIcon"
      :label="$t('QuoteInformation.fee_paid')"
      :value="feePaidDisplay"
    />

    <DetailRow
      v-if="quoteUnit !== 'sat'"
      :icon="CircleDollarSignIcon"
      :label="$t('QuoteInformation.unit')"
      :value="unitDisplay"
    />

    <DetailRow
      v-if="stateDisplay && !(hidePaidStatus && isPaidState)"
      :icon="ActivityIcon"
      :label="$t('QuoteInformation.status')"
      :value="stateDisplay"
      :value-class="{ 'text-positive': isPaidState }"
    />

    <DetailRow
      v-if="networkDisplay"
      :icon="NetworkIcon"
      :label="$t('QuoteInformation.network')"
      :value="networkDisplay"
    />

    <DetailRow
      v-if="hasTxid"
      :icon="HashIcon"
      :label="$t('QuoteInformation.transaction_id')"
      :href="onchainTxUrl"
      ><bdi dir="ltr">{{ shortTxid(txidValue) }}</bdi></DetailRow
    >

    <ConfirmationsRow
      v-if="hasTxid && (onchainMetadata || loadingOnchainMetadata)"
      :metadata="onchainMetadata"
      :loading="loadingOnchainMetadata"
    />

    <DetailRow
      v-if="paidAtDisplay"
      :icon="ClockIcon"
      :label="$t('QuoteInformation.paid_at')"
      :value="paidAtDisplay"
    />

    <DetailRow
      v-if="hasPreimage"
      :icon="FingerprintIcon"
      :label="$t('QuoteInformation.preimage')"
      :value="preimageValue"
      :copy-value="preimageValue"
      :copied-message="$t('QuoteInformation.preimage_copied')"
    />

    <DetailRow
      v-if="mintDisplay"
      :icon="LandmarkIcon"
      :label="$t('QuoteInformation.mint')"
      :value="mintDisplay"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { mapState } from "pinia";
import { getShortUrl } from "src/js/wallet-helpers";
import { useMintsStore } from "stores/mints";
import { MeltQuoteBolt11Response } from "@cashu/cashu-ts";
import { PaymentMethod } from "src/stores/walletTypes";
import {
  fetchTxMetadata,
  onchainNetwork,
  onchainNetworkDisplay,
  type MempoolTxMetadata,
} from "src/js/onchain";
import {
  CircleDollarSign as CircleDollarSignIcon,
  Clock as ClockIcon,
  Coins as CoinsIcon,
  Fingerprint as FingerprintIcon,
  Hash as HashIcon,
  Activity as ActivityIcon,
  Landmark as LandmarkIcon,
  Network as NetworkIcon,
  ReceiptText as ReceiptTextIcon,
} from "lucide-vue-next";
import DetailRow from "src/components/ui/DetailRow.vue";
import ConfirmationsRow from "src/components/ConfirmationsRow.vue";

declare const windowMixin: any;
declare const formatCurrency: any;

type ExtendedMeltQuote = MeltQuoteBolt11Response & {
  fee_paid?: number | null;
  paid?: number | string | boolean | null;
  paid_at?: number | string | null;
  paid_timestamp?: number | string | null;
  paid_time?: number | string | null;
};

export default defineComponent({
  name: "MeltQuoteInformation",
  mixins: [windowMixin],
  components: { DetailRow, ConfirmationsRow },
  setup() {
    return {
      CircleDollarSignIcon,
      ClockIcon,
      CoinsIcon,
      FingerprintIcon,
      HashIcon,
      ActivityIcon,
      LandmarkIcon,
      NetworkIcon,
      ReceiptTextIcon,
    };
  },
  data: function () {
    return {
      onchainMetadata: null as MempoolTxMetadata | null,
      loadingOnchainMetadata: false,
    };
  },
  props: {
    hidePaidStatus: {
      type: Boolean,
      default: false,
    },
    meltQuote: {
      type: Object as PropType<ExtendedMeltQuote | null>,
      default: null,
    },
    mintQuote: {
      type: Object as PropType<any | null>,
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
    historyPaidAt: {
      type: [String, Number, Date] as PropType<
        string | number | Date | null | undefined
      >,
      default: null,
    },
    refreshTrigger: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    ...mapState(useMintsStore, ["activeMintUrl", "activeUnit"]),
    hasQuote(): boolean {
      return Boolean(this.meltQuote && this.meltQuote.quote);
    },
    containerTextClass(): string {
      return this.$q.dark.isActive ? "text-white" : "text-dark";
    },
    quoteUnit(): string {
      if (this.meltQuote?.unit) {
        return this.meltQuote.unit;
      }
      if (this.mintQuote?.unit) {
        return this.mintQuote.unit;
      }
      if (this.activeUnit) {
        return this.activeUnit as string;
      }
      return "sat";
    },
    unitDisplay(): string {
      return this.quoteUnit === "sat"
        ? "sat"
        : this.quoteUnit?.toUpperCase?.() || "";
    },
    amountDisplay(): string {
      const amount =
        (this.meltQuote?.amount as number | undefined) ??
        (this.mintQuote?.amount as number | undefined) ??
        (typeof this.invoice?.amount === "number"
          ? Math.abs(this.invoice.amount)
          : undefined);
      if (typeof amount !== "number") return "";
      return (this as any).formatCurrency(amount, this.quoteUnit);
    },
    hasFeeReserve(): boolean {
      return Boolean(
        this.meltQuote && typeof this.meltQuote.fee_reserve === "number"
      );
    },
    feeReserveDisplay(): string {
      const value = this.meltQuote?.fee_reserve ?? 0;
      return (this as any).formatCurrency(value, this.quoteUnit);
    },
    feePaidValue(): number | null {
      if (
        !this.meltQuote ||
        this.meltQuote.fee_paid === undefined ||
        this.meltQuote.fee_paid === null
      ) {
        return null;
      }
      return typeof this.meltQuote.fee_paid === "number"
        ? this.meltQuote.fee_paid
        : Number(this.meltQuote.fee_paid);
    },
    feePaidActual(): number | null {
      if (
        this.invoice &&
        this.meltQuote &&
        typeof this.meltQuote.amount === "number"
      ) {
        const totalPaidAbs = Math.abs(Number(this.invoice.amount) || 0);
        if (Number.isFinite(totalPaidAbs) && totalPaidAbs >= 0) {
          const value = totalPaidAbs - this.meltQuote.amount;
          return Math.max(0, value);
        }
      }
      return this.feePaidValue;
    },
    feePaidDisplay(): string {
      const v = this.feePaidActual;
      if (v === null || Number.isNaN(v)) {
        return "";
      }
      return (this as any).formatCurrency(v, this.quoteUnit);
    },
    hasFeePaid(): boolean {
      const v = this.feePaidActual;
      return v !== null && Number.isFinite(v) && v >= 0;
    },
    stateDisplay(): string {
      const state = (this.invoice?.status as string) || this.meltQuote?.state;
      if (!state) {
        return "";
      }
      const lower = state.toLowerCase();
      const key = `QuoteInformation.states.${lower}`;
      if (this.$te(key)) return this.$t(key) as string;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    },
    isPaidState(): boolean {
      const state = (this.invoice?.status as string) || this.meltQuote?.state;
      return state?.toLowerCase() === "paid";
    },
    paidAtTimestamp(): number | null {
      if (this.invoice?.paidDate) {
        return this.normalizeToTimestamp(this.invoice.paidDate);
      }
      if (this.historyPaidAt) {
        return this.normalizeToTimestamp(this.historyPaidAt);
      }
      if (!this.meltQuote) {
        return null;
      }
      const raw =
        (this.meltQuote as ExtendedMeltQuote).paid_at ??
        (this.meltQuote as ExtendedMeltQuote).paid_timestamp ??
        (this.meltQuote as ExtendedMeltQuote).paid_time ??
        (this.meltQuote as ExtendedMeltQuote).paid;
      if (raw === undefined || raw === null) {
        return null;
      }
      if (typeof raw === "boolean") {
        return null;
      }
      if (typeof raw === "number") {
        return this.normalizeNumberTimestamp(raw);
      }
      if (typeof raw === "string") {
        return this.normalizeStringTimestamp(raw);
      }
      return null;
    },
    paidAtDisplay(): string {
      if (!this.paidAtTimestamp) {
        return "";
      }
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
    hasPreimage(): boolean {
      const pre = (this.meltQuote as any)?.payment_preimage;
      return typeof pre === "string" && pre.length > 0;
    },
    preimageValue(): string {
      return ((this.meltQuote as any)?.payment_preimage as string) || "";
    },
    txidValue(): string {
      const outpoint = (this.meltQuote as any)?.outpoint;
      if (typeof outpoint !== "string" || !outpoint) return "";
      return outpoint.split(":")[0];
    },
    hasTxid(): boolean {
      return this.txidValue.length > 0;
    },
    onchainTxUrl(): string {
      return (
        this.onchainMetadata?.url ||
        `${
          this.isMutinynet ? "https://mutinynet.com" : "https://mempool.space"
        }/tx/${this.txidValue}`
      );
    },
    isMutinynet(): boolean {
      const request = this.meltQuote?.request || this.invoice?.request || "";
      return (this.invoice?.network || onchainNetwork(request)) === "mutinynet";
    },
    networkDisplay(): string {
      if (!this.isMutinynet) return "";
      return onchainNetworkDisplay("mutinynet");
    },
  },
  methods: {
    shortTxid(txid: string): string {
      return `${txid.slice(0, 8)}...${txid.slice(-8)}`;
    },
    onchainConfirmations(): number {
      const mintStore = useMintsStore();
      const mint = mintStore.mints.find((m: any) => m.url === this.mintUrl);
      const methods =
        mint?.info?.nuts?.[5]?.methods || mint?.info?.nuts?.["5"]?.methods;
      const method = methods?.find(
        (m: any) =>
          m.method === PaymentMethod.Onchain && m.unit === this.quoteUnit
      );
      return Number(method?.options?.confirmations || 1);
    },
    async loadOnchainMetadata() {
      if (!this.hasTxid) return;
      this.loadingOnchainMetadata = true;
      this.onchainMetadata = null;
      try {
        const addressHint =
          this.meltQuote?.request ||
          (this.invoice?.network === "mutinynet" ? "tb1" : "bc1");
        this.onchainMetadata = await fetchTxMetadata(
          this.txidValue,
          this.onchainConfirmations(),
          addressHint
        );
      } catch (error) {
        console.error("Could not fetch on-chain metadata", error);
      } finally {
        this.loadingOnchainMetadata = false;
      }
    },
    normalizeToTimestamp(
      value: string | number | Date | null | undefined
    ): number | null {
      if (value === null || value === undefined) {
        return null;
      }
      if (value instanceof Date) {
        return value.getTime();
      }
      if (typeof value === "number") {
        return this.normalizeNumberTimestamp(value);
      }
      if (typeof value === "string") {
        return this.normalizeStringTimestamp(value);
      }
      return null;
    },
    normalizeNumberTimestamp(value: number): number | null {
      if (!Number.isFinite(value) || value <= 0) {
        return null;
      }
      return value > 1e12 ? value : value * 1000;
    },
    normalizeStringTimestamp(value: string): number | null {
      if (!value) {
        return null;
      }
      const numeric = Number(value);
      if (!Number.isNaN(numeric) && numeric > 0) {
        return this.normalizeNumberTimestamp(numeric);
      }
      const parsed = Date.parse(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
      return null;
    },
  },
  watch: {
    txidValue: function () {
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
.melt-quote-information {
  width: 100%;
}
</style>
