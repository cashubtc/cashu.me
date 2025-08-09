<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-gutter-sm q-mb-md">
      <q-input dense v-model="search" placeholder="Search" clearable @update:model-value="onSearch" />
      <q-btn flat icon="filter_list" @click="filters?.show()" />
    </div>
    <q-tabs v-model="activeTab" dense class="text-grey-7" active-color="primary" indicator-color="primary">
      <q-tab name="all" :label="`All (${counts.all})`" />
      <q-tab name="weekly" :label="`Weekly (${counts.weekly})`" />
      <q-tab name="biweekly" :label="`Bi-weekly (${counts.biweekly})`" />
      <q-tab name="monthly" :label="`Monthly (${counts.monthly})`" />
      <q-tab name="pending" :label="`Pending (${counts.pending})`" />
      <q-tab name="ended" :label="`Ended (${counts.ended})`" />
    </q-tabs>
    <div class="q-mt-md">
      <div v-for="s in filtered" :key="s.id" class="q-pa-sm">
        {{ s.name }} - {{ s.tierName }}
      </div>
    </div>
    <SubscriberFiltersPopover ref="filters" />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import SubscriberFiltersPopover from 'src/components/subscribers/SubscriberFiltersPopover.vue';
import { useCreatorSubscribersStore } from 'src/stores/creatorSubscribers';

const store = useCreatorSubscribersStore();
const { filtered, counts, activeTab } = storeToRefs(store);

const search = ref(store.query);
const filters = ref<InstanceType<typeof SubscriberFiltersPopover> | null>(null);

const onSearch = useDebounceFn((val: string) => {
  store.setQuery(val);
}, 220);
</script>
