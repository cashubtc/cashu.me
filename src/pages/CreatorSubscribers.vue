<template>
  <q-page class="q-pa-md">
    <!-- page header -->
    <div
      class="sticky top-0 z-10 mb-6"
      :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
    >
      <div
        class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <h5 class="q-my-none">
          {{ $t("CreatorSubscribers.summary.subscribers") }} ({{ total }})
        </h5>
        <div class="flex items-center gap-2 w-full md:w-auto">
          <q-input
            v-model="filter"
            dense
            debounce="300"
            clearable
            class="flex-1"
            :placeholder="$t('CreatorSubscribers.filter.placeholder')"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-btn
            flat
            color="primary"
            icon="filter_list"
            :label="$t('CreatorSubscribers.actions.filters')"
            @click="showFilters = true"
          />
        </div>
      </div>
    </div>

    <!-- summary cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <!-- total subscribers card -->
      <q-card class="bg-gray-800/50 border border-gray-700 text-white">
        <q-card-section>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <q-icon name="group" />
              <div class="text-sm">
                {{ $t("CreatorSubscribers.summary.subscribers") }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-h6">{{ total }}</div>
              <div class="text-xs text-gray-300">
                +{{ subscribersThisMonth }} {{ $t("CreatorSubscribers.summary.thisMonth") }}
              </div>
            </div>
          </div>
          <div class="flex justify-between text-xs text-gray-300 mt-2">
            <div class="flex items-center gap-1">
              <q-icon name="check_circle" size="16px" />
              <span>{{ active }}</span>
            </div>
            <div class="flex items-center gap-1">
              <q-icon name="hourglass_top" size="16px" />
              <span>{{ pending }}</span>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- active subscribers card -->
      <q-card class="bg-gray-800/50 border border-gray-700 text-white">
        <q-card-section>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <q-icon name="verified" />
              <div class="text-sm">
                {{ $t("CreatorSubscribers.summary.active") }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-h6">{{ active }}</div>
              <div class="text-xs text-gray-300">
                +{{ activeThisMonth }} {{ $t("CreatorSubscribers.summary.thisMonth") }}
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- revenue card -->
      <q-card class="bg-gray-800/50 border border-gray-700 text-white">
        <q-card-section>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <q-icon name="attach_money" />
              <div class="text-sm">
                {{ $t("CreatorSubscribers.summary.revenue") }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-h6">{{ formatCurrency(revenue) }}</div>
              <div class="text-xs text-gray-300">
                +{{ formatCurrency(revenueThisMonth) }} {{ $t("CreatorSubscribers.summary.thisMonth") }}
              </div>
            </div>
          </div>
          <svg viewBox="0 0 100 30" class="w-full h-8 mt-2 text-primary">
            <polyline
              :points="revenueSparklinePoints"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </q-card-section>
      </q-card>
    </div>

    <!-- bulk actions -->
    <q-banner
      v-if="selected.length"
      class="bg-grey-2 q-px-md q-py-sm rounded-borders mb-4 flex items-center gap-2"
    >
      <div class="text-caption">{{ t('CreatorSubscribers.selectionCount', { count: selected.length }) }}</div>
      <q-btn
        flat
        color="primary"
        :disable="selected.length === 0 || !canSendDm"
        :label="$t('CreatorSubscribers.actions.sendGroupMessage')"
        @click="sendGroupMessage"
      >
        <q-tooltip v-if="selected.length === 0">
          {{ t('CreatorSubscribers.tooltips.noSelection') }}
        </q-tooltip>
        <q-tooltip v-else-if="!canSendDm">
          {{ t('CreatorSubscribers.tooltips.notLoggedIn') }}
        </q-tooltip>
      </q-btn>
      <q-btn
        flat
        color="primary"
        :disable="selected.length === 0"
        :label="$t('CreatorSubscribers.actions.exportSelected')"
        @click="exportSelected"
      >
        <q-tooltip v-if="selected.length === 0">
          {{ t('CreatorSubscribers.tooltips.noSelection') }}
        </q-tooltip>
      </q-btn>
    </q-banner>

    <!-- no data -->
    <div
      v-if="!loading && filteredSubscribers.length === 0"
      class="text-center q-mt-xl"
    >
      {{ $t("CreatorSubscribers.noData") }}
    </div>

    <!-- subscriber cards -->
    <div v-else class="space-y-4">
      <q-card
        v-for="sub in filteredSubscribers"
        :key="sub.subscriptionId"
        class="p-4 flex items-center gap-4 cursor-pointer"
        @click="openSubscriber(sub)"
      >
        <q-checkbox
          :model-value="isSelected(sub)"
          @update:model-value="(val) => handleSelectChange(val, sub)"
          @click.stop
        />
        <q-avatar size="48px">
          <div class="placeholder text-white">
            {{ getInitials(sub.subscriberNpub) }}
          </div>
        </q-avatar>
        <div class="flex-1">
          <div class="font-medium">
            {{ shortenString(pubkeyNpub(sub.subscriberNpub), 15, 6) }}
          </div>
          <q-badge color="primary" class="q-mt-xs">{{ sub.tierName }}</q-badge>
        </div>
        <div class="text-right">
          <div>{{ formatCurrency(sub.totalAmount) }}</div>
          <q-badge
            class="q-mt-xs"
            :color="sub.status === 'active' ? 'positive' : 'warning'"
          >
            {{ t(`CreatorSubscribers.status.${sub.status}`) }}
          </q-badge>
        </div>
      </q-card>
    </div>

    <!-- filter dialog -->
    <q-dialog v-model="showFilters">
      <q-card style="min-width: 300px">
        <q-card-section class="text-h6">
          {{ $t('CreatorSubscribers.actions.filters') }}
        </q-card-section>
        <q-card-section>
          <q-select
            v-model="tierFilter"
            dense
            emit-value
            map-options
            clearable
            :options="tierOptions"
            :label="$t('CreatorSubscribers.columns.tier')"
          />
          <q-select
            v-model="statusFilter"
            dense
            emit-value
            map-options
            clearable
            class="q-mt-md"
            :options="statusOptions"
            :label="$t('CreatorSubscribers.columns.status')"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat color="primary" @click="clearFilters" v-close-popup>
            {{ $t('global.actions.cancel.label') }}
          </q-btn>
          <q-btn flat color="primary" v-close-popup>
            {{ $t('global.actions.ok.label') }}
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showSubscriberDialog" position="right">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center q-gutter-md">
          <q-avatar size="64px">
            <template v-if="subscriberProfile?.picture">
              <img :src="subscriberProfile.picture" />
            </template>
            <template v-else>
              <div class="placeholder text-white">{{ subscriberInitials }}</div>
            </template>
          </q-avatar>
          <div class="column">
            <div class="text-h6">{{ subscriberName }}</div>
            <div class="text-caption">{{ currentSubscriberNpub }}</div>
          </div>
        </q-card-section>
        <q-card-section>
          <div>
            <strong>{{ $t('CreatorSubscribers.columns.tier') }}:</strong>
            {{ currentSubscriber?.tierName }}
          </div>
          <div>
            <strong>{{ $t('CreatorSubscribers.columns.nextRenewal') }}:</strong>
            {{
              currentSubscriber?.nextRenewal
                ? formatTs(currentSubscriber.nextRenewal)
                : '-'
            }}
          </div>
          <div>
            <strong>{{ $t('CreatorSubscribers.summary.revenue') }}:</strong>
            {{ formatCurrency(currentSubscriber?.totalAmount || 0) }}
          </div>
        </q-card-section>
        <q-card-section v-if="latestNote">
          <div class="text-subtitle1 q-mb-xs">Latest note</div>
          <div class="text-body2">{{ latestNote }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat color="primary" @click="sendMessageFromDrawer">
            {{ $t('CreatorSubscribers.actions.sendMessage') }}
          </q-btn>
          <q-btn flat color="primary" @click="copyNpub">
            {{ $t('global.actions.copy.label') }}
          </q-btn>
          <q-btn flat v-close-popup color="grey">
            {{ $t('global.actions.close.label') }}
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showMessageDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="text-h6">{{ dialogTitle }}</q-card-section>
        <q-card-section>
          <q-input
            v-model="messageText"
            type="textarea"
            autogrow
            dense
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat color="primary" v-close-popup>
            {{ $t('global.actions.cancel.label') }}
          </q-btn>
          <q-btn flat color="primary" @click="confirmMessage">
            {{ $t('global.actions.send.label') }}
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import {
  useCreatorSubscriptionsStore,
  type CreatorSubscription,
} from "stores/creatorSubscriptions";
import { useMintsStore } from "stores/mints";
import { useUiStore } from "stores/ui";
import { useI18n } from "vue-i18n";
import { useMessengerStore } from "stores/messenger";
import { useRouter } from "vue-router";
import { useNostrStore } from "stores/nostr";
import { notifySuccess, notifyError } from "src/js/notify";
import exportSubscribers from "src/utils/subscriberCsv";
import { nip19 } from "nostr-tools";
import { shortenString } from "src/js/string-utils";

const creatorSubscriptionsStore = useCreatorSubscriptionsStore();
const { subscriptions, loading } = storeToRefs(creatorSubscriptionsStore);

const mintsStore = useMintsStore();
const uiStore = useUiStore();
const { activeUnit } = storeToRefs(mintsStore);
const { t } = useI18n();

const filter = ref("");
const tierFilter = ref<string | null>(null);
const statusFilter = ref<string | null>(null);
const showFilters = ref(false);

const tierOptions = computed(() => {
  const set = new Set(subscriptions.value.map((s) => s.tierName));
  return Array.from(set).map((name) => ({ label: name, value: name }));
});

const statusOptions = computed(() => [
  { label: t("CreatorSubscribers.status.active"), value: "active" },
  { label: t("CreatorSubscribers.status.pending"), value: "pending" },
]);

function clearFilters() {
  tierFilter.value = null;
  statusFilter.value = null;
}

function formatCurrency(amount: number): string {
  return uiStore.formatCurrency(amount, activeUnit.value);
}

function formatTs(ts: number): string {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${(
    "0" + d.getDate()
  ).slice(-2)}`;
}

const total = computed(() => subscriptions.value.length);
const active = computed(
  () => subscriptions.value.filter((s) => s.status === "active").length
);
const pending = computed(
  () => subscriptions.value.filter((s) => s.status === "pending").length
);
const revenue = computed(() =>
  subscriptions.value.reduce((sum, s) => sum + s.totalAmount, 0)
);

function isThisMonth(ts: number | null) {
  if (!ts) return false;
  const d = new Date(ts * 1000);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

const subscribersThisMonth = computed(() =>
  subscriptions.value.filter((s) => isThisMonth(s.startDate)).length
);
const activeThisMonth = computed(() =>
  subscriptions.value.filter(
    (s) => s.status === "active" && isThisMonth(s.startDate)
  ).length
);
const revenueThisMonth = computed(() =>
  subscriptions.value
    .filter((s) => isThisMonth(s.startDate))
    .reduce((sum, s) => sum + s.totalAmount, 0)
);

const revenueTrend = computed(() =>
  subscriptions.value
    .slice()
    .sort((a, b) => (a.startDate || 0) - (b.startDate || 0))
    .map((s) => s.totalAmount)
);

const revenueSparklinePoints = computed(() => {
  const data = revenueTrend.value;
  if (data.length === 0) return "";
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  return data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 30 - ((v - min) / range) * 30;
      return `${x},${y}`;
    })
    .join(" ");
});

const messenger = useMessengerStore();
const router = useRouter();
const nostr = useNostrStore();
const selected = ref<CreatorSubscription[]>([]);
const showMessageDialog = ref(false);
const messageText = ref("");
const messageRecipients = ref<string[]>([]);
const dialogTitle = computed(() =>
  messageRecipients.value.length > 1
    ? t("CreatorSubscribers.actions.sendGroupMessage")
    : t("CreatorSubscribers.actions.sendMessage"),
);
const canSendDm = computed(
  () =>
    messenger.connected &&
    (!!nostr.signer || !!nostr.privKeyHex)
);

function pubkeyNpub(hex: string): string {
  try {
    return nip19.npubEncode(hex);
  } catch {
    return hex;
  }
}

function sendMessage(npub: string) {
  messageRecipients.value = [npub];
  messageText.value = "";
  showMessageDialog.value = true;
}

function sendGroupMessage() {
  const recips = selected.value.map((s) => s.subscriberNpub);
  if (!recips.length) return;
  messageRecipients.value = recips;
  messageText.value = "";
  showMessageDialog.value = true;
}

async function confirmMessage() {
  const text = messageText.value.trim();
  const recips = messageRecipients.value;
  showMessageDialog.value = false;
  if (!text || recips.length === 0) return;
  if (!canSendDm.value) {
    notifyError(t('CreatorSubscribers.notifications.dm_not_ready'));
    return;
  }
  let allSuccess = true;
  for (const r of recips) {
    const { success } = await messenger.sendDm(r, text);
    if (success) {
      messenger.createConversation(r);
      messenger.setCurrentConversation(r);
      messenger.markRead(r);
    } else {
      allSuccess = false;
    }
  }
  selected.value = [];
  if (allSuccess) {
    notifySuccess(t('wallet.notifications.nostr_dm_sent'));
    if (recips.length) router.push('/nostr-messenger');
  } else {
    notifyError(t('wallet.notifications.nostr_dm_failed'));
  }
}

function exportSelected() {
  if (!selected.value.length) return;
  try {
    exportSubscribers(selected.value, 'subscribers.csv');
    notifySuccess(t('CreatorSubscribers.notifications.export_success'));
  } catch {
    notifyError(t('CreatorSubscribers.notifications.export_failed'));
  }
  selected.value = [];
}

function isSelected(sub: CreatorSubscription) {
  return selected.value.some((s) => s.subscriptionId === sub.subscriptionId);
}

function handleSelectChange(val: boolean, sub: CreatorSubscription) {
  const idx = selected.value.findIndex((s) => s.subscriptionId === sub.subscriptionId);
  if (val && idx === -1) selected.value.push(sub);
  if (!val && idx !== -1) selected.value.splice(idx, 1);
  const ids = selected.value.map((s) => s.subscriptionId);
  if (ids.length !== new Set(ids).size) {
    console.warn('Duplicate subscriptionId detected in selection');
  }
}

const showSubscriberDialog = ref(false);
const currentSubscriber = ref<CreatorSubscription | null>(null);
const subscriberProfile = ref<any>(null);
const latestNote = ref<string | null>(null);

const currentSubscriberNpub = computed(() =>
  currentSubscriber.value ? pubkeyNpub(currentSubscriber.value.subscriberNpub) : ""
);

async function openSubscriber(sub: CreatorSubscription) {
  currentSubscriber.value = sub;
  showSubscriberDialog.value = true;
  subscriberProfile.value = null;
  latestNote.value = null;
  try {
    subscriberProfile.value = await nostr.getProfile(sub.subscriberNpub);
    latestNote.value = await nostr.fetchMostRecentPost(sub.subscriberNpub);
  } catch (e) {
    console.error(e);
  }
}

const subscriberName = computed(() => {
  if (!currentSubscriber.value) return "";
  const p: any = subscriberProfile.value;
  return p?.display_name || p?.name || currentSubscriberNpub.value;
});

const subscriberInitials = computed(() => {
  const name = subscriberName.value.trim();
  if (!name) return "";
  const parts = name.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
});

function sendMessageFromDrawer() {
  if (!currentSubscriber.value) return;
  showSubscriberDialog.value = false;
  sendMessage(currentSubscriber.value.subscriberNpub);
}

async function copyNpub() {
  if (!currentSubscriber.value) return;
  try {
    await navigator?.clipboard?.writeText(currentSubscriberNpub.value);
    notifySuccess(t("global.copy_to_clipboard.success"));
  } catch {
    notifyError(t("copy_failed"));
  }
}
function getInitials(npub: string): string {
  return pubkeyNpub(npub).slice(0, 2).toUpperCase();
}

const filteredSubscribers = computed(() => {
  const term = filter.value.toLowerCase();
  return subscriptions.value.filter((s) => {
    const matchesSearch =
      !term ||
      s.subscriberNpub.toLowerCase().includes(term) ||
      s.tierName.toLowerCase().includes(term);
    const matchesTier = !tierFilter.value || s.tierName === tierFilter.value;
    const matchesStatus =
      !statusFilter.value || s.status === statusFilter.value;
    return matchesSearch && matchesTier && matchesStatus;
  });
});
</script>

<style scoped>
.placeholder {
  background: var(--divider-color);
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
</style>
