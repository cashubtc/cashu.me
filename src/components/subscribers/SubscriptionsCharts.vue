<template>
  <div class="row q-col-gutter-lg">
    <q-card class="col-12 col-md-4" aria-label="Frequency distribution pie chart">
      <q-card-section>
        <div style="height: 200px">
          <Pie :data="frequencyData" :options="pieOptions" aria-label="Frequency distribution pie chart" role="img" />
        </div>
      </q-card-section>
    </q-card>
    <q-card class="col-12 col-md-4" aria-label="Subscription status bar chart">
      <q-card-section>
        <div style="height: 200px">
          <Bar :data="statusData" :options="barOptions" aria-label="Subscription status bar chart" role="img" />
        </div>
      </q-card-section>
    </q-card>
    <q-card class="col-12 col-md-4" aria-label="New subscribers line chart">
      <q-card-section>
        <div style="height: 200px">
          <Line :data="newSubsData" :options="lineOptions" aria-label="New subscribers line chart" role="img" />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';
import { Pie, Bar, Line } from 'vue-chartjs';
import type { CreatorSubscription } from 'stores/creatorSubscriptions';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
);

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

const days = 7;

const newSubsLabels = computed(() => {
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (days - i - 1));
    return date.toLocaleDateString();
  });
});

const newSubsSeries = computed(() => {
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

const frequencyData = computed(() => ({
  labels: frequencyLabels.value,
  datasets: [
    {
      data: frequencySeries.value,
      backgroundColor: [
        'var(--q-positive)',
        'var(--q-warning)',
        'var(--q-negative)',
      ],
    },
  ],
}));

const statusData = computed(() => ({
  labels: statusLabels.value,
  datasets: [
    {
      data: statusSeries.value,
      backgroundColor: [
        'var(--q-positive)',
        'var(--q-warning)',
        'var(--q-negative)',
      ],
    },
  ],
}));

const newSubsData = computed(() => ({
  labels: newSubsLabels.value,
  datasets: [
    {
      data: newSubsSeries.value,
      label: t('CreatorSubscribers.charts.newSubs'),
      borderColor: 'var(--q-primary)',
      tension: 0.3,
      fill: false,
    },
  ],
}));

const pieOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
    title: {
      display: true,
      text: t('CreatorSubscribers.charts.frequency'),
    },
    tooltip: {
      callbacks: {
        label: (ctx: any) => `${ctx.label}: ${ctx.parsed}`,
      },
    },
  },
}));

const barOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
    title: {
      display: true,
      text: t('CreatorSubscribers.charts.status'),
    },
    tooltip: {
      callbacks: {
        label: (ctx: any) => `${ctx.label}: ${ctx.parsed.y}`,
      },
    },
  },
  scales: {
    y: { beginAtZero: true },
  },
}));

const lineOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
    title: {
      display: true,
      text: t('CreatorSubscribers.charts.newSubs'),
    },
    tooltip: {
      callbacks: {
        label: (ctx: any) => `${ctx.label}: ${ctx.parsed.y}`,
      },
    },
  },
  scales: {
    y: { beginAtZero: true },
  },
}));
</script>

