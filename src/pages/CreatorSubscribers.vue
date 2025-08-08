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
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KpiCard
          :title="t('CreatorSubscribers.summary.subscribers')"
          :value="total"
        />
        <KpiCard
          :title="t('CreatorSubscribers.summary.active')"
          :value="active"
          :diff="pending"
        />
        <KpiCard
          :title="t('CreatorSubscribers.summary.revenue')"
          :value="formatCurrency(lifetimeRevenue)"
        >
          <Sparkline :data="lifetimeTrend" />
        </KpiCard>
        <KpiCard
          :title="t('CreatorSubscribers.summary.thisPeriod')"
          :value="formatCurrency(periodRevenue)"
        >
          <template #caption>
            <q-btn-group dense>
              <q-btn
                size="sm"
                flat
                :color="revenueToggle === 'week' ? 'primary' : 'grey-6'"
                @click="revenueToggle = 'week'"
              >
                {{ t('CreatorSubscribers.summary.thisWeek') }}
              </q-btn>
              <q-btn
                size="sm"
                flat
                :color="revenueToggle === 'month' ? 'primary' : 'grey-6'"
                @click="revenueToggle = 'month'"
              >
                {{ t('CreatorSubscribers.summary.thisMonth') }}
              </q-btn>
            </q-btn-group>
          </template>
        </KpiCard>
      </div>

      <SubscriptionsCharts :rows="rows" class="mb-6" />

      <!-- toolbar -->
      <div class="flex flex-wrap items-center gap-2 mb-6">
        <q-input
          v-model="search"
          dense
          clearable
          debounce="200"
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
            color="primary"
            :text-color="selectedFrequencies.includes(f.value) ? 'white' : 'primary'"
            :outline="!selectedFrequencies.includes(f.value)"
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
            color="primary"
            :text-color="selectedStatus === s.value ? 'white' : 'primary'"
            :outline="selectedStatus !== s.value"
            @click="selectedStatus = s.value"
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

        <q-btn flat icon="download" :disable="rows.length === 0" @click="exportCsv" />
      </div>

      <!-- grouped sections -->
      <div v-for="(list, key) in grouped" :key="key" class="mb-8">
        <h6 class="q-my-md">{{ keyLabel(key) }}</h6>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SubscriberCard
            v-for="item in list"
            :key="item.subscriptionId"
            :sub="item"
            :profile="profilesById[item.subscriptionId]"
            :compact="compact"
            @select="selectSubscriber(item)"
            @open="openSubscriber(item)"
          />
        </div>
      </div>

      <SubscriberDrawer
        v-if="current"
        v-model="drawer"
        :sub="current"
        :profile="currentProfile"
      />
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import SubscriberCard from 'components/subscribers/SubscriberCard.vue';
import SubscriberDrawer from 'components/subscribers/SubscriberDrawer.vue';
import KpiCard from 'components/subscribers/KpiCard.vue';
import Sparkline from 'components/subscribers/Sparkline.vue';
import SubscriptionsCharts from 'components/subscribers/SubscriptionsCharts.vue';
import { useCreatorSubscriptionsStore, type CreatorSubscription } from 'stores/creatorSubscriptions';
import { downloadCsv } from 'src/utils/subscriberCsv';
import type { NDKUserProfile as Profile } from '@nostr-dev-kit/ndk';
import { useNostrProfiles } from 'src/composables/useNostrProfiles';
import { daysToFrequency } from 'src/constants/subscriptionFrequency';

const { t } = useI18n();
const creatorSubscriptionsStore = useCreatorSubscriptionsStore();
const { subscriptions, loading } = storeToRefs(creatorSubscriptionsStore);

// search term
const search = ref('');

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
  { label: t('CreatorSubscribers.status.any'), value: 'any' },
  { label: t('CreatorSubscribers.status.active'), value: 'active' },
  { label: t('CreatorSubscribers.status.pending'), value: 'pending' },
  { label: t('CreatorSubscribers.status.ended'), value: 'ended' },
];
const selectedStatus = ref<'any' | 'active' | 'pending' | 'ended'>('any');

