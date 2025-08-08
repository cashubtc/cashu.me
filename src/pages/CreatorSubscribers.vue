<template>
  <q-page class="q-pa-md">
    <div v-if="loading" class="q-gutter-md">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <q-skeleton v-for="n in 3" :key="n" type="QCard" class="h-24" />
      </div>
      <q-skeleton v-for="n in 3" :key="n" class="h-8" />
    </div>
    <template v-else>
      <!-- KPI cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <q-card>
          <q-card-section>
            <div class="text-subtitle1">{{ t('CreatorSubscribers.summary.subscribers') }}</div>
            <div class="text-h6">{{ total }}</div>
          </q-card-section>
        </q-card>
        <q-card>
          <q-card-section>
            <div class="text-subtitle1">{{ t('CreatorSubscribers.summary.active') }}</div>
            <div class="text-h6">{{ active }}</div>
          </q-card-section>
        </q-card>
        <q-card>
          <q-card-section>
            <div class="text-subtitle1">{{ t('CreatorSubscribers.summary.revenue') }}</div>
            <div class="text-h6">{{ formatCurrency(lifetimeRevenue) }}</div>
            <div class="text-caption">
              {{ revenueToggle === 'week' ? t('CreatorSubscribers.summary.thisWeek') : t('CreatorSubscribers.summary.thisMonth') }}:
              {{ formatCurrency(periodRevenue) }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- toolbar -->
      <div class="flex flex-wrap items-center gap-2 mb-6">
        <q-input
          v-model="search"
          dense
          clearable
          debounce="0"
          placeholder="Search"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <div class="flex items-center gap-1">
          <q-chip
            v-for="f in frequenciesOptions"
            :key="f.value"
            clickable
            :color="selectedFrequencies.includes(f.value) ? 'primary' : 'grey-6'"
            text-color="white"
            @click="toggleFrequency(f.value)"
          >
            {{ f.label }}
          </q-chip>
        </div>

        <div class="flex items-center gap-1">
          <q-chip
            v-for="s in statusOptions"
            :key="s.value"
            clickable
            :color="selectedStatuses.includes(s.value) ? 'primary' : 'grey-6'"
            text-color="white"
            @click="toggleStatus(s.value)"
          >
            {{ s.label }}
          </q-chip>
        </div>

        <q-select
          v-model="tierFilter"
          :options="tierOptions"
          dense
          clearable
          emit-value
          map-options
          placeholder="Tier"
          style="min-width: 120px"
        />

        <q-select
          v-model="sort"
          :options="sortOptions"
          dense
          emit-value
          map-options
          placeholder="Sort"
          style="min-width: 120px"
        />

        <q-toggle v-model="compact" label="Compact" />

        <q-btn flat icon="download" :disable="filtered.all.length === 0" @click="exportCsv" />
      </div>

      <!-- grouped sections -->
      <div v-for="(list, key) in grouped" :key="key" class="mb-8">
        <h6 class="q-my-md">{{ keyLabel(key) }}</h6>
        <q-virtual-scroll
          :items="list"
          :item-size="compact ? 56 : 92"
          v-slot="{ item }"
        >
          <SubscriberCard
            :subscription="item"
            :compact="compact"
            :status="uiStatus(item)"
            :next-in="nextIn(item)"
            :progress="progress(item)"
            :amount="amountPerInterval(item)"
            @click="openSubscriber(item)"
          />
        </q-virtual-scroll>
      </div>

      <SubscriberDrawer v-model="drawer" :subscription="current" />
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useDebounceFn } from '@vueuse/core';
import SubscriberCard from 'components/SubscriberCard.vue';
import SubscriberDrawer from 'components/SubscriberDrawer.vue';
import { useCreatorSubscriptionsStore, type CreatorSubscription } from 'stores/creatorSubscriptions';
import { exportSubscribers } from 'src/utils/subscriberCsv';
import { useNostrStore } from 'stores/nostr';
import type { NDKUserProfile as Profile } from '@nostr-dev-kit/ndk';

const { t } = useI18n();
const creatorSubscriptionsStore = useCreatorSubscriptionsStore();
const { subscriptions, loading } = storeToRefs(creatorSubscriptionsStore);

// search with debounce
const search = ref('');
const debouncedSearch = ref('');
watch(search, useDebounceFn((v: string) => (debouncedSearch.value = v), 200));

