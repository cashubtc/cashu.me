<template>
  <div
    class="q-my-xs flex column"
    :class="message.outgoing ? 'items-end' : 'items-start'"
  >
    <div :class="message.outgoing ? 'sent' : 'received'" :style="bubbleStyle">
      <template v-if="tokenPayload">
        <div class="token-container">
          <div v-if="tokenPayload.amount !== null && tokenPayload.amount !== undefined">
            <strong>Amount:</strong> {{ tokenPayload.amount }}
          </div>
          <div v-if="tokenPayload.memo">
            <strong>Memo:</strong> {{ tokenPayload.memo }}
          </div>
          <div v-if="unlockDate">
            <strong>Unlock:</strong> {{ unlockDate }}
          </div>
        </div>
        <q-btn dense color="primary" class="q-mt-sm" @click="receiveToken"
          >Receive Token</q-btn
        >
      </template>
      <template v-else>
        {{ message.content }}
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
import { useQuasar } from "quasar";
import { mdiCheck, mdiCheckAll } from "@quasar/extras/mdi-v6";
import type { MessengerMessage } from "src/stores/messenger";
import {
  parseFormattedTokenMessage,
  CASHU_TOKEN_START,
  CASHU_TOKEN_END,
} from "src/js/message-utils";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";

const props = defineProps<{
  message: MessengerMessage;
  deliveryStatus?: "sent" | "delivered";
}>();

const $q = useQuasar();
const receiveTokensStore = useReceiveTokensStore();

const tokenPayload = computed(() => {
  if (
    !props.message.content.includes(CASHU_TOKEN_START) ||
    !props.message.content.includes(CASHU_TOKEN_END)
  )
    return null;
  return parseFormattedTokenMessage(props.message.content);
});

const unlockDate = computed(() => {
  if (!tokenPayload.value?.unlockTime) return null;
  return new Date(tokenPayload.value.unlockTime * 1000).toLocaleString();
});

async function receiveToken() {
  if (!tokenPayload.value) return;
  receiveTokensStore.receiveData.tokensBase64 = tokenPayload.value.token;
  await receiveTokensStore.receiveToken(
    tokenPayload.value.token,
    receiveTokensStore.receiveData.bucketId,
  );
}

const receivedStyle = computed(() => ({
  backgroundColor: $q.dark.isActive
    ? 'var(--q-color-grey-8)'
    : 'var(--q-color-grey-2)',
  color: $q.dark.isActive ? '#ffffff' : '#000000'
}));

const bubbleStyle = computed(() => (
  props.message.outgoing ? {} : receivedStyle.value
));

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

.token-container {
  border: 1px solid currentColor;
  padding: 8px;
  border-radius: 8px;
}
</style>
