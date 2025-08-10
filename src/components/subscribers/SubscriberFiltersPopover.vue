<template>
  <q-menu
    ref="menu"
    anchor="bottom left"
    self="top left"
    transition-show="jump-down"
    transition-hide="jump-up"
  >
    <div class="q-pa-md" style="min-width: 200px">
      <div class="text-subtitle2 q-mb-sm">
        {{ t('CreatorSubscribers.filters.status') }}
      </div>
      <q-option-group v-model="localStatuses" :options="statusOptions" type="checkbox" />
      <div class="text-subtitle2 q-mt-md q-mb-sm">
        {{ t('CreatorSubscribers.filters.tier') }}
      </div>
      <q-option-group v-model="localTiers" :options="tierOptions" type="checkbox" />
      <div class="text-subtitle2 q-mt-md q-mb-sm">
        {{ t('CreatorSubscribers.filters.sort') }}
      </div>
      <q-option-group v-model="localSort" :options="sortOptions" type="radio" />
      <div class="row justify-end q-mt-md q-gutter-sm">
        <q-btn flat :label="t('CreatorSubscribers.filters.clear')" v-close-popup @click="clear" />
        <q-btn color="primary" :label="t('CreatorSubscribers.filters.apply')" v-close-popup @click="apply" />
      </div>
    </div>
  </q-menu>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCreatorSubscribersStore } from 'src/stores/creatorSubscribers';
import type { SubStatus } from 'src/types/subscriber';
import type { SortOption } from 'src/stores/creatorSubscribers';
import { useI18n } from 'vue-i18n';

const store = useCreatorSubscribersStore();

const menu = ref();
const localStatuses = ref<SubStatus[]>(Array.from(store.statuses));
const localTiers = ref<string[]>(Array.from(store.tiers));
const localSort = ref<SortOption>(store.sort);

const { t } = useI18n();

const statusOptions = computed(() => [
  { label: t('CreatorSubscribers.status.active'), value: 'active' },
  { label: t('CreatorSubscribers.status.pending'), value: 'pending' },
  { label: t('CreatorSubscribers.status.ended'), value: 'ended' },
]);

const tierOptions = computed(() => {
  const map = new Map(store.subscribers.map(s => [s.tierId, s.tierName]));
  return Array.from(map, ([id, name]) => ({ label: name, value: id }));
});

const sortOptions = computed(() => [
  {
    label: t('CreatorSubscribers.filters.sortOptions.next'),
    value: 'next',
  },
  {
    label: t('CreatorSubscribers.filters.sortOptions.first'),
    value: 'first',
  },
  {
    label: t('CreatorSubscribers.filters.sortOptions.amount'),
    value: 'amount',
  },
]);

function apply() {
  store.applyFilters({
    statuses: new Set(localStatuses.value),
    tiers: new Set(localTiers.value),
    sort: localSort.value
  });
}

function clear() {
  localStatuses.value = [];
  localTiers.value = [];
  localSort.value = 'next';
  store.clearFilters();
}

function show() {
  menu.value?.show();
}

defineExpose({ show });
</script>
