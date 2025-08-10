<template>
  <q-page padding>
    <SubscriberFiltersPopover ref="filters" />
    <!-- Top bar -->
    <div class="row items-center q-gutter-sm q-mb-md">
      <div class="text-h6">Subscribers</div>
      <q-input
        dense
        v-model="search"
        placeholder="Search"
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
        :options="[
          { value: 'table', icon: 'table_rows' },
          { value: 'cards', icon: 'grid_view' },
        ]"
      />
      <q-btn-toggle
        v-model="density"
        dense
        toggle-color="primary"
        class="q-ml-sm"
        :options="[
          { value: 'comfortable', icon: 'view_comfy' },
          { value: 'compact', icon: 'view_compact' },
        ]"
      />
      <q-btn
        dense
        flat
        round
        icon="tune"
        class="q-ml-sm"
        @click.stop="openFilters"
        aria-label="Filters"
      />
      <q-btn
        outline
        color="grey-5"
        icon="download"
        label="Export CSV"
        class="q-ml-sm"
        @click="downloadCsv()"
      />
    </div>

    <!-- KPI Row -->
    <div class="row q-col-gutter-md q-mb-md">
      <q-card
        flat
        bordered
        class="col-12 col-sm-6 col-md-3 panel-container q-pa-sm"
      >
        <div class="text-caption text-grey">Subscribers</div>
        <div class="text-h6">{{ counts.all }}</div>
      </q-card>
      <q-card
        flat
        bordered
        class="col-12 col-sm-6 col-md-3 panel-container q-pa-sm"
      >
        <div class="text-caption text-grey">Active / Pending</div>
        <div class="text-h6">{{ activeCount }} / {{ pendingCount }}</div>
      </q-card>
      <q-card
        flat
        bordered
        class="col-12 col-sm-6 col-md-3 panel-container q-pa-sm"
      >
        <div class="text-caption text-grey">Lifetime revenue</div>
        <div class="text-h6">{{ lifetimeRevenue }} sat</div>
      </q-card>
      <q-card
        flat
        bordered
        class="col-12 col-sm-6 col-md-3 panel-container q-pa-sm"
        @click="togglePeriod"
      >
        <div class="text-caption text-grey">Next {{ periodMode }}</div>
        <div class="text-h6">{{ formattedKpiThisPeriodSat }} sat</div>
      </q-card>
    </div>

    <!-- Charts -->
    <div class="row q-col-gutter-md q-mb-md">
      <q-card flat bordered class="col-12 col-md-4 panel-container q-pa-sm">
        <div class="text-subtitle2 q-mb-sm">Revenue over time</div>
        <canvas ref="lineEl" />
      </q-card>
      <q-card flat bordered class="col-12 col-md-4 panel-container q-pa-sm">
        <div class="text-subtitle2 q-mb-sm">Frequency mix</div>
        <canvas ref="doughnutEl" />
      </q-card>
      <q-card flat bordered class="col-12 col-md-4 panel-container q-pa-sm">
        <div class="text-subtitle2 q-mb-sm">Status by frequency</div>
        <canvas ref="barEl" />
      </q-card>
    </div>

    <!-- Tabs -->
    <q-tabs v-model="activeTab" dense class="q-mb-md" no-caps>
      <q-tab name="all"
        ><div class="row items-center no-wrap">
          <span>All</span
          ><q-badge class="q-ml-xs" color="primary">{{ counts.all }}</q-badge>
        </div></q-tab
      >
      <q-tab name="weekly"
        ><div class="row items-center no-wrap">
          <span>Weekly</span
          ><q-badge class="q-ml-xs" color="primary">{{
            counts.weekly
          }}</q-badge>
        </div></q-tab
      >
      <q-tab name="biweekly"
        ><div class="row items-center no-wrap">
          <span>Bi-weekly</span
          ><q-badge class="q-ml-xs" color="primary">{{
            counts.biweekly
          }}</q-badge>
        </div></q-tab
      >
      <q-tab name="monthly"
        ><div class="row items-center no-wrap">
          <span>Monthly</span
          ><q-badge class="q-ml-xs" color="primary">{{
            counts.monthly
          }}</q-badge>
        </div></q-tab
      >
      <q-tab name="pending"
        ><div class="row items-center no-wrap">
          <span>Pending</span
          ><q-badge class="q-ml-xs" color="primary">{{
            counts.pending
          }}</q-badge>
        </div></q-tab
      >
      <q-tab name="ended"
        ><div class="row items-center no-wrap">
          <span>Ended</span
          ><q-badge class="q-ml-xs" color="primary">{{ counts.ended }}</q-badge>
        </div></q-tab
      >
    </q-tabs>

    <!-- Table -->
    <q-table
      v-if="view === 'table'"
      flat
      :rows="filtered"
      row-key="id"
      selection="multiple"
      v-model:selected="selected"
      :columns="columns"
      :rows-per-page-options="[10, 25, 50]"
      :row-class="rowClass"
      :dense="density === 'compact'"
      :class="['density--' + density]"
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
            text-color="white"
            >{{ props.row.status }}</q-chip
          ></q-td
        >
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
              aria-label="Renewal progress"
            />
            <div class="column">
              <div
                :class="[
                  'text-caption',
                  dueSoon(props.row) ? 'text-warning' : '',
                ]"
              >
                {{
                  props.row.nextRenewal ? distToNow(props.row.nextRenewal) : "—"
                }}
              </div>
              <div class="text-caption text-grey-6">
                {{
                  props.row.nextRenewal ? formatDate(props.row.nextRenewal) : ""
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
            @click="openDrawer(props.row)" /></q-td
      ></template>
    </q-table>
    <div v-else class="subscriber-cards">
      <SubscriberCard
        v-for="row in filtered"
        :key="row.id"
        :subscription="{ tierName: row.tierName, subscriberNpub: row.npub } as any"
        :status="row.status"
        :next-in="row.nextRenewal ? distToNow(row.nextRenewal) : '—'"
        :progress="progressPercent(row) / 100"
        :amount="row.amountSat + ' sat'"
        :compact="density === 'compact'"
        @click="openDrawer(row)"
      />
    </div>

    <!-- Selection bar -->
    <div
      v-if="selected.length"
      class="q-mt-sm q-pa-sm bg-primary text-white row items-center q-gutter-sm"
    >
      <div>{{ selected.length }} selected</div>
      <q-space />
      <q-btn
        outline
        dense
        color="white"
        icon="download"
        label="Export selection"
        @click="downloadCsv(selected)"
      />
      <q-btn flat dense color="white" label="Clear" @click="selected = []" />
    </div>

    <!-- Drawer -->
    <q-drawer v-model="drawer" side="right" overlay bordered>
      <div v-if="current" class="q-pa-md">
        <div class="row items-center q-gutter-sm">
          <q-avatar size="64px">{{ initials(current.name) }}</q-avatar>
          <div>
            <div class="text-h6">{{ current.name }}</div>
            <div class="text-body2 text-grey-6">{{ current.nip05 }}</div>
          </div>
        </div>
        <div class="row q-gutter-xs q-mt-md">
          <q-chip dense color="primary" text-color="white">{{
            current.tierName
          }}</q-chip>
          <q-chip dense outline>{{ current.frequency }}</q-chip>
          <q-chip
            dense
            :color="statusColor(current.status)"
            text-color="white"
            >{{ current.status }}</q-chip
          >
        </div>
        <div class="q-mt-md">
          {{ current.amountSat }} sat / {{ current.frequency }}
        </div>
        <div class="q-mt-sm">
          Next renewal:
          {{ current.nextRenewal ? formatDate(current.nextRenewal) : "—" }}
          <span v-if="current.nextRenewal" class="text-grey-6"
            >({{ distToNow(current.nextRenewal) }})</span
          >
        </div>
        <div class="q-mt-sm">Lifetime: {{ current.lifetimeSat }} sat</div>
        <div class="q-mt-sm">Since {{ formatDate(current.startDate) }}</div>
        <div class="row q-gutter-sm q-mt-md">
          <q-btn outline label="DM" @click="dmSubscriber" />
          <q-btn outline label="Copy npub" @click="copyNpub" />
        </div>
        <div class="q-mt-lg">
          <div class="text-subtitle2 q-mb-sm">Payments</div>
          <q-list bordered dense>
            <q-item v-for="p in payments" :key="p.ts">
              <q-item-section>{{ formatDate(p.ts) }}</q-item-section>
              <q-item-section side>{{ p.amount }} sat</q-item-section>
            </q-item>
          </q-list>
        </div>
        <div class="q-mt-lg">
          <div class="text-subtitle2 q-mb-sm">Activity</div>
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
  </q-page>
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
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { Subscriber, Frequency, SubStatus } from "src/types/subscriber";
import downloadCsv from "src/utils/subscriberCsv";
import SubscriberFiltersPopover from "src/components/subscribers/SubscriberFiltersPopover.vue";
import SubscriberCard from "src/components/SubscriberCard.vue";

const subStore = useCreatorSubscribersStore();
const { filtered, counts, activeTab } = storeToRefs(subStore);
// `filtered` is maintained by the Pinia store based on the active tab,
// search query and filter popover. Treat it as the single source of truth
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

const statusByFreq = computed(() => {
  // Bar chart: counts of active/pending/ended subscriptions per frequency.
  const freqs: Frequency[] = ["weekly", "biweekly", "monthly"];
  const labels = ["Weekly", "Bi-weekly", "Monthly"];
  const active = freqs.map(
    (f) =>
      filtered.value.filter((s) => s.frequency === f && s.status === "active")
        .length
  );
  const pending = freqs.map(
    (f) =>
      filtered.value.filter((s) => s.frequency === f && s.status === "pending")
        .length
  );
  const ended = freqs.map(
    (f) =>
      filtered.value.filter((s) => s.frequency === f && s.status === "ended")
        .length
  );
  return { labels, active, pending, ended };
});

const search = ref(subStore.query);
// Forward the user-entered search term to the Pinia store (debounced),
// which recomputes `filtered` for us.
const applySearch = useDebounceFn((v: string) => {
  subStore.query = v;
}, 300);
watch(search, (v) => applySearch(v));

const filters = ref<InstanceType<typeof SubscriberFiltersPopover> | null>(null);

function openFilters(e: MouseEvent) {
  filters.value?.show(e);
}

const selected = ref<Subscriber[]>([]);

const view = ref<"table" | "cards">("table");
const density = ref<"compact" | "comfortable">("comfortable");

const lineEl = ref<HTMLCanvasElement | null>(null);
const doughnutEl = ref<HTMLCanvasElement | null>(null);
const barEl = ref<HTMLCanvasElement | null>(null);

// Chart.js instances are created once on mount and then updated reactively.
let lineChart: Chart | null = null;
let doughnutChart: Chart | null = null;
let barChart: Chart | null = null;

onMounted(() => {
  void subStore.fetchProfiles();
  // Instantiate charts after DOM elements are available.
  if (lineEl.value) {
    lineChart = new ChartJS(lineEl.value, {
      type: "line",
      data: {
        labels: revenueSeries.value.labels,
        datasets: [
          {
            data: revenueSeries.value.data,
            borderColor: "#027be3",
            backgroundColor: "rgba(2,123,227,0.1)",
            fill: false,
            pointRadius: 0,
          },
        ],
      },
      options: { plugins: { legend: { display: false } }, animation: false },
    });
  }
  if (doughnutEl.value) {
    doughnutChart = new ChartJS(doughnutEl.value, {
      type: "doughnut",
      data: {
        labels: ["Weekly", "Bi-weekly", "Monthly"],
        datasets: [
          {
            data: freqMix.value,
            backgroundColor: ["#027be3", "#26a69a", "#9c27b0"],
          },
        ],
      },
      options: { plugins: { legend: { display: false } }, animation: false },
    });
  }
  if (barEl.value) {
    barChart = new ChartJS(barEl.value, {
      type: "bar",
      data: {
        labels: statusByFreq.value.labels,
        datasets: [
          {
            label: "Active",
            backgroundColor: "#21ba45",
            data: statusByFreq.value.active,
          },
          {
            label: "Pending",
            backgroundColor: "#f2c037",
            data: statusByFreq.value.pending,
          },
          {
            label: "Ended",
            backgroundColor: "#f44336",
            data: statusByFreq.value.ended,
          },
        ],
      },
      options: { plugins: { legend: { display: false } }, animation: false },
    });
  }
});

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
  { name: "subscriber", label: "Subscriber", field: "name", sortable: false },
  { name: "tier", label: "Tier", field: "tierName", sortable: false },
  { name: "frequency", label: "Freq", field: "frequency", sortable: false },
  { name: "status", label: "Status", field: "status", sortable: false },
  { name: "amount", label: "Amount", field: "amountSat", sortable: false },
  {
    name: "nextRenewal",
    label: "Next renewal",
    field: "nextRenewal",
    sortable: false,
  },
  {
    name: "lifetime",
    label: "Lifetime",
    field: "lifetimeSat",
    sortable: false,
  },
  { name: "actions", label: "", field: "id", sortable: false },
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
  return s === "active" ? "positive" : s === "pending" ? "warning" : "negative";
}
function progressPercent(r: Subscriber) {
  if (!r.nextRenewal) return 0;
  const days =
    r.frequency === "weekly" ? 7 : r.frequency === "biweekly" ? 14 : 30;
  const end = r.nextRenewal * 1000;
  const start = end - days * 86400000;
  const now = Date.now();
  return Math.round(
    Math.min(Math.max((now - start) / (end - start), 0), 1) * 100
  );
}
function dueSoon(r: Subscriber) {
  if (!r.nextRenewal || r.status !== "active") return false;
  return r.nextRenewal * 1000 - Date.now() < 72 * 3600 * 1000;
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
const { t } = useI18n();

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
