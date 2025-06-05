<template>
  <div class="q-my-xs flex column" :class="message.outgoing ? 'items-end' : 'items-start'">
    <div :class="message.outgoing ? 'chat-bubble-sent' : 'chat-bubble-received'">
      {{ message.content }}
    </div>
    <div class="text-caption q-mt-xs" :class="message.outgoing ? 'text-right' : 'text-left'">
      {{ time }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { MessengerMessage } from 'src/stores/messenger';

const props = defineProps<{ message: MessengerMessage }>();
const time = computed(() => new Date(props.message.created_at * 1000).toLocaleString());
</script>

