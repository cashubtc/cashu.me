<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-white text-dark">
      <q-toolbar class="row items-center q-gutter-sm">
        <q-input
          dense
          v-model="search"
          :placeholder="t('CreatorSubscribers.toolbar.searchPlaceholder')"
          clearable
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-select
          v-model="savedView"
          dense
          emit-value
          map-options
          :options="savedViewOptions"
          class="q-ml-sm"
        />
        <q-btn
          flat
          dense
          class="q-ml-sm"
          icon="filter_list"
          :label="$q.screen.gt.xs ? t('CreatorSubscribers.actions.filters') : ''"
          :aria-label="t('CreatorSubscribers.actions.filters')"
        >
          <q-menu>
            <SubscriberFilters />
          </q-menu>
        </q-btn>
        <q-space />
        <q-btn-dropdown flat label="Display">
          <q-list style="min-width: 200px">
            <q-item>
              <q-item-section>
                <div class="q-mb-sm">
                  {{ t('CreatorSubscribers.toolbar.view') }}
                </div>
                <q-btn-toggle
                  v-model="view"
                  dense
                  toggle-color="primary"
                  :options="viewOptions"
                />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <div class="q-mb-sm">
                  {{ t('CreatorSubscribers.toolbar.density') }}
                </div>
                <q-btn-toggle
                  v-model="density"
                  dense
                  toggle-color="primary"
                  :options="densityOptions"
                />
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item-label header>{{ t('CreatorSubscribers.toolbar.columns') }}</q-item-label>
            <q-item v-for="col in columns" :key="col.name" clickable>
              <q-item-section avatar>
                <q-checkbox v-model="visibleColumns" :val="col.name" />
              </q-item-section>
              <q-item-section>{{ col.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn
          class="q-ml-sm"
          color="secondary"
          icon="download"
          :label="$q.screen.gt.xs ? t('CreatorSubscribers.toolbar.exportCsv') : ''"
          :aria-label="t('CreatorSubscribers.toolbar.exportCsv')"
          @click="downloadCsv()"
        />
        <q-btn class="q-ml-sm" flat icon="event">
          <q-popup-proxy transition-show="scale" transition-hide="scale">
            <q-date v-model="chartRange" range mask="YYYY-MM-DD" />
          </q-popup-proxy>
        </q-btn>
      </q-toolbar>
      <div class="bg-grey-2 q-px-md q-pb-sm">
        <div
          v-if="filterChips.length"
          class="row q-gutter-xs q-mb-sm"
        >
          <q-chip
            v-for="chip in filterChips"
            :key="chip.key"
            dense
            removable
            color="primary"
            text-color="white"
            @remove="removeFilter(chip)"
          >
            {{ chip.label }}
          </q-chip>
        </div>
        <q-segmented
          v-model="activeTab"
          dense
          color="primary"
          :options="tabOptions"
        />
      </div>
    </q-header>
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
        <div class="q-mb-lg">
          <div class="text-h6 q-mb-md">Subscribers Overview</div>
          <div class="row q-gutter-md">
            <KpiCard
              class="col-12 col-sm-6 col-md-3"
              title="Total Subscribers"
              :value="counts.all"
            />
            <KpiCard
              class="col-12 col-sm-6 col-md-3"
              title="Active / Pending"
              :value="`${activeCount} / ${pendingCount}`"
            />
            <KpiCard
              class="col-12 col-sm-6 col-md-3"
              title="Lifetime Revenue"
              :value="`${lifetimeRevenue} sat`"
            />
            <KpiCard
              class="col-12 col-sm-6 col-md-3 cursor-pointer"
              :title="periodMode === 'week' ? 'Next Week Revenue' : 'Next Month Revenue'"
              :value="`${formattedKpiThisPeriodSat} sat`"
              @click="togglePeriod"
            />
          </div>
        </div>

        <!-- Charts -->
        <q-card class="q-mb-lg">
          <q-card-section>
            <SubscriptionsCharts :rows="chartRows" />
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
      v-model:visible-columns="visibleColumns"
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
        ><q-td :props="props" class="q-pa-sm text-right">{{ props.row.amountSat }} sat</q-td></template
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
              <div class="row items-center no-wrap">
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
                <q-badge
                  v-if="dueSoon(props.row)"
                  color="warning"
                  text-color="black"
                  outline
                  class="q-ml-xs"
                  label="Soon"
                />
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
        ><q-td :props="props" class="q-pa-sm text-right">{{ props.row.lifetimeSat }} sat</q-td></template
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
    <div v-if="current" class="column fit">
      <div class="q-pa-md scroll">
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

        <div class="q-mt-md">
          <div class="text-subtitle2 q-mb-sm">
            {{ t('CreatorSubscribers.drawer.tabs.overview') }}
          </div>
          <q-list bordered dense>
            <q-item>
              <q-item-section>{{ t('CreatorSubscribers.columns.tier') }}</q-item-section>
              <q-item-section side>{{ current.tierName }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>{{ t('CreatorSubscribers.columns.frequency') }}</q-item-section>
              <q-item-section side>{{ t('CreatorSubscribers.frequency.' + current.frequency) }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>{{ t('CreatorSubscribers.columns.status') }}</q-item-section>
              <q-item-section side>{{ t('CreatorSubscribers.status.' + current.status) }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>{{ t('CreatorSubscribers.drawer.overview.amountPerInterval') }}</q-item-section>
              <q-item-section side>
                {{ current.amountSat }} sat / {{ t('CreatorSubscribers.frequency.' + current.frequency) }}
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>{{ t('CreatorSubscribers.drawer.overview.nextRenewal') }}</q-item-section>
              <q-item-section side>
                {{ current.nextRenewal ? formatDate(current.nextRenewal) : '—' }}
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>{{ t('CreatorSubscribers.drawer.overview.lifetimeTotal') }}</q-item-section>
              <q-item-section side>{{ current.lifetimeSat }} sat</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>{{ t('CreatorSubscribers.drawer.overview.since') }}</q-item-section>
              <q-item-section side>{{ formatDate(current.startDate) }}</q-item-section>
            </q-item>
          </q-list>
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
              <q-item-section side class="text-caption text-grey">
                {{ distToNow(a.ts) }}
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
      <q-separator />
      <div class="q-pa-sm bg-grey-2 row q-gutter-sm justify-end">
        <q-btn
          flat
          :label="t('CreatorSubscribers.drawer.actions.dm')"
          :aria-label="t('CreatorSubscribers.drawer.actions.dm')"
          @click="dmSubscriber"
        />
        <q-btn
          flat
          :label="t('CreatorSubscribers.drawer.actions.copyNpub')"
          :aria-label="t('CreatorSubscribers.drawer.actions.copyNpub')"
          @click="copyNpub"
        />
        <q-btn
          flat
          color="negative"
          :label="t('CreatorSubscribers.drawer.actions.cancel')"
          :aria-label="t('CreatorSubscribers.drawer.actions.cancel')"
          @click="drawer = false"
        />
      </div>
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
import { useCreatorSubscribersStore, type SortOption } from "src/stores/creatorSubscribers";
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
import KpiCard from "src/components/subscribers/KpiCard.vue";

const { t } = useI18n();
const $q = useQuasar();

const subStore = useCreatorSubscribersStore();
const {
  filtered,
  counts,
  activeTab,
  loading,
  error,
} = storeToRefs(subStore);
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

const savedView = ref('default');
const savedViewOptions = [{ label: 'Default', value: 'default' }];

const chartRange = ref<{ from: string; to: string } | null>(null);
const chartRows = computed(() => {
  if (!chartRange.value) return filtered.value;
  const from = new Date(chartRange.value.from).getTime() / 1000;
  const to =
    new Date(chartRange.value.to).getTime() / 1000 + 24 * 60 * 60;
  return filtered.value.filter(
    (r) => r.startDate && r.startDate >= from && r.startDate <= to,
  );
});

const tabOptions = computed(() => [
  {
    label: `${t('CreatorSubscribers.tabs.all')} (${counts.value.all})`,
    value: 'all',
  },
  {
    label: `${t('CreatorSubscribers.frequency.weekly')} (${counts.value.weekly})`,
    value: 'weekly',
  },
  {
    label: `${t('CreatorSubscribers.frequency.biweekly')} (${counts.value.biweekly})`,
    value: 'biweekly',
  },
  {
    label: `${t('CreatorSubscribers.frequency.monthly')} (${counts.value.monthly})`,
    value: 'monthly',
  },
  {
    label: `${t('CreatorSubscribers.status.pending')} (${counts.value.pending})`,
    value: 'pending',
  },
  {
    label: `${t('CreatorSubscribers.status.ended')} (${counts.value.ended})`,
    value: 'ended',
  },
]);

const tierMap = computed(() => {
  return new Map(subStore.subscribers.map((s) => [s.tierId, s.tierName]));
});

const filterChips = computed(() => {
  const chips: Array<{ key: string; label: string; type: string; value?: string }>
    = [];
  for (const s of subStore.statuses) {
    chips.push({
      key: `status-${s}`,
      type: 'status',
      value: s,
      label: `${t('CreatorSubscribers.filters.status')}: ${t(`CreatorSubscribers.status.${s}`)}`,
    });
  }
  for (const tierId of subStore.tiers) {
    chips.push({
      key: `tier-${tierId}`,
      type: 'tier',
      value: tierId,
      label: `${t('CreatorSubscribers.filters.tier')}: ${tierMap.value.get(tierId) ?? tierId}`,
    });
  }
  if (subStore.sort !== 'next') {
    chips.push({
      key: 'sort',
      type: 'sort',
      value: subStore.sort,
      label: `${t('CreatorSubscribers.filters.sort')}: ${t(
        `CreatorSubscribers.filters.sortOptions.${subStore.sort}`,
      )}`,
    });
  }
  return chips;
});

function removeFilter(chip: { type: string; value?: string }) {
  const statuses = new Set(subStore.statuses);
  const tiers = new Set(subStore.tiers);
  let sort: SortOption = subStore.sort;
  if (chip.type === 'status' && chip.value) {
    statuses.delete(chip.value as SubStatus);
  } else if (chip.type === 'tier' && chip.value) {
    tiers.delete(chip.value);
  } else if (chip.type === 'sort') {
    sort = 'next';
  }
  if (statuses.size || tiers.size || sort !== 'next') {
    subStore.applyFilters({ statuses, tiers, sort });
  } else {
    subStore.clearFilters();
  }
}

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
    name: 'actions',
    label: t('CreatorSubscribers.columns.actions'),
    field: 'id',
    sortable: false,
    align: 'left',
  },
  {
    name: 'subscriber',
    label: t('CreatorSubscribers.columns.subscriber'),
    field: 'name',
    sortable: false,
    align: 'left',
  },
  {
    name: 'tier',
    label: t('CreatorSubscribers.columns.tier'),
    field: 'tierName',
    sortable: false,
    align: 'left',
  },
  {
    name: 'frequency',
    label: t('CreatorSubscribers.columns.frequency'),
    field: 'frequency',
    sortable: false,
    align: 'left',
  },
  {
    name: 'status',
    label: t('CreatorSubscribers.columns.status'),
    field: 'status',
    sortable: false,
    align: 'left',
  },
  {
    name: 'amount',
    label: t('CreatorSubscribers.columns.amount'),
    field: 'amountSat',
    sortable: false,
    align: 'right',
  },
  {
    name: 'nextRenewal',
    label: t('CreatorSubscribers.columns.nextRenewal'),
    field: 'nextRenewal',
    sortable: false,
    align: 'left',
  },
  {
    name: 'lifetime',
    label: t('CreatorSubscribers.columns.lifetime'),
    field: 'lifetimeSat',
    sortable: false,
    align: 'right',
  },
];

const visibleColumns = ref(columns.map((c) => c.name));

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
