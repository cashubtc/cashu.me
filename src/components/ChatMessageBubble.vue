<template>
  <div
    class="q-my-xs flex column"
    :class="message.outgoing ? 'items-end' : 'items-start'"
  >
    <div v-if="!isTokenMsg" :class="message.outgoing ? 'sent' : 'received'" :style="bubbleStyle">
      {{ message.content }}
    </div>
    <div v-else :class="message.outgoing ? 'sent-token' : 'received-token'" :style="tokenBubbleStyle">
      <p><strong>Token Amount:</strong> {{ tokenDisplayDetails.amount }}</p>
      <p v-if="tokenDisplayDetails.memo"><strong>Memo:</strong> {{ tokenDisplayDetails.memo }}</p>
      <p v-if="tokenDisplayDetails.unlockTime"><strong>Unlock Time:</strong> {{ tokenDisplayDetails.unlockTime }}</p>
      <q-btn
        v-if="!message.outgoing"
        label="Receive Token"
        @click="handleReceiveTokenClick(message.content)"
        color="primary"
        dense
        class="q-mt-sm"
      />
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
import { useQuasar, QBtn } from "quasar";
import { mdiCheck, mdiCheckAll } from "@quasar/extras/mdi-v6";
import type { MessengerMessage } from "src/stores/messenger";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore"; // Adjusted path
import {
  parseFormattedTokenMessage,
  CASHU_TOKEN_START,
  CASHU_TOKEN_END
} from "src/js/message-utils";
import { notifySuccess, notifyError } from "src/js/notify";

const props = defineProps<{
  message: MessengerMessage;
  deliveryStatus?: "sent" | "delivered";
}>();

const $q = useQuasar();
const receiveTokensStore = useReceiveTokensStore();

const receivedStyle = computed(() => ({
  backgroundColor: $q.dark.isActive
    ? 'var(--q-color-grey-8)'
    : 'var(--q-color-grey-2)',
  color: $q.dark.isActive ? '#ffffff' : '#000000'
}));

const bubbleStyle = computed(() => (
  props.message.outgoing ? {} : receivedStyle.value
));

const tokenBubbleStyle = computed(() => {
  const baseStyle = {
    padding: '16px',
    borderRadius: '12px',
    maxWidth: '70%',
    wordBreak: 'break-word',
    border: '1px solid',
  };
  if (props.message.outgoing) {
    return {
      ...baseStyle,
      backgroundColor: $q.dark.isActive ? 'var(--q-color-primary)' : 'var(--q-color-primary)',
      color: '#ffffff',
      borderColor: $q.dark.isActive ? 'var(--q-color-primary-darken-2)' : 'var(--q-color-primary-lighten-2)',
    };
  } else {
    return {
      ...baseStyle,
      backgroundColor: $q.dark.isActive ? 'var(--q-color-grey-8)' : 'var(--q-color-grey-3)',
      color: $q.dark.isActive ? '#ffffff' : '#000000',
      borderColor: $q.dark.isActive ? 'var(--q-color-grey-7)' : 'var(--q-color-grey-4)',
    };
  }
});

const isTokenMsg = computed(() => {
  return props.message.content.includes(CASHU_TOKEN_START) && props.message.content.includes(CASHU_TOKEN_END);
});

const tokenDisplayDetails = computed(() => {
  if (!isTokenMsg.value) return {};
  const lines = props.message.content.split('\n');
  const details: { amount?: string; memo?: string; unlockTime?: string } = {};
  lines.forEach(line => {
    if (line.startsWith('Token Amount:')) details.amount = line.substring('Token Amount:'.length).trim();
    else if (line.startsWith('Memo:')) details.memo = line.substring('Memo:'.length).trim();
    else if (line.startsWith('Unlock Time:')) details.unlockTime = line.substring('Unlock Time:'.length).trim();
  });
  return details;
});

async function handleReceiveTokenClick(messageText: string) {
  const rawToken = parseFormattedTokenMessage(messageText);
  if (rawToken) {
    try {
      // The receiveTokensStore.receiveToken action expects the token to be set in its state first.
      // Or, more directly, call the action that processes the token string if available.
      // Based on receiveTokensStore.ts, it seems actions often pick up from `receiveData.tokensBase64`.
      // Let's use the direct `receiveToken` action if it fits, or set data then call.
      // `receiveTokensStore.receiveToken(encodedToken, bucketId)` looks suitable.
      // We might need to prompt for bucketId or use a default. For now, using default.
      receiveTokensStore.receiveData.tokensBase64 = rawToken; // Set data for the store
      await receiveTokensStore.receiveToken(rawToken); // Pass rawToken also to the action
      // notifySuccess("Token received successfully!"); // receiveToken action already shows notifications
    } catch (e: any) {
      console.error("Failed to receive token:", e);
      notifyError(`Failed to receive token: ${e.message || e}`);
    }
  } else {
    notifyError("Could not parse token from message.");
  }
}

const time = computed(() =>
  new Date(props.message.created_at * 1000).toLocaleString()
);
const isoTime = computed(() =>
  new Date(props.message.created_at * 1000).toISOString()
);
const deliveryIcon = computed(() =>
  props.deliveryStatus === "delivered" ? mdiCheckAll : mdiCheck
);
</script>

<style scoped>
.sent,
.received,
.sent-token,
.received-token {
  padding: 16px;
  border-radius: 12px;
  max-width: 70%;
  word-break: break-word;
  white-space: pre-wrap; /* To respect newlines in the formatted message */
}

.sent {
  background-color: var(--q-color-primary);
  color: #ffffff;
}

.received {
  /* Standard received style from props is used if not token */
}

.sent-token {
  /* Style for outgoing token messages, uses tokenBubbleStyle */
}
.received-token {
 /* Style for incoming token messages, uses tokenBubbleStyle */
}
</style>
