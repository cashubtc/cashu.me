<template>
  <div class="q-pa-md">
    <h5 class="q-my-none q-mb-md">{{ $t('SubscriptionsOverview.title') }}</h5>
    <q-markup-table flat bordered dense>
      <thead>
        <tr>
          <th class="text-left">{{ $t('SubscriptionsOverview.columns.creator') }}</th>
          <th class="text-right">{{ $t('SubscriptionsOverview.columns.total') }}</th>
          <th class="text-left">{{ $t('SubscriptionsOverview.columns.next_unlock') }}</th>
          <th class="text-right">{{ $t('SubscriptionsOverview.columns.remaining') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.creator">
          <td>{{ shortenString(pubkeyNpub(row.creator), 15, 6) }}</td>
          <td class="text-right">{{ formatCurrency(row.total) }}</td>
          <td>{{ row.nextUnlock ? formatTs(row.nextUnlock) : '-' }}</td>
          <td class="text-right">{{ row.monthsLeft }}</td>
        </tr>
        <tr v-if="rows.length === 0">
          <td colspan="4" class="text-center text-grey">{{ $t('SubscriptionsOverview.empty') }}</td>
        </tr>
      </tbody>
    </q-markup-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useLockedTokensStore, type LockedToken } from 'stores/lockedTokens';
import { useBucketsStore } from 'stores/buckets';
import { useMintsStore } from 'stores/mints';
import { useUiStore } from 'stores/ui';
import { nip19 } from 'nostr-tools';
import { shortenString } from 'src/js/string-utils';

const lockedStore = useLockedTokensStore();
const bucketsStore = useBucketsStore();
const mintsStore = useMintsStore();
const uiStore = useUiStore();
const { activeUnit } = storeToRefs(mintsStore);

function pubkeyNpub(hex: string): string {
  try {
    return nip19.npubEncode(hex);
  } catch {
    return hex;
  }
}

function formatCurrency(amount: number): string {
  return uiStore.formatCurrency(amount, activeUnit.value);
}

function formatTs(ts: number): string {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}`;
}

const groups = computed<Record<string, LockedToken[]>>(() => {
  const map: Record<string, LockedToken[]> = {};
  lockedStore.lockedTokens.forEach((t) => {
    const bucket = bucketsStore.bucketList.find((b) => b.id === t.bucketId);
    const pubkey = bucket?.creatorPubkey || t.pubkey;
    if (!map[pubkey]) map[pubkey] = [];
    map[pubkey].push(t);
  });
  return map;
});

const rows = computed(() => {
  const now = Math.floor(Date.now() / 1000);
  return Object.entries(groups.value).map(([creator, tokens]) => {
    const total = tokens.reduce((sum, t) => sum + t.amount, 0);
    const future = tokens.filter((t) => t.locktime && t.locktime > now);
    const nextUnlock = future.sort((a, b) => (a.locktime! - b.locktime!))[0]?.locktime || null;
    const monthsLeft = future.length;
    return { creator, total, nextUnlock, monthsLeft };
  });
});
</script>

<style scoped>
</style>

