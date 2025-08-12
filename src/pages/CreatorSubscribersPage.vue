<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="q-pa-md fit page-surface">
        <div class="card-bg">
          <q-toolbar class="row items-center q-gutter-sm card-bg">
            <q-input
              dense
              v-model="search"
              :placeholder="t('CreatorSubscribers.toolbar.searchPlaceholder')"
              :aria-label="t('CreatorSubscribers.toolbar.searchPlaceholder')"
              clearable
              class="focus-outline"
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
              class="q-ml-sm focus-outline"
            />
            <q-btn
              flat
              dense
              class="q-ml-sm focus-outline"
              icon="filter_list"
              :label="
                $q.screen.gt.xs ? t('CreatorSubscribers.actions.filters') : ''
              "
              :aria-label="t('CreatorSubscribers.actions.filters')"
            >
              <q-menu>
                <SubscriberFilters />
              </q-menu>
            </q-btn>
            <q-space />
            <q-btn-dropdown
              flat
              label="Display"
              aria-label="Display options"
              class="focus-outline"
            >
              <q-list style="min-width: 200px" class="card-bg">
                <q-item>
                  <q-item-section>
                    <div class="q-mb-sm">
                      {{ t("CreatorSubscribers.toolbar.view") }}
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
                      {{ t("CreatorSubscribers.toolbar.density") }}
                    </div>
                    <q-btn-toggle
                      v-model="density"
                      dense
                      toggle-color="primary"
                      :options="densityOptions"
                    />
                  </q-item-section>
                </q-item>
                <q-separator class="divider-bg" />
                <q-item-label header>{{
                  t("CreatorSubscribers.toolbar.columns")
                }}</q-item-label>
                <q-item v-for="col in columns" :key="col.name" clickable>
                  <q-item-section avatar>
                    <q-checkbox v-model="visibleColumns" :val="col.name" />
                  </q-item-section>
                  <q-item-section>{{ col.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
            <q-btn
              class="q-ml-sm focus-outline"
              color="secondary"
              icon="download"
              :label="
                $q.screen.gt.xs ? t('CreatorSubscribers.toolbar.exportCsv') : ''
              "
              :aria-label="t('CreatorSubscribers.toolbar.exportCsv')"
              @click="downloadCsv()"
            />
            <q-btn
              class="q-ml-sm focus-outline"
              flat
              icon="event"
              aria-label="Date range"
            >
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-date v-model="chartRange" range mask="YYYY-MM-DD" />
              </q-popup-proxy>
            </q-btn>
          </q-toolbar>
          <div class="card-bg q-px-md q-pb-sm">
            <div v-if="filterChips.length" class="row q-gutter-xs q-mb-sm">
              <q-chip
                v-for="chip in filterChips"
                :key="chip.key"
                dense
                removable
                color="primary"
                text-color="white"
                @remove="removeFilter(chip)"
                class="focus-outline"
                tabindex="0"
              >
                {{ chip.label }}
              </q-chip>
            </div>
            <q-btn-toggle
              v-model="activeTab"
              dense
              toggle-color="primary"
              :options="tabOptions"
            />
          </div>
        </div>
        <q-banner v-if="error" dense class="q-mb-md bg-red-1 text-red-9">
          {{ error }}
          <template #action>
            <q-btn
              flat
              color="red"
              :label="t('CreatorSubscribers.actions.retry')"
              :aria-label="t('CreatorSubscribers.actions.retry')"
              @click="retry"
              class="focus-outline"
            />
          </template>
        </q-banner>
        <q-inner-loading :showing="loading">
          <q-spinner size="50px" color="primary" />
        </q-inner-loading>
        <q-linear-progress
          v-if="!loading && profilesLoading"
          indeterminate
          color="primary"
          class="q-mb-md"
        />
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
              :title="
                periodMode === 'week'
                  ? 'Next Week Revenue'
                  : 'Next Month Revenue'
              "
              :value="`${formattedKpiThisPeriodSat} sat`"
              @click="togglePeriod"
            />
          </div>
        </div>

        <!-- Charts -->
        <q-card class="q-mb-lg card-bg">
          <q-card-section>
            <SubscriptionsCharts :rows="chartRows" />
          </q-card-section>
        </q-card>

        <!-- Table -->
        <SubscribersTable :subscribers="filtered" @select="openDrawer" />
        <q-virtual-scroll
          v-if="view === 'card'"
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
          <q-list class="card-bg">
            <q-item clickable v-close-popup @click="copyNpub(menuNpub)">
              <q-item-section>{{
                t("CreatorSubscribers.drawer.actions.copyNpub")
              }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-page>
    </q-page-container>
    <q-drawer
      v-model="drawer"
      side="right"
      :overlay="$q.screen.lt.md"
      bordered
      class="page-surface"
    >
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
              class="focus-outline"
            />
            <q-avatar size="64px">{{ initials(current.name) }}</q-avatar>
            <div>
              <div class="text-h6">{{ current.name }}</div>
              <div class="text-body2 text-secondary">{{ current.nip05 }}</div>
            </div>
            <q-space />
          </div>
          <q-bar class="card-bg q-mt-sm">
            <div class="text-body2 monospace ellipsis">{{ current.npub }}</div>
          </q-bar>

          <div class="q-mt-md">
            <div class="text-subtitle2 q-mb-sm">
              {{ t("CreatorSubscribers.drawer.tabs.overview") }}
            </div>
            <q-list bordered dense class="card-bg">
              <q-item>
                <q-item-section>{{
                  t("CreatorSubscribers.columns.tier")
                }}</q-item-section>
                <q-item-section side>{{ current.tierName }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section>{{
                  t("CreatorSubscribers.columns.frequency")
                }}</q-item-section>
                <q-item-section side>{{
                  t("CreatorSubscribers.frequency." + current.frequency)
                }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section>{{
                  t("CreatorSubscribers.columns.status")
                }}</q-item-section>
                <q-item-section side>{{
                  t("CreatorSubscribers.status." + current.status)
                }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section>{{
                  t("CreatorSubscribers.drawer.overview.amountPerInterval")
                }}</q-item-section>
                <q-item-section side>
                  {{ current.amountSat }} sat /
                  {{ t("CreatorSubscribers.frequency." + current.frequency) }}
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>{{
                  t("CreatorSubscribers.drawer.overview.nextRenewal")
                }}</q-item-section>
                <q-item-section side>
                  {{
                    current.nextRenewal ? formatDate(current.nextRenewal) : "—"
                  }}
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>{{
                  t("CreatorSubscribers.drawer.overview.lifetimeTotal")
                }}</q-item-section>
                <q-item-section side
                  >{{ current.lifetimeSat }} sat</q-item-section
                >
              </q-item>
              <q-item>
                <q-item-section>{{
                  t("CreatorSubscribers.drawer.overview.since")
                }}</q-item-section>
                <q-item-section side>{{
                  formatDate(current.startDate)
                }}</q-item-section>
              </q-item>
            </q-list>
          </div>

          <div class="q-mt-lg">
            <div class="text-subtitle2 q-mb-sm">
              {{ t("CreatorSubscribers.drawer.tabs.payments") }}
            </div>
            <q-list bordered dense class="card-bg">
              <q-item v-for="p in payments" :key="p.ts">
                <q-item-section>{{ formatDate(p.ts) }}</q-item-section>
                <q-item-section side>{{ p.amount }} sat</q-item-section>
              </q-item>
            </q-list>
          </div>

          <div class="q-mt-lg">
            <div class="text-subtitle2 q-mb-sm">
              {{ t("CreatorSubscribers.drawer.activity") }}
            </div>
            <q-list bordered dense class="card-bg">
              <q-item v-for="a in activity" :key="a.ts">
                <q-item-section>{{ a.text }}</q-item-section>
                <q-item-section side class="text-caption text-secondary">
                  {{ distToNow(a.ts) }}
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
        <q-separator class="divider-bg" />
        <div class="q-pa-sm card-bg row q-gutter-sm justify-end">
          <q-btn
            flat
            :label="t('CreatorSubscribers.drawer.actions.dm')"
            :aria-label="t('CreatorSubscribers.drawer.actions.dm')"
            @click="dmSubscriber"
            class="focus-outline"
          />
          <q-btn
            flat
            :label="t('CreatorSubscribers.drawer.actions.copyNpub')"
            :aria-label="t('CreatorSubscribers.drawer.actions.copyNpub')"
            @click="copyCurrentNpub"
            class="focus-outline"
          />
          <q-btn
            flat
            color="negative"
            :label="t('CreatorSubscribers.drawer.actions.cancel')"
            :aria-label="t('CreatorSubscribers.drawer.actions.cancel')"
            @click="drawer = false"
            class="focus-outline"
          />
        </div>
      </div>
    </q-drawer>
    <q-footer v-if="selected.length" class="bg-primary text-white">
      <div class="row items-center q-pa-sm q-gutter-sm full-width">
        <div>
          {{
            t("CreatorSubscribers.selectionCount", { count: selected.length })
          }}
        </div>
        <q-space />
        <q-btn
          outline
          dense
          color="white"
          icon="download"
          :label="t('CreatorSubscribers.actions.exportSelected')"
          :aria-label="t('CreatorSubscribers.actions.exportSelected')"
          @click="exportSelected"
          class="focus-outline"
        />
        <q-btn
          flat
          dense
          color="white"
          :label="t('CreatorSubscribers.actions.clear')"
          :aria-label="t('CreatorSubscribers.actions.clear')"
          @click="clearSelected"
          class="focus-outline"
        />
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useCreatorSubscribersStore } from "src/stores/creatorSubscribers";
import {
  useSubscribersStore,
  type SortOption,
} from "src/stores/subscribersStore";
import { storeToRefs } from "pinia";
import { useDebounceFn } from "@vueuse/core";
import { format, formatDistanceToNow } from "date-fns";
import { useQuasar } from "quasar";
import type { QMenu } from "quasar";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { Subscriber, Frequency, SubStatus } from "src/types/subscriber";
import downloadCsv from "src/utils/subscriberCsv";
import SubscriberFilters from "src/components/subscribers/SubscriberFilters.vue";
import SubscriberCard from "src/components/SubscriberCard.vue";
import SubscriptionsCharts from "src/components/subscribers/SubscriptionsCharts.vue";
import KpiCard from "src/components/subscribers/KpiCard.vue";
import SubscribersTable from "src/components/subscribers/SubscribersTable.vue";
import { copyNpub } from "src/utils/clipboard";

const { t } = useI18n();
const $q = useQuasar();

const subStore = useCreatorSubscribersStore();
const viewStore = useSubscribersStore();
const { filtered, counts, activeTab, loading, profilesLoading, error } =
  storeToRefs(subStore);
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
    0
  )
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
        s.nextRenewal <= end
    )
    .reduce(
      (sum, s) => sum + (typeof s.amountSat === "number" ? s.amountSat : 0),
      0
    );
});
const formattedKpiThisPeriodSat = computed(() =>
  kpiThisPeriodSat.value.toLocaleString()
);

function togglePeriod() {
  // Toggle between week and month views when the KPI card is clicked.
  periodMode.value = periodMode.value === "week" ? "month" : "week";
}

const search = ref(viewStore.query);
// Forward the user-entered search term to the Pinia store (debounced),
// which recomputes `filtered` for us.
const applySearch = useDebounceFn((v: string) => {
  viewStore.applyFilters({ query: v });
}, 300);
watch(search, (v) => applySearch(v));

const sort = ref<SortOption>(viewStore.sort);
watch(
  () => viewStore.sort,
  (v) => {
    sort.value = v;
  }
);
watch(sort, (v) => viewStore.applyFilters({ sort: v }));

const savedView = ref("default");
const savedViewOptions = [{ label: "Default", value: "default" }];

const chartRange = ref<{ from: string; to: string } | null>(null);
const chartRows = computed(() => {
  if (!chartRange.value) return filtered.value;
  const from = new Date(chartRange.value.from).getTime() / 1000;
  const to = new Date(chartRange.value.to).getTime() / 1000 + 24 * 60 * 60;
  return filtered.value.filter(
    (r) => r.startDate && r.startDate >= from && r.startDate <= to
  );
});

const tabOptions = computed(() => [
  {
    label: `${t("CreatorSubscribers.tabs.all")} (${counts.value.all})`,
    value: "all",
  },
  {
    label: `${t("CreatorSubscribers.frequency.weekly")} (${
      counts.value.weekly
    })`,
    value: "weekly",
  },
  {
    label: `${t("CreatorSubscribers.frequency.biweekly")} (${
      counts.value.biweekly
    })`,
    value: "biweekly",
  },
  {
    label: `${t("CreatorSubscribers.frequency.monthly")} (${
      counts.value.monthly
    })`,
    value: "monthly",
  },
  {
    label: `${t("CreatorSubscribers.status.pending")} (${
      counts.value.pending
    })`,
    value: "pending",
  },
  {
    label: `${t("CreatorSubscribers.status.ended")} (${counts.value.ended})`,
    value: "ended",
  },
]);

const tierMap = computed(() => {
  return new Map(subStore.subscribers.map((s) => [s.tierId, s.tierName]));
});

const filterChips = computed(() => {
  const chips: Array<{
    key: string;
    label: string;
    type: string;
    value?: string;
  }> = [];
  for (const s of viewStore.status) {
    chips.push({
      key: `status-${s}`,
      type: "status",
      value: s,
      label: `${t("CreatorSubscribers.filters.status")}: ${t(
        `CreatorSubscribers.status.${s}`
      )}`,
    });
  }
  for (const tierId of viewStore.tier) {
    chips.push({
      key: `tier-${tierId}`,
      type: "tier",
      value: tierId,
      label: `${t("CreatorSubscribers.filters.tier")}: ${
        tierMap.value.get(tierId) ?? tierId
      }`,
    });
  }
  if (viewStore.sort !== "next") {
    chips.push({
      key: "sort",
      type: "sort",
      value: viewStore.sort,
      label: `${t("CreatorSubscribers.filters.sort")}: ${t(
        `CreatorSubscribers.filters.sortOptions.${viewStore.sort}`
      )}`,
    });
  }
  return chips;
});

function removeFilter(chip: { type: string; value?: string }) {
  const statuses = new Set(viewStore.status);
  const tiers = new Set(viewStore.tier);
  let sort: SortOption = viewStore.sort;
  if (chip.type === "status" && chip.value) {
    statuses.delete(chip.value as SubStatus);
  } else if (chip.type === "tier" && chip.value) {
    tiers.delete(chip.value);
  } else if (chip.type === "sort") {
    sort = "next";
  }
  if (statuses.size || tiers.size || sort !== "next") {
    viewStore.applyFilters({ status: statuses, tier: tiers, sort });
  } else {
    viewStore.clearFilters();
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

const { viewMode: view, density, visibleColumns } = storeToRefs(viewStore);

const viewOptions = computed(() => [
  {
    value: "table",
    icon: "table_rows",
    label: $q.screen.gt.xs ? t("CreatorSubscribers.toolbar.tableView") : "",
    "aria-label": t("CreatorSubscribers.toolbar.tableView"),
  },
  {
    value: "card",
    icon: "grid_view",
    label: $q.screen.gt.xs ? t("CreatorSubscribers.toolbar.cardView") : "",
    "aria-label": t("CreatorSubscribers.toolbar.cardView"),
  },
]);
const densityOptions = computed(() => [
  {
    value: "comfortable",
    icon: "view_comfy",
    label: $q.screen.gt.xs ? t("CreatorSubscribers.toolbar.comfortable") : "",
    "aria-label": t("CreatorSubscribers.toolbar.comfortable"),
  },
  {
    value: "compact",
    icon: "view_compact",
    label: $q.screen.gt.xs ? t("CreatorSubscribers.toolbar.compact") : "",
    "aria-label": t("CreatorSubscribers.toolbar.compact"),
  },
]);

onMounted(() => {
  void subStore.loadFromDb();
  void subStore.fetchProfiles();
});

// When the list of subscribers changes, fetch profiles for any new npubs.
watch(
  () => subStore.subscribers.map((s) => s.npub),
  (npubs, prev) => {
    const prevSet = new Set(prev);
    if (npubs.some((n) => !prevSet.has(n))) {
      void subStore.fetchProfiles();
    }
  }
);

const columns = [
  {
    name: "subscriber",
    label: t("CreatorSubscribers.columns.subscriber"),
  },
  {
    name: "tier",
    label: t("CreatorSubscribers.columns.tier"),
  },
  {
    name: "frequency",
    label: t("CreatorSubscribers.columns.frequency"),
  },
  {
    name: "status",
    label: t("CreatorSubscribers.columns.status"),
  },
  {
    name: "amount",
    label: t("CreatorSubscribers.columns.amount"),
  },
  {
    name: "nextRenewal",
    label: t("CreatorSubscribers.columns.nextRenewal"),
  },
  {
    name: "lifetime",
    label: t("CreatorSubscribers.columns.lifetime"),
  },
];

if (visibleColumns.value.length === 0) {
  visibleColumns.value = columns.map((c) => c.name);
}

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
function statusTextColor(s: SubStatus) {
  return s === "pending" ? "black" : "white";
}
function statusIcon(s: SubStatus) {
  return s === "active" ? "check" : s === "pending" ? "schedule" : "close";
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

function copyCurrentNpub() {
  if (!current.value) return;
  copyNpub(current.value.npub);
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

<style scoped>
.page-surface {
  background-color: #0f1216;
  color: #e7ecf3;
}
.card-bg {
  background-color: #12161c;
}
.divider-bg {
  background-color: #1c222b;
}
.text-secondary {
  color: #a7b0bf;
}
.focus-outline:focus-visible,
.focus-outline .q-field__native:focus-visible {
  outline: 2px solid #8c5efb;
  outline-offset: 2px;
}
</style>
