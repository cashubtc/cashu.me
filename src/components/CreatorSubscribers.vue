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
          <div class="row items-center no-wrap">
            <q-avatar
              size="32px"
              v-if="profiles[props.row.subscriberNpub]?.picture"
            >
              <img :src="profiles[props.row.subscriberNpub].picture" />
            </q-avatar>
            <div class="q-ml-sm">
              {{
                profiles[props.row.subscriberNpub]?.display_name ||
                profiles[props.row.subscriberNpub]?.name ||
                shortenString(pubkeyNpub(props.row.subscriberNpub), 15, 6)
              }}
            </div>
          </div>
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
      <template #no-data>
        <div class="full-width column items-center q-pa-md">
          <div>No subscribers yet</div>
          <q-btn flat color="primary" label="Find creators" to="/find-creators" class="q-mt-sm" />
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { nip19 } from 'nostr-tools';
import { useCreatorSubscriptionsStore } from 'stores/creatorSubscriptions';
import { shortenString } from 'src/js/string-utils';
import { useI18n } from 'vue-i18n';
import { useNostrStore } from 'stores/nostr';

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

const profiles = ref<Record<string, any>>({});
const nostr = useNostrStore();

async function updateProfiles() {
  for (const sub of subscriptions.value) {
    const pk = sub.subscriberNpub;
    if (!profiles.value[pk]) {
      const p = await nostr.getProfile(pk);
      if (p) profiles.value[pk] = p;
    }
  }
}

onMounted(updateProfiles);
watch(subscriptions, updateProfiles);

function pubkeyNpub(hex: string): string {
  try {
    return nip19.npubEncode(hex);
  } catch {
    return hex;
  }
}
</script>
