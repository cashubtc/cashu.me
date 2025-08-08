<template>
  <q-card class="kpi-card bg-grey-10 text-white">
    <q-card-section>
      <div class="flex items-start justify-between">
        <div>
          <div class="text-body1">{{ title }}</div>
          <div class="text-h5">{{ value }}</div>
        </div>
        <div
          v-if="diff !== undefined"
          :class="[diff >= 0 ? 'text-positive' : 'text-negative', 'text-subtitle2']"
        >
          {{ diff >= 0 ? '+' : '' }}{{ diff }}
        </div>
      </div>
      <div v-if="$slots.caption" class="text-caption q-mt-xs">
        <slot name="caption" />
      </div>
      <div v-if="$slots.default" class="q-mt-sm">
        <slot />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
  value: string | number;
  diff?: number;
}>();
</script>

<style scoped>
.kpi-card {
  border: 1px solid #2b2f3a;
  border-radius: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}
</style>
