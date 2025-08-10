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
        <q-btn-group flat rounded class="q-ml-sm">
          <q-btn-toggle
            v-model="view"
            dense
            toggle-color="primary"
            :options="viewOptions"
          />
          <q-btn-toggle
            v-model="density"
            dense
            toggle-color="primary"
            :options="densityOptions"
          />
        </q-btn-group>
        <q-space />
        <q-btn
          flat
          color="primary"
          icon="download"
          :label="t('CreatorSubscribers.toolbar.exportCsv')"
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
    <div class="row q-col-gutter-lg q-mb-lg">
      <q-card
        flat
        bordered
        class="col-12 col-sm-6 col-md-3 panel-container q-pa-md q-ma-sm"
      >
        <div class="text-caption text-grey">
          {{ t('CreatorSubscribers.summary.subscribers') }}
        </div>
        <div class="text-h6">{{ counts.all }}</div>
      </q-card>
      <q-card
        flat
        bordered
        class="col-12 col-sm-6 col-md-3 panel-container q-pa-md q-ma-sm"
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
        class="col-12 col-sm-6 col-md-3 panel-container q-pa-md q-ma-sm"
      >
        <div class="text-caption text-grey">
          {{ t('CreatorSubscribers.summary.lifetimeRevenue') }}
        </div>
        <div class="text-h6">{{ lifetimeRevenue }} sat</div>
      </q-card>
      <q-card
        flat
        bordered
        class="col-12 col-sm-6 col-md-3 panel-container q-pa-md q-ma-sm"
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
    <SubscriptionsCharts :rows="filtered" class="q-mb-lg" />

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
      :class="['density--' + density, 'q-mb-lg']"
      v-model:pagination="pagination"
      :row-count="filtered.length"
      @request="onRequest"
    >
      <template #body-cell-subscriber="props">
        <q-td :props="props">
          <div class="row items-center q-gutter-sm no-wrap">
            <q-avatar
              size="32px"
            >
              {{ initials(props.row.name) }}
            </q-avatar>
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
      class="q-mb-lg"
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
  <SubscriberDrawer
    v-model="drawer"
    :sub="current"
    :profile="currentProfile"
    @dm="dmSubscriber"
  />
</q-layout>
</template>

<script setup lang="ts">
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
import type { NDKUserProfile } from "@nostr-dev-kit/ndk";
import downloadCsv from "src/utils/subscriberCsv";
import SubscriberFilters from "src/components/subscribers/SubscriberFilters.vue";
import SubscriberCard from "src/components/SubscriberCard.vue";
import SubscriptionsCharts from "src/components/subscribers/SubscriptionsCharts.vue";
import SubscriberDrawer from "src/components/subscribers/SubscriberDrawer.vue";

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

const pagination = ref({ page: 1, rowsPerPage: 25 });
const paginatedRows = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.rowsPerPage;
  const end = start + pagination.value.rowsPerPage;
  return filtered.value.slice(start, end);
});
function onRequest(props: QTableRequestProp) {
  pagination.value = props.pagination;
}

onMounted(() => {
  void subStore.loadFromDb();
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
const currentProfile = computed<NDKUserProfile | undefined>(() => {
  const npub = current.value?.npub;
  if (!npub) return undefined;
  const cached = subStore.profileCache[npub];
  if (!cached) return undefined;
  return { name: cached.name, nip05: cached.nip05 } as NDKUserProfile;
});
const $q = useQuasar();
const router = useRouter();

function dmSubscriber() {
  if (!current.value) return;
  router.push({
    path: "/nostr-messenger",
    query: { pubkey: current.value.npub },
  });
}
</script>
