<template>
  <q-banner v-if="limits" rounded class="deposit-limits-warning bg-warning">
    <template v-slot:avatar>
      <q-icon name="warning" color="dark" />
    </template>
    <div class="text-dark text-weight-medium">On-chain deposit limits</div>
    <div class="text-dark text-body2">
      {{ limitMessage }} Deposits outside this range may not be credited and
      could be lost.
    </div>
  </q-banner>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "pinia";
import { useMintsStore } from "src/stores/mints";
import { PaymentMethod } from "src/stores/walletTypes";
import { mintPaymentMethodLimits } from "src/js/mint-payment-methods";

declare const windowMixin: any;

export default defineComponent({
  name: "OnchainDepositLimits",
  mixins: [windowMixin],
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
        return `Send between ${this.formatLimit(min)} and ${this.formatLimit(
          max
        )}.`;
      }
      if (min != null) return `Send at least ${this.formatLimit(min)}.`;
      return `Send no more than ${this.formatLimit(max as number)}.`;
    },
  },
  methods: {
    formatLimit(amount: number): string {
      return (this as any).formatCurrency(amount, this.unit, true);
    },
  },
});
</script>
