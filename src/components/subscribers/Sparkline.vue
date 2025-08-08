<template>
  <div class="w-full">
    <q-skeleton v-if="!data || data.length === 0" class="w-full h-6" />
    <svg v-else :viewBox="`0 0 ${width} ${height}`" class="w-full h-6">
      <polyline :points="points" fill="none" stroke="currentColor" stroke-width="2" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ data: number[] }>();

const width = 100;
const height = 24;

const points = computed(() => {
  if (!props.data || props.data.length === 0) return '';
  const max = Math.max(...props.data);
  const min = Math.min(...props.data);
  const range = max - min || 1;
  const step = props.data.length > 1 ? width / (props.data.length - 1) : 0;
  return props.data
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');
});
</script>
