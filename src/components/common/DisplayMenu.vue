<template>
  <q-btn-dropdown :flat="flat" :icon="icon" :label="label" dense>
    <q-list class="display-menu" style="min-width: 200px">
      <q-item>
        <q-item-section>
          <div class="q-mb-sm">View Mode</div>
          <q-btn-toggle
            v-model="viewMode"
            dense
            toggle-color="primary"
            :options="viewOptions"
          />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <div class="q-mb-sm">Density</div>
          <q-btn-toggle
            v-model="density"
            dense
            toggle-color="primary"
            :options="densityOptions"
          />
        </q-item-section>
      </q-item>
      <template v-if="columns.length">
        <q-separator />
        <q-item-label header>Visible Columns</q-item-label>
        <q-item
          v-for="col in columns"
          :key="col.name"
          clickable
          class="column-item"
          tabindex="0"
          @click="onToggleColumn(col.name)"
          @keyup.enter.prevent="onToggleColumn(col.name)"
          @keyup.space.prevent="onToggleColumn(col.name)"
        >
          <q-item-section avatar>
            <q-checkbox
              :model-value="store.visibleColumns.includes(col.name)"
              @click.stop="onToggleColumn(col.name)"
            />
          </q-item-section>
          <q-item-section>{{ col.label }}</q-item-section>
        </q-item>
      </template>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSubscribersStore } from "src/stores/subscribersStore";

interface Column {
  name: string;
  label: string;
}

const props = withDefaults(
  defineProps<{
    columns?: Column[];
    label?: string;
    flat?: boolean;
    icon?: string;
  }>(),
  {
    columns: () => [],
    label: "Display",
    flat: true,
    icon: "view_module",
  }
);

const emit = defineEmits<{
  "update:viewMode": ["table" | "card"];
  "update:density": ["comfortable" | "compact"];
  "update:visibleColumns": [string[]];
}>();

const store = useSubscribersStore();

if (store.visibleColumns.length === 0 && props.columns.length) {
  store.visibleColumns.push(...props.columns.map((c) => c.name));
}

const viewMode = computed({
  get: () => store.viewMode,
  set: (val: "table" | "card") => {
    store.setViewMode(val);
    emit("update:viewMode", val);
  },
});

const density = computed({
  get: () => store.density,
  set: (val: "comfortable" | "compact") => {
    store.setDensity(val);
    emit("update:density", val);
  },
});

function onToggleColumn(name: string) {
  store.toggleColumn(name);
  emit("update:visibleColumns", store.visibleColumns);
}

const viewOptions = [
  { label: "Table", value: "table" },
  { label: "Card", value: "card" },
];

const densityOptions = [
  { label: "Comfortable", value: "comfortable" },
  { label: "Compact", value: "compact" },
];
</script>

<style scoped>
.column-item:focus-visible {
  outline: 2px solid var(--q-primary);
  outline-offset: 2px;
}
</style>
