<template>
  <div
    v-if="limitMessage"
    class="deposit-limits-warning text-caption text-app-muted"
  >
    <InfoIcon :size="13" class="deposit-limits-icon" />{{ limitMessage }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "pinia";
import { Info as InfoIcon } from "lucide-vue-next";
import { useMintsStore } from "src/stores/mints";
import { PaymentMethod } from "src/stores/walletTypes";
import { mintPaymentMethodLimits } from "src/js/mint-payment-methods";

declare const windowMixin: any;

export default defineComponent({
  name: "OnchainDepositLimits",
  mixins: [windowMixin],
  components: {
    InfoIcon,
  },
  props: {
    mintUrl: {
      type: String,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapState(useMintsStore, ["mints"]),
    limits() {
      const mint = this.mints.find((entry) => entry.url === this.mintUrl);
      return mintPaymentMethodLimits(
        mint,
        PaymentMethod.Onchain,
        "mint",
        this.unit
      );
    },
    limitMessage(): string {
      if (!this.limits) return "";
      const min = this.limits.minAmount;
      const max = this.limits.maxAmount;
      if (min != null && max != null) {
        return this.$t("CreateInvoiceDialog.deposit_limits.outside", {
          min: this.formatLimit(min),
          max: this.formatLimit(max),
        }) as string;
      }
      if (min != null)
        return this.$t("CreateInvoiceDialog.deposit_limits.below", {
          min: this.formatLimit(min),
        }) as string;
      if (max != null)
        return this.$t("CreateInvoiceDialog.deposit_limits.above", {
          max: this.formatLimit(max),
        }) as string;
      return "";
    },
  },
  methods: {
    formatLimit(amount: bigint): string {
      return (this as any).formatCurrency(amount, this.unit, true);
    },
  },
});
</script>

<style scoped>
.deposit-limits-warning {
  line-height: 1.4;
  text-align: center;
  text-wrap: balance;
}
.deposit-limits-icon {
  margin-inline-end: 6px;
  vertical-align: -2px;
}
</style>
