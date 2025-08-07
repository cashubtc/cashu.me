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

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-input
          v-model="filter"
          dense
          debounce="300"
          clearable
          :placeholder="$t('CreatorSubscribers.filter.placeholder')"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-6 col-md-4">
        <q-select
          v-model="frequencyFilter"
          dense
          emit-value
          map-options
          clearable
          :options="frequencyOptions"
          :label="$t('CreatorSubscribers.filters.frequency')"
        />
      </div>
      <div class="col-6 col-md-4">
        <q-select
          v-model="statusFilter"
          dense
          emit-value
          map-options
          clearable
          :options="statusOptions"
          :label="$t('CreatorSubscribers.columns.status')"
        />
      </div>
    </div>

    <div
      v-if="!loading && filteredSubscribers.length === 0"
      class="text-center q-mt-xl"
    >
      {{ $t("CreatorSubscribers.noData") }}
    </div>

    <div v-else>
      <q-table
        :rows="filteredSubscribers"
        :columns="columns"
        row-key="subscriptionId"
        flat
        :pagination="{ rowsPerPage: 0 }"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useCreatorSubscriptionsStore } from "stores/creatorSubscriptions";
import { useMintsStore } from "stores/mints";
import { useUiStore } from "stores/ui";
import { useI18n } from "vue-i18n";

const creatorSubscriptionsStore = useCreatorSubscriptionsStore();
const { subscriptions, loading } = storeToRefs(creatorSubscriptionsStore);

const mintsStore = useMintsStore();
const uiStore = useUiStore();
const { activeUnit } = storeToRefs(mintsStore);
const { t } = useI18n();

const filter = ref("");
const frequencyFilter = ref<string | null>(null);
const statusFilter = ref<string | null>(null);

const frequencyOptions = computed(() => [
  { label: t("CreatorSubscribers.frequency.weekly"), value: "weekly" },
  { label: t("CreatorSubscribers.frequency.biweekly"), value: "biweekly" },
  { label: t("CreatorSubscribers.frequency.monthly"), value: "monthly" },
]);

const statusOptions = computed(() => [
  { label: t("CreatorSubscribers.status.active"), value: "active" },
  { label: t("CreatorSubscribers.status.pending"), value: "pending" },
]);

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

const columns = computed(() => [
  {
    name: "tier",
    label: t("CreatorSubscribers.columns.tier"),
    field: "tierName",
  },
  {
    name: "subscriber",
    label: t("CreatorSubscribers.columns.subscriber"),
    field: "subscriberNpub",
  },
  {
    name: "status",
    label: t("CreatorSubscribers.columns.status"),
    field: "status",
    format: (val: string) => t(`CreatorSubscribers.status.${val}`),
  },
  {
    name: "nextRenewal",
    label: t("CreatorSubscribers.columns.nextRenewal"),
    field: "nextRenewal",
    format: (val: number | null) => (val ? formatTs(val) : "-"),
  },
  {
    name: "revenue",
    label: t("CreatorSubscribers.summary.revenue"),
    field: "totalAmount",
    format: (val: number) => formatCurrency(val),
  },
]);

const filteredSubscribers = computed(() => {
  const term = filter.value.toLowerCase();
  return subscriptions.value.filter((s) => {
    const matchesSearch =
      !term ||
      s.subscriberNpub.toLowerCase().includes(term) ||
      s.tierName.toLowerCase().includes(term);
    const matchesFrequency =
      !frequencyFilter.value || s.frequency === frequencyFilter.value;
    const matchesStatus =
      !statusFilter.value || s.status === statusFilter.value;
    return matchesSearch && matchesFrequency && matchesStatus;
  });
});
</script>

<style scoped></style>
