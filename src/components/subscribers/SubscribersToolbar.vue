<template>
  <div class="subscribers-toolbar">
    <q-toolbar>
      <!-- Left section -->
      <div class="row items-center q-gutter-sm">
        <div class="text-h6">
          Subscribers ({{ total }})
        </div>
        <q-select
          v-model="modelDateRange"
          :options="dateOptions"
          dense
          outlined
          class="q-ml-sm"
        />
      </div>

      <q-space />

      <!-- Center section -->
      <div class="row items-center q-gutter-sm">
        <q-input
          ref="searchRef"
          v-model="modelSearch"
          dense
          outlined
          debounce="250"
          placeholder="Search"
        />
        <FilterChips :filters="filters" />
      </div>

      <q-space />

      <!-- Right section -->
      <div class="row items-center q-gutter-sm">
        <DisplayMenu :columns="columns" />
        <q-select
          v-model="modelSavedView"
          :options="savedViews"
          dense
          outlined
          placeholder="Saved Views"
        />
        <q-btn
          ref="exportBtn"
          color="primary"
          icon="download"
          label="Export"
          @click="emit('export')"
        />
      </div>
    </q-toolbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import FilterChips from './FilterChips.vue';
import DisplayMenu from '../common/DisplayMenu.vue';

const props = withDefaults(defineProps<{
  total: number;
  dateRange: string;
  search: string;
  savedView: string;
  savedViews: { label: string; value: string }[];
  filters: { key: string; label: string }[];
  columns?: { name: string; label: string }[];
}>(), {
  columns: () => [],
});

const emit = defineEmits<{
  'update:dateRange': [string];
  'update:search': [string];
  'update:savedView': [string];
  'open-filters': [];
  export: [];
}>();

const dateOptions = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
];

const modelDateRange = computed({
  get: () => props.dateRange,
  set: (val: string) => emit('update:dateRange', val),
});

const modelSearch = computed({
  get: () => props.search,
  set: (val: string) => emit('update:search', val),
});

const modelSavedView = computed({
  get: () => props.savedView,
  set: (val: string) => emit('update:savedView', val),
});

const searchRef = ref<{ focus: () => void } | null>(null);

function handleKey(event: KeyboardEvent) {
  const tag = (event.target as HTMLElement).tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;

  if (event.key === '/') {
    event.preventDefault();
    searchRef.value?.focus();
  } else if (event.key === 'f') {
    event.preventDefault();
    emit('open-filters');
  } else if (event.key === 'e') {
    event.preventDefault();
    emit('export');
  }
}

onMounted(() => document.addEventListener('keydown', handleKey));
onBeforeUnmount(() => document.removeEventListener('keydown', handleKey));
</script>
