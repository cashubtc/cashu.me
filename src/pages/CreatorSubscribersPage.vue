<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-white text-dark">
      <q-toolbar class="row items-center q-gutter-sm">
        <q-btn
          flat
          dense
          round
          icon="menu"
          :color="filtersActive ? 'primary' : 'dark'"
          :aria-label="t('CreatorSubscribers.actions.filters')"
          @click="filtersOpen = !filtersOpen"
        >
          <q-badge v-if="filtersActive" floating rounded color="primary" />
        </q-btn>
        <q-toolbar-title>
          {{ t('CreatorSubscribers.summary.subscribers') }}
        </q-toolbar-title>
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
        <q-space />
        <q-btn-group flat rounded>
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
        <q-btn
          class="q-ml-sm"
          color="secondary"
          icon="download"
          :label="$q.screen.gt.xs ? t('CreatorSubscribers.toolbar.exportCsv') : ''"
          :aria-label="t('CreatorSubscribers.toolbar.exportCsv')"
          @click="downloadCsv()"
        />
      </q-toolbar>
      <q-toolbar class="bg-grey-2">
        <q-tabs v-model="activeTab" dense no-caps class="text-dark">
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
        <q-card-section class="bg-grey-1 q-mb-lg">
          <div class="row q-col-gutter-xl">
            <q-card
              flat
              bordered
              class="col-12 col-sm-6 col-md-3 panel-container q-pa-lg"
            >
              <div class="text-caption text-grey">
                {{ t('CreatorSubscribers.summary.subscribers') }}
              </div>
              <div class="text-h5">{{ counts.all }}</div>
            </q-card>
            <q-card
              flat
              bordered
              class="col-12 col-sm-6 col-md-3 panel-container q-pa-lg"
            >
              <div class="text-caption text-grey">
                {{ t('CreatorSubscribers.summary.active') }} /
                {{ t('CreatorSubscribers.summary.pending') }}
              </div>
              <div class="text-h5">{{ activeCount }} / {{ pendingCount }}</div>
            </q-card>
            <q-card
              flat
              bordered
              class="col-12 col-sm-6 col-md-3 panel-container q-pa-lg"
            >
              <div class="text-caption text-grey">
                {{ t('CreatorSubscribers.summary.lifetimeRevenue') }}
              </div>
              <div class="text-h5">{{ lifetimeRevenue }} sat</div>
            </q-card>
            <q-card
              flat
              bordered
              class="col-12 col-sm-6 col-md-3 panel-container q-pa-lg"
              @click="togglePeriod"
            >
              <div class="text-caption text-grey">
                {{ periodMode === 'week'
                  ? t('CreatorSubscribers.summary.nextWeek')
                  : t('CreatorSubscribers.summary.nextMonth') }}
              </div>
              <div class="text-h5">{{ formattedKpiThisPeriodSat }} sat</div>
            </q-card>
          </div>
        </q-card-section>

        <!-- Charts -->
        <q-card class="q-mb-lg">
          <q-card-section>
            <SubscriptionsCharts :rows="filtered" />
          </q-card-section>
        </q-card>

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
      :class="['density--' + density, 'q-mb-lg', 'text-body1']"
      v-model:pagination="pagination"
      :row-count="filtered.length"
      @request="onRequest"
    >
      <template #top-right>
        <q-chip
          v-if="selected.length"
          dense
          color="primary"
          text-color="white"
        >
          {{ t('CreatorSubscribers.selectionCount', { count: selected.length }) }}
        </q-chip>
      </template>
      <template #body-cell-subscriber="props">
        <q-td :props="props" class="q-pa-sm">
          <div class="row items-center q-gutter-sm no-wrap">
            <q-avatar
              size="32px"
              @click.stop="showAvatarMenu($event, props.row)"
            >
              {{ initials(props.row.name) }}
            </q-avatar>
            <div>
              <div class="text-body1">{{ props.row.name }}</div>
              <div class="text-caption text-grey-6">{{ props.row.nip05 }}</div>
            </div>
          </div>
        </q-td>
      </template>
      <template #body-cell-tier="props">
        <q-td :props="props" class="q-pa-sm"
          ><q-chip dense color="primary" text-color="white">{{
            props.row.tierName
          }}</q-chip></q-td
        >
      </template>
      <template #body-cell-frequency="props">
        <q-td :props="props" class="q-pa-sm"
          ><q-chip dense outline>{{
            freqShort(props.row.frequency)
          }}</q-chip></q-td
        >
      </template>
      <template #body-cell-status="props">
        <q-td :props="props" class="q-pa-sm"
          ><q-chip
            dense
            :color="statusColor(props.row.status)"
            :text-color="statusTextColor(props.row.status)"
            :icon="statusIcon(props.row.status)"
            >{{ t('CreatorSubscribers.status.' + props.row.status) }}</q-chip
          ></q-td>
      </template>
      <template #body-cell-amount="props"
        ><q-td :props="props" class="q-pa-sm">{{ props.row.amountSat }} sat</q-td></template
      >
      <template #body-cell-nextRenewal="props">
        <q-td :props="props" class="q-pa-sm">
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
        ><q-td :props="props" class="q-pa-sm">{{ props.row.lifetimeSat }} sat</q-td></template
      >
      <template #body-cell-actions="props"
        ><q-td :props="props" class="q-pa-sm"
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

    <q-menu ref="avatarMenuRef">
      <q-list>
        <q-item clickable v-close-popup @click="copyAnyNpub(menuNpub)">
          <q-item-section>{{ t('CreatorSubscribers.drawer.actions.copyNpub') }}</q-item-section>
        </q-item>
      </q-list>
    </q-menu>

    </q-page>
  </q-page-container>
  <q-drawer v-model="drawer" side="right" :overlay="$q.screen.lt.md" bordered>
    <div v-if="current" class="q-pa-md">
        <div class="row items-center q-gutter-sm">
          <q-btn
            flat
            dense
            round
            icon="arrow_back"
            aria-label="Back"
            @click="drawer = false"
          />
          <q-avatar size="64px">{{ initials(current.name) }}</q-avatar>
          <div>
            <div class="text-h6">{{ current.name }}</div>
            <div class="text-body2 text-grey-6">{{ current.nip05 }}</div>
          </div>
          <q-space />
        </div>
        <q-bar class="bg-grey-2 q-mt-sm">
          <div class="text-body2 monospace ellipsis">{{ current.npub }}</div>
        </q-bar>
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
          <q-btn
            outline
            :label="t('CreatorSubscribers.drawer.actions.dm')"
            :aria-label="t('CreatorSubscribers.drawer.actions.dm')"
            @click="dmSubscriber"
          />
          <q-btn
            flat
            dense
            round
            icon="content_copy"
            :aria-label="t('CreatorSubscribers.drawer.actions.copyNpub')"
            @click="copyNpub"
          />
        </div>
        <q-expansion-item
          class="q-mt-lg"
          expand-separator
          icon="payments"
          :label="t('CreatorSubscribers.drawer.tabs.payments')"
        >
          <q-card>
            <q-card-section class="q-pa-none">
              <q-list bordered dense>
                <q-item v-for="p in payments" :key="p.ts">
                  <q-item-section>{{ formatDate(p.ts) }}</q-item-section>
                  <q-item-section side>{{ p.amount }} sat</q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </q-expansion-item>
        <q-expansion-item
          class="q-mt-md"
          expand-separator
          icon="history"
          :label="t('CreatorSubscribers.drawer.activity')"
        >
          <q-card>
            <q-card-section class="q-pa-none">
              <q-list bordered dense>
                <q-item v-for="a in activity" :key="a.ts">
                  <q-item-section>{{ a.text }}</q-item-section>
                  <q-item-section side class="text-caption text-grey">
                    {{ distToNow(a.ts) }}
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </q-expansion-item>
    </div>
  </q-drawer>
  <q-footer v-if="selected.length" class="bg-primary text-white">
    <div class="row items-center q-pa-sm q-gutter-sm full-width">
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
  </q-footer>
