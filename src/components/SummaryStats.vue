<template>
  <div class="summary-stats row items-center justify-between q-pa-sm q-mb-md">
    <div class="text-h6 text-weight-bold">{{ formatCurrency(total) }}</div>
    <div class="text-caption">{{ activeCount }} Active Buckets</div>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from "stores/ui";
import { useMintsStore } from "stores/mints";
import { storeToRefs } from "pinia";

const props = defineProps<{ total: number; activeCount: number }>();

const ui = useUiStore();
const { activeUnit } = storeToRefs(useMintsStore());

function formatCurrency(val: number) {
  return ui.formatCurrency(val, activeUnit.value);
}
</script>

<style scoped>
.summary-stats {
  background-color: var(--bucket-background);
  border-radius: 8px;
  color: var(--bucket-text-color);
}
@media (max-width: 600px) {
  .summary-stats {
    flex-direction: column;
    text-align: center;
  }
}
</style>
