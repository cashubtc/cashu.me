<!-- A quote's one Status row, on a receive and on a payment. An on-chain receive moves
     Waiting for payment (dots, muted), Confirming (n/m) (a clock, muted), Issuing ecash (dots),
     then Paid (a check, in the positive colour). The mark, not the colour alone, tells the
     states apart; the text carries the state for screen readers. -->
<template>
  <DetailRow
    :icon="ActivityIcon"
    :label="$t('QuoteInformation.status')"
    :value-class="[
      'detail-value--inline',
      `quote-status--${tone}`,
      { 'text-positive': tone === 'paid' },
    ]"
  >
    <PendingDots v-if="tone === 'waiting' || tone === 'issuing'" size="16px" />
    <component
      :is="tone === 'paid' ? CircleCheckIcon : ClockIcon"
      v-else-if="tone === 'paid' || tone === 'confirming'"
      :size="16"
      class="quote-status__icon"
      aria-hidden="true"
    />
    <span data-testid="quote-status">{{ text }}</span>
  </DetailRow>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import {
  Activity as ActivityIcon,
  CircleCheck as CircleCheckIcon,
  Clock as ClockIcon,
} from "lucide-vue-next";
import DetailRow from "src/components/ui/DetailRow.vue";
import PendingDots from "src/components/ui/PendingDots.vue";

export type QuoteStatusTone =
  | "waiting"
  | "confirming"
  | "issuing"
  | "paid"
  | "other";

export default defineComponent({
  name: "QuoteStatusRow",
  components: { DetailRow, PendingDots },
  props: {
    /** Which mark the row shows and whether it reads muted or positive. */
    tone: { type: String as PropType<QuoteStatusTone>, default: "other" },
    /** The state in words ("Confirming (1/3)"). */
    text: { type: String, required: true },
  },
  setup() {
    return { ActivityIcon, CircleCheckIcon, ClockIcon };
  },
});
</script>

<style scoped>
.quote-status__icon {
  flex-shrink: 0;
}
/* Waiting and confirming are secondary text at regular weight; only Paid takes a colour. */
:deep(.quote-status--waiting),
:deep(.quote-status--confirming) {
  color: var(--app-text-muted);
  font-weight: 400;
}
</style>
