<template>
  <div
    class="q-my-xs flex column"
    :class="message.outgoing ? 'items-end' : 'items-start'"
  >
    <div :class="message.outgoing ? 'sent' : 'received'" :style="bubbleStyle">
      {{ message.content }}
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
import { useQuasar } from "quasar";
import { mdiCheck, mdiCheckAll } from "@quasar/extras/mdi-v6";
import type { MessengerMessage } from "src/stores/messenger";

const props = defineProps<{
  message: MessengerMessage;
  deliveryStatus?: "sent" | "delivered";
}>();

const $q = useQuasar();

const receivedStyle = computed(() => ({
  backgroundColor: $q.dark.isActive
    ? "var(--q-secondary)"
    : "var(--q-color-grey-2)",
  color: $q.dark.isActive ? "#ffffff" : "#000000",
}));

const bubbleStyle = computed(() =>
  props.message.outgoing ? {} : receivedStyle.value,
);

const time = computed(() =>
  new Date(props.message.created_at * 1000).toLocaleString(),
);
const isoTime = computed(() =>
  new Date(props.message.created_at * 1000).toISOString(),
);
const deliveryIcon = computed(() =>
  props.deliveryStatus === "delivered" ? mdiCheckAll : mdiCheck,
);
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
  background-color: var(--q-primary);
  color: #ffffff;
}

.received {
  background-color: var(--q-secondary);
  color: #000000;
}
</style>
