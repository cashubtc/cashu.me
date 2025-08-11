<template>
  <div class="filter-chips row q-gutter-xs">
    <q-chip
      v-for="f in filters"
      :key="f.key"
      dense
      removable
      tabindex="0"
      class="filter-chip"
      :aria-label="`Filter: ${f.label}`"
      :remove-label="`Remove filter ${f.label}`"
      @remove="onRemove(f.key)"
    >
      {{ f.label }}
    </q-chip>
  </div>
</template>

<script setup lang="ts">
import { useSubscribersStore, type SortOption } from 'src/stores/subscribersStore';
import type { SubStatus } from 'src/types/subscriber';

defineProps<{ filters: { key: string; label: string }[] }>();

const emit = defineEmits<{ remove: [string] }>();
const store = useSubscribersStore();

function onRemove(key: string) {
  const statuses = new Set(store.status);
  const tiers = new Set(store.tier);
  let sort: SortOption = store.sort;

  if (key.startsWith('status-')) {
    statuses.delete(key.slice('status-'.length) as SubStatus);
  } else if (key.startsWith('tier-')) {
    tiers.delete(key.slice('tier-'.length));
  } else if (key === 'sort') {
    sort = 'next';
  }

  if (statuses.size || tiers.size || sort !== 'next') {
    store.applyFilters({ status: statuses, tier: tiers, sort });
  } else {
    store.clearFilters();
  }

  emit('remove', key);
}
</script>

<style scoped>
.filter-chip:focus-visible,
.filter-chip:focus-within {
  outline: 2px solid var(--q-primary);
  outline-offset: 2px;
}
</style>
