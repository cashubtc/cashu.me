<!-- The outcome at the top of a payment: a state mark (a green check when paid, the pending
     dots while it runs), the state in words, the amount as the one large figure, and a muted
     caption such as the fee. Paid invoices, paying and receiving use the same block. -->
<template>
  <div class="payment-status">
    <CircleCheckIcon
      v-if="state === 'paid'"
      :size="64"
      :stroke-width="1.5"
      class="text-positive"
      aria-hidden="true"
    />
    <PendingDots v-else-if="state === 'pending'" size="32px" />
    <div v-if="label" class="payment-status__label">{{ label }}</div>
    <AmountHeadline v-if="$slots.default"><slot /></AmountHeadline>
    <div v-if="caption" class="payment-status__caption">{{ caption }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { CircleCheck as CircleCheckIcon } from "lucide-vue-next";
import AmountHeadline from "src/components/ui/AmountHeadline.vue";
import PendingDots from "src/components/ui/PendingDots.vue";

export default defineComponent({
  name: "PaymentStatus",
  components: { AmountHeadline, CircleCheckIcon, PendingDots },
  props: {
    state: {
      type: String as PropType<"paid" | "pending" | "none">,
      default: "none",
    },
    label: { type: String, default: "" },
    caption: { type: String, default: "" },
  },
});
</script>

<style scoped>
.payment-status {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
}
.payment-status__label {
  font-size: 17px;
  font-weight: 600;
  line-height: 24px;
}
.payment-status__caption {
  color: var(--app-text-muted);
  font-size: 14px;
  line-height: 20px;
}
</style>
