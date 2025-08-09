<template>
  <q-page class="q-pa-md">
    <!-- HEADER -->
    <div class="row items-center q-gutter-md">
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-input
          dense
          standout
          clearable
          v-model="state.query"
          placeholder="Search name, npub, nip05..."
          :debounce="250"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
      </div>
      <q-space />
      <div class="row items-center q-gutter-x-sm">
        <SavedViewsMenu
          :saved-views="savedViews"
          @select="loadView"
          @save="saveView"
          @delete="deleteView"
        />
        <FiltersPopover
          v-model="state.filters"
          :tier-options="tierOptions"
          @reset="resetFilters"
        />
        <q-btn-toggle
          v-model="state.compact"
          dense
          flat
          padding="sm"
          :options="[
            { icon: 'view_list', value: false },
            { icon: 'view_dense', value: true },
          ]"
        />
        <q-btn flat dense icon="download">
          <q-menu>
            <q-list dense>
              <q-item clickable v-close-popup @click="exportCsv('all')">
                <q-item-section>Export all...</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="exportCsv('view')">
                <q-item-section>Export current view...</q-item-section>
              </q-item>
              <q-item
                clickable
                v-close-popup
                :disable="selected.length === 0"
                @click="exportCsv('selection')"
              >
                <q-item-section>Export selection...</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </div>

    <!-- KPI RAIL -->
    <KpiRail class="q-mt-md" :loading="store.loading" v-bind="kpis" />

    <!-- TABS -->
    <q-tabs
      v-model="state.frequencyTab"
      dense
      class="q-mt-md"
      active-color="primary"
      indicator-color="primary"
      align="left"
    >
      <q-tab name="all" label="All">
        <q-badge color="grey-6" floating>{{ store.all.value.length }}</q-badge>
      </q-tab>
      <q-tab name="weekly" label="Weekly">
        <q-badge color="grey-6" floating>{{ store.weekly.value.length }}</q-badge>
      </q-tab>
      <q-tab name="biweekly" label="Bi-weekly">
        <q-badge color="grey-6" floating>{{ store.biweekly.value.length }}</q-badge>
      </q-tab>
      <q-tab name="monthly" label="Monthly">
        <q-badge color="grey-6" floating>{{ store.monthly.value.length }}</q-badge>
      </q-tab>
      <q-tab name="pending" label="Pending">
        <q-badge color="warning" floating>{{ store.pending.value.length }}</q-badge>
      </q-tab>
      <q-tab name="ended" label="Ended">
        <q-badge color="grey-6" floating>{{ store.ended.value.length }}</q-badge>
      </q-tab>
    </q-tabs>
    <q-separator />

    <!-- MAIN CONTENT -->
    <div class="q-mt-md">
      <div class="row items-center justify-end q-mb-md">
        <q-btn-toggle
          v-model="state.viewMode"
          dense
          flat
          padding="sm"
          :options="[
            { icon: 'table_rows', value: 'table' },
            { icon: 'grid_view', value: 'cards' },
          ]"
        />
      </div>

      <!-- Table View -->
      <q-table
        v-if="state.viewMode === 'table'"
        :rows="computedRows"
        :columns="columns"
        row-key="subscriptionId"
        selection="multiple"
        v-model:selected="selected"
        virtual-scroll
        :virtual-scroll-item-size="state.compact ? 36 : 52"
        :rows-per-page-options="[0]"
        :loading="store.loading"
        :dense="state.compact"
        flat
        bordered
        @row-click="(_evt, row) => openDrawer(row)"
      >
        <template #body-cell-name="props">
          <q-td :props="props" class="cursor-pointer">
            <div class="row items-center no-wrap q-gutter-x-sm">
              <q-avatar size="md" rounded>
                <img v-if="props.row.profile?.picture" :src="props.row.profile.picture" />
                <span v-else>{{ (props.row.profile?.displayName || props.row.subscriberNpub).slice(0, 2).toUpperCase() }}</span>
              </q-avatar>
              <div>
                <div class="ellipsis">{{ props.row.profile?.displayName || props.row.subscriberNpub }}</div>
                <div class="text-caption text-grey-6 ellipsis">{{ props.row.profile?.nip05 || props.row.subscriberNpub.slice(0, 12) + '...' }}</div>
              </div>
            </div>
            <q-menu touch-position context-menu>
              <q-list dense>
                <q-item clickable v-close-popup @click="openDrawer(props.row)"><q-item-section>View details</q-item-section></q-item>
                <q-item clickable v-close-popup><q-item-section>Copy npub</q-item-section></q-item>
                <q-item clickable v-close-popup><q-item-section>Send DM</q-item-section></q-item>
              </q-list>
            </q-menu>
          </q-td>
        </template>
        <template #body-cell-freq="props">
          <q-td :props="props">
            <q-chip dense outline :label="freqBadge(props.value)" />
          </q-td>
        </template>
        <template #body-cell-status="props">
          <q-td :props="props">
            <q-chip dense :color="statusColor(props.value)" text-color="white" :label="props.value" />
          </q-td>
        </template>
        <template #body-cell-nextRenewal="props">
          <q-td :props="props">
            <span v-if="props.value">{{ timeAgo(props.value) }}</span>
            <span v-else>—</span>
          </q-td>
        </template>
        <template #loading>
          <q-inner-loading showing color="primary" />
        </template>
      </q-table>

      <!-- Cards View -->
      <q-virtual-scroll
        v-if="state.viewMode === 'cards' && !store.loading"
        :items="computedRows"
        :virtual-scroll-item-size="state.compact ? 80 : 120"
        v-slot="{ item, index }"
        class="row q-col-gutter-md"
      >
        <div :key="index" class="col-12 col-sm-6 col-lg-4">
          <SubscriberCard
            :subscription="item"
            :profile="item.profile"
            :compact="state.compact"
            @open="openDrawer(item)"
            @select="toggleSelection(item)"
            :selected="isSelected(item)"
          />
        </div>
      </q-virtual-scroll>

      <!-- Empty State -->
      <div
        v-if="!store.loading && computedRows.length === 0"
        class="text-center q-pa-xl text-grey-6"
      >
        <q-icon name="group" size="xl" />
        <div class="text-h6 q-mt-md">
          No subscribers match your filters.
        </div>
        <q-btn flat color="primary" @click="resetFilters" class="q-mt-sm">Clear filters</q-btn>
      </div>
    </div>

    <!-- BULK ACTIONS BAR -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-slide-transition appear>
        <div v-show="selected.length > 0">
          <q-card class="bg-grey-9 q-pa-sm" rounded>
            <div class="row items-center q-gutter-md">
              <div class="text-body2">{{ selected.length }} selected</div>
              <q-btn flat dense icon="send" label="Group DM" />
              <q-btn flat dense icon="download" label="Export" @click="exportCsv('selection')" />
              <q-separator vertical />
              <q-btn flat dense round icon="close" @click="selected = []" />
            </div>
          </q-card>
        </div>
      </q-slide-transition>
    </q-page-sticky>

    <!-- DRAWER -->
    <SubscriberDrawer
      v-model="drawer.open"
      :sub="drawer.sub"
      :profile="drawer.sub?.profile"
    />
  </q-page>
