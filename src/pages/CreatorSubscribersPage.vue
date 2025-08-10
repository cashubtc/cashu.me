<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-white text-dark">
      <q-toolbar class="row items-center q-gutter-sm">
        <q-btn
          flat
          dense
          round
          icon="menu"
          :aria-label="t('CreatorSubscribers.actions.filters')"
          @click="filtersOpen = !filtersOpen"
        />
        <div class="text-h6">{{ t('CreatorSubscribers.summary.subscribers') }}</div>
        <q-input
          dense
          v-model="search"
          :placeholder="t('CreatorSubscribers.toolbar.searchPlaceholder')"
          class="q-ml-md"
          clearable
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn-toggle
          v-model="view"
          dense
          toggle-color="primary"
          class="q-ml-sm"
          :options="viewOptions"
        />
        <q-btn-toggle
          v-model="density"
          dense
          toggle-color="primary"
          class="q-ml-sm"
          :options="densityOptions"
        />
        <q-btn
          outline
          color="grey-5"
          icon="download"
          :label="t('CreatorSubscribers.toolbar.exportCsv')"
          class="q-ml-sm"
          :aria-label="t('CreatorSubscribers.toolbar.exportCsv')"
          @click="downloadCsv()"
        />
      </q-toolbar>
    </q-header>
    <q-drawer v-model="filtersOpen" side="left" bordered :overlay="$q.screen.lt.md">
      <SubscriberFilters />
    </q-drawer>
    <q-page-container>
      <q-page class="q-pa-md fit">
        <q-banner v-if="error" dense class="q-mb-md bg-red-1 text-red">
          {{ error }}
          <template #action>
            <q-btn
              flat
              color="red"
              :label="t('CreatorSubscribers.actions.retry')"
              :aria-label="t('CreatorSubscribers.actions.retry')"
              @click="retry"
            />
          </template>
        </q-banner>
        <q-inner-loading :showing="loading">
          <q-spinner size="50px" color="primary" />
        </q-inner-loading>
        <!-- KPI Row -->
    <div class="row q-col-gutter-md q-mb-md">
      <q-card
        flat
        bordered
        class="col-12 col-sm-6 col-md-3 panel-container q-pa-sm"
      >
        <div class="text-caption text-grey">
          {{ t('CreatorSubscribers.summary.subscribers') }}
        </div>
        <div class="text-h6">{{ counts.all }}</div>
      </q-card>
      <q-card
        flat
        bordered
        class="col-12 col-sm-6 col-md-3 panel-container q-pa-sm"
      >
        <div class="text-caption text-grey">
          {{ t('CreatorSubscribers.summary.active') }} /
          {{ t('CreatorSubscribers.summary.pending') }}
        </div>
        <div class="text-h6">{{ activeCount }} / {{ pendingCount }}</div>
      </q-card>
      <q-card
        flat
        bordered
        class="col-12 col-sm-6 col-md-3 panel-container q-pa-sm"
      >
        <div class="text-caption text-grey">
          {{ t('CreatorSubscribers.summary.lifetimeRevenue') }}
        </div>
        <div class="text-h6">{{ lifetimeRevenue }} sat</div>
      </q-card>
      <q-card
        flat
        bordered
        class="col-12 col-sm-6 col-md-3 panel-container q-pa-sm"
        @click="togglePeriod"
      >
        <div class="text-caption text-grey">
          {{ periodMode === 'week'
            ? t('CreatorSubscribers.summary.nextWeek')
            : t('CreatorSubscribers.summary.nextMonth') }}
        </div>
        <div class="text-h6">{{ formattedKpiThisPeriodSat }} sat</div>
      </q-card>
    </div>

    <!-- Charts -->
    <q-option-group
      v-model="visibleCharts"
      type="toggle"
      inline
      class="q-mb-md"
      :options="chartToggleOptions"
    />
    <div class="row q-col-gutter-md q-mb-md">
      <q-card
        v-show="showRevenueChart"
        flat
        bordered
        class="col-12 col-md-4 panel-container q-pa-sm"
      >
        <div class="text-subtitle2 q-mb-sm">
          {{ t('CreatorSubscribers.charts.revenueOverTime') }}
        </div>
        <canvas
          ref="lineEl"
          :aria-label="t('CreatorSubscribers.charts.revenueOverTime')"
          role="img"
        />
        <p class="sr-only">{{ revenueSummary }}</p>
      </q-card>
      <q-card
          v-show="showFrequencyChart"
          flat
          bordered
          class="col-12 col-md-4 panel-container q-pa-sm"
        >
        <div class="text-subtitle2 q-mb-sm">
          {{ t('CreatorSubscribers.charts.frequencyMix') }}
        </div>
        <canvas
          ref="doughnutEl"
          :aria-label="t('CreatorSubscribers.charts.frequencyMix')"
          role="img"
        />
        <p class="sr-only">{{ frequencySummary }}</p>
      </q-card>
      <q-card
        v-show="showStatusChart"
        flat
        bordered
        class="col-12 col-md-4 panel-container q-pa-sm"
      >
        <div class="text-subtitle2 q-mb-sm">
          {{ t('CreatorSubscribers.charts.statusByFrequency') }}
        </div>
        <canvas
          ref="barEl"
          :aria-label="t('CreatorSubscribers.charts.statusByFrequency')"
          role="img"
        />
        <p class="sr-only">{{ statusSummary }}</p>
      </q-card>
    </div>

    <!-- Tabs -->
    <q-tabs v-model="activeTab" dense class="q-mb-md" no-caps>
      <q-tab name="all">
        <div class="row items-center no-wrap">
          <span>{{ t('CreatorSubscribers.tabs.all') }}</span>
          <q-badge class="q-ml-xs" color="primary">{{ counts.all }}</q-badge>
        </div>
      </q-tab>
      <q-tab name="weekly">
        <div class="row items-center no-wrap">
          <span>{{ t('CreatorSubscribers.frequency.weekly') }}</span>
          <q-badge class="q-ml-xs" color="primary">{{ counts.weekly }}</q-badge>
        </div>
      </q-tab>
      <q-tab name="biweekly">
        <div class="row items-center no-wrap">
          <span>{{ t('CreatorSubscribers.frequency.biweekly') }}</span>
          <q-badge class="q-ml-xs" color="primary">{{ counts.biweekly }}</q-badge>
        </div>
      </q-tab>
      <q-tab name="monthly">
        <div class="row items-center no-wrap">
          <span>{{ t('CreatorSubscribers.frequency.monthly') }}</span>
          <q-badge class="q-ml-xs" color="primary">{{ counts.monthly }}</q-badge>
        </div>
      </q-tab>
      <q-tab name="pending">
        <div class="row items-center no-wrap">
          <span>{{ t('CreatorSubscribers.status.pending') }}</span>
          <q-badge class="q-ml-xs" color="primary">{{ counts.pending }}</q-badge>
        </div>
      </q-tab>
      <q-tab name="ended">
        <div class="row items-center no-wrap">
          <span>{{ t('CreatorSubscribers.status.ended') }}</span>
          <q-badge class="q-ml-xs" color="primary">{{ counts.ended }}</q-badge>
        </div>
      </q-tab>
    </q-tabs>

    <!-- Table -->
    <q-table
      v-if="view === 'table'"
      flat
      :rows="paginatedRows"
      row-key="id"
      selection="multiple"
      v-model:selected="selected"
      :columns="columns"
      :rows-per-page-options="[10, 25, 50]"
      :row-class="rowClass"
      :dense="density === 'compact'"
      :class="['density--' + density]"
      v-model:pagination="pagination"
      :row-count="filtered.length"
      @request="onRequest"
    >
      <template #body-cell-subscriber="props">
        <q-td :props="props">
          <div class="row items-center q-gutter-sm no-wrap">
            <q-avatar size="32px">{{ initials(props.row.name) }}</q-avatar>
            <div>
              <div class="text-body2">{{ props.row.name }}</div>
              <div class="text-caption text-grey-6">{{ props.row.nip05 }}</div>
            </div>
          </div>
        </q-td>
      </template>
      <template #body-cell-tier="props">
        <q-td :props="props"
          ><q-chip dense color="primary" text-color="white">{{
            props.row.tierName
          }}</q-chip></q-td
        >
      </template>
      <template #body-cell-frequency="props">
        <q-td :props="props"
          ><q-chip dense outline>{{
            freqShort(props.row.frequency)
          }}</q-chip></q-td
        >
      </template>
      <template #body-cell-status="props">
        <q-td :props="props"
          ><q-chip
            dense
            :color="statusColor(props.row.status)"
            :text-color="statusTextColor(props.row.status)"
            :icon="statusIcon(props.row.status)"
            >{{ t('CreatorSubscribers.status.' + props.row.status) }}</q-chip
          ></q-td>
      </template>
      <template #body-cell-amount="props"
        ><q-td :props="props">{{ props.row.amountSat }} sat</q-td></template
      >
      <template #body-cell-nextRenewal="props">
        <q-td :props="props">
          <div class="row items-center no-wrap q-gutter-sm">
            <div
              class="progress-ring"
              :style="{
                '--progress': progressPercent(props.row),
                '--size': '28px',
                '--thickness': '3px',
                '--progress-ring-fill': `var(--q-${
                  dueSoon(props.row) ? 'warning' : 'primary'
                })`,
              }"
              :data-label="`${progressPercent(props.row)}%`"
              role="progressbar"
              :aria-valuenow="progressPercent(props.row)"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="t('CreatorSubscribers.renewalProgress')"
              :aria-valuetext="progressPercent(props.row) + '%'"
            />
            <div class="column">
              <div
                :class="[
                  'text-caption',
                  dueSoon(props.row) ? 'text-warning' : '',
                ]"
              >
                {{
                  props.row.nextRenewal ? distToNow(props.row.nextRenewal) : '—'
                }}
              </div>
              <div class="text-caption text-grey-6">
                {{
                  props.row.nextRenewal ? formatDate(props.row.nextRenewal) : ''
                }}
              </div>
            </div>
          </div>
        </q-td>
      </template>
      <template #body-cell-lifetime="props"
        ><q-td :props="props">{{ props.row.lifetimeSat }} sat</q-td></template
      >
      <template #body-cell-actions="props"
        ><q-td :props="props"
          ><q-btn
            flat
            dense
            round
            icon="chevron_right"
            :aria-label="t('CreatorSubscribers.actions.openDetails')"
            @click="openDrawer(props.row)" /></q-td
      ></template>
    </q-table>
    <q-virtual-scroll
      v-else
      :items="filtered"
      :virtual-scroll-item-size="140"
      content-class="subscriber-cards"
    >
      <template #default="{ item: row }">
        <SubscriberCard
          :subscription="{ tierName: row.tierName, subscriberNpub: row.npub } as any"
          :status="row.status"
          :next-in="row.nextRenewal ? distToNow(row.nextRenewal) : '—'"
          :progress="progressPercent(row) / 100"
          :amount="row.amountSat + ' sat'"
          :compact="density === 'compact'"
          @click="openDrawer(row)"
        />
      </template>
    </q-virtual-scroll>

    <!-- Selection bar -->
    <div
      v-if="selected.length"
      class="q-mt-sm q-pa-sm bg-primary text-white row items-center q-gutter-sm"
    >
      <div>{{ t('CreatorSubscribers.selectionCount', { count: selected.length }) }}</div>
      <q-space />
      <q-btn
        outline
        dense
        color="white"
        icon="download"
        :label="t('CreatorSubscribers.actions.exportSelected')"
        :aria-label="t('CreatorSubscribers.actions.exportSelected')"
        @click="exportSelected"
      />
      <q-btn
        flat
        dense
        color="white"
        :label="t('CreatorSubscribers.actions.clear')"
        :aria-label="t('CreatorSubscribers.actions.clear')"
        @click="clearSelected"
      />
    </div>
    </q-page>
  </q-page-container>
  <q-drawer v-model="drawer" side="right" :overlay="$q.screen.lt.md" bordered>
    <div v-if="current" class="q-pa-md">
        <div class="row items-center q-gutter-sm">
          <q-avatar size="64px">{{ initials(current.name) }}</q-avatar>
          <div>
            <div class="text-h6">{{ current.name }}</div>
            <div class="text-body2 text-grey-6">{{ current.nip05 }}</div>
          </div>
          <q-space />
          <q-btn icon="close" flat round @click="drawer = false" />
        </div>
        <div class="row q-gutter-xs q-mt-md">
          <q-chip dense color="primary" text-color="white">{{
            current.tierName
          }}</q-chip>
          <q-chip dense outline>{{
            t('CreatorSubscribers.frequency.' + current.frequency)
          }}</q-chip>
          <q-chip
            dense
            :color="statusColor(current.status)"
            :text-color="statusTextColor(current.status)"
            :icon="statusIcon(current.status)"
            >{{ t('CreatorSubscribers.status.' + current.status) }}</q-chip
          >
        </div>
        <div class="q-mt-md">
          {{ current.amountSat }} sat /
          {{ t('CreatorSubscribers.frequency.' + current.frequency) }}
        </div>
        <div class="q-mt-sm">
          {{ t('CreatorSubscribers.drawer.overview.nextRenewal') }}:
          {{ current.nextRenewal ? formatDate(current.nextRenewal) : '—' }}
          <span v-if="current.nextRenewal" class="text-grey-6"
            >({{ distToNow(current.nextRenewal) }})</span
          >
        </div>
        <div class="q-mt-sm">
          {{ t('CreatorSubscribers.drawer.overview.lifetimeTotal') }}:
          {{ current.lifetimeSat }} sat
        </div>
        <div class="q-mt-sm">
          {{ t('CreatorSubscribers.drawer.overview.since') }}
          {{ formatDate(current.startDate) }}
        </div>
        <div class="row q-gutter-sm q-mt-md">
          <q-btn outline :label="t('CreatorSubscribers.drawer.actions.dm')" :aria-label="t('CreatorSubscribers.drawer.actions.dm')" @click="dmSubscriber" />
          <q-btn outline :label="t('CreatorSubscribers.drawer.actions.copyNpub')" :aria-label="t('CreatorSubscribers.drawer.actions.copyNpub')" @click="copyNpub" />
        </div>
        <div class="q-mt-lg">
          <div class="text-subtitle2 q-mb-sm">
            {{ t('CreatorSubscribers.drawer.tabs.payments') }}
          </div>
          <q-list bordered dense>
            <q-item v-for="p in payments" :key="p.ts">
              <q-item-section>{{ formatDate(p.ts) }}</q-item-section>
              <q-item-section side>{{ p.amount }} sat</q-item-section>
            </q-item>
          </q-list>
        </div>
        <div class="q-mt-lg">
          <div class="text-subtitle2 q-mb-sm">
            {{ t('CreatorSubscribers.drawer.activity') }}
          </div>
          <q-list bordered dense>
            <q-item v-for="a in activity" :key="a.ts">
              <q-item-section>{{ a.text }}</q-item-section>
              <q-item-section side class="text-caption text-grey">{{
                distToNow(a.ts)
              }}</q-item-section>
            </q-item>
          </q-list>
        </div>
    </div>
  </q-drawer>
