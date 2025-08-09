<template>
  <q-drawer
    v-model="model"
    side="right"
    bordered
    overlay
    :width="400"
    @keydown.esc.prevent="close"
  >
    <div v-if="sub">
      <q-toolbar>
        <div class="column">
          <q-toolbar-title class="text-body1 ellipsis">{{ profileTitle }}</q-toolbar-title>
          <div class="text-caption text-grey-6 ellipsis">{{ sub.subscriberNpub }}</div>
        </div>
        <q-space />
        <q-btn flat round dense icon="close" @click="close" />
      </q-toolbar>

      <div class="row items-center q-gutter-sm q-px-md q-pb-sm">
          <q-btn outline dense icon="chat" label="DM" @click="emit('dm')" />
          <q-btn outline dense icon="content_copy" label="npub" @click="copy(sub.subscriberNpub)" />
          <q-btn outline dense icon="content_copy" label="lud16" v-if="profile?.lud16" @click="copy(profile.lud16)" />
          <q-btn outline dense icon="open_in_new" label="Profile" @click="emit('openProfile')" />
      </div>

      <q-tabs v-model="tab" dense align="justify" class="text-grey-7" active-color="primary">
        <q-tab name="overview" label="Overview" />
        <q-tab name="payments" label="Payments" />
        <q-tab name="notes" label="Notes" />
        <q-tab name="activity" label="Activity" />
      </q-tabs>
      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="overview" class="q-pa-md">
          <q-list dense>
            <q-item>
              <q-item-section avatar><q-icon name="star" /></q-item-section>
              <q-item-section>Tier</q-item-section>
              <q-item-section side>{{ sub.tierName }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar><q-icon name="event_repeat" /></q-item-section>
              <q-item-section>Frequency</q-item-section>
              <q-item-section side>{{ sub.frequency }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar><q-icon name="schedule" /></q-item-section>
              <q-item-section>Next Renewal</q-item-section>
              <q-item-section side>{{ nextRenewal }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar><q-icon name="paid" /></q-item-section>
              <q-item-section>Lifetime Total</q-item-section>
              <q-item-section side>{{ lifetimeTotal }}</q-item-section>
            </q-item>
             <q-item>
              <q-item-section avatar><q-icon name="today" /></q-item-section>
              <q-item-section>Subscribed Since</q-item-section>
              <q-item-section side>{{ sinceDate }}</q-item-section>
            </q-item>
          </q-list>
        </q-tab-panel>

        <q-tab-panel name="payments" class="q-pa-none">
          <div v-if="paymentsLoading" class="q-pa-md">
            <q-skeleton v-for="n in 8" :key="n" type="text" class="q-my-sm" />
          </div>
          <q-list v-else separator>
            <q-item v-for="p in payments" :key="p.id">
              <q-item-section :class="p.status === 'Paid' ? 'text-positive' : 'text-negative'">{{ p.status }}</q-item-section>
              <q-item-section>{{ p.date }}</q-item-section>
              <q-item-section side>{{ formatCurrency(p.amount) }}</q-item-section>
            </q-item>
            <q-item v-if="canLoadMore" clickable @click="loadPayments(true)" class="text-center">
              <q-item-section>Load more</q-item-section>
            </q-item>
            <div v-if="payments.length === 0" class="text-caption q-pa-md text-center">
              No payments found.
            </div>
          </q-list>
        </q-tab-panel>

        <q-tab-panel name="notes" class="q-pa-md">
          <q-input v-model="notes" type="textarea" outlined autogrow placeholder="Add private notes here..." />
        </q-tab-panel>

        <q-tab-panel name="activity" class="q-pa-md">
          <div class="text-center text-grey-6">Activity timeline coming soon.</div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
    <div v-else class="flex flex-center" style="height: 100%">
      <q-spinner-dots color="primary" size="40px" />
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { onKeyStroke, useLocalStorage } from '@vueuse/core';
import { useQuasar } from 'quasar';
import { cashuDb } from 'stores/dexie';
import { useUiStore } from 'stores/ui';
import type { CreatorSubscription } from 'stores/creatorSubscriptions';
import type { NDKUserProfile as Profile } from '@nostr-dev-kit/ndk';

const props = defineProps<{ modelValue: boolean; sub: CreatorSubscription | null; profile?: Profile; }>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'dm'): void;
  (e: 'cancel'): void;
  (e: 'openProfile'): void;
}>();

const $q = useQuasar();

const model = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
});

const tab = ref('overview');

const uiStore = useUiStore();

function formatCurrency(amount: number): string {
  return uiStore.formatCurrency(amount);
}

const profileTitle = computed(() => props.profile?.displayName || props.profile?.name || props.sub?.subscriberNpub.slice(0, 16) + '...');

const nextRenewal = computed(() => {
  const ts = props.sub?.nextRenewal;
  if (!ts) return '—';
  if (props.sub?.status === 'ended') return 'Ended';
  return new Date(ts * 1000).toLocaleDateString();
});

const lifetimeTotal = computed(() => formatCurrency(props.sub?.totalAmount || 0));

const sinceDate = computed(() => {
  const ts = props.sub?.startDate;
  if (!ts) return '—';
  return new Date(ts * 1000).toLocaleDateString();
});

function copy(text?: string) {
  if (!text) return;
  $q.copyToClipboard(text);
  $q.notify({ message: 'Copied to clipboard', position: 'bottom', timeout: 1000 });
}

const payments = ref<Array<{ id: string; status: string; date: string; amount: number }>>([]);
const paymentsLoading = ref(false);
const paymentsLimit = ref(20);
const canLoadMore = ref(true);

async function loadPayments(loadMore = false) {
  const id = props.sub?.subscriptionId;
  if (!id) {
    payments.value = [];
    return;
  }
  if (!loadMore) {
    payments.value = [];
    paymentsLimit.value = 20;
  }
  paymentsLoading.value = true;
  try {
    const query = cashuDb.lockedTokens
      .where('subscriptionId').equals(id)
      .and((t) => t.owner === 'creator');

    const total = await query.count();
    const rows = await query.reverse().sortBy('unlockTs');

    payments.value = rows.slice(0, paymentsLimit.value).map((r) => ({
      id: r.id,
      status: r.status === 'claimed' ? 'Paid' : 'Failed',
      date: new Date(r.unlockTs * 1000).toLocaleDateString(),
      amount: r.amount,
    }));

    canLoadMore.value = payments.value.length < total;
    if (loadMore) {
      paymentsLimit.value += 20;
    }
  } finally {
    paymentsLoading.value = false;
  }
}

watch(() => props.sub?.subscriptionId, (id) => {
  if (model.value && id) {
    tab.value = 'overview';
    loadPayments();
  }
});

const storageKey = computed(() => `sub-notes:${props.sub?.subscriptionId ?? ''}`);
const notes = useLocalStorage<string>(storageKey, '');

function close() {
  model.value = false;
}

onKeyStroke('Escape', (e) => {
  if (model.value) {
    e.preventDefault();
    close();
  }
});
</script>
