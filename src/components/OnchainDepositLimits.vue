<!-- The selected mint's on-chain deposit range as one sentence ("Deposits outside
     {min}–{max} won't be credited.") behind an info glyph. `placement` picks where it sits:
     "picker", helper text under the mint picker on the amount step (council R92, item 21),
     start-aligned at body size; "address", the centred caption under the address QR, the one
     screen a sender sees. The range is one left-to-right, non-breaking run, so Arabic keeps
     min before max and the sentence never splits it across lines. `limits` stands in for the
     mint's advertised range on the design-system board. -->
<template>
  <div
    v-if="parts"
    :class="
      placement === 'picker'
        ? 'deposit-limits-hint'
        : 'deposit-limits-warning text-caption'
    "
  >
    <InfoIcon
      :size="placement === 'picker' ? 16 : 13"
      class="deposit-limits-icon"
      aria-hidden="true"
    />
    <span
      >{{ parts.before
      }}<bdi dir="ltr" class="deposit-limits-range">{{ parts.range }}</bdi
      >{{ parts.after }}</span
    >
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { mapState } from "pinia";
import { Info as InfoIcon } from "lucide-vue-next";
import { useMintsStore } from "src/stores/mints";
import { PaymentMethod } from "src/stores/walletTypes";
import {
  mintPaymentMethodLimits,
  type PaymentMethodLimits,
} from "src/js/mint-payment-methods";

declare const windowMixin: any;

// Private-use markers stand in for the amounts, so the sentence can be cut around the range
// whatever order or punctuation a locale gives it.
const MIN_MARK = "";
const MAX_MARK = "";

export default defineComponent({
  name: "OnchainDepositLimits",
  mixins: [windowMixin],
  components: {
    InfoIcon,
  },
  props: {
    mintUrl: {
      type: String,
      default: "",
    },
    unit: {
      type: String,
      required: true,
    },
    placement: {
      type: String as PropType<"picker" | "address">,
      default: "address",
    },
    limits: {
      type: Object as PropType<PaymentMethodLimits | null>,
      default: null,
    },
  },
  computed: {
    ...mapState(useMintsStore, ["mints"]),
    mintLimits(): PaymentMethodLimits | null {
      if (this.limits) return this.limits;
      const mint = this.mints.find((entry) => entry.url === this.mintUrl);
      return mintPaymentMethodLimits(
        mint,
        PaymentMethod.Onchain,
        "mint",
        this.unit
      );
    },
    parts(): { before: string; range: string; after: string } | null {
      if (!this.mintLimits) return null;
      const min = this.mintLimits.minAmount;
      const max = this.mintLimits.maxAmount;
      let template: string;
      if (min != null && max != null) {
        template = this.$t("CreateInvoiceDialog.deposit_limits.outside", {
          min: MIN_MARK,
          max: MAX_MARK,
        }) as string;
      } else if (min != null) {
        template = this.$t("CreateInvoiceDialog.deposit_limits.below", {
          min: MIN_MARK,
        }) as string;
      } else if (max != null) {
        template = this.$t("CreateInvoiceDialog.deposit_limits.above", {
          max: MAX_MARK,
        }) as string;
      } else {
        return null;
      }
      const marks = [...template.matchAll(/[]/g)];
      if (!marks.length) return { before: template, range: "", after: "" };
      const start = marks[0].index ?? 0;
      const end = (marks[marks.length - 1].index ?? 0) + 1;
      const fill = (text: string) =>
        text
          .replace(MIN_MARK, min != null ? this.formatLimit(min) : "")
          .replace(MAX_MARK, max != null ? this.formatLimit(max) : "");
      return {
        before: template.slice(0, start),
        range: fill(template.slice(start, end)),
        after: template.slice(end),
      };
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
  color: var(--app-text-muted);
  line-height: 1.4;
  text-align: center;
  text-wrap: balance;
}
.deposit-limits-warning .deposit-limits-icon {
  margin-inline-end: 6px;
  vertical-align: -2px;
}
/* Helper text under the mint card: 12px below it (ChooseMint keeps a 16px bottom inset), inset
   to the card's content, body size in the secondary-text token. */
.deposit-limits-hint {
  align-items: flex-start;
  color: var(--app-text-muted);
  display: flex;
  font-size: 14px;
  gap: 8px;
  line-height: 20px;
  margin-top: -4px;
  padding-inline: 16px;
}
.deposit-limits-hint .deposit-limits-icon {
  flex: none;
  margin-top: 2px;
}
.deposit-limits-range {
  white-space: nowrap;
}
</style>