</q-layout>
</template>

<script setup lang="ts">
import {
  Chart as ChartJS,
  LineController,
  DoughnutController,
  BarController,
  LineElement,
  ArcElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
  type Chart,
} from "chart.js";

ChartJS.register(
  LineController,
  DoughnutController,
  BarController,
  LineElement,
  ArcElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip
);

import { ref, computed, watch, onMounted } from "vue";
import { useCreatorSubscribersStore } from "src/stores/creatorSubscribers";
import { storeToRefs } from "pinia";
import { useDebounceFn } from "@vueuse/core";
import { format, formatDistanceToNow } from "date-fns";
import { useQuasar } from "quasar";
import type { QTableRequestProp } from "quasar";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { Subscriber, Frequency, SubStatus } from "src/types/subscriber";
import downloadCsv from "src/utils/subscriberCsv";
import SubscriberFilters from "src/components/subscribers/SubscriberFilters.vue";
import SubscriberCard from "src/components/SubscriberCard.vue";

const { t } = useI18n();

const subStore = useCreatorSubscribersStore();
const { filtered, counts, activeTab, loading, error } = storeToRefs(subStore);
// `filtered` is maintained by the Pinia store based on the active tab,
// search query and filter drawer. Treat it as the single source of truth
// for the subscriber list and KPI counts throughout this page.

