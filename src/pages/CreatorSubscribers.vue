<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card>
          <q-card-section class="text-center">
            <div class="text-h6">
              {{ $t("CreatorSubscribers.summary.subscribers") }}
            </div>
            <div class="text-subtitle1">{{ total }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card>
          <q-card-section class="text-center">
            <div class="text-h6">
              {{ $t("CreatorSubscribers.summary.active") }}
            </div>
            <div class="text-subtitle1">{{ active }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card>
          <q-card-section class="text-center">
            <div class="text-h6">
              {{ $t("CreatorSubscribers.summary.pending") }}
            </div>
            <div class="text-subtitle1">{{ pending }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card>
          <q-card-section class="text-center">
            <div class="text-h6">
              {{ $t("CreatorSubscribers.summary.revenue") }}
            </div>
            <div class="text-subtitle1">{{ formatCurrency(revenue) }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-input
          v-model="filter"
          dense
          debounce="300"
          clearable
          :placeholder="$t('CreatorSubscribers.filter.placeholder')"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-6 col-md-4">
        <q-select
          v-model="frequencyFilter"
          dense
          emit-value
          map-options
          clearable
          :options="frequencyOptions"
          :label="$t('CreatorSubscribers.filters.frequency')"
        />
      </div>
      <div class="col-6 col-md-4">
        <q-select
          v-model="statusFilter"
          dense
          emit-value
          map-options
          clearable
          :options="statusOptions"
          :label="$t('CreatorSubscribers.columns.status')"
        />
      </div>
    </div>

    <div
      v-if="!loading && filteredSubscribers.length === 0"
      class="text-center q-mt-xl"
    >
      {{ $t("CreatorSubscribers.noData") }}
    </div>

    <div v-else>
      <q-table
        :rows="filteredSubscribers"
        :columns="columns"
        row-key="subscriptionId"
        selection="multiple"
        v-model:selected="selected"
        flat
        :pagination="{ rowsPerPage: 0 }"
        @row-click="(_, row) => openSubscriber(row)"
      >
        <template #top>
          <div class="row items-center q-gutter-sm">
            <q-btn
              flat
              color="primary"
              :disable="selected.length === 0"
              :label="$t('CreatorSubscribers.actions.sendGroupMessage')"
              @click="sendGroupMessage"
            />
            <q-btn
              flat
              color="primary"
              :disable="selected.length === 0"
              :label="$t('CreatorSubscribers.actions.exportSelected')"
              @click="exportSelected"
            />
          </div>
        </template>
        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              size="sm"
              flat
              icon="chat"
              @click.stop="sendMessage(props.row.subscriberNpub)"
            >
              <q-tooltip>{{ $t('CreatorSubscribers.actions.sendMessage') }}</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>
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
            <div class="text-caption">{{ currentSubscriber?.subscriberNpub }}</div>
          </div>
        </q-card-section>
        <q-card-section>
          <div><strong>Tier:</strong> {{ currentSubscriber?.tierName }}</div>
          <div>
            <strong>Next renewal:</strong>
            {{ currentSubscriber?.nextRenewal ? formatTs(currentSubscriber.nextRenewal) : '-' }}
          </div>
          <div>
            <strong>Total paid:</strong>
            {{ formatCurrency(currentSubscriber?.totalAmount || 0) }}
          </div>
        </q-card-section>
        <q-card-section v-if="latestNote">
          <div class="text-subtitle1 q-mb-xs">Latest note</div>
          <div class="text-body2">{{ latestNote }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat color="primary" @click="viewProfile">View Profile</q-btn>
          <q-btn flat color="primary" @click="sendMessageFromDrawer">Send Message</q-btn>
          <q-btn flat v-close-popup color="grey">Close</q-btn>
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

const creatorSubscriptionsStore = useCreatorSubscriptionsStore();
const { subscriptions, loading } = storeToRefs(creatorSubscriptionsStore);

const mintsStore = useMintsStore();
const uiStore = useUiStore();
const { activeUnit } = storeToRefs(mintsStore);
const { t } = useI18n();

const filter = ref("");
const frequencyFilter = ref<string | null>(null);
const statusFilter = ref<string | null>(null);

const frequencyOptions = computed(() => [
  { label: t("CreatorSubscribers.frequency.weekly"), value: "weekly" },
  { label: t("CreatorSubscribers.frequency.biweekly"), value: "biweekly" },
  { label: t("CreatorSubscribers.frequency.monthly"), value: "monthly" },
]);

const statusOptions = computed(() => [
  { label: t("CreatorSubscribers.status.active"), value: "active" },
  { label: t("CreatorSubscribers.status.pending"), value: "pending" },
]);

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
  for (const r of recips) {
    const { success } = await messenger.sendDm(r, text);
    if (success) {
      notifySuccess(t("wallet.notifications.nostr_dm_sent"));
      messenger.createConversation(r);
      messenger.setCurrentConversation(r);
      messenger.markRead(r);
    } else {
      notifyError(t("wallet.notifications.nostr_dm_failed"));
    }
  }
  if (recips.length) router.push("/nostr-messenger");
}

function exportSelected() {
  if (!selected.value.length) return;
  exportSubscribers(selected.value, "subscribers.csv");
}

const showSubscriberDialog = ref(false);
const currentSubscriber = ref<CreatorSubscription | null>(null);
const subscriberProfile = ref<any>(null);
const latestNote = ref<string | null>(null);

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
  return (
    p?.display_name || p?.name || currentSubscriber.value.subscriberNpub
  );
});

const subscriberInitials = computed(() => {
  const name = subscriberName.value.trim();
  if (!name) return "";
  const parts = name.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
});

function viewProfile() {
  if (!currentSubscriber.value) return;
  showSubscriberDialog.value = false;
  router.push(`/creator/${currentSubscriber.value.subscriberNpub}`);
}

function sendMessageFromDrawer() {
  if (!currentSubscriber.value) return;
  showSubscriberDialog.value = false;
  sendMessage(currentSubscriber.value.subscriberNpub);
}

const columns = computed(() => [
  {
    name: "tier",
    label: t("CreatorSubscribers.columns.tier"),
    field: "tierName",
  },
  {
    name: "subscriber",
    label: t("CreatorSubscribers.columns.subscriber"),
    field: "subscriberNpub",
  },
  {
    name: "status",
    label: t("CreatorSubscribers.columns.status"),
    field: "status",
    format: (val: string) => t(`CreatorSubscribers.status.${val}`),
  },
  {
    name: "nextRenewal",
    label: t("CreatorSubscribers.columns.nextRenewal"),
    field: "nextRenewal",
    format: (val: number | null) => (val ? formatTs(val) : "-"),
  },
  {
    name: "revenue",
    label: t("CreatorSubscribers.summary.revenue"),
    field: "totalAmount",
    format: (val: number) => formatCurrency(val),
  },
  {
    name: "actions",
    label: t("CreatorSubscribers.columns.actions"),
    field: "actions",
    align: "right",
  },
]);

const filteredSubscribers = computed(() => {
  const term = filter.value.toLowerCase();
  return subscriptions.value.filter((s) => {
    const matchesSearch =
      !term ||
      s.subscriberNpub.toLowerCase().includes(term) ||
      s.tierName.toLowerCase().includes(term);
    const matchesFrequency =
      !frequencyFilter.value || s.frequency === frequencyFilter.value;
    const matchesStatus =
      !statusFilter.value || s.status === statusFilter.value;
    return matchesSearch && matchesFrequency && matchesStatus;
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
