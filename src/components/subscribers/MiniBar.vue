<template>
  <div class="w-full">
    <q-skeleton v-if="!series || series.length === 0" class="w-full h-6" />
    <svg v-else :viewBox="`0 0 ${width} ${height}`" class="w-full h-6">
      <rect
        v-for="(v, i) in series"
        :key="i"
        :x="i * barWidth"
        :y="height - (v / maxValue) * height"
        :width="barWidth - gap"
        :height="(v / maxValue) * height"
        rx="1"
        ry="1"
        fill="currentColor"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ series: number[]; max?: number }>();

const width = 100;
const height = 24;
const gap = 1;

const barWidth = computed(() =>
  props.series.length > 0 ? width / props.series.length : 0,
);

const maxValue = computed(() =>
  props.max !== undefined ? props.max : Math.max(...props.series, 1),
);
</script>
