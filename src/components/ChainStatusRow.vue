<!-- The on-chain confirmation status row in quote details: a spinner while the explorer is
     queried, then "Confirmed/Pending (n/threshold)", fading between states. -->
<template>
  <DetailRow
    :icon="InfoIcon"
    :label="$t('QuoteInformation.chain_status')"
    value-class="detail-value-with-spinner"
  >
    <q-spinner v-if="loading" size="14px" color="grey-6" class="q-mr-xs" />
    <transition name="chain-status-fade" mode="out-in">
      <span
        v-if="metadata"
        :key="statusDisplay"
        :class="{ 'text-positive': metadata.confirmed }"
      >
        {{ statusDisplay }}
      </span>
      <span v-else key="loading" class="text-grey-6">{{
        $t("QuoteInformation.fetching")
      }}</span>
    </transition>
  </DetailRow>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { Info as InfoIcon } from "lucide-vue-next";
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
    return { InfoIcon };
  },
  computed: {
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
