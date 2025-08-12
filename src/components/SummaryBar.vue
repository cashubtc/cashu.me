<template>
  <div class="summary-bar text-center q-mb-md">
    <div class="text-h5 text-weight-bold text-white">
      {{ formatCurrency(total, unit) }}
    </div>
    <div class="text-grey-5">{{ activeCount }} Active Buckets</div>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from "stores/ui";

const props = defineProps<{
  total: number;
  activeCount: number;
  unit: string;
}>();

const uiStore = useUiStore();

function formatCurrency(value: number, unit: string) {
  return uiStore.formatCurrency(value, unit);
}
</script>

<style scoped>
.summary-bar {
  /* simple wrapper */
}
</style>
