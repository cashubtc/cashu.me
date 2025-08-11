<template>
  <q-expansion-item label="Insights" expand-separator>
    <div class="row q-col-gutter-lg">
      <q-card class="col-12">
        <q-card-section>
          <div id="frequencyChartDesc" class="text-caption text-grey-7 q-mb-sm">
            Shows number of subscriptions by frequency.
          </div>
          <div style="height: 300px">
            <Pie
              :data="frequencyData"
              :options="pieOptions"
              aria-label="Frequency distribution pie chart"
              aria-describedby="frequencyChartDesc"
              role="img"
            />
          </div>
        </q-card-section>
      </q-card>
      <q-card class="col-12">
        <q-card-section>
          <div id="statusChartDesc" class="text-caption text-grey-7 q-mb-sm">
            Shows number of subscriptions by status.
          </div>
          <div style="height: 300px">
            <Bar
              :data="statusData"
              :options="barOptions"
              aria-label="Subscription status bar chart"
              aria-describedby="statusChartDesc"
              role="img"
            />
          </div>
        </q-card-section>
      </q-card>
      <q-card class="col-12">
        <q-card-section>
          <div id="newSubsChartDesc" class="text-caption text-grey-7 q-mb-sm">
            Shows new subscribers over the past week.
          </div>
          <div style="height: 300px">
            <Line
              :data="newSubsData"
              :options="lineOptions"
              aria-label="New subscribers line chart"
              aria-describedby="newSubsChartDesc"
              role="img"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-expansion-item>
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
  {
    id: 'pieLabelPlugin',
    afterDatasetsDraw(chart) {
      if (chart.config.type !== 'pie') return;
      const { ctx, data } = chart;
      ctx.save();
      chart.getDatasetMeta(0).data.forEach((datapoint, i) => {
        const { x, y } = datapoint.tooltipPosition();
        const value = data.datasets[0].data[i] as number;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(value), x, y);
      });
    },
  },
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
        'var(--q-light-green-5)',
        'var(--q-amber-5)',
        'var(--q-red-5)',
      ],
      borderColor: '#fff',
      borderWidth: 1,
    },
  ],
}));

const statusData = computed(() => ({
  labels: statusLabels.value,
  datasets: [
    {
      data: statusSeries.value,
      backgroundColor: [
        'var(--q-light-green-5)',
        'var(--q-amber-5)',
        'var(--q-red-5)',
      ],
      borderColor: '#fff',
      borderWidth: 1,
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
    legend: { position: 'bottom', labels: { font: { size: 14 } } },
    title: {
      display: true,
      text: t('CreatorSubscribers.charts.frequency'),
      font: { size: 16 },
    },
    tooltip: {
      backgroundColor: '#2f2f2f',
      titleColor: '#fff',
      bodyColor: '#fff',
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
    legend: { position: 'bottom', labels: { font: { size: 14 } } },
    title: {
      display: true,
      text: t('CreatorSubscribers.charts.status'),
      font: { size: 16 },
    },
    tooltip: {
      backgroundColor: '#2f2f2f',
      titleColor: '#fff',
      bodyColor: '#fff',
      callbacks: {
        label: (ctx: any) => `${ctx.label}: ${ctx.parsed.y}`,
      },
    },
  },
  scales: {
    x: {
      ticks: { font: { size: 12 } },
    },
    y: {
      beginAtZero: true,
      ticks: { font: { size: 12 } },
    },
  },
}));

const lineOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { font: { size: 14 } } },
    title: {
      display: true,
      text: t('CreatorSubscribers.charts.newSubs'),
      font: { size: 16 },
    },
    tooltip: {
      backgroundColor: '#2f2f2f',
      titleColor: '#fff',
      bodyColor: '#fff',
      callbacks: {
        label: (ctx: any) => `${ctx.label}: ${ctx.parsed.y}`,
      },
    },
  },
  scales: {
    x: {
      ticks: { font: { size: 12 } },
    },
    y: {
      beginAtZero: true,
      ticks: { font: { size: 12 } },
    },
  },
}));
</script>

