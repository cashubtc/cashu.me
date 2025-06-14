<template>
  <q-scroll-area style="max-height: 200px">
    <q-list dense>
      <q-item v-for="e in events" :key="e.id">
        <q-item-section>
          <q-icon
            v-if="e.outgoing !== undefined"
            :name="e.outgoing ? 'north_east' : 'south_west'"
            size="xs"
            class="q-mr-sm"
          />
          {{ e.id }}
        </q-item-section>
        <q-item-section side>{{ formatDate(e.created_at) }}</q-item-section>
      </q-item>
    </q-list>
  </q-scroll-area>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useNostrStore } from "src/stores/nostr";

interface LogEvent {
  id: string;
  created_at: number;
  outgoing?: boolean;
}

const props = defineProps<{ events?: LogEvent[] }>();

const nostr = useNostrStore();
const defaultEvents = computed(() => nostr.nip17EventIdsWeHaveSeen);
const events = computed(() => props.events ?? defaultEvents.value);
const formatDate = (ts: number) => new Date(ts * 1000).toLocaleString();
</script>
