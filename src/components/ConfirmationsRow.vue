<!-- An on-chain send's confirmations: a fact row, "Confirmations n/threshold". Once the
     threshold is reached the count reads in the positive colour after a check; below it, muted
     after a clock (the icon, not the colour alone, tells them apart). No state word: the Status
     row or the hero stays the one payment status. Busy dots alone until the explorer first
     answers; a refetch keeps the known count. -->
<template>
  <DetailRow
    :icon="LinkIcon"
    :label="$t('QuoteInformation.confirmations')"
    value-class="detail-value--inline"
  >
    <PendingDots v-if="loading && !metadata" size="16px" />
    <transition v-else-if="metadata" name="confirmations-fade" mode="out-in">
      <span
        :key="confirmed ? 'confirmed' : 'pending'"
        class="confirmations"
        :class="confirmed ? 'text-positive' : 'confirmations--pending'"
        data-testid="confirmations-value"
      >
        <component
          :is="confirmed ? CircleCheckIcon : ClockIcon"
          :size="16"
          class="confirmations__icon"
          aria-hidden="true"
        />
        <bdi dir="ltr">{{ countDisplay }}</bdi>
      </span>
    </transition>
  </DetailRow>
</template>

<script lang="ts">
import PendingDots from "src/components/ui/PendingDots.vue";
import { defineComponent, type PropType } from "vue";
import {
  CircleCheck as CircleCheckIcon,
  Clock as ClockIcon,
  Link as LinkIcon,
} from "lucide-vue-next";
import DetailRow from "src/components/ui/DetailRow.vue";
import type { MempoolTxMetadata } from "src/js/onchain";

export default defineComponent({
  name: "ConfirmationsRow",
  components: { PendingDots, DetailRow },
  props: {
    metadata: {
      type: Object as PropType<MempoolTxMetadata | null>,
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    return { CircleCheckIcon, ClockIcon, LinkIcon };
  },
  computed: {
    /** The explorer's own verdict: the threshold is met. */
    confirmed(): boolean {
      return Boolean(this.metadata?.confirmed);
    },
    countDisplay(): string {
      if (!this.metadata) return "";
      return `${this.metadata.confirmations}/${this.metadata.confirmationThreshold}`;
    },
  },
});
</script>

<style scoped>
.confirmations {
  align-items: center;
  display: inline-flex;
  gap: 6px;
}
.confirmations__icon {
  flex-shrink: 0;
}
/* Below the threshold the count is secondary text; only a confirmed count takes a colour. */
.confirmations--pending {
  color: var(--app-text-muted);
  font-weight: 400;
}
.confirmations-fade-enter-active,
.confirmations-fade-leave-active {
  transition: opacity 0.2s ease;
}
.confirmations-fade-enter-from,
.confirmations-fade-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .confirmations-fade-enter-active,
  .confirmations-fade-leave-active {
    transition: none;
  }
}
</style>
