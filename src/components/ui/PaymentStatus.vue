<!-- The outcome at the top of a payment: a state mark (a green check when paid, the pending
     dots while it runs), the state in words, the amount as the one large figure, and a muted
     caption such as the fee. Paid invoices, paying and receiving use the same block.
     Paid arrives in three beats, as in the native wallet: the check comes into focus with a
     small bounce, then the words and amount rise in, then whatever follows in the flow (the
     receipt table; .flow-stack in elements.scss). Reduced motion keeps a plain fade. -->
<template>
  <div class="payment-status" :class="`payment-status--${state}`">
    <CircleCheckIcon
      v-if="state === 'paid'"
      :size="64"
      :stroke-width="1.5"
      class="text-positive payment-status__mark"
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
/* Beat 1 (100ms): the check sharpens from a 4px blur at 92%, overshoots to 112% and settles.
   Beat 2 (220ms): the words, amount and caption rise 8px as they fade in. */
@media (prefers-reduced-motion: no-preference) {
  .payment-status--paid .payment-status__mark {
    animation: payment-status-check 0.6s 0.1s both;
  }
  .payment-status--paid > :not(.payment-status__mark) {
    animation: payment-status-rise 0.3s 0.22s cubic-bezier(0.2, 0, 0, 1) both;
  }
}
@media (prefers-reduced-motion: reduce) {
  .payment-status--paid {
    animation: payment-status-fade 0.2s both;
  }
}
@keyframes payment-status-check {
  0% {
    filter: blur(4px);
    opacity: 0;
    transform: scale(0.92);
    animation-timing-function: cubic-bezier(0.2, 0, 0, 1);
  }
  55% {
    filter: blur(0);
    opacity: 1;
    transform: scale(1.12);
    animation-timing-function: cubic-bezier(0.3, 0, 0.2, 1);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes payment-status-rise {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}
@keyframes payment-status-fade {
  from {
    opacity: 0;
  }
}
</style>
