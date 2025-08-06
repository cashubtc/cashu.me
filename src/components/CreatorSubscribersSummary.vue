<template>
  <div class="row q-col-gutter-md q-mb-md">
    <div class="col-12 col-sm-4">
      <q-card flat bordered class="q-pa-sm text-center">
        <div class="text-h6">{{ totalActiveSubscribers }}</div>
        <div class="text-caption">
          {{ t('CreatorSubscribers.summary.activeSubscribers') }}
        </div>
      </q-card>
    </div>
    <div class="col-12 col-sm-4">
      <q-card flat bordered class="q-pa-sm text-center">
        <div class="text-h6">{{ totalReceivedMonths }}</div>
        <div class="text-caption">
          {{ t('CreatorSubscribers.summary.receivedMonths') }}
        </div>
      </q-card>
    </div>
    <div class="col-12 col-sm-4">
      <q-card flat bordered class="q-pa-sm text-center">
        <div class="text-h6">{{ formatCurrency(totalRevenue) }}</div>
        <div class="text-caption">
          {{ t('CreatorSubscribers.summary.revenue') }}
        </div>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  totalActiveSubscribers: number;
  totalReceivedMonths: number;
  totalRevenue: number;
  formatCurrency: (amount: number) => string;
}>();

const { totalActiveSubscribers, totalReceivedMonths, totalRevenue } = toRefs(props);
const formatCurrency = props.formatCurrency;

const { t } = useI18n();
</script>
