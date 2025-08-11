<template>
  <q-drawer
    v-model="model"
    side="right"
    bordered
    overlay
    :transition-duration="100"
    :width="448"
    v-focus-trap
    class="subscriber-drawer column no-wrap z-40"
    @keydown.esc.prevent="close"
  >
    <div class="drawer-header">
      <q-toolbar>
        <q-toolbar-title>
          {{ profileTitle }}
        </q-toolbar-title>
        <q-btn
          flat
          round
          dense
          icon="close"
          :aria-label="t('global.actions.close.label')"
          @click="close"
        />
      </q-toolbar>

      <q-tabs
        v-model="tab"
        dense
        align="justify"
        class="text-grey-7"
        active-color="primary"
      >
        <q-tab
          name="overview"
          :label="t('CreatorSubscribers.drawer.tabs.overview')"
        />
        <q-tab
          name="payments"
          :label="t('CreatorSubscribers.drawer.tabs.payments')"
        />
        <q-tab
          name="notes"
          :label="t('CreatorSubscribers.drawer.tabs.notes')"
        />
      </q-tabs>
      <q-separator />
    </div>

    <div class="drawer-scroll">
      <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="overview" class="q-pa-md">
        <q-list dense v-if="sub">
          <q-item v-if="profile?.nip05">
            <q-item-section>{{ t('CreatorSubscribers.drawer.overview.nip05') }}</q-item-section>
            <q-item-section side>{{ profile.nip05 }}</q-item-section>
          </q-item>
          <q-item v-if="profile?.lud16">
            <q-item-section>{{ t('CreatorSubscribers.drawer.overview.lud16') }}</q-item-section>
            <q-item-section side>{{ profile.lud16 }}</q-item-section>
          </q-item>
          <q-item v-if="profile?.about">
            <q-item-section>{{ t('CreatorSubscribers.drawer.overview.about') }}</q-item-section>
            <q-item-section side>{{ profile.about }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>{{ t('CreatorSubscribers.drawer.overview.nextRenewal') }}</q-item-section>
            <q-item-section side>{{ nextRenewal }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>{{ t('CreatorSubscribers.drawer.overview.amountPerInterval') }}</q-item-section>
            <q-item-section side>{{ amountPerInterval }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>{{ t('CreatorSubscribers.drawer.overview.lifetimeTotal') }}</q-item-section>
            <q-item-section side>{{ lifetimeTotal }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>{{ t('CreatorSubscribers.drawer.overview.since') }}</q-item-section>
            <q-item-section side>{{ sinceDate }}</q-item-section>
          </q-item>
        </q-list>

        <div class="row q-gutter-sm q-mt-md">
          <q-btn
            flat
            dense
            icon="chat"
            :label="t('CreatorSubscribers.drawer.actions.dm')"
            :aria-label="t('CreatorSubscribers.drawer.actions.dm')"
            @click="emit('dm')"
          />
          <q-btn
            flat
            dense
            icon="content_copy"
            :label="t('CreatorSubscribers.drawer.actions.copyNpub')"
            :aria-label="t('CreatorSubscribers.drawer.actions.copyNpub')"
            @click="copy(sub?.subscriberNpub)"
          />
          <q-btn
            flat
            dense
            icon="content_copy"
            :label="t('CreatorSubscribers.drawer.actions.copyLud16')"
            v-if="profile?.lud16"
            :aria-label="t('CreatorSubscribers.drawer.actions.copyLud16')"
            @click="copy(profile.lud16)"
          />
          <q-btn
            flat
            dense
            icon="open_in_new"
            :label="t('CreatorSubscribers.drawer.actions.openProfile')"
            :aria-label="t('CreatorSubscribers.drawer.actions.openProfile')"
            @click="emit('openProfile')"
          />
          <q-btn
            flat
            dense
            color="negative"
            :label="t('CreatorSubscribers.drawer.actions.cancel')"
            :aria-label="t('CreatorSubscribers.drawer.actions.cancel')"
            @click="emit('cancel')"
          />
        </div>
      </q-tab-panel>

      <q-tab-panel name="payments" class="q-pa-md">
        <div v-if="paymentsLoading" class="q-gutter-y-sm">
          <q-skeleton v-for="n in 8" :key="n" type="text" />
        </div>
        <q-list v-else>
          <q-item v-for="p in payments" :key="p.id">
            <q-item-section>{{ p.status }}</q-item-section>
            <q-item-section>{{ p.date }}</q-item-section>
            <q-item-section side>{{ formatCurrency(p.amount) }}</q-item-section>
          </q-item>
          <div v-if="payments.length === 0" class="text-caption q-pa-md">
            {{ t('CreatorSubscribers.drawer.payments.noPayments') }}
          </div>
        </q-list>
      </q-tab-panel>

      <q-tab-panel name="notes" class="q-pa-md">
        <q-input v-model="notes" type="textarea" autogrow />
      </q-tab-panel>
    </q-tab-panels>
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { onKeyStroke, useLocalStorage } from '@vueuse/core';
import { copyNpub } from 'src/utils/clipboard';
import { useI18n } from 'vue-i18n';
import { cashuDb } from 'stores/dexie';
import { useUiStore } from 'stores/ui';
import { useMintsStore } from 'stores/mints';
import type { CreatorSubscription } from 'stores/creatorSubscriptions';
import type { NDKUserProfile as Profile } from '@nostr-dev-kit/ndk';

const props = defineProps<{ modelValue: boolean; sub: CreatorSubscription; profile?: Profile; notes?: string }>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'update:notes', v: string): void;
  (e: 'dm'): void;
  (e: 'cancel'): void;
  (e: 'openProfile'): void;
}>();

const { t } = useI18n();

const model = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
});

