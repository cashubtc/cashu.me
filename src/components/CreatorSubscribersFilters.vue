<template>
  <q-dialog v-model="showFiltersModel" position="right" :maximized="isSmallScreen">
    <q-card style="min-width: 250px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Filters</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section class="column q-gutter-sm">
        <q-select
          v-model="tierFilterModel"
          :options="tierOptions"
          dense
          outlined
          clearable
          emit-value
          map-options
          :label="t('CreatorSubscribers.columns.tier')"
        />
        <q-select
          v-model="statusFilterModel"
          :options="statusOptions"
          dense
          outlined
          clearable
          :label="t('CreatorSubscribers.columns.status')"
        />
        <q-select
          v-model="frequencyFilterModel"
          :options="frequencyOptions"
          dense
          outlined
          clearable
          emit-value
          map-options
          :label="t('CreatorSubscribers.filter.frequency')"
        />
        <q-input
          v-model="startFromModel"
          type="date"
          dense
          outlined
          clearable
          :label="t('CreatorSubscribers.filter.startFrom')"
        >
          <q-tooltip>{{ t('CreatorSubscribers.startTooltip') }}</q-tooltip>
        </q-input>
        <q-input
          v-model="startToModel"
          type="date"
          dense
          outlined
          clearable
          :label="t('CreatorSubscribers.filter.startTo')"
        >
          <q-tooltip>{{ t('CreatorSubscribers.startTooltip') }}</q-tooltip>
        </q-input>
        <q-input
          v-model="nextRenewalFromModel"
          type="date"
          dense
          outlined
          clearable
          :label="t('CreatorSubscribers.filter.nextRenewalFrom')"
        >
          <q-tooltip>{{ t('CreatorSubscribers.nextRenewalTooltip') }}</q-tooltip>
        </q-input>
        <q-input
          v-model="nextRenewalToModel"
          type="date"
          dense
          outlined
          clearable
          :label="t('CreatorSubscribers.filter.nextRenewalTo')"
        >
          <q-tooltip>{{ t('CreatorSubscribers.nextRenewalTooltip') }}</q-tooltip>
        </q-input>
        <q-input
          v-model.number="monthsRemainingModel"
          type="number"
          dense
          outlined
          clearable
          :label="t('CreatorSubscribers.filter.monthsRemaining')"
        >
          <q-tooltip>{{ t('CreatorSubscribers.monthsRemainingTooltip') }}</q-tooltip>
        </q-input>
        <q-btn
          flat
          color="primary"
          icon="download"
          :label="t('CreatorSubscribers.actions.downloadCsv')"
          @click="$emit('downloadCsv')"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  tierFilter: string | null;
  statusFilter: string | null;
  startFrom: string | null;
  startTo: string | null;
  nextRenewalFrom: string | null;
  nextRenewalTo: string | null;
  monthsRemaining: number | null;
  frequencyFilter: string | null;
  tierOptions: { label: string; value: string }[];
  statusOptions: { label: string; value: string }[];
  isSmallScreen: boolean;
  showFilters: boolean;
}>();

const emit = defineEmits([
  'update:tierFilter',
  'update:statusFilter',
  'update:startFrom',
  'update:startTo',
  'update:nextRenewalFrom',
  'update:nextRenewalTo',
  'update:monthsRemaining',
  'update:frequencyFilter',
  'update:showFilters',
  'downloadCsv',
]);

const {
  tierOptions,
  statusOptions,
  isSmallScreen,
} = toRefs(props);

const tierFilterModel = computed({
  get: () => props.tierFilter,
  set: (val: string | null) => emit('update:tierFilter', val),
});
const statusFilterModel = computed({
  get: () => props.statusFilter,
  set: (val: string | null) => emit('update:statusFilter', val),
});
const frequencyFilterModel = computed({
  get: () => props.frequencyFilter,
  set: (val: string | null) => emit('update:frequencyFilter', val),
});
const startFromModel = computed({
  get: () => props.startFrom,
  set: (val: string | null) => emit('update:startFrom', val),
});
const startToModel = computed({
  get: () => props.startTo,
  set: (val: string | null) => emit('update:startTo', val),
});
const nextRenewalFromModel = computed({
  get: () => props.nextRenewalFrom,
  set: (val: string | null) => emit('update:nextRenewalFrom', val),
});
const nextRenewalToModel = computed({
  get: () => props.nextRenewalTo,
  set: (val: string | null) => emit('update:nextRenewalTo', val),
});
const monthsRemainingModel = computed({
  get: () => props.monthsRemaining,
  set: (val: number | null) => emit('update:monthsRemaining', val),
});
const showFiltersModel = computed({
  get: () => props.showFilters,
  set: (val: boolean) => emit('update:showFilters', val),
});

const frequencyOptions = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Twice Monthly', value: 'biweekly' },
  { label: 'Monthly', value: 'monthly' },
];

const { t } = useI18n();
</script>

