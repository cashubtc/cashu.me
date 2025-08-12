<template>
  <div class="buckets-toolbar row items-center q-gutter-sm q-mb-md">
    <q-input
      v-model="modelSearch"
      dense
      outlined
      placeholder="Search"
      class="bg-slate-800"
    />
    <q-btn-toggle
      v-model="modelViewMode"
      dense
      rounded
      unelevated
      toggle-color="primary"
      color="grey-9"
      text-color="white"
      :options="[
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
      ]"
    />
    <q-select
      v-model="modelSort"
      dense
      outlined
      class="bg-slate-800"
      :options="[
        { label: 'Name', value: 'name' },
        { label: 'Balance', value: 'balance' },
      ]"
    />
    <q-space />
    <q-btn color="primary" label="Move Tokens" @click="emit('move-tokens')" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  search: string;
  viewMode: string;
  sort: string;
}>();

const emit = defineEmits<{
  "update:search": [string];
  "update:viewMode": [string];
  "update:sort": [string];
  "move-tokens": [];
}>();

const modelSearch = computed({
  get: () => props.search,
  set: (val: string) => emit("update:search", val),
});
const modelViewMode = computed({
  get: () => props.viewMode,
  set: (val: string) => emit("update:viewMode", val),
});
const modelSort = computed({
  get: () => props.sort,
  set: (val: string) => emit("update:sort", val),
});
</script>

<style scoped>
.buckets-toolbar {
  position: sticky;
  top: 56px;
  z-index: 10;
  background-color: #111827;
  padding: 8px;
}
</style>
