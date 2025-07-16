<template>
  <div class="q-pa-md">
    <h5 class="q-my-none q-mb-md">{{ $t("SubscriptionsOverview.title") }}</h5>
    <div class="row items-center q-mb-md">
      <div class="col">
        {{ $t("SubscriptionsOverview.summary.monthly") }}:
        {{ formatCurrency(monthlyTotal) }}
      </div>
      <div class="col text-right">
        {{ $t("SubscriptionsOverview.summary.total") }}:
        {{ formatCurrency(totalLocked) }}
      </div>
    </div>
    <q-banner v-if="sendQueue.length" dense class="q-mb-md bg-orange-2">
      {{
        $t("SubscriptionsOverview.pending_retry", { count: sendQueue.length })
      }}
      <template #action>
        <q-btn flat color="primary" dense @click="retryQueuedSends">
          {{ $t("SubscriptionsOverview.actions.retry_now") }}
        </q-btn>
      </template>
    </q-banner>
    <div v-if="isSmallScreen">
      <div class="row q-col-gutter-sm q-mb-md">
        <q-input
          v-model="filter"
          dense
          debounce="300"
          class="col"
          :placeholder="$t('global.actions.search.label')"
        />
        <q-select
          v-model="statusFilter"
          dense
          emit-value
          map-options
          clearable
          class="col"
          :options="[
            {
              label: $t('SubscriptionsOverview.status.active'),
              value: 'active',
            },
            {
              label: $t('SubscriptionsOverview.status.expired'),
              value: 'expired',
            },
          ]"
          :placeholder="$t('SubscriptionsOverview.filter.status')"
        />
        <q-select
          v-model="bucketFilter"
          dense
          emit-value
          map-options
          clearable
          class="col"
          :options="
            bucketsStore.bucketList.map((b) => ({
              label: b.name,
              value: b.name,
            }))
          "
          :placeholder="$t('SubscriptionsOverview.filter.bucket')"
        />
        <q-select
          v-model="frequencyFilter"
          dense
          emit-value
          map-options
          clearable
          class="col"
          :options="[
            { label: 'monthly', value: 'monthly' },
            { label: 'weekly', value: 'weekly' },
          ]"
          :placeholder="$t('SubscriptionsOverview.filter.frequency')"
        />
      </div>
      <div v-for="row in filteredRows" :key="row.creator" class="q-mb-md">
        <q-card flat bordered>
          <q-card-section class="row items-center">
            <q-avatar size="32px" v-if="profiles[row.creator]?.picture">
              <img :src="profiles[row.creator].picture" />
            </q-avatar>
            <div class="q-ml-sm">
              <div>
                {{
                  profiles[row.creator]?.display_name ||
                  profiles[row.creator]?.name ||
                  shortenString(pubkeyNpub(row.creator), 15, 6)
                }}
              </div>
              <div class="text-caption">
                {{ row.tierName }}
              </div>
            </div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-linear-progress
              rounded
              size="8px"
              class="mobile-progress"
              :class="row.status === 'active' ? 'active-bar' : 'expired-bar'"
              :value="row.progress"
              :label="Math.round(row.progress * 100) + '%'"
              :color="row.status === 'active' ? 'positive' : 'negative'"
              track-color="grey-4"
            >
              <q-tooltip>
                {{
                  row.countdown
                    ? $t("SubscriptionsOverview.row.next_unlock_label", {
                        value: row.countdown,
                      })
                    : "-"
                }}
              </q-tooltip>
            </q-linear-progress>
          </q-card-section>
          <q-card-actions align="right" class="q-gutter-xs">
            <q-btn flat dense size="sm" @click="openDetails(row.creator)">
              {{ $t("SubscriptionsOverview.view") }}
            </q-btn>
            <q-btn
              flat
              dense
              size="sm"
              class="q-ml-xs"
              :to="`/creator/${pubkeyNpub(row.creator)}`"
            >
              {{ $t("FindCreators.actions.view_profile") }}
            </q-btn>
            <q-btn
              flat
              dense
              size="sm"
              class="q-ml-xs"
              @click="sendMessage(row.creator)"
            >
              {{ $t("SubscriptionsOverview.message") }}
            </q-btn>
            <q-btn
              flat
              dense
              size="sm"
              class="q-ml-xs"
              @click="extendSubscription(row.creator)"
            >
              {{ $t("SubscriptionsOverview.extend") }}
            </q-btn>
            <q-btn
              flat
              dense
              size="sm"
              class="q-ml-xs"
              @click="shareTokens(row.creator)"
            >
              {{ $t("SubscriptionsOverview.export") }}
            </q-btn>
            <q-btn
              flat
              dense
              size="sm"
              class="q-ml-xs"
              @click="exportTokens(row.creator)"
            >
              {{ $t("SubscriptionsOverview.export_csv") }}
            </q-btn>
            <q-btn
              flat
              dense
              size="sm"
              class="q-ml-xs"
              @click="cancelSubscription(row.creator)"
            >
              {{ $t("SubscriptionsOverview.cancel") }}
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>
      <div v-if="!filteredRows.length" class="text-center q-pa-md">
        {{ $t("SubscriptionsOverview.empty") }}
        <q-btn flat color="primary" to="/find-creators" class="q-ml-md">
          {{ $t("SubscriptionsOverview.discover") }}
        </q-btn>
      </div>
    </div>
    <q-table
      v-else
      flat
      bordered
      dense
      :rows="filteredRows"
      :columns="columns"
      row-key="creator"
      :rows-per-page-options="[5, 10, 20, 0]"
      :filter="filter"
      :pagination="pagination"
      :sort-method="customSort"
    >
      <template #top-right>
        <q-input
          v-model="filter"
          dense
          debounce="300"
          class="q-mr-md"
          :placeholder="$t('global.actions.search.label')"
        />
        <q-select
          v-model="statusFilter"
          dense
          emit-value
          map-options
          clearable
          :options="[
            {
              label: $t('SubscriptionsOverview.status.active'),
              value: 'active',
            },
            {
              label: $t('SubscriptionsOverview.status.expired'),
              value: 'expired',
            },
          ]"
          :placeholder="$t('SubscriptionsOverview.filter.status')"
        />
        <q-select
          v-model="bucketFilter"
          dense
          emit-value
          map-options
          clearable
          :options="
            bucketsStore.bucketList.map((b) => ({
              label: b.name,
              value: b.name,
            }))
          "
          class="q-ml-md"
          :placeholder="$t('SubscriptionsOverview.filter.bucket')"
        />
        <q-select
          v-model="frequencyFilter"
          dense
          emit-value
          map-options
          clearable
          :options="[
            { label: 'monthly', value: 'monthly' },
            { label: 'weekly', value: 'weekly' },
          ]"
          class="q-ml-md"
          :placeholder="$t('SubscriptionsOverview.filter.frequency')"
        />
      </template>
      <template #body-cell-creator="props">
        <div class="row items-center">
          <q-avatar size="32px" v-if="profiles[props.row.creator]?.picture">
            <img :src="profiles[props.row.creator].picture" />
          </q-avatar>
          <div class="q-ml-sm">
            <div>
              {{
                profiles[props.row.creator]?.display_name ||
                profiles[props.row.creator]?.name ||
                shortenString(pubkeyNpub(props.row.creator), 15, 6)
              }}
            </div>
            <div class="text-caption">
              {{ props.row.bucketName }}
            </div>
          </div>
        </div>
      </template>
      <template #body-cell-bucket="props">
        {{ props.row.bucketName || "-" }}
      </template>
      <template #body-cell-benefits="props">
        <template v-if="Array.isArray(props.row.benefits)">
          <ul class="q-my-none q-pl-none">
            <li v-for="(benefit, idx) in props.row.benefits" :key="idx">
              {{ benefit }}
            </li>
          </ul>
        </template>
        <template v-else>
          {{ props.row.benefits }}
        </template>
      </template>
      <template #body-cell-monthly="props">
        {{ formatCurrency(props.row.monthly) }}
      </template>
      <template #body-cell-total="props">
        {{ formatCurrency(props.row.total) }}
      </template>
      <template #body-cell-start="props">
        {{ props.row.start ? formatTs(props.row.start) : "-" }}
      </template>
      <template #body-cell-end="props">
        {{ props.row.end ? formatTs(props.row.end) : "-" }}
      </template>
      <template #body-cell-totalMonths="props">
        {{ props.row.totalMonths }}
      </template>
      <template #body-cell-next_unlock="props">
        {{ props.row.nextUnlock ? formatTs(props.row.nextUnlock) : "-" }}
      </template>
      <template #body-cell-status="props">
        <div class="row items-center">
          <q-badge
            :color="props.row.status === 'active' ? 'positive' : 'negative'"
            class="q-mr-xs"
          >
            {{ $t(`SubscriptionsOverview.status.${props.row.status}`) }}
          </q-badge>
          <q-badge v-if="props.row.hasUnlocked" color="primary">
            {{ $t("SubscriptionsOverview.status.unlocked") }}
          </q-badge>
        </div>
      </template>
      <template #body-cell-remaining="props">
        <div class="row items-center">
          <span class="q-mr-sm">{{ props.row.monthsLeft }}</span>
          <q-linear-progress
            rounded
            size="8px"
            class="progress"
            :class="
              props.row.status === 'active' ? 'active-bar' : 'expired-bar'
            "
            :value="props.row.progress"
            :label="Math.round(props.row.progress * 100) + '%'"
            :color="props.row.status === 'active' ? 'positive' : 'negative'"
            track-color="grey-4"
          >
            <q-tooltip>
              {{
                props.row.countdown
                  ? $t("SubscriptionsOverview.row.next_unlock_label", {
                      value: props.row.countdown,
                    })
                  : "-"
              }}
            </q-tooltip>
          </q-linear-progress>
        </div>
      </template>
      <template #body-cell-actions="props">
        <q-btn flat dense size="sm" @click="openDetails(props.row.creator)">
          {{ $t("SubscriptionsOverview.view") }}
        </q-btn>
        <q-btn
          flat
          dense
          size="sm"
          class="q-ml-xs"
          :to="`/creator/${pubkeyNpub(props.row.creator)}`"
        >
          {{ $t("FindCreators.actions.view_profile") }}
        </q-btn>
        <q-btn
          flat
          dense
          size="sm"
          class="q-ml-xs"
          @click="sendMessage(props.row.creator)"
        >
          {{ $t("SubscriptionsOverview.message") }}
        </q-btn>
        <q-btn
          flat
          dense
          size="sm"
          class="q-ml-xs"
          @click="extendSubscription(props.row.creator)"
        >
          {{ $t("SubscriptionsOverview.extend") }}
        </q-btn>
        <q-btn
          flat
          dense
          size="sm"
          class="q-ml-xs"
          @click="shareTokens(props.row.creator)"
        >
          {{ $t("SubscriptionsOverview.export") }}
        </q-btn>
        <q-btn
          flat
          dense
          size="sm"
          class="q-ml-xs"
          @click="exportTokens(props.row.creator)"
        >
          {{ $t("SubscriptionsOverview.export_csv") }}
        </q-btn>
        <q-btn
          flat
          dense
          size="sm"
          class="q-ml-xs"
          @click="cancelSubscription(props.row.creator)"
        >
          {{ $t("SubscriptionsOverview.cancel") }}
        </q-btn>
      </template>
      <template #no-data>
        <div class="text-center q-pa-md">
          {{ $t("SubscriptionsOverview.empty") }}
          <q-btn flat color="primary" to="/find-creators" class="q-ml-md">
            {{ $t("SubscriptionsOverview.discover") }}
          </q-btn>
        </div>
      </template>
    </q-table>
    <q-dialog v-model="showDialog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">
            {{
              profiles[selectedCreator]?.display_name ||
              profiles[selectedCreator]?.name ||
              shortenString(pubkeyNpub(selectedCreator), 15, 6)
            }}
          </div>
        </q-card-section>
        <q-card-section class="q-pa-none">
          <q-list bordered>
            <q-item v-for="t in creatorTokens" :key="t.id">
              <q-item-section>
                <q-item-label class="text-weight-bold">
                  {{ formatCurrency(t.amount) }}
                </q-item-label>
                <q-item-label caption>
                  Month {{ t.monthIndex }} -
                  {{ t.locktime ? formatTs(t.locktime) : "-" }}
                </q-item-label>
                <q-item-label caption v-if="t.locktime">
                  Unlocks in {{ countdownTo(t.locktime) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon
                  :name="t.redeemed ? 'check_circle' : 'hourglass_empty'"
                  :color="t.redeemed ? 'positive' : 'grey'"
                  class="q-mr-sm"
                />
                <q-btn
                  flat
                  dense
                  icon="content_copy"
                  @click="copyToken(t.token)"
                />
              </q-item-section>
            </q-item>
          </q-list>
          <div
            v-if="creatorTokens.length === 0"
            class="text-center q-pa-md text-caption"
          >
            {{ $t("LockedTokensTable.empty_text") }}
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat color="primary" v-close-popup>
            {{ $t("global.actions.close.label") }}
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showMessageDialog">
      <q-card style="min-width: 300px">
        <q-card-section class="text-h6">
          {{ $t("SubscriptionsOverview.message") }}
        </q-card-section>
        <q-card-section>
          <q-input v-model="messageText" type="textarea" autofocus />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat v-close-popup color="grey">
            {{ $t("global.actions.cancel.label") }}
          </q-btn>
          <q-btn
            flat
            color="primary"
            :disable="!messageText.trim()"
            @click="confirmMessage"
          >
            {{ $t("global.actions.send.label") }}
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <SubscriptionReceipt v-model="showReceiptDialog" :receipts="receiptList" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from "vue";
import { storeToRefs } from "pinia";
import type { LockedToken } from "stores/lockedTokens";
import { useBucketsStore } from "stores/buckets";
import { useMintsStore } from "stores/mints";
import { useUiStore } from "stores/ui";
import { useNostrStore } from "stores/nostr";
import { useMessengerStore } from "stores/messenger";
import { useSubscriptionsStore } from "stores/subscriptions";
import { useNutzapStore } from "stores/nutzap";
import { fetchNutzapProfile, RelayConnectionError } from "stores/nostr";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useClipboard } from "src/composables/useClipboard";
import { nip19 } from "nostr-tools";
import { formatDistanceToNow } from "date-fns";
import { shortenString } from "src/js/string-utils";
import { useI18n } from "vue-i18n";
import { notifySuccess, notifyError } from "src/js/notify";
import type { Proof } from "@cashu/cashu-ts";
import { useProofsStore } from "stores/proofs";
import { useSendTokensStore } from "stores/sendTokensStore";
import token from "src/js/token";
import SubscriptionReceipt from "components/SubscriptionReceipt.vue";

const bucketsStore = useBucketsStore();
const mintsStore = useMintsStore();
const uiStore = useUiStore();
const proofsStore = useProofsStore();
const sendTokensStore = useSendTokensStore();
const nutzap = useNutzapStore();
const { activeUnit } = storeToRefs(mintsStore);
const { sendQueue } = storeToRefs(nutzap);

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
  return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${(
    "0" + d.getDate()
  ).slice(-2)}`;
}

function countdownTo(ts: number): string {
  return formatDistanceToNow(ts * 1000);
}

const subscriptionsStore = useSubscriptionsStore();

const now = ref(Date.now());
let nowTimer: any;
onMounted(() => {
  nowTimer = setInterval(() => {
    now.value = Date.now();
  }, 1000);
});
onUnmounted(() => clearInterval(nowTimer));

const rows = computed(() => {
  const nowSec = Math.floor(now.value / 1000);
  return subscriptionsStore.subscriptions.map((sub) => {
    const tokens: LockedToken[] = sub.intervals.map((i) => ({
      id: i.lockedTokenId,
      amount: sub.amountPerInterval,
      token: i.tokenString,
      pubkey: sub.creatorNpub,
      locktime: i.unlockTs,
      bucketId: sub.tierId,
      date: "",
      status: i.status,
      redeemed: i.redeemed ?? false,
      monthIndex: i.monthIndex,
    }));
    const total = tokens.reduce((sum, t) => sum + t.amount, 0);
    const future = tokens.filter((t) => t.locktime && t.locktime > nowSec);
    const nextUnlock =
      future.sort((a, b) => a.locktime! - b.locktime!)[0]?.locktime || null;
    const countdown = nextUnlock ? formatDistanceToNow(nextUnlock * 1000) : "";
    const monthsLeft = future.length;
    const monthly = sub.amountPerInterval;
    const start = sub.startDate || null;
    const progress = tokens.length ? 1 - monthsLeft / tokens.length : 0;
    const totalMonths = tokens.length;
    const end =
      start && totalMonths
        ? start + (totalMonths - 1) * 30 * 24 * 60 * 60
        : null;
    const unlocked = tokens.filter(
      (t) => !t.locktime || t.locktime <= nowSec,
    ).length;
    const status = monthsLeft > 0 ? "active" : "expired";
    const bucket = bucketsStore.bucketList.find((b) => b.id === sub.tierId);
    const bucketName = bucket?.name || "";
    return {
      creator: sub.creatorNpub,
      bucketName,
      total,
      monthly,
      start,
      nextUnlock,
      countdown,
      monthsLeft,
      progress,
      totalMonths,
      end,
      hasUnlocked: unlocked > 0,
      status,
      tokens,
      tierName: (sub as any).tierName,
      benefits: (sub as any).benefits || [],
      frequency: sub.frequency,
      tokensRemaining: monthsLeft,
    };
  });
});

const totalLocked = computed(() => rows.value.reduce((s, r) => s + r.total, 0));
const monthlyTotal = computed(() =>
  rows.value.reduce((s, r) => s + r.monthly, 0),
);

const profiles = ref<Record<string, any>>({});
const nostr = useNostrStore();
const messenger = useMessengerStore();
const router = useRouter();
const $q = useQuasar();
const { copy } = useClipboard();
const isSmallScreen = computed(() => $q.screen.lt.md);
const { t } = useI18n();
const showDialog = ref(false);
const selectedCreator = ref("");
const showMessageDialog = ref(false);
const showReceiptDialog = ref(false);
const receiptList = ref<any[]>([]);
const messageText = ref("");
const messageRecipient = ref("");
const filter = ref("");
const statusFilter = ref<string | null>(null);
const bucketFilter = ref<string | null>(null);
const frequencyFilter = ref<string | null>(null);
const pagination = ref({ page: 1, rowsPerPage: 10 });

const filteredRows = computed(() => {
  const term = filter.value.toLowerCase();
  return rows.value.filter((r) => {
    const matchesStatus =
      !statusFilter.value || r.status === statusFilter.value;
    const matchesBucket =
      !bucketFilter.value || r.bucketName === bucketFilter.value;
    const matchesFrequency =
      !frequencyFilter.value || r.frequency === frequencyFilter.value;
    const rowString = JSON.stringify(r).toLowerCase();
    const matchesFilter = !term || rowString.includes(term);
    return matchesStatus && matchesBucket && matchesFrequency && matchesFilter;
  });
});

function customSort(rows: any[], sortBy: string, descending: boolean) {
  return rows.sort((a, b) => {
    const x = a[sortBy];
    const y = b[sortBy];
    let result = 0;
    if (typeof x === "number" && typeof y === "number") {
      result = x - y;
    } else {
      result = String(x).localeCompare(String(y));
    }
    return descending ? -result : result;
  });
}

const creatorTokens = computed(() => {
  const row = rows.value.find((r) => r.creator === selectedCreator.value);
  return row ? row.tokens : [];
});

function openDetails(pubkey: string) {
  selectedCreator.value = pubkey;
  showDialog.value = true;
}

function sendMessage(pubkey: string) {
  messageRecipient.value = pubkey;
  messageText.value = "";
  showMessageDialog.value = true;
}

async function confirmMessage() {
  const text = messageText.value.trim();
  const recipient = messageRecipient.value;
  showMessageDialog.value = false;
  if (!text || !recipient) return;
  const { success } = await messenger.sendDm(recipient, text);
  if (success) {
    notifySuccess(t("wallet.notifications.nostr_dm_sent"));
    messenger.createConversation(recipient);
    messenger.setCurrentConversation(recipient);
    messenger.markRead(recipient);
    router.push("/nostr-messenger");
  } else {
    notifyError(t("wallet.notifications.nostr_dm_failed"));
  }
}

function retryQueuedSends() {
  nutzap.retryQueuedSends();
}

function cancelSubscription(pubkey: string) {
  const row = rows.value.find((r) => r.creator === pubkey);
  if (!row) return;
  $q.dialog({
    title: t("SubscriptionsOverview.cancel_confirm_title"),
    message: t("SubscriptionsOverview.cancel_confirm_text"),
    cancel: true,
    persistent: true,
  }).onOk(() => {
    subscriptionsStore
      .cancelSubscription(pubkey)
      .then(() =>
        notifySuccess(t("SubscriptionsOverview.notifications.cancel_success")),
      )
      .catch((e: any) => notifyError(e.message));
  });
}

function extendSubscription(pubkey: string) {
  const row = rows.value.find((r) => r.creator === pubkey);
  if (!row) return;
  $q.dialog({
    title: t("SubscriptionsOverview.extend_dialog_title"),
    message: t("SubscriptionsOverview.extend_dialog_text"),
    prompt: {
      model: 1,
      type: "number",
      min: 1,
    },
    cancel: true,
    persistent: true,
  }).onOk(async (months: number) => {
    if (!months || months <= 0) return;
    const future = row.tokens
      .filter((t) => t.locktime)
      .sort((a, b) => (a.locktime || 0) - (b.locktime || 0));
    const lastLock = future.length
      ? future[future.length - 1].locktime!
      : Math.floor(Date.now() / 1000);
    const startDate = lastLock + 30 * 24 * 60 * 60;
    try {
      let profile = null;
      try {
        profile = await fetchNutzapProfile(pubkey);
      } catch (e: any) {
        if (e instanceof RelayConnectionError) {
          notifyError("Unable to connect to Nostr relays");
          return;
        }
        throw e;
      }
      if (!profile) {
        notifyError("Creator has not published a Nutzap profile (kind-10019)");
        return;
      }
      const receipts = await nutzap.send({
        npub: pubkey,
        months,
        amount: row.monthly,
        startDate,
      });
      receiptList.value = receipts as any[];
      showReceiptDialog.value = true;
      notifySuccess(t("SubscriptionsOverview.notifications.extend_success"));
    } catch (e: any) {
      notifyError(e.message);
    }
  });
}

function shareTokens(pubkey: string) {
  const row = rows.value.find((r) => r.creator === pubkey);
  if (!row) return;
  const proofs = row.tokens.flatMap((t) => {
    const decoded = token.decode(t.token);
    return decoded ? (token.getProofs(decoded) as Proof[]) : [];
  });
  if (!proofs.length) return;
  const tokenStr = proofsStore.serializeProofs(proofs);
  sendTokensStore.clearSendData();
  sendTokensStore.sendData.tokensBase64 = tokenStr;
  sendTokensStore.showSendTokens = true;
}

function exportTokens(pubkey: string) {
  const row = rows.value.find((r) => r.creator === pubkey);
  if (!row) return;
  const lines = ["amount,unlock_time,token"];
  row.tokens.forEach((t) => {
    lines.push(`${t.amount},${t.locktime || ""},${t.token}`);
  });
  const csv = lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tokens_${pubkey}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function copyToken(token: string) {
  copy(token);
}

async function updateProfiles() {
  for (const sub of subscriptionsStore.subscriptions) {
    const pk = sub.creatorNpub;
    if (!profiles.value[pk]) {
      const p = await nostr.getProfile(pk);
      if (p) profiles.value[pk] = p;
    }
  }
}

onMounted(async () => {
  try {
    await updateProfiles();
  } catch (e: any) {
    notifyError(e.message);
  }
});
watch(() => subscriptionsStore.subscriptions, updateProfiles);

const columns = computed(() => [
  {
    name: "creator",
    label: t("SubscriptionsOverview.columns.creator"),
    field: "creator",
    sortable: true,
  },
  {
    name: "bucket",
    label: t("SubscriptionsOverview.columns.bucket"),
    field: "bucketName",
    sortable: true,
  },
  {
    name: "tierName",
    label: t("SubscriptionsOverview.columns.tierName"),
    field: "tierName",
    sortable: true,
  },
  {
    name: "benefits",
    label: t("SubscriptionsOverview.columns.benefits"),
    field: "benefits",
    sortable: true,
  },
  {
    name: "frequency",
    label: t("SubscriptionsOverview.columns.frequency"),
    field: "frequency",
    sortable: true,
  },
  {
    name: "tokensRemaining",
    label: t("SubscriptionsOverview.columns.tokensRemaining"),
    field: "tokensRemaining",
    align: "right",
    sortable: true,
  },
  {
    name: "monthly",
    label: t("SubscriptionsOverview.columns.monthly"),
    field: "monthly",
    align: "right",
    sortable: true,
  },
  {
    name: "total",
    label: t("SubscriptionsOverview.columns.total"),
    field: "total",
    align: "right",
    sortable: true,
  },
  {
    name: "start",
    label: t("SubscriptionsOverview.columns.start"),
    field: "start",
    sortable: true,
  },
  {
    name: "end",
    label: t("SubscriptionsOverview.columns.end"),
    field: "end",
    sortable: true,
  },
  {
    name: "totalMonths",
    label: t("SubscriptionsOverview.columns.total_months"),
    field: "totalMonths",
    align: "right",
    sortable: true,
  },
  {
    name: "next_unlock",
    label: t("SubscriptionsOverview.columns.next_unlock"),
    field: "nextUnlock",
    sortable: true,
  },
  {
    name: "status",
    label: t("SubscriptionsOverview.columns.status"),
    field: "status",
    sortable: true,
  },
  {
    name: "remaining",
    label: t("SubscriptionsOverview.columns.remaining"),
    field: "monthsLeft",
    align: "right",
    sortable: true,
  },
  {
    name: "actions",
    label: t("SubscriptionsOverview.columns.actions"),
    field: "creator",
    sortable: true,
  },
]);
</script>

<style scoped>
.progress {
  width: 80px;
}

.q-table {
  margin-bottom: 16px;
}

@media (min-width: 600px) {
  .q-pa-md {
    padding: 24px;
  }
}

.active-bar {
  --q-color-positive: #4caf50;
}

.expired-bar {
  --q-color-negative: #f44336;
}

.mobile-progress {
  width: 100%;
}
</style>
