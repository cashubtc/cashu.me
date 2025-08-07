<template>
  <q-page class="q-pa-md bg-grey-10 text-white">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div class="flex items-center mb-4 sm:mb-0">
        <q-btn flat round dense icon="arrow_back" @click="$router.go(-1)" />
        <h1 class="text-2xl font-bold ml-4">My Subscribers ({{ totalSubscribers }})</h1>
      </div>
      <div class="flex items-center w-full sm:w-auto">
        <q-input
          v-model="searchTerm"
          placeholder="Search subscribers..."
          dark
          dense
          outlined
          class="w-full sm:w-64 mr-4"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn
          label="Filters"
          icon="filter_list"
          @click="showFilterDialog = true"
          color="grey-8"
        />
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="q-pa-md">
      <!-- Skeleton for Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <q-card v-for="i in 3" :key="i" class="bg-grey-9" flat bordered>
          <q-card-section class="flex justify-between items-center">
            <div class="flex-grow pr-4">
              <q-skeleton type="text" width="60%" class="text-sm" />
              <q-skeleton type="text" width="40%" class="text-3xl mt-2" />
              <q-skeleton type="text" width="80%" class="text-sm mt-2" />
            </div>
            <q-skeleton type="QAvatar" size="40px" />
          </q-card-section>
        </q-card>
      </div>

      <!-- Skeleton for Table -->
      <q-card class="bg-grey-9" flat bordered>
        <q-markup-table dark class="bg-transparent">
          <thead>
            <tr>
              <th v-for="i in 6" :key="i" class="text-left">
                <q-skeleton type="text" width="50%" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="n in 5" :key="n">
              <td class="text-left">
                <div class="flex items-center">
                  <q-skeleton type="QCheckbox" class="mr-2" />
                  <q-skeleton type="QAvatar" size="40px" />
                  <div class="ml-4 flex-grow">
                    <q-skeleton type="text" width="60%" />
                    <q-skeleton type="text" width="40%" class="text-xs" />
                  </div>
                </div>
              </td>
              <td v-for="i in 5" :key="i" class="text-center">
                <q-skeleton type="text" width="70%" />
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card>
    </div>

    <div v-else>
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <q-card class="bg-grey-9 summary-card" flat bordered>
          <q-card-section>
            <div class="flex justify-between items-start">
              <div>
                <div class="text-sm font-medium text-grey-5">Total Subscribers</div>
                <div class="text-3xl font-bold mt-2">{{ totalSubscribers }}</div>
                <div class="flex items-center mt-2 text-sm">
                  <span class="flex items-center text-green-4"><q-icon name="check_circle" class="mr-1" />{{ activeSubscribers }} Active</span>
                  <span class="ml-4 flex items-center text-yellow-4"><q-icon name="pending" class="mr-1" />{{ pendingSubscribers }} Pending</span>
                </div>
              </div>
              <q-avatar icon="people" font-size="32px" color="purple" text-color="white" />
            </div>
          </q-card-section>
        </q-card>

        <q-card class="bg-grey-9 summary-card" flat bordered>
          <q-card-section>
            <div class="flex justify-between items-start">
              <div>
                <div class="text-sm font-medium text-grey-5">Total Received Periods</div>
                <div class="text-3xl font-bold mt-2">{{ totalReceivedPeriods }}</div>
              </div>
              <q-avatar icon="event_repeat" font-size="32px" color="blue" text-color="white" />
            </div>
          </q-card-section>
        </q-card>

        <q-card class="bg-grey-9 summary-card" flat bordered>
          <q-card-section>
            <div class="flex justify-between items-start">
              <div>
                <div class="text-sm font-medium text-grey-5">Total Revenue</div>
                <div class="text-3xl font-bold mt-2">{{ totalRevenue.toLocaleString() }} sat</div>
              </div>
              <q-avatar icon="payments" font-size="32px" color="green" text-color="white" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Bulk Actions Bar -->
      <transition name="fade-slide">
        <div v-if="selectedRows.length > 0" class="bg-grey-8 rounded-lg p-3 mb-4 flex justify-between items-center sticky-top-card">
          <p class="font-medium">{{ selectedRows.length }} subscriber<span v-if="selectedRows.length > 1">s</span> selected</p>
          <div>
            <q-btn
              color="primary"
              label="Export CSV"
              @click="exportCsv"
              no-caps
            />
            <q-btn
              class="ml-2"
              color="grey-7"
              label="Send Group DM"
              disabled
              no-caps
            />
          </div>
        </div>
      </transition>

      <!-- Subscriber Table -->
      <q-table
        v-if="subscriptions.length"
        :rows="filteredRows"
        :columns="columns"
        row-key="subscriptionId"
        class="subscriber-table"
        flat
        dark
        card-class="bg-grey-9"
        table-header-class="text-grey-5"
        :rows-per-page-options="[10, 25, 50]"
        :loading="loading"
        @row-click="(evt, row) => viewSubscriber(row)"
        selection="multiple"
        v-model:selected="selectedRows"
      >
        <template #body-cell-subscriber="props">
          <q-td :props="props">
            <div class="flex items-center">
              <q-avatar size="40px" class="mr-4">
                <img :src="props.row.avatar" alt="Avatar" />
              </q-avatar>
              <div>
                <div class="font-bold">{{ props.row.displayName }}</div>
                <div class="text-sm text-grey-5">{{ props.row.subscriberNpub.substring(0, 12) }}...</div>
              </div>
            </div>
          </q-td>
        </template>

        <template #body-cell-tier="props">
          <q-td :props="props">
            <q-badge :color="getTierColor(props.row.tierName)" outline>
              {{ props.row.tierName }} Tier
            </q-badge>
          </q-td>
        </template>

        <template #body-cell-revenue="props">
          <q-td :props="props">
            <div class="font-medium">{{ props.row.totalAmount.toLocaleString() }} sat</div>
            <div class="text-xs text-grey-5">Total Revenue</div>
          </q-td>
        </template>

        <template #body-cell-since="props">
          <q-td :props="props">
            <div>{{ formatDate(props.row.startDate) }}</div>
            <div class="text-xs text-grey-5">{{ props.row.frequency }}</div>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="props.row.status === 'active' ? 'blue-5' : 'yellow-8'" text-color="white" rounded class="capitalize">
              {{ props.row.status }}
            </q-badge>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round dense icon="chevron_right" @click.stop="viewSubscriber(props.row)" />
          </q-td>
        </template>
      </q-table>

      <p v-if="!filteredRows.length && !loading" class="text-center text-grey-5 q-mt-xl">
        No subscribers match your filters.
      </p>
      <p v-else-if="!subscriptions.length && !loading" class="text-center text-grey-5 q-mt-xl">
        No subscribers yet.
      </p>
    </div>

    <!-- Filter Dialog -->
    <q-dialog v-model="showFilterDialog">
      <q-card class="bg-grey-9 text-white" style="width: 400px">
        <q-card-section class="flex justify-between items-center">
          <div class="text-h6">Filters</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator dark />
        <q-card-section>
          <div class="text-sm font-semibold text-grey-5 mb-2">Tier</div>
          <q-option-group
            v-model="filterTier"
            :options="tierOptions"
            type="checkbox"
            color="primary"
            dark
            dense
          />
        </q-card-section>
        <q-card-section>
          <div class="text-sm font-semibold text-grey-5 mb-2">Status</div>
          <q-option-group
            v-model="filterStatus"
            :options="statusOptions"
            type="checkbox"
            color="primary"
            dark
            dense
          />
        </q-card-section>
        <q-card-section>
          <div class="text-sm font-semibold text-grey-5 mb-2">Revenue Range (sats)</div>
          <q-range
            v-model="filterRevenue"
            :min="0"
            :max="maxRevenue"
            :step="100"
            label-always
            dark
            color="primary"
            class="q-mt-md"
          />
        </q-card-section>
        <q-separator dark />
        <q-card-actions align="right">
          <q-btn flat label="Reset" @click="resetFilters" />
          <q-btn flat label="Apply" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Subscriber Details Drawer -->
    <q-dialog v-model="showDrawer" position="right" maximized>
      <q-card v-if="selectedSubscriber" class="bg-grey-9 text-white" style="width: 400px; max-width: 100vw;">
        <q-card-section class="flex justify-between items-center">
          <div class="text-h6">Subscriber Details</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator dark />
        <q-card-section class="q-pa-md">
          <div class="flex flex-col items-center text-center">
            <q-avatar size="100px">
              <img :src="selectedSubscriber.avatar">
            </q-avatar>
            <h3 class="text-2xl font-bold mt-4">{{ selectedSubscriber.displayName }}</h3>
            <p class="text-sm text-grey-5 mt-1 break-all">{{ selectedSubscriber.subscriberNpub }}</p>
          </div>
          <div class="mt-8 space-y-2">
            <div class="bg-grey-8 rounded-lg p-3 flex justify-between items-center">
              <p class="text-sm font-medium text-grey-4">Status</p>
              <q-badge :color="selectedSubscriber.status === 'active' ? 'blue-5' : 'yellow-8'" text-color="white" rounded class="capitalize">
                {{ selectedSubscriber.status }}
              </q-badge>
            </div>
            <div class="bg-grey-8 rounded-lg p-3 flex justify-between items-center">
              <p class="text-sm font-medium text-grey-4">Tier</p>
              <q-badge :color="getTierColor(selectedSubscriber.tierName)" outline>
                {{ selectedSubscriber.tierName }} Tier
              </q-badge>
            </div>
            <div class="bg-grey-8 rounded-lg p-3 flex justify-between items-center">
              <p class="text-sm font-medium text-grey-4">Next Renewal</p>
              <p class="text-sm font-semibold">{{ formatDate(selectedSubscriber.nextRenewal) }}</p>
            </div>
            <div class="bg-grey-8 rounded-lg p-3 flex justify-between items-center">
              <p class="text-sm font-medium text-grey-4">Total Paid</p>
              <p class="text-sm font-semibold">{{ selectedSubscriber.totalAmount.toLocaleString() }} sat</p>
            </div>
          </div>
        </q-card-section>
        <q-space />
        <q-card-actions class="bg-grey-9 p-4 border-t border-grey-8">
          <div class="flex w-full gap-4">
            <q-btn class="flex-1" color="primary" label="Send DM" no-caps />
            <q-btn class="flex-1" color="grey-7" label="Copy Npub" @click="copyNpub(selectedSubscriber.subscriberNpub)" no-caps />
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { useCreatorSubscriptionsStore, type CreatorSubscription } from 'src/stores/creatorSubscriptions';
import { useNostrStore } from 'src/stores/nostr';
import { computed, ref, watchEffect } from 'vue';
import { QTableProps, useQuasar, copyToClipboard } from 'quasar';
import { bech32 } from 'bech32';
import { exportSubscribersToCsv } from 'src/utils/subscriberCsv';

