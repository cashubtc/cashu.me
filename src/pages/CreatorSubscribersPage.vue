<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <q-btn
        flat
        round
        dense
        icon="arrow_back"
        @click="$router.go(-1)"
        aria-label="Go back"
        class="q-mr-sm"
      />
      <h5 class="q-my-none">My Subscribers ({{ count }})</h5>
    </div>
    <CreatorSubscribers />
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import CreatorSubscribers from 'components/CreatorSubscribers.vue';
import { useCreatorSubscriptionsStore } from 'stores/creatorSubscriptions';

const creatorSubscriptionsStore = useCreatorSubscriptionsStore();
const { subscriptions } = storeToRefs(creatorSubscriptionsStore);
const count = computed(() => subscriptions.value.length);
</script>
