<template>
  <div
    class="q-my-xs row"
    :class="message.outgoing ? 'justify-end' : 'justify-start'"
  >
    <q-avatar v-if="!message.outgoing" size="32px" class="q-mr-sm">
      <img v-if="profile?.picture" :src="profile.picture" />
      <span v-else>{{ initials }}</span>
    </q-avatar>
    <div
      class="flex column"
      :class="message.outgoing ? 'items-end' : 'items-start'"
    >
      <div :class="message.outgoing ? 'sent' : 'received'">
        <template v-if="message.subscriptionPayment">
          <TokenCarousel
            :payments="message.subscriptionPayment"
            :creator="!message.outgoing"
            :message="message"
            @redeem="redeemPayment"
          />
          <div v-if="unlockTime && remaining > 0" class="text-caption q-mt-xs">
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
        <template v-else-if="message.tokenPayload">
          <div class="token-wrapper">
            <TokenInformation
              :encodedToken="message.tokenPayload.token"
              :showAmount="true"
            />
            <div v-if="message.tokenPayload.memo" class="q-mt-sm">
              <span class="text-weight-bold">Memo:</span>
              {{ message.tokenPayload.memo }}
            </div>
          </div>
        </template>
        <template v-else>
          <q-img
            v-if="imageSrc"
            :src="imageSrc"
            style="max-width: 300px; max-height: 300px"
            class="q-mb-sm"
          />
          <template v-else-if="isFile">
            <a
              :href="message.content"
              target="_blank"
              :download="attachmentName"
            >
              {{ attachmentName }}
            </a>
          </template>
          <template v-else>
            {{ message.content }}
          </template>
        </template>
      </div>
      <div
        class="text-caption q-mt-xs row items-center"
        :class="
          message.outgoing
            ? 'justify-end text-right'
            : 'justify-start text-left'
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
          :color="deliveryColor"
        />
      </div>
      <q-avatar v-if="message.outgoing" size="32px" class="q-ml-sm">
        <img v-if="profile?.picture" :src="profile.picture" />
        <span v-else>{{ initials }}</span>
      </q-avatar>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { formatDistanceToNow } from "date-fns";

import {
  mdiCheck,
  mdiCheckAll,
  mdiAlertCircleOutline,
} from "@quasar/extras/mdi-v6";
import type { MessengerMessage } from "src/stores/messenger";
import TokenCarousel from "components/TokenCarousel.vue";
import TokenInformation from "components/TokenInformation.vue";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";
import { useWalletStore } from "src/stores/wallet";
import { notifyError } from "src/js/notify";
import { cashuDb } from "src/stores/dexie";
import { useP2PKStore } from "src/stores/p2pk";
import { useNostrStore } from "src/stores/nostr";
import { useMessengerStore } from "src/stores/messenger";
import { nip19 } from "nostr-tools";

const props = defineProps<{
  message: MessengerMessage;
  deliveryStatus?: "sent" | "delivered" | "failed";
}>();

const p2pk = useP2PKStore();
const nostr = useNostrStore();
const messenger = useMessengerStore();

const avatarPubkey = computed(() =>
  props.message.outgoing ? nostr.pubkey : props.message.pubkey,
);
const profile = ref<any>(null);
const initials = computed(() => {
  const alias = messenger.aliases[avatarPubkey.value];
  const p: any = profile.value;
  const name = alias || p?.display_name || p?.name || "";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
});

onMounted(async () => {
  profile.value = await nostr.getProfile(avatarPubkey.value);
});

const time = computed(() =>
  new Date(props.message.created_at * 1000).toLocaleString(),
);
const isoTime = computed(() =>
  new Date(props.message.created_at * 1000).toISOString(),
);
const deliveryIcon = computed(() => {
  if (props.deliveryStatus === "failed") return mdiAlertCircleOutline;
  return props.deliveryStatus === "delivered" ? mdiCheckAll : mdiCheck;
});
const deliveryColor = computed(() =>
  props.deliveryStatus === "failed" ? "negative" : undefined,
);

const isDataUrl = computed(() => props.message.content.startsWith("data:"));
const isImageDataUrl = computed(() =>
  props.message.content.startsWith("data:image"),
);
const isHttpUrl = computed(() => /^https?:\/\//.test(props.message.content));
const isImageLink = computed(
  () =>
    isHttpUrl.value &&
    /\.(png|jpe?g|gif|webp|svg)$/i.test(props.message.content),
);
const imageSrc = computed(() =>
  isImageDataUrl.value || isImageLink.value ? props.message.content : "",
);
const isFile = computed(() => isDataUrl.value || isHttpUrl.value);
const attachmentName = computed(
  () =>
    props.message.attachment?.name ||
    props.message.content.split("/").pop()?.split("?")[0] ||
    "file",
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
    : "",
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
  const receiveStore = useReceiveTokensStore();
  try {
    if (unlockTime.value && remaining.value > 0) {
      return;
    }
    await receiveStore.enqueue(() => wallet.redeem(payment.token));
    if (payment.subscription_id) {
      const sub = await cashuDb.subscriptions.get(payment.subscription_id);
      const idx = sub?.intervals.findIndex(
        (i) => i.monthIndex === payment.month_index,
      );
      if (sub && idx !== undefined && idx >= 0) {
        sub.intervals[idx].status = "claimed";
        sub.intervals[idx].redeemed = true;
        await cashuDb.subscriptions.update(sub.id, {
          intervals: sub.intervals,
        });
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
  max-width: 70%;
  word-break: break-word;
}

.sent {
  background-color: var(--q-primary);
  color: #ffffff;
  border-radius: 12px 0 12px 12px;
}

.received {
  background-color: var(--q-secondary);
  color: #000000;
  border-radius: 0 12px 12px 12px;
}

.token-wrapper {
  border: 1px solid currentColor;
  padding: 8px;
  border-radius: 8px;
  margin-top: 4px;
}

.token-wrapper .q-chip {
  white-space: normal;
  word-break: break-word;
  max-width: 100%;
  display: block; /* optional: stack chips vertically */
  margin-bottom: 4px; /* spacing between chips */
}
</style>