const $q = useQuasar();
const subscriptionsStore = useCreatorSubscriptionsStore();
const nostrStore = useNostrStore();

const loading = computed(() => subscriptionsStore.loading);
const subscriptions = computed(() => subscriptionsStore.subscriptions);

// -- Bulk Actions State --
const selectedRows = ref<any[]>([]);

function exportCsv() {
  const success = exportSubscribersToCsv(selectedRows.value, columns.value as QTableProps['columns']);
  if (success) {
    $q.notify({
      message: `${selectedRows.value.length} subscribers exported successfully.`,
      color: 'positive',
      icon: 'check',
    });
    selectedRows.value = []; // Clear selection after export
  } else {
    $q.notify({
      message: 'CSV export failed.',
      color: 'negative',
      icon: 'warning',
    });
  }
}
// --------------------

// -- Drawer State --
const selectedSubscriber = ref<any>(null);
const showDrawer = ref(false);

function viewSubscriber(sub: any) {
  selectedSubscriber.value = sub;
  showDrawer.value = true;
}

function copyNpub(npub: string) {
  copyToClipboard(npub)
    .then(() => $q.notify({ message: 'Npub copied', color: 'positive', icon: 'check' }))
    .catch(() => $q.notify({ message: 'Failed to copy', color: 'negative', icon: 'warning' }));
}
// --------------------

