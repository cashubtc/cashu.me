<template>
  <div class="q-pa-md" style="min-width: 200px">
    <div class="text-subtitle2 q-mb-sm">
      {{ t("CreatorSubscribers.filters.status") }}
    </div>
    <q-option-group
      v-model="localStatuses"
      :options="statusOptions"
      type="checkbox"
    />
    <div class="text-subtitle2 q-mt-md q-mb-sm">
      {{ t("CreatorSubscribers.filters.tier") }}
    </div>
    <q-option-group
      v-model="localTiers"
      :options="tierOptions"
      type="checkbox"
    />
    <div class="text-subtitle2 q-mt-md q-mb-sm">
      {{ t("CreatorSubscribers.filters.sort") }}
    </div>
    <q-option-group v-model="localSort" :options="sortOptions" type="radio" />
    <div class="row justify-end q-mt-md q-gutter-sm">
      <q-btn
        flat
        :label="t('CreatorSubscribers.filters.clear')"
        @click="clear"
        v-close-popup
      />
      <q-btn
        color="primary"
        :label="t('CreatorSubscribers.filters.apply')"
        @click="apply"
        v-close-popup
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useCreatorSubscribersStore } from "src/stores/creatorSubscribers";
import {
  useSubscribersStore,
  type SortOption,
} from "src/stores/subscribersStore";
import type { SubStatus } from "src/types/subscriber";
import { useI18n } from "vue-i18n";

const dataStore = useCreatorSubscribersStore();
const store = useSubscribersStore();

const localStatuses = ref<SubStatus[]>(Array.from(store.status));
const localTiers = ref<string[]>(Array.from(store.tier));
const localSort = ref<SortOption>(store.sort);

const { t } = useI18n();

const statusOptions = computed(() => [
  { label: t("CreatorSubscribers.status.active"), value: "active" },
  { label: t("CreatorSubscribers.status.pending"), value: "pending" },
  { label: t("CreatorSubscribers.status.ended"), value: "ended" },
]);

const tierOptions = computed(() => {
  const map = new Map(dataStore.subscribers.map((s) => [s.tierId, s.tierName]));
  return Array.from(map, ([id, name]) => ({ label: name, value: id }));
});

const sortOptions = computed(() => [
  {
    label: t("CreatorSubscribers.filters.sortOptions.next"),
    value: "next",
  },
  {
    label: t("CreatorSubscribers.filters.sortOptions.first"),
    value: "first",
  },
  {
    label: t("CreatorSubscribers.filters.sortOptions.amount"),
    value: "amount",
  },
]);

watch(
  () => Array.from(store.status),
  (v) => {
    localStatuses.value = v as SubStatus[];
  }
);
watch(
  () => Array.from(store.tier),
  (v) => {
    localTiers.value = v as string[];
  }
);
watch(
  () => store.sort,
  (v) => {
    localSort.value = v;
  }
);

function apply() {
  store.applyFilters({
    status: new Set(localStatuses.value),
    tier: new Set(localTiers.value),
    sort: localSort.value,
  });
}

function clear() {
  localStatuses.value = [];
  localTiers.value = [];
  localSort.value = "next";
  store.clearFilters();
}
</script>
