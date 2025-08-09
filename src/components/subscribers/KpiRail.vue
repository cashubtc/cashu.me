<template>
  <div class="row q-col-gutter-md">
    <div v-for="kpi in kpis" :key="kpi.label" class="col-12 col-sm-6 col-lg-3">
      <q-card v-if="!loading">
        <q-card-section>
          <div class="text-caption text-grey-5">{{ kpi.label }}</div>
          <div class="text-h5">{{ kpi.value }}</div>
          <div v-if="kpi.subValue" class="text-caption text-grey-6">{{ kpi.subValue }}</div>
        </q-card-section>
      </q-card>
      <q-skeleton v-else type="rect" height="80px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  totals?: any;
  activeCount?: number;
  pendingCount?: number;
  revenueLifetime?: number;
  revenueThisPeriod?: number;
  loading: boolean;
}>();

const kpis = computed(() => [
  { label: 'Total Subs', value: props.totals ?? 0 },
  { label: 'Active', value: props.activeCount ?? 0, subValue: `Pending ${props.pendingCount ?? 0}` },
  { label: 'Lifetime Revenue', value: `${props.revenueLifetime ?? 0} sat` },
  { label: 'Revenue This Period', value: `${props.revenueThisPeriod ?? 0} sat` },
]);
</script>