</template>

<script setup lang="ts">
import { reactive, computed, watch, ref, onMounted } from 'vue';
import { useLocalStorage, useDebounceFn } from '@vueuse/core';
import { useQuasar } from 'quasar';
import { formatDistanceToNowStrict } from 'date-fns';

import { useCreatorSubscriptionsStore, type CreatorSubscription, type Status, type Frequency } from 'src/stores/creatorSubscriptions';
import { useNostrProfiles } from 'src/composables/useNostrProfiles';
import { downloadCsv } from 'src/utils/subscriberCsv';

import KpiRail from 'src/components/subscribers/KpiRail.vue';
import FiltersPopover from 'src/components/subscribers/FiltersPopover.vue';
import SavedViewsMenu from 'src/components/subscribers/SavedViewsMenu.vue';
import SubscriberCard from 'src/components/subscribers/SubscriberCard.vue';
import SubscriberDrawer from 'src/components/subscribers/SubscriberDrawer.vue';

const $q = useQuasar();
const store = useCreatorSubscriptionsStore();

// STATE
const defaultFilters = {
  tiers: [],
  statuses: [],
  sortKey: 'nextRenewal' as const,
};

const state = reactive({
  query: '',
  frequencyTab: 'all' as 'all' | Frequency | 'pending' | 'ended',
  filters: { ...defaultFilters },
  viewMode: 'table' as 'table' | 'cards',
  compact: false,
  savedViewId: null as string | null,
});
useLocalStorage('creator-subs-ui-state', state);

