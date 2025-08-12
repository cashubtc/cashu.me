<template>
  <q-carousel
    v-model="slide"
    control-color="primary"
    swipeable
    animated
    :height="220"
  >
    <q-carousel-slide
      v-for="(p, idx) in payments"
      :name="idx"
      :key="idx"
      class="q-pa-md"
    >
      <TokenInformation
        :encodedToken="p.token"
        :showAmount="true"
        :showMintCheck="true"
        :showP2PKCheck="true"
      />
      <div class="q-mt-sm">
        <q-badge :color="badgeColor(p.status)" class="q-pa-sm">
          <q-icon :name="badgeIcon(p.status)" class="q-mr-xs" />
          {{ p.status }}
        </q-badge>
      </div>
      <div
        v-if="p.unlock_time && remaining(p) > 0"
        class="text-caption q-mt-xs"
      >
        Unlocks in {{ countdown(p) }}
      </div>
      <div class="row q-gutter-sm q-mt-sm">
        <q-btn
          v-if="creator"
          color="primary"
          label="Redeem"
          :disable="!canRedeem(p)"
          @click="$emit('redeem', p)"
        />
        <q-btn flat color="primary" label="Download" @click="download(p)" />
      </div>
    </q-carousel-slide>
  </q-carousel>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { formatDistanceToNow } from "date-fns";
import TokenInformation from "./TokenInformation.vue";
import { saveReceipt } from "src/utils/receipt-utils";
const props = defineProps<{
  payments: any | any[];
  creator?: boolean;
  message: any;
}>();
const emit = defineEmits(["redeem"]);
const slide = ref(0);
const payments = computed(() =>
  Array.isArray(props.payments) ? props.payments : [props.payments],
);
const now = ref(Date.now());
let timer: any;
onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now();
  }, 1000);
});
onUnmounted(() => clearInterval(timer));
function badgeColor(s: string) {
  if (s === "claimed") return "info";
  if (s === "redeemable") return "positive";
  return "warning";
}
function badgeIcon(s: string) {
  if (s === "claimed") return "check";
  if (s === "redeemable") return "lock_open";
  return "schedule";
}
function remaining(p: any): number {
  if (!p.unlock_time) return 0;
  return p.unlock_time - Math.floor(now.value / 1000);
}
function countdown(p: any): string {
  return formatDistanceToNow(p.unlock_time * 1000, {
    includeSeconds: true,
  });
}
function canRedeem(p: any) {
  return props.creator && (!p.unlock_time || remaining(p) <= 0);
}
function download(p: any) {
  saveReceipt({ ...props.message, subscriptionPayment: p });
}
</script>