const activeCount = computed(
  () => filtered.value.filter((s) => s.status === "active").length
);
const pendingCount = computed(
  () => filtered.value.filter((s) => s.status === "pending").length
);
// Lifetime sats are included in the KPI row. Safeguard against undefined
// values in case the field is missing from older data snapshots.
const lifetimeRevenue = computed(() =>
  filtered.value.reduce(
    (sum, s) => sum + (typeof s.lifetimeSat === "number" ? s.lifetimeSat : 0),
    0,
  ),
);

// Controls the "Next week/month" KPI card. Clicking the card swaps
// `periodMode` to show upcoming revenue for the next 7 vs 30 days.
const periodMode = ref<"week" | "month">("month");
const periodWindowDays = computed(() => (periodMode.value === "week" ? 7 : 30));
// Aggregate expected sats from subscriptions that renew inside the
// selected window. This feeds the final KPI card.
const kpiThisPeriodSat = computed(() => {
  const now = Date.now() / 1000;
  const end = now + periodWindowDays.value * 86400;
  return filtered.value
    .filter(
      (s) =>
        s.status === "active" &&
        typeof s.nextRenewal === "number" &&
        s.nextRenewal <= end,
    )
    .reduce(
      (sum, s) => sum + (typeof s.amountSat === "number" ? s.amountSat : 0),
      0,
    );
});
const formattedKpiThisPeriodSat = computed(() =>
  kpiThisPeriodSat.value.toLocaleString()
);

