<template>
  <div>
    <div class="row q-mb-md">
      <q-input
        v-model="filter"
        dense
        outlined
        debounce="300"
        clearable
        :placeholder="$t('CreatorSubscribers.filter.placeholder')"
        class="col"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
    <q-table
      flat
      bordered
      row-key="subscriptionId"
      :rows="subscriptions"
      :columns="columns"
      :filter="filter"
      :pagination="pagination"
      :loading="loading"
      :rows-per-page-options="[5, 10, 20]"
    >
      <template #body-cell-subscriber="props">
        <q-td :props="props">
          {{ shortenString(pubkeyNpub(props.row.subscriberNpub), 15, 6) }}
        </q-td>
      </template>
      <template #body-cell-months="props">
        <q-td :props="props">
          {{ props.row.receivedMonths }} / {{ props.row.totalMonths }}
        </q-td>
      </template>
      <template #body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="props.row.status === 'active' ? 'positive' : 'warning'">
            {{ props.row.status }}
          </q-badge>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { nip19 } from 'nostr-tools';
import { useCreatorSubscriptionsStore } from 'stores/creatorSubscriptions';
import { shortenString } from 'src/js/string-utils';
import { useI18n } from 'vue-i18n';

const store = useCreatorSubscriptionsStore();
const { subscriptions, loading } = storeToRefs(store);

const { t } = useI18n();

const filter = ref('');
const pagination = ref({ page: 1, rowsPerPage: 5 });

const columns = computed(() => [
  {
    name: 'subscriber',
    label: t('CreatorSubscribers.columns.subscriber'),
    field: 'subscriberNpub',
    align: 'left',
  },
  {
    name: 'tier',
    label: t('CreatorSubscribers.columns.tier'),
    field: 'tierId',
    align: 'left',
  },
  {
    name: 'months',
    label: t('CreatorSubscribers.columns.months'),
    field: 'receivedMonths',
    align: 'center',
  },
  {
    name: 'status',
    label: t('CreatorSubscribers.columns.status'),
    field: 'status',
    align: 'left',
  },
]);

function pubkeyNpub(hex: string): string {
  try {
    return nip19.npubEncode(hex);
  } catch {
    return hex;
  }
}
</script>