// -- Filtering and Search State --
const searchTerm = ref('');
const showFilterDialog = ref(false);
const filterTier = ref<string[]>([]);
const filterStatus = ref<string[]>([]);

const maxRevenue = computed(() => {
  if (subscriptions.value.length === 0) return 10000;
  return Math.max(...subscriptions.value.map(s => s.totalAmount));
});

const filterRevenue = ref({ min: 0, max: maxRevenue.value });
watchEffect(() => {
  if (filterRevenue.value.max > maxRevenue.value) {
    filterRevenue.value.max = maxRevenue.value;
  }
});


const tierOptions = computed(() => {
  const tiers = new Set(subscriptions.value.map(s => s.tierName).filter(Boolean));
  return Array.from(tiers).map(tier => ({ label: `${tier} Tier`, value: tier }));
});

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
];

function resetFilters() {
  filterTier.value = [];
  filterStatus.value = [];
  filterRevenue.value = { min: 0, max: maxRevenue.value };
}
// ---------------------------------

// Fetch profiles for all subscriber npubs when the list changes
watchEffect(() => {
  const npubs = subscriptions.value.map(s => s.subscriberNpub).filter(Boolean);
  if (npubs.length > 0) {
    nostrStore.fetchProfiles(npubs);
  }
});

const totalSubscribers = computed(() => subscriptions.value.length);
const activeSubscribers = computed(() => subscriptions.value.filter(s => s.status === 'active').length);
const pendingSubscribers = computed(() => subscriptions.value.filter(s => s.status === 'pending').length);
const totalRevenue = computed(() => subscriptions.value.reduce((sum, s) => sum + s.totalAmount, 0));
const totalReceivedPeriods = computed(() => subscriptions.value.reduce((sum, s) => sum + (s.receivedPeriods || 0), 0));

