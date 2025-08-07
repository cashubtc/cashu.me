<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card>
          <q-card-section class="text-center">
            <div class="text-h6">
              {{ $t("CreatorSubscribers.summary.subscribers") }}
            </div>
            <div class="text-subtitle1">{{ total }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card>
          <q-card-section class="text-center">
            <div class="text-h6">
              {{ $t("CreatorSubscribers.summary.active") }}
            </div>
            <div class="text-subtitle1">{{ active }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card>
          <q-card-section class="text-center">
            <div class="text-h6">
              {{ $t("CreatorSubscribers.summary.pending") }}
            </div>
            <div class="text-subtitle1">{{ pending }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card>
          <q-card-section class="text-center">
            <div class="text-h6">
              {{ $t("CreatorSubscribers.summary.revenue") }}
            </div>
            <div class="text-subtitle1">{{ formatCurrency(revenue) }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div
      v-if="!loading && subscriptions.length === 0"
      class="text-center q-mt-xl"
    >
      {{ $t("CreatorSubscribers.noData") }}
    </div>

    <div v-else>
      <q-card
        v-for="sub in subscriptions"
        :key="sub.subscriptionId"
        class="q-mb-md"
      >
        <q-card-section>
          <div class="text-subtitle1">{{ sub.tierName }}</div>
          <div>
            {{ $t("CreatorSubscribers.columns.subscriber") }}:
            {{ sub.subscriberNpub }}
          </div>
          <div>
            {{ $t("CreatorSubscribers.columns.status") }}:
            {{ $t(`CreatorSubscribers.status.${sub.status}`) }}
          </div>
          <div>
            {{ $t("CreatorSubscribers.columns.nextRenewal") }}:
            {{ sub.nextRenewal ? formatTs(sub.nextRenewal) : "-" }}
          </div>
          <div>
            {{ $t("CreatorSubscribers.summary.revenue") }}:
            {{ formatCurrency(sub.totalAmount) }}
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useCreatorSubscriptionsStore } from "stores/creatorSubscriptions";
import { useMintsStore } from "stores/mints";
import { useUiStore } from "stores/ui";

const creatorSubscriptionsStore = useCreatorSubscriptionsStore();
const { subscriptions, loading } = storeToRefs(creatorSubscriptionsStore);

const mintsStore = useMintsStore();
const uiStore = useUiStore();
const { activeUnit } = storeToRefs(mintsStore);

function formatCurrency(amount: number): string {
  return uiStore.formatCurrency(amount, activeUnit.value);
}

function formatTs(ts: number): string {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${(
    "0" + d.getDate()
  ).slice(-2)}`;
}

const total = computed(() => subscriptions.value.length);
const active = computed(
  () => subscriptions.value.filter((s) => s.status === "active").length
);
const pending = computed(
  () => subscriptions.value.filter((s) => s.status === "pending").length
);
const revenue = computed(() =>
  subscriptions.value.reduce((sum, s) => sum + s.totalAmount, 0)
);
</script>

<style scoped></style>
