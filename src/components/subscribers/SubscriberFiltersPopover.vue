<template>
  <q-menu
    ref="menu"
    anchor="bottom right"
    self="top right"
    transition-show="jump-down"
    transition-hide="jump-up"
  >
    <div class="q-pa-md" style="min-width: 200px">
      <div class="text-subtitle2 q-mb-sm">Status</div>
      <q-option-group v-model="localStatuses" :options="statusOptions" type="checkbox" />
      <div class="text-subtitle2 q-mt-md q-mb-sm">Tier</div>
      <q-option-group v-model="localTiers" :options="tierOptions" type="checkbox" />
      <div class="text-subtitle2 q-mt-md q-mb-sm">Sort</div>
      <q-option-group v-model="localSort" :options="sortOptions" type="radio" />
      <div class="row justify-end q-mt-md q-gutter-sm">
        <q-btn flat label="Clear" v-close-popup @click="clear" />
        <q-btn color="primary" label="Apply" v-close-popup @click="apply" />
      </div>
    </div>
  </q-menu>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCreatorSubscribersStore } from 'src/stores/creatorSubscribers';
import type { SubStatus } from 'src/types/subscriber';
import type { SortOption } from 'src/stores/creatorSubscribers';

const store = useCreatorSubscribersStore();

const menu = ref();
const localStatuses = ref<SubStatus[]>(Array.from(store.statuses));
const localTiers = ref<string[]>(Array.from(store.tiers));
const localSort = ref<SortOption>(store.sort);

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Ended', value: 'ended' }
];

const tierOptions = computed(() => {
  const map = new Map(store.subscribers.map(s => [s.tierId, s.tierName]));
  return Array.from(map, ([id, name]) => ({ label: name, value: id }));
});

const sortOptions = [
  { label: 'Next renewal', value: 'next' },
  { label: 'First seen', value: 'first' },
  { label: 'Lifetime sats', value: 'amount' }
];

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

function show(evt?: MouseEvent) {
  menu.value?.show(evt);
}

defineExpose({ show });
</script>