function togglePeriod() {
  // Toggle between week and month views when the KPI card is clicked.
  periodMode.value = periodMode.value === "week" ? "month" : "week";
}

// Data plumbing for charts: build lightweight structures consumed by Chart.js.
const revenueSeries = computed(() => {
  // Line chart: each subscriber's start date vs amount.
  const arr = filtered.value.slice().sort((a, b) => a.startDate - b.startDate);
  return {
    labels: arr.map((s) => format(s.startDate * 1000, "MM/dd")),
    data: arr.map((s) => s.amountSat),
  };
});

const freqMix = computed(() => [
  // Doughnut chart: breakdown of subscribers by frequency.
  filtered.value.filter((s) => s.frequency === "weekly").length,
  filtered.value.filter((s) => s.frequency === "biweekly").length,
  filtered.value.filter((s) => s.frequency === "monthly").length,
]);

const revenueSummary = computed(() =>
  t('CreatorSubscribers.charts.revenueSummary', {
    total: revenueSeries.value.data.reduce((a, b) => a + b, 0),
  }),
);
const frequencySummary = computed(() =>
  t('CreatorSubscribers.charts.frequencySummary', {
    weekly: freqMix.value[0],
    biweekly: freqMix.value[1],
    monthly: freqMix.value[2],
  }),
);

