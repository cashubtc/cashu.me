<!-- An on-chain send's confirmations: a plain fact row, "Confirmations n/threshold", with no
     state word, icon or colour (the Status row or the hero is the one status; owner
     2026-10-29, item 10). Busy dots alone while the explorer is queried. -->
<template>
  <DetailRow
    :icon="LinkIcon"
    :label="$t('QuoteInformation.confirmations')"
    value-class="confirmations-row__value"
  >
    <PendingDots v-if="loading && !metadata" size="16px" />
    <bdi v-else-if="metadata" dir="ltr">{{ countDisplay }}</bdi>
  </DetailRow>
</template>

<script lang="ts">
import PendingDots from "src/components/ui/PendingDots.vue";
import { defineComponent, type PropType } from "vue";
import { Link as LinkIcon } from "lucide-vue-next";
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
    return { LinkIcon };
  },
  computed: {
    countDisplay(): string {
      if (!this.metadata) return "";
      return `${this.metadata.confirmations}/${this.metadata.confirmationThreshold}`;
    },
  },
});
</script>

<style scoped>
/* The value element belongs to DetailRow, so it is reached through this row's root. */
:deep(.confirmations-row__value) {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>
