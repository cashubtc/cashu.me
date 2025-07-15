<template>
  <div
    class="q-my-xs flex column"
    :class="message.outgoing ? 'items-end' : 'items-start'"
  >
    <div :class="message.outgoing ? 'sent' : 'received'" :style="bubbleStyle">
      <template v-if="message.subscriptionPayment">
        <TokenCarousel
          :payments="message.subscriptionPayment"
          :creator="!message.outgoing"
          :message="message"
          @redeem="redeemPayment"
        />
        <div
          v-if="unlockTime && remaining > 0"
          class="text-caption q-mt-xs"
        >
          Unlocks in {{ countdown }}
        </div>
        <q-toggle
          v-if="!message.outgoing"
          v-model="autoRedeem"
          label="Auto-redeem"
          class="q-mt-sm"
          @update:model-value="updateAutoRedeem"
        />
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
import { computed, ref, onMounted, onUnmounted } from "vue";
import { formatDistanceToNow } from "date-fns";
import { useQuasar } from "quasar";
import { mdiCheck, mdiCheckAll } from "@quasar/extras/mdi-v6";
import type { MessengerMessage } from "src/stores/messenger";
import TokenCarousel from "components/TokenCarousel.vue";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";
import { useWalletStore } from "src/stores/wallet";
import { notifyError } from "src/js/notify";
import { cashuDb } from "src/stores/dexie";
import { useP2PKStore } from "src/stores/p2pk";
import { nip19 } from "nostr-tools";
import { shortenString } from "src/js/string-utils";

const props = defineProps<{
  message: MessengerMessage;
  deliveryStatus?: "sent" | "delivered";
}>();

const $q = useQuasar();
const p2pk = useP2PKStore();


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

const receiveStore = useReceiveTokensStore();
const redeemed = ref(false);
const autoRedeem = ref(false);
if (props.message.subscriptionPayment) {
  cashuDb.lockedTokens
    .where("tokenString")
    .equals(props.message.subscriptionPayment.token)
    .first()
    .then((row) => {
      autoRedeem.value = row?.autoRedeem ?? false;
    });
}

const now = ref(Date.now());
let timer: any;
onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now();
  }, 1000);
});
onUnmounted(() => clearInterval(timer));

const receiverPubkey = computed(() => {
  if (!props.message.subscriptionPayment) return "";
  return p2pk.getTokenPubkey(props.message.subscriptionPayment.token) || "";
});

const unlockTime = computed(() => {
  if (!props.message.subscriptionPayment) return undefined;
  return p2pk.getTokenLocktime(props.message.subscriptionPayment.token);
});

const unlockIso = computed(() =>
  unlockTime.value ? new Date(unlockTime.value * 1000).toISOString() : "",
);

const remaining = computed(() => {
  if (!unlockTime.value) return 0;
  return unlockTime.value - Math.floor(now.value / 1000);
});

const countdown = computed(() =>
  unlockTime.value
    ? formatDistanceToNow(unlockTime.value * 1000, { includeSeconds: true })
    : ""
);

const receiverPubkeyNpub = computed(() => {
  try {
    return receiverPubkey.value ? nip19.npubEncode(receiverPubkey.value) : "";
  } catch {
    return receiverPubkey.value;
  }
});

async function redeemPayment() {
  if (!props.message.subscriptionPayment) return;
  const payment = props.message.subscriptionPayment;
  const wallet = useWalletStore();
  try {
    if (unlockTime.value && remaining.value > 0) {
      return;
    }
    await wallet.redeem(payment.token);
    if (payment.subscription_id) {
      const sub = await cashuDb.subscriptions.get(payment.subscription_id);
      const idx = sub?.intervals.findIndex(
        (i) => i.monthIndex === payment.month_index,
      );
      if (sub && idx !== undefined && idx >= 0) {
        sub.intervals[idx].status = "claimed";
        sub.intervals[idx].redeemed = true;
        await cashuDb.subscriptions.update(sub.id, { intervals: sub.intervals });
      }
    }
    redeemed.value = true;
  } catch (e) {
    console.error(e);
    notifyError(e);
  }
}

async function updateAutoRedeem(val: boolean) {
  if (!props.message.subscriptionPayment) return;
  const row = await cashuDb.lockedTokens
    .where("tokenString")
    .equals(props.message.subscriptionPayment.token)
    .first();
  if (row) await cashuDb.lockedTokens.update(row.id, { autoRedeem: val });
  autoRedeem.value = val;
}
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
