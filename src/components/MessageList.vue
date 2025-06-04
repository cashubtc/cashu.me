<template>
  <q-scroll-area class="col column q-pa-md">
    <q-chat-message
      v-for="msg in messages"
      :key="msg.id"
      :sent="msg.outgoing"
      :text="[msg.content]"
      :stamp="formatDate(msg.created_at)"
    />
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