const columns: QTableProps['columns'] = [
  { name: 'subscriber', label: 'Subscriber', field: 'subscriberNpub', align: 'left', sortable: true },
  { name: 'tier', label: 'Tier', field: 'tierName', align: 'center', sortable: true },
  { name: 'revenue', label: 'Revenue', field: 'totalAmount', align: 'center', sortable: true },
  { name: 'since', label: 'Member Since', field: 'startDate', align: 'center', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: true },
  { name: 'actions', label: '', align: 'right' }
];

const filteredRows = computed(() => {
  const allRows = subscriptions.value.map(sub => {
    const profile = nostrStore.profiles.get(sub.subscriberNpub);
    const defaultAvatar = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${sub.subscriberNpub}`;
    const displayName = profile?.name || profile?.display_name || formatNpub(sub.subscriberNpub);
    return {
      ...sub,
      displayName,
      avatar: profile?.picture || defaultAvatar,
    };
  });

  return allRows.filter(row => {
    const searchMatch = !searchTerm.value ||
      row.displayName.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      row.subscriberNpub.toLowerCase().includes(searchTerm.value.toLowerCase());

    const tierMatch = filterTier.value.length === 0 || filterTier.value.includes(row.tierName);
    const statusMatch = filterStatus.value.length === 0 || filterStatus.value.includes(row.status);
    const revenueMatch = row.totalAmount >= filterRevenue.value.min && row.totalAmount <= filterRevenue.value.max;

    return searchMatch && tierMatch && statusMatch && revenueMatch;
  });
});

function formatNpub(npub: string) {
  if (!npub) return 'unknown';
  try {
    const { prefix, words } = bech32.decode(npub);
    if (prefix === 'npub') {
      return `${npub.slice(0, 8)}...${npub.slice(-4)}`;
    }
    return 'invalid npub';
  } catch (e) {
    return 'invalid npub';
  }
}

function getTierColor(tierName: string) {
  const name = tierName?.toLowerCase() || '';
  if (name.includes('gold')) return 'amber-7';
  if (name.includes('silver')) return 'grey-7';
  if (name.includes('bronze')) return 'deep-orange-7';
  return 'purple-5';
}

function formatDate(timestamp: number | null) {
  if (!timestamp) return 'N/A';
  return new Date(timestamp * 1000).toLocaleDateString();
}
</script>

<style lang="scss" scoped>
.subscriber-table {
  .q-tr:hover {
    background-color: rgba(255, 255, 255, 0.05) !important;
  }
  .capitalize {
    text-transform: capitalize;
  }
}

.summary-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}
.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

// Using Tailwind-style utility classes directly in the template
.grid {
  display: grid;
}
.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}
.sm\:grid-cols-2 {
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.lg\:grid-cols-3 {
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
.gap-6 {
  gap: 1.5rem;
}
.mb-6 {
  margin-bottom: 1.5rem;
}
.mt-2 {
  margin-top: 0.5rem;
}
.ml-4 {
  margin-left: 1rem;
}
.mr-1 {
  margin-right: 0.25rem;
}
.font-bold {
  font-weight: 700;
}
.font-medium {
  font-weight: 500;
}
.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}
.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}
.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}
.flex {
  display: flex;
}
.flex-col {
  flex-direction: column;
}
.sm\:flex-row {
  @media (min-width: 640px) {
    flex-direction: row;
  }
}
.items-start {
  align-items: flex-start;
}
.items-center {
  align-items: center;
}
.justify-between {
  justify-content: space-between;
}
.w-full {
  width: 100%;
}
.sm\:w-auto {
  @media (min-width: 640px) {
    width: auto;
  }
}
.mb-4 {
  margin-bottom: 1rem;
}
.sm\:mb-0 {
  @media (min-width: 640px) {
    margin-bottom: 0;
  }
}

.text-green-4 {
  color: $green-4;
}
.text-yellow-4 {
  color: $yellow-4;
}

</style>
