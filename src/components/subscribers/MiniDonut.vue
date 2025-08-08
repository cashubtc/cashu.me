<template>
  <div class="flex items-center">
    <q-skeleton v-if="segments.length === 0" type="circle" class="w-12 h-12" />
    <template v-else>
      <svg viewBox="0 0 32 32" class="w-12 h-12">
        <circle
          cx="16"
          cy="16"
          r="14"
          fill="none"
          stroke="var(--q-grey-4)"
          stroke-width="4"
        />
        <g transform="rotate(-90 16 16)">
          <circle
            v-for="(seg, i) in segments"
            :key="i"
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke-width="4"
            stroke-linecap="butt"
            :stroke="colors[i]"
            pathLength="100"
            :stroke-dasharray="`${seg.percent} 100`"
            :stroke-dashoffset="seg.offset"
          />
        </g>
      </svg>
      <ul v-if="labels.length" class="text-caption q-ml-sm">
        <li v-for="(label, i) in labels" :key="i" class="flex items-center">
          <span
            class="w-2 h-2 rounded-sm q-mr-xs"
            :style="{ backgroundColor: colors[i] }"
          />
          {{ label }}
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ series: number[]; labels: string[] }>();

const colors = [
  'var(--q-positive)',
  'var(--q-warning)',
  'var(--q-negative)',
  'var(--q-primary)',
  'var(--q-accent)',
  'var(--q-secondary)',
];

const total = computed(() => props.series.reduce((a, b) => a + b, 0));

const segments = computed(() => {
  if (total.value === 0) return [] as { percent: number; offset: number }[];
  let acc = 0;
  return props.series.map((val) => {
    const percent = (val / total.value) * 100;
    const seg = { percent, offset: -acc };
    acc += percent;
    return seg;
  });
});
</script>

<style scoped>
li + li {
  margin-top: 2px;
}
</style>
