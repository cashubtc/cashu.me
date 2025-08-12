<template>
  <q-card
    :class="[{ 'q-mb-sm': !compact }, 'q-pa-md', 'q-ma-sm', 'cursor-pointer']"
    @click="$emit('click')"
  >
    <q-card-section class="q-pa-none">
      <div class="row items-center justify-between">
        <div>
          <div class="text-h6">{{ subscription.tierName }}</div>
          <div class="text-caption text-grey">
            {{ subscription.subscriberNpub }}
          </div>
        </div>
        <div class="text-h6">{{ amount }}</div>
      </div>
      <q-linear-progress :value="progress" class="q-mt-sm" />
      <div class="row items-center q-mt-sm">
        <q-chip dense :color="statusColor" :text-color="statusTextColor">{{
          status
        }}</q-chip>
        <q-chip
          v-if="nextIn !== '—'"
          dense
          class="q-ml-sm"
          color="grey-6"
          text-color="white"
        >
          {{ nextIn }}
        </q-chip>
      </div>
    </q-card-section>
  </q-card>
</template>
<script setup lang="ts">
import { computed } from "vue";
import type { CreatorSubscription } from "stores/creatorSubscriptions";

const props = defineProps<{
  subscription: CreatorSubscription;
  compact?: boolean;
  status: "active" | "pending" | "ended";
  nextIn: string;
  progress: number;
  amount: string;
}>();

const statusColor = computed(() => {
  if (props.status === "active") return "positive";
  if (props.status === "pending") return "warning";
  return "negative";
});

const statusTextColor = computed(() =>
  props.status === "pending" ? "black" : "white"
);
</script>
