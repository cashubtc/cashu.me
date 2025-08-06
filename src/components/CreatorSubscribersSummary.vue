<template>
  <div class="row q-col-gutter-md q-mb-md">
    <div class="col-12 col-sm-4">
      <q-card flat bordered class="q-pa-sm text-center">
        <div class="row items-center justify-center q-mb-sm">
          <q-icon name="group" size="sm" class="q-mr-xs" />
          <span class="text-weight-bold">
            {{ t('CreatorSubscribers.summary.subscribers') }}
          </span>
        </div>
        <div class="flex justify-center q-mb-sm">
          <svg width="60" height="60" viewBox="0 0 36 36" class="donut">
            <circle
              class="text-warning"
              stroke="currentColor"
              stroke-width="3.8"
              fill="transparent"
              cx="18"
              cy="18"
              r="15.9155"
              stroke-dasharray="100 0"
            />
            <circle
              class="text-positive"
              stroke="currentColor"
              stroke-width="3.8"
              fill="transparent"
              cx="18"
              cy="18"
              r="15.9155"
              :stroke-dasharray="`${activePercent} ${100 - activePercent}`"
              stroke-dashoffset="25"
            />
          </svg>
        </div>
        <div class="row justify-center q-gutter-sm text-caption">
          <div class="row items-center">
            <q-icon name="circle" size="xs" color="positive" class="q-mr-xs" />
            <span>{{ t('CreatorSubscribers.summary.active') }}: {{ activeCount }}</span>
          </div>
          <div class="row items-center">
            <q-icon name="circle" size="xs" color="warning" class="q-mr-xs" />
            <span>{{ t('CreatorSubscribers.summary.pending') }}: {{ pendingCount }}</span>
          </div>
        </div>
      </q-card>
    </div>
    <div class="col-12 col-sm-4">
      <q-card flat bordered class="q-pa-sm text-center">
        <div class="row items-center justify-center q-mb-sm">
          <q-icon name="event" size="sm" class="q-mr-xs" />
          <span class="text-weight-bold">
            {{ t('CreatorSubscribers.summary.receivedPeriods') }}
          </span>
        </div>
        <div class="text-h6">{{ totalReceivedPeriods }}</div>
      </q-card>
    </div>
    <div class="col-12 col-sm-4">
      <q-card flat bordered class="q-pa-sm text-center">
        <div class="row items-center justify-center q-mb-sm">
          <q-icon name="attach_money" size="sm" class="q-mr-xs" />
          <span class="text-weight-bold">
            {{ t('CreatorSubscribers.summary.revenue') }}
          </span>
        </div>
        <div class="text-h6">{{ formatCurrency(totalRevenue) }}</div>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  activeCount: number;
  pendingCount: number;
  totalReceivedPeriods: number;
  totalRevenue: number;
  formatCurrency: (amount: number) => string;
}>();

const {
  activeCount,
  pendingCount,
  totalReceivedPeriods,
  totalRevenue,
} = toRefs(props);
const formatCurrency = props.formatCurrency;

const total = computed(() => activeCount.value + pendingCount.value);
const activePercent = computed(() => {
  const totalVal = total.value;
  return totalVal ? (activeCount.value / totalVal) * 100 : 0;
});

const { t } = useI18n();
</script>

<style scoped>
.donut {
  max-width: 60px;
}
</style>
