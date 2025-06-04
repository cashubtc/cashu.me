<template>
  <q-scroll-area class="col column q-pa-md">
    <div
      v-for="msg in messages"
      :key="msg.id"
      class="q-my-xs flex column"
      :class="msg.outgoing ? 'items-end' : 'items-start'"
    >
      <div :class="msg.outgoing ? 'chat-bubble-sent' : 'chat-bubble-received'">
        {{ msg.content }}
      </div>
      <div
        class="text-caption q-mt-xs"
        :class="msg.outgoing ? 'text-right' : 'text-left'"
      >
        {{ formatDate(msg.created_at) }}
      </div>
    </div>
    <div ref="bottom"></div>
  </q-scroll-area>
</template>

<script lang="ts" setup>
import { nextTick, ref, watch } from 'vue';
import type { MessengerMessage } from 'src/stores/messenger';

const props = defineProps<{ messages: MessengerMessage[] }>();
const bottom = ref<HTMLElement>();

watch(
  () => props.messages,
  () => {
    nextTick(() => bottom.value?.scrollIntoView({ behavior: 'smooth' }));
  },
  { deep: true }
);

const formatDate = (ts: number) => new Date(ts * 1000).toLocaleString();
</script>