// tier filter
const tierFilter = ref<string | null>(null);
const tierOptions = computed(() => {
  const map = new Map<string, string>();
  subscriptions.value.forEach((s) => map.set(s.tierId, s.tierName));
  return Array.from(map, ([value, label]) => ({ label, value }));
});

// sort select
const sortOptions = [
  { label: t('CreatorSubscribers.sort.next'), value: 'next' },
  { label: t('CreatorSubscribers.sort.first'), value: 'first' },
  { label: t('CreatorSubscribers.sort.amount'), value: 'amount' },
];
const sort = ref('next');

const compact = ref(false);

const profiles = useNostrProfiles();
const profilesById = computed(() => {
  const map: Record<string, Profile | undefined> = {};
  subscriptions.value.forEach((s) => {
    map[s.subscriptionId] = profiles.get(s.subscriberNpub);
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
const active = computed(() => subscriptions.value.filter((s) => uiStatus(s) === 'active').length);
const pending = computed(() => subscriptions.value.filter((s) => uiStatus(s) === 'pending').length);
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

const lifetimeTrend = computed(() => [0, lifetimeRevenue.value]);

// filtering and sorting
const filtered = computed(() => {
  let arr = subscriptions.value.slice();
  if (search.value) {
    const term = search.value.toLowerCase();
    arr = arr.filter((s) => {
      const name = displayName.value[s.subscriptionId]?.toLowerCase() || '';
      const npub = s.subscriberNpub.toLowerCase();
      const nip = nip05.value[s.subscriptionId]?.toLowerCase() || '';
      return (
        name.includes(term) ||
        npub.includes(term) ||
        nip.includes(term)
      );
    });
  }
  arr = arr.filter((s) => selectedFrequencies.value.includes(freqKey(s)));
  if (selectedStatus.value !== 'any') {
    arr = arr.filter((s) => uiStatus(s) === selectedStatus.value);
  }
  if (tierFilter.value) arr = arr.filter((s) => s.tierId === tierFilter.value);

  if (sort.value === 'amount') {
    arr.sort((a, b) => b.totalAmount - a.totalAmount);
  } else if (sort.value === 'first') {
    arr.sort((a, b) => (a.startDate ?? 0) - (b.startDate ?? 0));
  } else {
    arr.sort((a, b) => (a.nextRenewal ?? 0) - (b.nextRenewal ?? 0));
  }
  return arr;
});
const grouped = computed(() => {
  const groups: Record<'weekly' | 'biweekly' | 'monthly', CreatorSubscription[]> = {
    weekly: [],
    biweekly: [],
    monthly: [],
  };
  filtered.value.forEach((s) => {
    groups[freqKey(s)].push(s);
  });
  return groups;
});

const rows = filtered;

function keyLabel(key: string) {
  const map: Record<string, string> = {
    weekly: t('CreatorSubscribers.frequency.weekly'),
    biweekly: t('CreatorSubscribers.frequency.biweekly'),
    monthly: t('CreatorSubscribers.frequency.monthly'),
  };
  return map[key] || key;
}

function exportCsv() {
  const rows = filtered.value.map((s) => ({
    ...s,
    npub: s.subscriberNpub,
    displayName: displayName.value[s.subscriptionId],
    nip05: nip05.value[s.subscriptionId],
    lud16: lud16.value[s.subscriptionId],
    tier: s.tierName,
  }));
  downloadCsv(rows);
}

// drawer
const drawer = ref(false);
const current = ref<CreatorSubscription | null>(null);
const currentProfile = computed(() =>
  current.value ? profilesById.value[current.value.subscriptionId] : undefined,
);
function selectSubscriber(sub: CreatorSubscription) {
  current.value = sub;
}
function openSubscriber(sub: CreatorSubscription) {
  current.value = sub;
  drawer.value = true;
}

function freqKey(sub: CreatorSubscription): 'weekly' | 'biweekly' | 'monthly' {
  return daysToFrequency(sub.intervalDays || 30);
}

function uiStatus(
  sub: CreatorSubscription,
): 'active' | 'pending' | 'ended' {
  const now = Date.now() / 1000;
  if (sub.startDate && sub.startDate > now) return 'pending';
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
