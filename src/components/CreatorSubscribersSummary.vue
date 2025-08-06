<template>
  <div class="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-3">
    <div class="p-4 border rounded text-center">
      <div class="flex items-center justify-center mb-2">
        <UsersIcon class="w-4 h-4 mr-1" />
        <span class="font-semibold">
          {{ t("CreatorSubscribers.summary.subscribers") }}
        </span>
      </div>
      <div class="flex justify-center mb-2">
        <svg width="60" height="60" viewBox="0 0 36 36" class="donut">
          <circle
            class="text-yellow-500"
            stroke="currentColor"
            stroke-width="3.8"
            fill="transparent"
            cx="18"
            cy="18"
            r="15.9155"
            stroke-dasharray="100 0"
          />
          <circle
            class="text-green-500"
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
      <div class="flex justify-center gap-2 text-xs">
        <div class="flex items-center">
          <span class="w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
          <span
            >{{ t("CreatorSubscribers.summary.active") }}:
            {{ activeCount }}</span
          >
        </div>
        <div class="flex items-center">
          <span class="w-2 h-2 mr-1 bg-yellow-500 rounded-full"></span>
          <span
            >{{ t("CreatorSubscribers.summary.pending") }}:
            {{ pendingCount }}</span
          >
        </div>
      </div>
    </div>
    <div class="p-4 border rounded text-center">
      <div class="flex items-center justify-center mb-2">
        <CalendarIcon class="w-4 h-4 mr-1" />
        <span class="font-semibold">
          {{ t("CreatorSubscribers.summary.receivedPeriods") }}
        </span>
      </div>
      <div class="text-xl">{{ totalReceivedPeriods }}</div>
    </div>
    <div class="p-4 border rounded text-center">
      <div class="flex items-center justify-center mb-2">
        <DollarSignIcon class="w-4 h-4 mr-1" />
        <span class="font-semibold">
          {{ t("CreatorSubscribers.summary.revenue") }}
        </span>
      </div>
      <div class="text-xl">{{ formatCurrency(totalRevenue) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  Users as UsersIcon,
  Calendar as CalendarIcon,
  DollarSign as DollarSignIcon,
} from "lucide-vue-next";

const props = defineProps<{
  activeCount: number;
  pendingCount: number;
  totalReceivedPeriods: number;
  totalRevenue: number;
  formatCurrency: (amount: number) => string;
}>();

const { activeCount, pendingCount, totalReceivedPeriods, totalRevenue } =
  toRefs(props);
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
