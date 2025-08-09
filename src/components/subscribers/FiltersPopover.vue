<template>
  <q-btn icon="tune" label="Filters" flat>
    <q-menu anchor="bottom right" self="top right">
      <div class="q-pa-md" style="width: 300px">
        <div class="text-subtitle2 q-mb-sm">Tiers</div>
        <q-select
          multiple
          chips
          dense
          :options="tierOptions"
          :model-value="modelValue.tiers"
          @update:model-value="emit('update:modelValue', { ...modelValue, tiers: $event })"
        />

        <div class="text-subtitle2 q-mt-md q-mb-sm">Status</div>
        <q-option-group
          type="checkbox"
          dense
          :options="statusOptions"
          :model-value="modelValue.statuses"
          @update:model-value="emit('update:modelValue', { ...modelValue, statuses: $event })"
        />

        <div class="text-subtitle2 q-mt-md q-mb-sm">Sort</div>
        <q-select
          dense
          emit-value
          map-options
          :options="sortOptions"
          :model-value="modelValue.sortKey"
          @update:model-value="emit('update:modelValue', { ...modelValue, sortKey: $event })"
        />

        <div class="row q-mt-md">
          <q-space />
          <q-btn flat dense @click="emit('reset')">Reset</q-btn>
        </div>
      </div>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import type { Status } from 'src/stores/creatorSubscriptions';

interface Filters {
  tiers: string[];
  statuses: Status[];
  sortKey: 'nextRenewal' | 'lifetime' | 'amountPerInterval' | 'startDate';
}

defineProps<{
  modelValue: Filters,
  tierOptions: string[],
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: Filters): void;
  (e: 'reset'): void;
}>();

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Ended', value: 'ended' },
];

const sortOptions = [
  { label: 'Next renewal', value: 'nextRenewal' },
  { label: 'Lifetime SATS', value: 'lifetime' },
  { label: 'Amount per interval', value: 'amountPerInterval' },
  { label: 'Start date', value: 'startDate' },
];
</script>
