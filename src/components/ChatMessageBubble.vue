<template>
  <div
    class="q-my-xs flex column"
    :class="message.outgoing ? 'items-end' : 'items-start'"
  >
    <div :class="message.outgoing ? 'sent' : 'received'" :style="bubbleStyle">
      <template v-if="message.subscriptionPayment">
        <template v-if="message.subscriptionPayment.total_months > 1">
          <q-carousel
            v-model="activeSlide"
            animated
            control-color="primary"
            swipeable
            class="subscription-carousel"
          >
            <q-carousel-slide
              v-for="idx in message.subscriptionPayment.total_months"
              :key="idx"
              :name="idx"
            >
              <q-expansion-item dense switch-toggle-side>
                <template #header>Month {{ idx }}</template>
                <TokenInformation
                  :encodedToken="message.subscriptionPayment.token"
                  :showAmount="true"
                  :showMintCheck="true"
                  :showP2PKCheck="true"
                />
                <q-btn
                  label="Redeem"
                  color="primary"
                  class="q-mt-sm"
                  @click.stop="redeemPayment"
                />
              </q-expansion-item>
            </q-carousel-slide>
          </q-carousel>
        </template>
        <template v-else>
          <q-expansion-item dense switch-toggle-side>
            <template #header>
              Subscription payment ({{
                message.subscriptionPayment.total_months
              }}
              months)
            </template>
            <TokenInformation
              :encodedToken="message.subscriptionPayment.token"
              :showAmount="true"
              :showMintCheck="true"
              :showP2PKCheck="true"
            />
            <q-btn
              label="Redeem"
              color="primary"
              class="q-mt-sm"
              @click.stop="redeemPayment"
            />
          </q-expansion-item>
        </template>
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
import { computed, ref } from "vue";
import { useQuasar } from "quasar";
import { mdiCheck, mdiCheckAll } from "@quasar/extras/mdi-v6";
import type { MessengerMessage } from "src/stores/messenger";
import TokenInformation from "components/TokenInformation.vue";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";

const props = defineProps<{
  message: MessengerMessage;
  deliveryStatus?: "sent" | "delivered";
}>();

const $q = useQuasar();

const activeSlide = ref(1);

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

async function redeemPayment() {
  if (!props.message.subscriptionPayment) return;
  const tokenStr = props.message.subscriptionPayment.token;
  receiveStore.receiveData.tokensBase64 = tokenStr;
  await receiveStore.receiveToken(tokenStr);
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