// frequency chips
const frequenciesOptions = [
  { label: t('CreatorSubscribers.frequency.weekly'), value: 'weekly' },
  { label: t('CreatorSubscribers.frequency.biweekly'), value: 'biweekly' },
  { label: t('CreatorSubscribers.frequency.monthly'), value: 'monthly' },
];
const selectedFrequencies = ref<string[]>(frequenciesOptions.map((o) => o.value));
function toggleFrequency(val: string) {
  const idx = selectedFrequencies.value.indexOf(val);
  if (idx === -1) selectedFrequencies.value.push(val);
  else selectedFrequencies.value.splice(idx, 1);
}

// status chips
const statusOptions = [
  { label: t('CreatorSubscribers.status.active'), value: 'active' },
  { label: t('CreatorSubscribers.status.pending'), value: 'pending' },
];
const selectedStatuses = ref<string[]>(statusOptions.map((o) => o.value));
function toggleStatus(val: string) {
  const idx = selectedStatuses.value.indexOf(val);
  if (idx === -1) selectedStatuses.value.push(val);
  else selectedStatuses.value.splice(idx, 1);
}

// tier filter
const tierFilter = ref<string | null>(null);
const tierOptions = computed(() => {
  const map = new Map<string, string>();
  subscriptions.value.forEach((s) => map.set(s.tierId, s.tierName));
  return Array.from(map, ([value, label]) => ({ label, value }));
});

// sort select
const sortOptions = [
  { label: t('CreatorSubscribers.sort.newest'), value: 'newest' },
  { label: t('CreatorSubscribers.sort.amount'), value: 'amount' },
];
const sort = ref('newest');

const compact = ref(false);

// profile caching
const profileCache = new Map<string, Profile>();
const profileVersion = ref(0);
const pendingProfiles = new Set<string>();

function saveProfile(npub: string, profile: Profile) {
  profileCache.set(npub, profile);
  try {
    localStorage.setItem(npub, JSON.stringify(profile));
  } catch (e) {
    console.error(e);
  }
  profileVersion.value++;
}

function loadProfile(npub: string): Profile | undefined {
  const cached = profileCache.get(npub);
  if (cached) return cached;
  const stored = localStorage.getItem(npub);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Profile;
      profileCache.set(npub, parsed);
      return parsed;
    } catch (e) {
      console.error(e);
    }
  }
  return undefined;
}

function ensureProfile(npub: string) {
  if (loadProfile(npub) || pendingProfiles.has(npub)) return;
  pendingProfiles.add(npub);
  const schedule =
    typeof requestIdleCallback !== 'undefined'
      ? requestIdleCallback
      : (cb: any) => setTimeout(cb, 0);
  schedule(async () => {
    try {
      const profile = await useNostrStore().getProfile(npub);
      if (profile) saveProfile(npub, profile);
    } finally {
      pendingProfiles.delete(npub);
    }
  });
}

const profilesById = computed(() => {
  profileVersion.value;
  const map: Record<string, Profile | undefined> = {};
  subscriptions.value.forEach((s) => {
    const p = loadProfile(s.subscriberNpub);
    if (!p) ensureProfile(s.subscriberNpub);
    map[s.subscriptionId] = p;
  });
  return map;
});

function truncateNpub(npub: string) {
  return npub.slice(0, 8) + '...' + npub.slice(-4);
}

const displayName = computed(() => {
  const map: Record<string, string> = {};
  subscriptions.value.forEach((s) => {
    const p = profilesById.value[s.subscriptionId];
    let name = '';
    if (p?.display_name) name = p.display_name;
    else if (p?.name) name = p.name;
    else if ((p as any)?.displayName) name = (p as any).displayName;
    else if (p?.nip05) name = p.nip05.split('@')[0];
    else name = truncateNpub(s.subscriberNpub);
    map[s.subscriptionId] = name;
  });
  return map;
});

const nip05 = computed(() => {
  const map: Record<string, string> = {};
  subscriptions.value.forEach((s) => {
    const p = profilesById.value[s.subscriptionId];
    map[s.subscriptionId] = p?.nip05 || truncateNpub(s.subscriberNpub);
  });
  return map;
});

const lud16 = computed(() => {
  const map: Record<string, string> = {};
  subscriptions.value.forEach((s) => {
    const p = profilesById.value[s.subscriptionId];
    map[s.subscriptionId] = p?.lud16 || '';
  });
  return map;
});

const about = computed(() => {
  const map: Record<string, string> = {};
  subscriptions.value.forEach((s) => {
    const p = profilesById.value[s.subscriptionId];
    map[s.subscriptionId] = p?.about || '';
  });
  return map;
});

