<template>
  <q-card class="rounded-lg bg-white dark:bg-grey-9 text-dark dark:text-white">
    <q-card-section>
      <div class="flex items-start justify-between">
        <div>
          <div class="text-subtitle1">{{ title }}</div>
          <div class="text-h6">{{ value }}</div>
        </div>
        <div v-if="diff !== undefined" :class="[diff >= 0 ? 'text-positive' : 'text-negative', 'text-subtitle2']">
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
.rounded-lg {
  border-radius: 0.5rem;
}
</style>