const statusByFreq = computed(() => {
  // Bar chart: counts of active/pending/ended subscriptions per frequency.
  const freqs: Frequency[] = ['weekly', 'biweekly', 'monthly'];
  const labels = [
    t('CreatorSubscribers.frequency.weekly'),
    t('CreatorSubscribers.frequency.biweekly'),
    t('CreatorSubscribers.frequency.monthly'),
  ];
  const active = freqs.map(
    (f) =>
      filtered.value.filter((s) => s.frequency === f && s.status === 'active')
        .length,
  );
  const pending = freqs.map(
    (f) =>
      filtered.value.filter((s) => s.frequency === f && s.status === 'pending')
        .length,
  );
  const ended = freqs.map(
    (f) =>
      filtered.value.filter((s) => s.frequency === f && s.status === 'ended')
        .length,
  );
  return { labels, active, pending, ended };
});

const statusSummary = computed(() => {
  const s = statusByFreq.value;
  return t('CreatorSubscribers.charts.statusSummary', {
    weeklyActive: s.active[0],
    weeklyPending: s.pending[0],
    weeklyEnded: s.ended[0],
    biweeklyActive: s.active[1],
    biweeklyPending: s.pending[1],
    biweeklyEnded: s.ended[1],
    monthlyActive: s.active[2],
    monthlyPending: s.pending[2],
    monthlyEnded: s.ended[2],
  });
});