const tab = ref('overview');

const { activeUnit } = useMintsStore();
const uiStore = useUiStore();

function formatCurrency(amount: number): string {
  return uiStore.formatCurrency(amount, activeUnit.value);
}

const profileTitle = computed(() => {
  return (
    props.profile?.display_name ||
    props.profile?.name ||
    props.sub?.subscriberNpub ||
    ''
  );
});

const nextRenewal = computed(() => {
  const ts = props.sub?.nextRenewal;
  if (!ts) return '—';
  return new Date(ts * 1000).toLocaleString();
});

const amountPerInterval = computed(() => {
  const s = props.sub;
  if (!s) return '';
  const periodAmount = s.receivedPeriods > 0 ? s.totalAmount / s.receivedPeriods : s.totalAmount;
  return `${formatCurrency(periodAmount)} / ${s.frequency}`;
});

const lifetimeTotal = computed(() => {
  const s = props.sub;
  if (!s) return '';
  return formatCurrency(s.totalAmount);
});

const sinceDate = computed(() => {
  const ts = props.sub?.startDate;
  if (!ts) return '—';
  return new Date(ts * 1000).toLocaleDateString();
});

function copy(text?: string) {
  if (!text) return;
  copyNpub(text);
}

const payments = ref<Array<{ id: string; status: string; date: string; amount: number }>>([]);
const paymentsLoading = ref(false);
const originEl = ref<HTMLElement | null>(null);

async function loadPayments() {
  const id = props.sub?.subscriptionId;
  if (!id) {
    payments.value = [];
    return;
  }
  paymentsLoading.value = true;
  try {
    const rows = await cashuDb.lockedTokens
      .where('subscriptionId')
      .equals(id)
      .and((t) => t.owner === 'creator')
      .sortBy('unlockTs');
    rows.reverse();
    payments.value = rows.slice(0, 8).map((r) => ({
      id: r.id,
      status: r.status === 'claimed' ? 'Paid' : 'Failed',
      date: new Date(r.unlockTs * 1000).toLocaleDateString(),
      amount: r.amount,
    }));
  } finally {
    paymentsLoading.value = false;
  }
}

watch(
  () => props.sub?.subscriptionId,
  () => {
    if (model.value) loadPayments();
  },
);

watch(model, (v) => {
  if (v) {
    loadPayments();
    originEl.value = document.activeElement as HTMLElement;
  } else {
    originEl.value?.focus();
  }
});

const storageKey = computed(() => `sub-notes:${props.sub?.subscriptionId ?? ''}`);
const notes = useLocalStorage<string>(storageKey, props.notes ?? '');

watch(
  () => props.notes,
  (v) => {
    if (v !== undefined) notes.value = v;
  },
);

watch(notes, (v) => emit('update:notes', v));

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

<style scoped lang="scss">
.subscriber-drawer {
  max-height: 100vh;
  z-index: 3000;
}

.drawer-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background-color: var(--panel-bg-color);
}

.drawer-scroll {
  overflow: auto;
  flex: 1;
}

.drawer-scroll::before,
.drawer-scroll::after {
  content: '';
  position: sticky;
  left: 0;
  right: 0;
  height: 16px;
  pointer-events: none;
  z-index: 10;
}

.drawer-scroll::before {
  top: 0;
  background: linear-gradient(var(--panel-bg-color), transparent);
}

.drawer-scroll::after {
  bottom: 0;
  background: linear-gradient(transparent, var(--panel-bg-color));
}
</style>
