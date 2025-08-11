<template>
  <q-table
    v-if="viewMode === 'table'"
    flat
    :rows="paginatedRows"
    row-key="id"
    :columns="columns"
    v-model:visible-columns="visibleColumns"
    :dense="density === 'compact'"
    v-model:pagination="pagination"
    @row-click="onRowClick"
  >
    <template #bottom="scope">
      <div class="q-table__bottom row items-center justify-end q-pa-sm">
        <q-pagination
          v-model="pagination.page"
          :max="scope.pagesNumber"
          max-pages="5"
          boundary-links
          size="sm"
        />
        <q-select
          v-model="pagination.rowsPerPage"
          :options="rowsPerPageOptions"
          dense
          options-dense
          borderless
          emit-value
          class="q-ml-md"
          style="width: 80px"
        />
      </div>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSubscribersStore } from 'src/stores/subscribersStore';
import { storeToRefs } from 'pinia';
import type { Subscriber } from 'src/types/subscriber';

defineOptions({ name: 'SubscribersTable' });

const props = defineProps<{ subscribers: Subscriber[] }>();

const emit = defineEmits<{ select: [Subscriber] }>();

const { t } = useI18n();
const store = useSubscribersStore();
const { density, visibleColumns, viewMode } = storeToRefs(store);

const columns = [
  { name: 'subscriber', label: t('CreatorSubscribers.columns.subscriber'), field: 'name', align: 'left' },
  { name: 'tier', label: t('CreatorSubscribers.columns.tier'), field: 'tierName', align: 'left' },
  { name: 'frequency', label: t('CreatorSubscribers.columns.frequency'), field: 'frequency', align: 'left' },
  { name: 'status', label: t('CreatorSubscribers.columns.status'), field: 'status', align: 'left' },
  { name: 'amount', label: t('CreatorSubscribers.columns.amount'), field: 'amountSat', align: 'right' },
  { name: 'nextRenewal', label: t('CreatorSubscribers.columns.nextRenewal'), field: 'nextRenewal', align: 'left' },
  { name: 'lifetime', label: t('CreatorSubscribers.columns.lifetime'), field: 'lifetimeSat', align: 'right' },
];

const pagination = ref({ page: 1, rowsPerPage: 25 });
const rowsPerPageOptions = [10, 25, 50];

const paginatedRows = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.rowsPerPage;
  const end = start + pagination.value.rowsPerPage;
  return props.subscribers.slice(start, end);
});

function onRowClick(_evt: Event, row: Subscriber) {
  emit('select', row);
}

defineExpose({ pagination, paginatedRows });
</script>