const avatar = computed(() => {
  const map: Record<string, string> = {};
  subscriptions.value.forEach((s) => {
    const p = profilesById.value[s.subscriptionId];
    map[s.subscriptionId] = (p as any)?.picture || '';
  });
  return map;
});

// KPI metrics
const total = computed(() => subscriptions.value.length);
const active = computed(() => subscriptions.value.filter((s) => s.status === 'active').length);
const pending = computed(() => subscriptions.value.filter((s) => s.status === 'pending').length);
const lifetimeRevenue = computed(() =>
  subscriptions.value.reduce((sum, s) => sum + s.totalAmount, 0),
);

const revenueToggle = ref<'week' | 'month'>('week');
const weekRevenue = computed(() => {
  const now = Date.now();
  const weekStart = now - 7 * 24 * 3600 * 1000;
  return subscriptions.value
    .filter((s) => (s.endDate ?? 0) * 1000 >= weekStart)
    .reduce((sum, s) => sum + s.totalAmount, 0);
});
const monthRevenue = computed(() => {
  const now = Date.now();
  const monthStart = now - 30 * 24 * 3600 * 1000;
  return subscriptions.value
    .filter((s) => (s.endDate ?? 0) * 1000 >= monthStart)
    .reduce((sum, s) => sum + s.totalAmount, 0);
});
const periodRevenue = computed(() =>
  revenueToggle.value === 'week' ? weekRevenue.value : monthRevenue.value,
);

// filtering and sorting
const filtered = computed(() => {
  let arr = subscriptions.value.slice();
  if (debouncedSearch.value) {
    const term = debouncedSearch.value.toLowerCase();
    arr = arr.filter(
      (s) =>
        s.subscriberNpub.toLowerCase().includes(term) ||
        s.tierName.toLowerCase().includes(term),
    );
  }
  arr = arr.filter((s) => selectedFrequencies.value.includes(s.frequency));
  arr = arr.filter((s) => selectedStatuses.value.includes(s.status));
  if (tierFilter.value) arr = arr.filter((s) => s.tierId === tierFilter.value);

  if (sort.value === 'amount') {
    arr.sort((a, b) => b.totalAmount - a.totalAmount);
  } else {
    arr.sort((a, b) => (b.startDate ?? 0) - (a.startDate ?? 0));
  }
  return {
    all: arr,
    weekly: arr.filter((s) => s.frequency === 'weekly'),
    biweekly: arr.filter((s) => s.frequency === 'biweekly'),
    monthly: arr.filter((s) => s.frequency === 'monthly'),
  };
});
const grouped = computed(() => ({
  weekly: filtered.value.weekly,
  biweekly: filtered.value.biweekly,
  monthly: filtered.value.monthly,
}));

function keyLabel(key: string) {
  const map: Record<string, string> = {
    weekly: t('CreatorSubscribers.frequency.weekly'),
    biweekly: t('CreatorSubscribers.frequency.biweekly'),
    monthly: t('CreatorSubscribers.frequency.monthly'),
  };
  return map[key] || key;
}

function exportCsv() {
  exportSubscribers(filtered.value.all, 'subscribers.csv');
}

// drawer
const drawer = ref(false);
const current = ref<CreatorSubscription | null>(null);
function openSubscriber(sub: CreatorSubscription) {
  current.value = sub;
  drawer.value = true;
}

function uiStatus(
  sub: CreatorSubscription,
): 'active' | 'pending' | 'ended' {
  if (sub.status === 'pending') return 'pending';
  const now = Date.now() / 1000;
  if (sub.endDate && sub.endDate < now) return 'ended';
  return 'active';
}

function nextIn(sub: CreatorSubscription): string {
  if (!sub.nextRenewal) return '—';
  const diff = sub.nextRenewal * 1000 - Date.now();
  if (diff <= 0) return '—';
  const day = 24 * 60 * 60 * 1000;
  const hour = 60 * 60 * 1000;
  const days = Math.floor(diff / day);
  const hours = Math.floor((diff % day) / hour);
  return `${days}d ${hours}h`;
}

function progress(sub: CreatorSubscription): number {
  if (!sub.nextRenewal) return 0;
  const end = sub.nextRenewal * 1000;
  const period = sub.intervalDays * 24 * 60 * 60 * 1000;
  const start = end - period;
  const now = Date.now();
  if (now <= start) return 0;
  if (now >= end) return 1;
  return (now - start) / period;
}

function amountPerInterval(sub: CreatorSubscription): string {
  if (sub.receivedPeriods > 0) {
    return formatCurrency(sub.totalAmount / sub.receivedPeriods);
  }
  return '—';
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(
    amount / 100,
  );
}
</script>
