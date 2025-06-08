<template>
  <div
    class="q-my-xs flex column"
    :class="message.outgoing ? 'items-end' : 'items-start'"
  >
    <div :class="message.outgoing ? 'sent' : 'received'">
      <template v-for="(part, idx) in parts" :key="idx">
        <span v-if="part.type === 'text'">{{ part.value }}</span>
        <TokenBubble v-else :token="part.value" />
      </template>
    </div>
    <div
      class="text-caption q-mt-xs row items-center"
      :class="
        message.outgoing ? 'justify-end text-right' : 'justify-start text-left'
      "
    >
      <span>
        {{ time }}
        <q-tooltip>{{ isoTime }}</q-tooltip>
      </span>
      <q-icon
        v-if="deliveryStatus"
        :name="deliveryIcon"
        size="16px"
        class="q-ml-xs"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import TokenBubble from "./TokenBubble.vue";
import { mdiCheck, mdiCheckAll } from "@quasar/extras/mdi-v6";
import type { MessengerMessage } from "src/stores/messenger";

const props = defineProps<{
  message: MessengerMessage;
  deliveryStatus?: "sent" | "delivered";
}>();

const time = computed(() =>
  new Date(props.message.created_at * 1000).toLocaleString()
);
const isoTime = computed(() =>
  new Date(props.message.created_at * 1000).toISOString()
);
const deliveryIcon = computed(() =>
  props.deliveryStatus === "delivered" ? mdiCheckAll : mdiCheck
);

const tokenRegex = /(cashu[A-Za-z0-9]+)/g;
const parts = computed(() => {
  const segments: { type: 'text' | 'token'; value: string }[] = [];
  const text = props.message.content;
  let last = 0;
  for (const match of text.matchAll(tokenRegex)) {
    const idx = match.index || 0;
    if (idx > last) {
      segments.push({ type: 'text', value: text.slice(last, idx) });
    }
    segments.push({ type: 'token', value: match[0] });
    last = idx + match[0].length;
  }
  if (last < text.length) {
    segments.push({ type: 'text', value: text.slice(last) });
  }
  if (segments.length === 0) {
    segments.push({ type: 'text', value: text });
  }
  return segments;
});
</script>

<style scoped>
.sent,
.received {
  padding: 16px;
  border-radius: 12px;
  max-width: 70%;
  word-break: break-word;
}

.sent {
  background-color: var(--q-color-primary);
  color: #ffffff;
}

.received {
  background-color: var(--q-color-grey-2);
  color: #000000;
}

body.body--dark .received {
  background-color: var(--q-color-grey-8);
  color: #ffffff;
}
</style>
