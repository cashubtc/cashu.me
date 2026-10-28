<!-- The on-chain confirmation status row in quote details. The leading icon carries the state
     (a link while checking, a clock while pending, a check once confirmed); the value is a
     spinner while the explorer is queried, then "Confirmed/Pending (n/threshold)". -->
<template>
  <DetailRow
    :icon="statusIcon"
    :label="$t('QuoteInformation.chain_status')"
    value-class="detail-value-with-spinner"
  >
    <q-spinner
      v-if="loading"
      size="16px"
      :thickness="4"
      class="q-mr-xs chain-status__spinner"
    />
    <transition name="chain-status-fade" mode="out-in">
      <span
        v-if="metadata"
        :key="statusDisplay"
        :class="metadata.confirmed ? 'text-positive' : 'chain-status--pending'"
      >
        {{ statusDisplay }}
      </span>
      <span v-else key="loading" class="chain-status--pending">{{
        $t("QuoteInformation.fetching")
      }}</span>
    </transition>
  </DetailRow>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import {
  CircleCheck as CircleCheckIcon,
  Clock as ClockIcon,
  Link as LinkIcon,
} from "lucide-vue-next";
import DetailRow from "src/components/ui/DetailRow.vue";
import type { MempoolTxMetadata } from "src/js/onchain";

export default defineComponent({
  name: "ChainStatusRow",
  components: { DetailRow },
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
    statusIcon() {
      if (!this.metadata) return this.LinkIcon;
      return this.metadata.confirmed ? this.CircleCheckIcon : this.ClockIcon;
    },
    statusDisplay(): string {
      if (!this.metadata) return "";
      const status = this.$t(
        this.metadata.confirmed
          ? "QuoteInformation.chain_confirmed"
          : "QuoteInformation.chain_pending"
      );
      return `${status} (${this.metadata.confirmations}/${this.metadata.confirmationThreshold})`;
    },
  },
});
</script>

<style scoped>
.chain-status__spinner {
  color: var(--app-text-muted);
}
/* Pending is secondary text at regular weight; only Confirmed takes a colour. */
.chain-status--pending {
  color: var(--app-text-muted);
  font-weight: 400;
}

/* The value element belongs to DetailRow, so it is reached through this row's root. */
:deep(.detail-value-with-spinner) {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.chain-status-fade-enter-active,
.chain-status-fade-leave-active {
  transition: opacity 0.2s ease;
}

.chain-status-fade-enter-from,
.chain-status-fade-leave-to {
  opacity: 0;
}
</style>