const search = ref(subStore.query);
// Forward the user-entered search term to the Pinia store (debounced),
// which recomputes `filtered` for us.
const applySearch = useDebounceFn((v: string) => {
  subStore.query = v;
}, 300);
watch(search, (v) => applySearch(v));

const filtersOpen = ref(false);

function retry() {
  void subStore.loadFromDb();
  void subStore.fetchProfiles();
}

const selected = ref<Subscriber[]>([]);

function exportSelected() {
  downloadCsv(selected.value);
}

function clearSelected() {
  selected.value = [];
}

const view = ref<'table' | 'cards'>('table');
const density = ref<'compact' | 'comfortable'>('comfortable');

const viewOptions = computed(() => [
  { value: 'table', icon: 'table_rows', 'aria-label': t('CreatorSubscribers.toolbar.tableView') },
  { value: 'cards', icon: 'grid_view', 'aria-label': t('CreatorSubscribers.toolbar.cardView') },
]);
const densityOptions = computed(() => [
  { value: 'comfortable', icon: 'view_comfy', 'aria-label': t('CreatorSubscribers.toolbar.comfortable') },
  { value: 'compact', icon: 'view_compact', 'aria-label': t('CreatorSubscribers.toolbar.compact') },
]);

const visibleCharts = ref<Array<'revenue' | 'frequency' | 'status'>>([
  'revenue',
  'frequency',
  'status',
]);
const chartToggleOptions = computed(() => [
  {
    value: 'revenue',
    label: t('CreatorSubscribers.charts.revenueOverTime'),
  },
  {
    value: 'frequency',
    label: t('CreatorSubscribers.charts.frequencyMix'),
  },
  {
    value: 'status',
    label: t('CreatorSubscribers.charts.statusByFrequency'),
  },
]);
const showRevenueChart = computed(() => visibleCharts.value.includes('revenue'));
const showFrequencyChart = computed(() => visibleCharts.value.includes('frequency'));
const showStatusChart = computed(() => visibleCharts.value.includes('status'));

const pagination = ref({ page: 1, rowsPerPage: 25 });
const paginatedRows = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.rowsPerPage;
  const end = start + pagination.value.rowsPerPage;
  return filtered.value.slice(start, end);
});
function onRequest(props: QTableRequestProp) {
  pagination.value = props.pagination;
}

