<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="flex flex-col items-center">
      <MiniDonut :series="frequencySeries" :labels="frequencyLabels" />
      <div class="text-caption q-mt-xs">
        {{ t('CreatorSubscribers.charts.frequency') }}
      </div>
    </div>
    <div class="flex flex-col items-center">
      <MiniDonut :series="statusSeries" :labels="statusLabels" />
      <div class="text-caption q-mt-xs">
        {{ t('CreatorSubscribers.charts.status') }}
      </div>
    </div>
    <div class="flex flex-col items-center w-full">
      <MiniBar :series="newSubsSeries" class="w-full" />
      <div class="text-caption q-mt-xs">
        {{ t('CreatorSubscribers.charts.newSubs') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import MiniDonut from './MiniDonut.vue';
import MiniBar from './MiniBar.vue';
import type { CreatorSubscription } from 'stores/creatorSubscriptions';

const props = defineProps<{ rows: CreatorSubscription[] }>();

const { t } = useI18n();

const frequencyLabels = computed(() => [
  t('CreatorSubscribers.frequency.weekly'),
  t('CreatorSubscribers.frequency.biweekly'),
  t('CreatorSubscribers.frequency.monthly'),
]);

const frequencySeries = computed(() => {
  const counts = { weekly: 0, biweekly: 0, monthly: 0 };
  props.rows.forEach((r) => {
    counts[r.frequency] = (counts[r.frequency] || 0) + 1;
  });
  return [counts.weekly, counts.biweekly, counts.monthly];
});

function uiStatus(
  sub: CreatorSubscription,
): 'active' | 'pending' | 'ended' {
  if (sub.status === 'pending') return 'pending';
  const now = Date.now() / 1000;
  if (sub.endDate && sub.endDate < now) return 'ended';
  return 'active';
}

const statusLabels = computed(() => [
  t('CreatorSubscribers.status.active'),
  t('CreatorSubscribers.status.pending'),
  t('CreatorSubscribers.status.ended'),
]);

const statusSeries = computed(() => {
  const counts = { active: 0, pending: 0, ended: 0 };
  props.rows.forEach((r) => {
    counts[uiStatus(r)]++;
  });
  return [counts.active, counts.pending, counts.ended];
});

const newSubsSeries = computed(() => {
  const days = 7;
  const now = Date.now() / 1000;
  const arr = Array(days).fill(0);
  props.rows.forEach((r) => {
    if (!r.startDate) return;
    const diff = Math.floor((now - r.startDate) / (24 * 60 * 60));
    if (diff >= 0 && diff < days) {
      arr[days - diff - 1]++;
    }
  });
  return arr;
});
</script>
