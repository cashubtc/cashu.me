<template>
  <div
    v-if="hasQuote"
    class="melt-quote-information q-mt-md"
    :class="containerTextClass"
  >
    <div v-if="showAmount" class="detail-item q-mb-md">
      <div class="detail-label">
        <ZapIcon :size="20" :color="iconColor" class="detail-icon" />
        <div class="detail-name">Amount</div>
      </div>
      <div class="detail-value">{{ amountDisplay }}</div>
    </div>

    <div v-if="hasFeeReserve && !hasFeePaid" class="detail-item q-mb-md">
      <div class="detail-label">
        <ArrowDownUpIcon :size="20" :color="iconColor" class="detail-icon" />
        <div class="detail-name">Fee Reserve</div>
      </div>
      <div class="detail-value">{{ feeReserveDisplay }}</div>
    </div>

    <div v-if="hasFeePaid" class="detail-item q-mb-md">
      <div class="detail-label">
        <BadgeCheckIcon :size="20" :color="iconColor" class="detail-icon" />
        <div class="detail-name">Fee Paid</div>
      </div>
      <div class="detail-value">{{ feePaidDisplay }}</div>
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

    <div v-if="paidAtDisplay" class="detail-item q-mb-md">
      <div class="detail-label">
        <ClockIcon :size="20" :color="iconColor" class="detail-icon" />
        <div class="detail-name">Time Paid</div>
      </div>
      <div class="detail-value">{{ paidAtDisplay }}</div>
    </div>

    <div v-if="hasPreimage" class="detail-item q-mb-md">
      <div class="detail-label">
        <FingerprintIcon :size="20" :color="iconColor" class="detail-icon" />
        <div class="detail-name">Preimage</div>
      </div>
      <div class="detail-value" @click="copyPreimage" style="cursor: pointer">
        {{ preimageValue }}
      </div>
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
import { getShortUrl } from "src/js/wallet-helpers";
import { useMintsStore } from "stores/mints";
import { MeltQuoteResponse } from "@cashu/cashu-ts";
import {
  Zap as ZapIcon,
  ArrowDownUp as ArrowDownUpIcon,
  BadgeCheck as BadgeCheckIcon,
  Clock as ClockIcon,
  Building as BuildingIcon,
  Banknote as BanknoteIcon,
  Info as InfoIcon,
  Fingerprint as FingerprintIcon,
} from "lucide-vue-next";

declare const windowMixin: any;
declare const formatCurrency: any;

type ExtendedMeltQuote = MeltQuoteResponse & {
  fee_paid?: number | null;
  paid?: number | string | boolean | null;
  paid_at?: number | string | null;
  paid_timestamp?: number | string | null;
  paid_time?: number | string | null;
};

export default defineComponent({
  name: "MeltQuoteInformation",
  mixins: [windowMixin],
  components: {
    ZapIcon,
    ArrowDownUpIcon,
    BadgeCheckIcon,
    ClockIcon,
    BuildingIcon,
    BanknoteIcon,
    InfoIcon,
    FingerprintIcon,
  },
  props: {
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
  },
  computed: {
    ...mapState(useMintsStore, ["activeMintUrl", "activeUnit"]),
    hasQuote(): boolean {
      return Boolean(this.meltQuote && this.meltQuote.quote);
    },
    iconColor(): string {
      return this.$q.dark.isActive ? "#9E9E9E" : "#616161";
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
      return this.quoteUnit?.toUpperCase?.() || "";
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
      return new Intl.DateTimeFormat(undefined, {
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
  },
  methods: {
    async copyPreimage() {
      const pre = this.preimageValue;
      if (!pre) return;
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(pre);
        } else {
          (this as any).copyText?.(pre);
        }
        this.$q.notify({
          message: "Preimage copied",
          color: "positive",
          position: "top",
          timeout: 1000,
        });
      } catch (e) {
        console.error("Failed to copy preimage", e);
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
});
</script>

<style scoped>
.melt-quote-information {
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