const lineEl = ref<HTMLCanvasElement | null>(null);
const doughnutEl = ref<HTMLCanvasElement | null>(null);
const barEl = ref<HTMLCanvasElement | null>(null);

// Chart.js instances are created on demand and updated reactively.
let lineChart: Chart | null = null;
let doughnutChart: Chart | null = null;
let barChart: Chart | null = null;

function createLineChart() {
  if (lineEl.value) {
    lineChart = new ChartJS(lineEl.value, {
      type: 'line',
      data: {
        labels: revenueSeries.value.labels,
        datasets: [
          {
            data: revenueSeries.value.data,
            borderColor: '#027be3',
            backgroundColor: 'rgba(2,123,227,0.1)',
            fill: false,
            pointRadius: 0,
          },
        ],
      },
      options: { plugins: { legend: { display: false } }, animation: false },
    });
  }
}
function destroyLineChart() {
  lineChart?.destroy();
  lineChart = null;
}
function createDoughnutChart() {
  if (doughnutEl.value) {
    doughnutChart = new ChartJS(doughnutEl.value, {
      type: 'doughnut',
      data: {
        labels: [
          t('CreatorSubscribers.frequency.weekly'),
          t('CreatorSubscribers.frequency.biweekly'),
          t('CreatorSubscribers.frequency.monthly'),
        ],
        datasets: [
          {
            data: freqMix.value,
            backgroundColor: ['#027be3', '#26a69a', '#9c27b0'],
          },
        ],
      },
      options: { plugins: { legend: { display: false } }, animation: false },
    });
  }
}
function destroyDoughnutChart() {
  doughnutChart?.destroy();
  doughnutChart = null;
}
function createBarChart() {
  if (barEl.value) {
    barChart = new ChartJS(barEl.value, {
      type: 'bar',
      data: {
        labels: statusByFreq.value.labels,
        datasets: [
          {
            label: t('CreatorSubscribers.status.active'),
            backgroundColor: '#21ba45',
            data: statusByFreq.value.active,
          },
          {
            label: t('CreatorSubscribers.status.pending'),
            backgroundColor: '#f2c037',
            data: statusByFreq.value.pending,
          },
          {
            label: t('CreatorSubscribers.status.ended'),
            backgroundColor: '#f44336',
            data: statusByFreq.value.ended,
          },
        ],
      },
      options: { plugins: { legend: { display: false } }, animation: false },
    });
  }
}
function destroyBarChart() {
  barChart?.destroy();
  barChart = null;
}

onMounted(() => {
  void subStore.loadFromDb();
  if (showRevenueChart.value) {
    createLineChart();
  }
  if (showFrequencyChart.value) {
    createDoughnutChart();
  }
  if (showStatusChart.value) {
    createBarChart();
  }
});

watch(showRevenueChart, (val) => {
  if (val) {
    createLineChart();
  } else {
    destroyLineChart();
  }
});
watch(showFrequencyChart, (val) => {
  if (val) {
    createDoughnutChart();
  } else {
    destroyDoughnutChart();
  }
});
watch(showStatusChart, (val) => {
  if (val) {
    createBarChart();
  } else {
    destroyBarChart();
  }
});

// When the list of subscribers changes, fetch profiles for any new npubs.
watch(
  () => subStore.subscribers.map((s) => s.npub),
  (npubs, prev) => {
    const prevSet = new Set(prev);
    if (npubs.some((n) => !prevSet.has(n))) {
      void subStore.fetchProfiles();
    }
  },
);