// DATA
const { profiles, fetchProfiles } = useNostrProfiles();

const computedRows = computed(() => {
  const filters = {
    ...state.filters,
    query: state.query,
    frequency: state.frequencyTab === 'all' || state.frequencyTab === 'pending' || state.frequencyTab === 'ended' ? 'all' : state.frequencyTab,
  };
  if (state.frequencyTab === 'pending' || state.frequencyTab === 'ended') {
    filters.statuses = [state.frequencyTab];
  }

  const subs = store.sliceBy(filters);
  return subs.map(sub => ({
    ...sub,
    profile: profiles.value[sub.subscriberNpub],
  }));
});

watch(() => store.subscriptions, (subs) => {
  if (subs.length > 0) {
    const npubs = subs.map(s => s.subscriberNpub);
    fetchProfiles(npubs);
  }
}, { immediate: true });

const tierOptions = computed(() => {
  const set = new Set<string>();
  store.all.value.forEach(r => set.add(r.tierName || 'Unknown'));
  return Array.from(set);
});

const kpis = computed(() => ({
  totals: store.all.value.length,
  activeCount: store.all.value.filter(s => s.status === 'active').length,
  pendingCount: store.pending.value.length,
  revenueLifetime: store.all.value.reduce((sum, s) => sum + s.totalAmount, 0),
  revenueThisPeriod: 0, // TODO
}));

// SELECTION
const selected = ref<CreatorSubscription[]>([]);
const isSelected = (sub: CreatorSubscription) => selected.value.some(s => s.subscriptionId === sub.subscriptionId);
function toggleSelection(sub: CreatorSubscription) {
  if (isSelected(sub)) {
    selected.value = selected.value.filter(s => s.subscriptionId !== sub.subscriptionId);
  } else {
    selected.value.push(sub);
  }
}

// DRAWER
const drawer = reactive<{ open: boolean, sub: CreatorSubscription | null }>({
  open: false,
  sub: null,
});
function openDrawer(sub: CreatorSubscription) {
  drawer.sub = sub;
  drawer.open = true;
}

// SAVED VIEWS
const savedViews = useLocalStorage<Record<string, any>>('creator-subs-saved-views', {});
function saveView(name: string) {
  savedViews.value[name] = JSON.parse(JSON.stringify(state));
  $q.notify({ type: 'positive', message: `View '${name}' saved.` });
}
function loadView(name: string) {
  const viewState = savedViews.value[name];
  if (viewState) {
    Object.assign(state, viewState);
    $q.notify({ type: 'info', message: `View '${name}' loaded.` });
  }
}
function deleteView(name: string) {
  delete savedViews.value[name];
  $q.notify({ type: 'warning', message: `View '${name}' deleted.` });
}
function resetFilters() {
  state.filters = { ...defaultFilters };
  state.query = '';
}

// TABLE
const columns = [
  { name: 'name', label: 'Name', align: 'left', field: 'subscriberNpub', sortable: true },
  { name: 'tier', label: 'Tier', field: 'tierName', sortable: true },
  { name: 'freq', label: 'Freq', field: 'frequency', align: 'center' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'nextRenewal', label: 'Next Renewal', field: 'nextRenewal', sortable: true },
  { name: 'lifetime', label: 'Lifetime (sats)', field: 'totalAmount', sortable: true },
];

// FORMATTING
const freqBadge = (f: Frequency) => ({ weekly: 'W', biweekly: '2W', monthly: 'M' }[f]);
const statusColor = (s: Status) => ({ active: 'positive', pending: 'warning', ended: 'grey-7' }[s]);
const timeAgo = (ts: number) => formatDistanceToNowStrict(new Date(ts * 1000), { addSuffix: true });

// CSV EXPORT
function exportCsv(type: 'all' | 'view' | 'selection') {
  let rows: CreatorSubscription[];
  if (type === 'all') rows = store.all.value;
  else if (type === 'view') rows = computedRows.value;
  else rows = selected.value;

  downloadCsv(rows, computedRows.value.map(r => r.profile));
  $q.notify({ message: `Exporting ${rows.length} subscribers...` });
}
</script>
