<template>
  <q-scroll-area class="col column q-pa-md">
    <template v-for="(msg, idx) in messages" :key="msg.id">
      <div
        v-if="showDateSeparator(idx)"
        class="text-caption text-center q-my-md divider-text"
      >
        {{ formatDay(msg.created_at) }}
      </div>
      <ChatMessageBubble :message="msg" :delivery-status="msg.status" />
    </template>
    <div ref="bottom"></div>
  </q-scroll-area>
</template>

<script lang="ts" setup>
import { nextTick, ref, watch } from "vue";
import type { MessengerMessage } from "src/stores/messenger";
import ChatMessageBubble from "./ChatMessageBubble.vue";

const props = defineProps<{ messages: MessengerMessage[] }>();
const bottom = ref<HTMLElement>();

function formatDay(ts: number) {
  const d = new Date(ts * 1000);
  return d.toLocaleDateString();
}

function showDateSeparator(idx: number) {
  if (idx === 0) return true;
  const prev = props.messages[idx - 1];
  const prevDay = new Date(prev.created_at * 1000).toDateString();
  const currDay = new Date(
    props.messages[idx].created_at * 1000,
  ).toDateString();
  return prevDay !== currDay;
}

watch(
  () => props.messages,
  () => {
    nextTick(() => bottom.value?.scrollIntoView({ behavior: "smooth" }));
  },
  { deep: true },
);

const formatDate = (ts: number) => new Date(ts * 1000).toLocaleString();

defineExpose({ formatDay, showDateSeparator });
</script>
