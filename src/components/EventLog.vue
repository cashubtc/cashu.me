<template>
  <q-scroll-area style="max-height: 200px">
    <q-list dense>
      <q-item v-for="e in events" :key="e.id">
        <q-item-section>{{ e.id }}</q-item-section>
        <q-item-section side>{{ formatDate(e.created_at) }}</q-item-section>
      </q-item>
    </q-list>
  </q-scroll-area>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useNostrStore } from 'src/stores/nostr';

const nostr = useNostrStore();
const events = computed(() => nostr.nip17EventIdsWeHaveSeen);
const formatDate = (ts: number) => new Date(ts * 1000).toLocaleString();
</script>
