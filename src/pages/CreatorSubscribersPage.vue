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
      <h5 class="q-my-none">My Subscribers</h5>
    </div>
    <CreatorSubscribers />
  </q-page>
</template>

<script setup lang="ts">
import CreatorSubscribers from 'components/CreatorSubscribers.vue';
</script>
