<template>
  <q-page class="q-pa-md">
    <q-toolbar class="q-mb-md q-gutter-sm" style="flex-wrap: wrap">
      <q-btn
        flat
        round
        dense
        icon="arrow_back"
        @click="$router.go(-1)"
        aria-label="Go back"
        class="q-mr-sm"
      />
      <q-toolbar-title>My Subscribers ({{ count }})</q-toolbar-title>
      <q-space />
      <q-input
        v-model="filter"
        dense
        outlined
        debounce="300"
        clearable
        placeholder="Search"
        class="q-mr-sm"
        style="flex: 1 1 200px; max-width: 300px"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-btn
        flat
        color="primary"
        icon="filter_list"
        label="Filters"
        @click="showFilters = true"
      />
    </q-toolbar>
    <CreatorSubscribers
      v-model:filter="filter"
      v-model:showFilters="showFilters"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import CreatorSubscribers from 'components/CreatorSubscribers.vue';
import { useCreatorSubscriptionsStore } from 'stores/creatorSubscriptions';

const creatorSubscriptionsStore = useCreatorSubscriptionsStore();
const { subscriptions } = storeToRefs(creatorSubscriptionsStore);
const count = computed(() => subscriptions.value.length);

const filter = ref('');
const showFilters = ref(false);
</script>