// When the underlying computed data changes, update the charts without
// re-creating them. This keeps Chart.js lifecycle simple and avoids leaks.
watch([revenueSeries, freqMix, statusByFreq], ([rev, mix, status]) => {
  if (lineChart) {
    lineChart.data.labels = rev.labels;
    lineChart.data.datasets[0].data = rev.data;
    lineChart.update("none");
  }
  if (doughnutChart) {
    doughnutChart.data.datasets[0].data = mix;
    doughnutChart.update("none");
  }
  if (barChart) {
    barChart.data.labels = status.labels;
    barChart.data.datasets[0].data = status.active;
    barChart.data.datasets[1].data = status.pending;
    barChart.data.datasets[2].data = status.ended;
    barChart.update("none");
  }
});

const columns = [
  {
    name: 'subscriber',
    label: t('CreatorSubscribers.columns.subscriber'),
    field: 'name',
    sortable: false,
  },
  {
    name: 'tier',
    label: t('CreatorSubscribers.columns.tier'),
    field: 'tierName',
    sortable: false,
  },
  {
    name: 'frequency',
    label: t('CreatorSubscribers.columns.frequency'),
    field: 'frequency',
    sortable: false,
  },
  {
    name: 'status',
    label: t('CreatorSubscribers.columns.status'),
    field: 'status',
    sortable: false,
  },
  {
    name: 'amount',
    label: t('CreatorSubscribers.columns.amount'),
    field: 'amountSat',
    sortable: false,
  },
  {
    name: 'nextRenewal',
    label: t('CreatorSubscribers.columns.nextRenewal'),
    field: 'nextRenewal',
    sortable: false,
  },
  {
    name: 'lifetime',
    label: t('CreatorSubscribers.columns.lifetime'),
    field: 'lifetimeSat',
    sortable: false,
  },
  { name: 'actions', label: t('CreatorSubscribers.columns.actions'), field: 'id', sortable: false },
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}
function freqShort(f: Frequency) {
  return f === "weekly" ? "W" : f === "biweekly" ? "2W" : "M";
}
function statusColor(s: SubStatus) {
  return s === 'active' ? 'positive' : s === 'pending' ? 'warning' : 'negative';
}
function statusTextColor(s: SubStatus) {
  return s === 'pending' ? 'black' : 'white';
}
function statusIcon(s: SubStatus) {
  return s === 'active' ? 'check' : s === 'pending' ? 'schedule' : 'close';
}
function progressPercent(r: Subscriber) {
  return Math.round((r.progress ?? 0) * 100);
}
function dueSoon(r: Subscriber) {
  return r.dueSoon;
}
function rowClass(row: Subscriber) {
  return dueSoon(row) ? "due-soon" : "";
}
function distToNow(ts: number) {
  return formatDistanceToNow(ts * 1000, { addSuffix: true });
}
function formatDate(ts: number) {
  return format(ts * 1000, "PP p");
}

const drawer = ref(false);
const current = ref<Subscriber | null>(null);
function openDrawer(r: Subscriber) {
  current.value = r;
  drawer.value = true;
}
const $q = useQuasar();
const router = useRouter();

function copyNpub() {
  if (!current.value) return;
  $q.clipboard.writeText(current.value.npub);
  $q.notify({ message: t("copied_to_clipboard"), color: "positive" });
}

function dmSubscriber() {
  if (!current.value) return;
  router.push({
    path: "/nostr-messenger",
    query: { pubkey: current.value.npub },
  });
}
const payments = computed(() => {
  const r = current.value;
  if (!r) return [] as any[];
  const interval =
    r.frequency === "weekly" ? 7 : r.frequency === "biweekly" ? 14 : 30;
  const last = (r.nextRenewal ?? r.startDate) - interval * 86400;
  return [
    { ts: last, amount: r.amountSat },
    { ts: r.nextRenewal ?? r.startDate, amount: r.amountSat },
  ];
});
const activity = computed(() => {
  const r = current.value;
  if (!r) return [] as any[];
  const arr = [{ ts: r.startDate, text: "Started subscription" }];
  if (r.nextRenewal) arr.push({ ts: r.nextRenewal, text: "Next renewal" });
  return arr;
});
</script>