</q-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useCreatorSubscribersStore } from "src/stores/creatorSubscribers";
import { storeToRefs } from "pinia";
import { useDebounceFn } from "@vueuse/core";
import { format, formatDistanceToNow } from "date-fns";
import { useQuasar } from "quasar";
import type { QTableRequestProp, QMenu } from "quasar";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { Subscriber, Frequency, SubStatus } from "src/types/subscriber";
import downloadCsv from "src/utils/subscriberCsv";
import SubscriberFilters from "src/components/subscribers/SubscriberFilters.vue";
import SubscriberCard from "src/components/SubscriberCard.vue";
import SubscriptionsCharts from "src/components/subscribers/SubscriptionsCharts.vue";

const { t } = useI18n();
const $q = useQuasar();

const subStore = useCreatorSubscribersStore();
const {
  filtered,
  counts,
  activeTab,
  loading,
  error,
  statuses,
  tiers,
  sort,
} = storeToRefs(subStore);
const filtersActive = computed(
  () => statuses.value.size > 0 || tiers.value.size > 0 || sort.value !== 'next'
);
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
  {
    value: 'table',
    icon: 'table_rows',
    label: $q.screen.gt.xs ? t('CreatorSubscribers.toolbar.tableView') : '',
    'aria-label': t('CreatorSubscribers.toolbar.tableView'),
  },
  {
    value: 'cards',
    icon: 'grid_view',
    label: $q.screen.gt.xs ? t('CreatorSubscribers.toolbar.cardView') : '',
    'aria-label': t('CreatorSubscribers.toolbar.cardView'),
  },
]);
const densityOptions = computed(() => [
  {
    value: 'comfortable',
    icon: 'view_comfy',
    label: $q.screen.gt.xs ? t('CreatorSubscribers.toolbar.comfortable') : '',
    'aria-label': t('CreatorSubscribers.toolbar.comfortable'),
  },
  {
    value: 'compact',
    icon: 'view_compact',
    label: $q.screen.gt.xs ? t('CreatorSubscribers.toolbar.compact') : '',
    'aria-label': t('CreatorSubscribers.toolbar.compact'),
  },
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
const avatarMenuRef = ref<QMenu | null>(null);
const menuNpub = ref("");
function showAvatarMenu(e: Event, row: Subscriber) {
  menuNpub.value = row.npub;
  avatarMenuRef.value?.show(e);
}
const router = useRouter();

function copyAnyNpub(npub: string) {
  $q.clipboard.writeText(npub);
  $q.notify({ message: t("copied_to_clipboard"), color: "positive" });
}
function copyNpub() {
  if (!current.value) return;
  copyAnyNpub(current.value.npub);
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
