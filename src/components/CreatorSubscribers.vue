<template>
  <div>
    <div class="row q-mb-md">
      <q-input
        v-model="filter"
        dense
        outlined
        debounce="300"
        clearable
        placeholder="Filter"
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
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { nip19 } from 'nostr-tools';
import { useCreatorSubscriptionsStore } from 'stores/creatorSubscriptions';
import { shortenString } from 'src/js/string-utils';

const store = useCreatorSubscriptionsStore();
const { subscriptions, loading } = storeToRefs(store);

const filter = ref('');
const pagination = ref({ page: 1, rowsPerPage: 5 });

const columns = [
  { name: 'subscriber', label: 'Subscriber', field: 'subscriberNpub', align: 'left' },
  { name: 'tier', label: 'Tier', field: 'tierId', align: 'left' },
  { name: 'months', label: 'Months', field: 'receivedMonths', align: 'center' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' }
];

function pubkeyNpub(hex: string): string {
  try {
    return nip19.npubEncode(hex);
  } catch {
    return hex;
  }
}
</script>
