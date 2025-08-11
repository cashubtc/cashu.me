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
        <q-btn-dropdown
          v-if="views.length > 0"
          dense
          outline
          label="Saved Views"
          class="q-ml-sm"
        >
          <q-list style="min-width: 200px" class="card-bg">
            <q-item
              v-for="v in views"
              :key="v.id"
              clickable
              v-close-popup
              @click="apply(v.id)"
            >
              <q-item-section>{{ v.name }}</q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  dense
                  icon="delete"
                  @click.stop="remove(v.id)"
                />
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="saveCurrent">
              <q-item-section>Save current as…</q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              :disable="!store.activeViewId"
              @click="setDefault"
            >
              <q-item-section>Set as default</q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              :disable="!store.activeViewId"
              @click="resetLast"
            >
              <q-item-section>Reset to Last Used</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
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
import { useSubscribersStore } from 'src/stores/subscribersStore';

const props = withDefaults(defineProps<{
  total: number;
  dateRange: string;
  search: string;
  filters: { key: string; label: string }[];
  columns?: { name: string; label: string }[];
}>(), {
  columns: () => [],
});

const emit = defineEmits<{
  'update:dateRange': [string];
  'update:search': [string];
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

const searchRef = ref<{ focus: () => void } | null>(null);

const store = useSubscribersStore();
const views = computed(() => store.savedViews);

function saveCurrent() {
  const name = window.prompt('View name?');
  if (name) {
    store.saveCurrentView(name);
  }
}

function apply(id: string) {
  store.applyView(id);
}

function remove(id: string) {
  store.deleteView(id);
}

function setDefault() {
  store.savePrefs();
}

function resetLast() {
  if (store.activeViewId) {
    store.applyView(store.activeViewId);
  }
}

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
