<template>
  <div class="q-mb-md">
    <div class="row q-gutter-sm q-mb-sm">
      <q-btn
        v-if="isSmallScreen"
        flat
        color="primary"
        icon="filter_list"
        label="Filters"
        @click="showFiltersModel = !showFiltersModel"
      />
      <q-btn
        flat
        color="primary"
        icon="download"
        :label="t('CreatorSubscribers.actions.downloadCsv')"
        @click="$emit('downloadCsv')"
      />
    </div>
    <q-slide-transition>
      <div v-show="!isSmallScreen || showFiltersModel" class="row q-gutter-sm">
        <q-input
          v-model="filterModel"
          dense
          outlined
          debounce="300"
          clearable
          :placeholder="t('CreatorSubscribers.filter.placeholder')"
          class="col"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-select
          v-model="tierFilterModel"
          :options="tierOptions"
          dense
          outlined
          clearable
          emit-value
          map-options
          :label="t('CreatorSubscribers.columns.tier')"
          class="col-3"
        />
        <q-select
          v-model="statusFilterModel"
          :options="statusOptions"
          dense
          outlined
          clearable
          :label="t('CreatorSubscribers.columns.status')"
          class="col-3"
        />
        <q-input
          v-model="startFromModel"
          type="date"
          dense
          outlined
          clearable
          :label="t('CreatorSubscribers.filter.startFrom')"
          class="col-3"
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
          class="col-3"
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
          class="col-3"
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
          class="col-3"
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
          class="col-3"
        >
          <q-tooltip>{{ t('CreatorSubscribers.monthsRemainingTooltip') }}</q-tooltip>
        </q-input>
      </div>
    </q-slide-transition>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  filter: string;
  tierFilter: string | null;
  statusFilter: string | null;
  startFrom: string | null;
  startTo: string | null;
  nextRenewalFrom: string | null;
  nextRenewalTo: string | null;
  monthsRemaining: number | null;
  tierOptions: { label: string; value: string }[];
  statusOptions: { label: string; value: string }[];
  isSmallScreen: boolean;
  showFilters: boolean;
}>();

const emit = defineEmits([
  'update:filter',
  'update:tierFilter',
  'update:statusFilter',
  'update:startFrom',
  'update:startTo',
  'update:nextRenewalFrom',
  'update:nextRenewalTo',
  'update:monthsRemaining',
  'update:showFilters',
  'downloadCsv',
]);

const {
  tierOptions,
  statusOptions,
  isSmallScreen,
} = toRefs(props);

const filterModel = computed({
  get: () => props.filter,
  set: (val: string) => emit('update:filter', val),
});
const tierFilterModel = computed({
  get: () => props.tierFilter,
  set: (val: string | null) => emit('update:tierFilter', val),
});
const statusFilterModel = computed({
  get: () => props.statusFilter,
  set: (val: string | null) => emit('update:statusFilter', val),
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

const { t } = useI18n();
</script>
