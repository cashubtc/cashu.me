<template>
  <div class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <h5 class="q-my-none">{{ $t("SubscriptionsOverview.title") }}</h5>
      <q-btn
        v-if="creatorSubscriptions.length > 0"
        flat
        color="primary"
        to="/creator-subscribers"
      >
        My Subscribers
      </q-btn>
    </div>
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="row items-center">
        <div class="col-12 col-sm-6">
          {{ $t("SubscriptionsOverview.summary.monthly") }}:
          {{ formatCurrency(monthlyTotal) }}
        </div>
        <div class="col-12 col-sm-6 text-left text-sm-right">
          {{ $t("SubscriptionsOverview.summary.total") }}:
          {{ formatCurrency(totalLocked) }}
        </div>
      </q-card-section>
    </q-card>
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
    <q-banner v-if="soonRows.length" dense class="q-mb-md bg-warning">
      {{ $t("SubscriptionsOverview.soon_unlock", { count: soonRows.length }) }}
    </q-banner>
    <div>
      <q-form class="q-gutter-sm q-mb-md">
        <q-btn
          flat
          dense
          icon="tune"
          :label="$t('SubscriptionsOverview.actions.open_filters.label')"
          @click="showFilterPanel = !showFilterPanel"
        />
        <q-slide-transition>
          <div v-show="showFilterPanel" class="q-mt-sm q-gutter-sm column">
            <q-input
              v-model="filter"
              dense
              debounce="300"
              outlined
              clearable
              :placeholder="$t('global.actions.search.label')"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
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
              :label="$t('SubscriptionsOverview.filter.status')"
            />
            <q-select
              v-model="sortBy"
              dense
              emit-value
              map-options
              :options="sortOptions"
              :label="$t('SubscriptionsOverview.sort_by')"
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
              :label="$t('SubscriptionsOverview.filter.bucket')"
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
              :label="$t('SubscriptionsOverview.filter.frequency')"
            />
          </div>
        </q-slide-transition>
      </q-form>
      <div v-if="isLoading" class="subscription-grid">
        <q-card v-for="n in 3" :key="n" flat bordered class="placeholder-card">
          <q-card-section class="row items-center">
            <q-skeleton type="circle" size="40px" />
            <div class="q-ml-sm col">
              <q-skeleton type="text" width="75%" />
              <q-skeleton type="text" width="50%" />
            </div>
            <q-skeleton width="60px" height="20px" class="q-ml-auto" />
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-skeleton width="100%" height="8px" />
            <div class="row justify-between q-mt-sm">
              <q-skeleton width="40%" height="12px" />
              <q-skeleton width="40%" height="12px" />
            </div>
          </q-card-section>
          <q-card-section>
            <q-skeleton type="text" width="70%" class="q-mb-xs" />
            <q-skeleton type="text" width="50%" class="q-mb-xs" />
            <q-skeleton type="text" width="60%" />
          </q-card-section>
          <q-card-actions class="justify-between">
            <div class="q-gutter-xs">
              <q-skeleton width="60px" height="24px" />
              <q-skeleton width="60px" height="24px" />
            </div>
            <q-skeleton width="24px" height="24px" />
          </q-card-actions>
        </q-card>
      </div>
      <div v-else class="subscription-grid">
        <q-card
          v-for="row in filteredRows"
          :key="row.creator"
          flat
          bordered
          class="subscription-card"
        >
          <q-card-section class="row items-center">
            <q-avatar size="40px" v-if="profiles[row.creator]?.picture">
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
              <div class="text-caption">{{ row.tierName }}</div>
            </div>
            <q-badge
              :color="row.status === 'active' ? 'positive' : 'negative'"
              class="q-ml-auto"
            >
              {{ $t(`SubscriptionsOverview.status.${row.status}`) }}
            </q-badge>
            <q-badge v-if="row.soon" color="warning" class="q-ml-sm">
              {{ $t("SubscriptionsOverview.soon_badge") }}
            </q-badge>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-linear-progress
              rounded
              size="8px"
              class="mobile-progress"
              :class="row.status === 'active' ? 'active-bar' : 'expired-bar'"
              :value="row.progress"
              track-color="grey-4"
            />
            <div class="row justify-between text-caption q-mt-xs">
              <div>
                {{ row.totalPeriods - row.monthsLeft }} /
                {{ row.totalPeriods }} months
              </div>
              <div>
                {{
                  row.countdown
                    ? $t("SubscriptionsOverview.row.next_unlock_label", {
                        value: row.countdown,
                      })
                    : "-"
                }}
              </div>
            </div>
          </q-card-section>
          <q-card-section>
            <div class="text-caption">
              <strong>{{ row.tierName }}</strong>
            </div>
            <div class="text-caption">
              Cost: {{ formatCurrency(row.monthly) }} / {{ row.frequency }}
            </div>
            <div class="text-caption">
              Total: {{ formatCurrency(row.total) }}
            </div>
            <ul class="q-pl-md q-mt-xs text-caption">
              <li v-for="(b, i) in row.benefits" :key="i">{{ b }}</li>
            </ul>
          </q-card-section>
          <q-card-actions class="justify-between">
            <div class="q-gutter-xs">
              <q-btn
                size="sm"
                flat
                color="primary"
                @click="toggleDetails(row.creator)"
              >
                {{ $t("SubscriptionsOverview.view") }}
              </q-btn>
              <q-btn
                size="sm"
                flat
                color="primary"
                @click="sendMessage(row.creator)"
              >
                {{ $t("SubscriptionsOverview.message") }}
              </q-btn>
              <q-btn
                size="sm"
                flat
                color="primary"
                @click="extendSubscription(row.creator)"
              >
                {{ $t("SubscriptionsOverview.renew") }}
              </q-btn>
            </div>
            <q-btn
              flat
              round
              dense
              icon="more_vert"
              :aria-label="
                $t('SubscriptionsOverview.actions.more_actions.label')
              "
            >
              <q-tooltip>
                {{ $t("SubscriptionsOverview.actions.more_actions.label") }}
              </q-tooltip>
              <q-menu anchor="bottom right" self="top right">
                <q-list dense style="min-width: 150px">
                  <q-item
                    clickable
                    v-close-popup
                    @click="toggleDetails(row.creator)"
                  >
                    <q-item-section>{{
                      $t("SubscriptionsOverview.view")
                    }}</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-close-popup
                    :to="`/creator/${pubkeyNpub(row.creator)}`"
                  >
                    <q-item-section>{{
                      $t("FindCreators.actions.view_profile.label")
                    }}</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-close-popup
                    @click="sendMessage(row.creator)"
                  >
                    <q-item-section>{{
                      $t("SubscriptionsOverview.message")
                    }}</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-close-popup
                    @click="extendSubscription(row.creator)"
                  >
                    <q-item-section>{{
                      $t("SubscriptionsOverview.extend")
                    }}</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-close-popup
                    @click="shareTokens(row.creator)"
                  >
                    <q-item-section>{{
                      $t("SubscriptionsOverview.export")
                    }}</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-close-popup
                    @click="exportTokens(row.creator)"
                  >
                    <q-item-section>{{
                      $t("SubscriptionsOverview.export_csv")
                    }}</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-close-popup
                    @click="cancelSubscription(row.creator)"
                  >
                    <q-item-section>{{
                      $t("SubscriptionsOverview.cancel")
                    }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-card-actions>
          <q-slide-transition>
            <div v-show="row.expanded" class="q-mt-sm">
              <q-list bordered>
                <q-item v-for="t in row.tokens" :key="t.id">
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
                      @click="copy(t.token)"
                      :aria-label="$t('global.actions.copy.label')"
                    />
                  </q-item-section>
                </q-item>
                <div
                  v-if="row.tokens.length === 0"
                  class="text-center q-pa-md text-caption"
                >
                  {{ $t("LockedTokensTable.empty_text") }}
                </div>
              </q-list>
            </div>
          </q-slide-transition>
        </q-card>
      </div>
      <div v-if="!filteredRows.length" class="text-center q-pa-md">
        {{ $t("SubscriptionsOverview.empty") }}
        <q-btn flat color="primary" to="/find-creators" class="q-ml-md">
          {{ $t("SubscriptionsOverview.discover") }}
        </q-btn>
      </div>
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
      <SubscriptionReceipt
        v-model="showReceiptDialog"
        :receipts="receiptList"
      />
      <ConfirmationDialog
        v-model="showConfirmDialog"
        :title="confirmTitle"
        :message="confirmDialogMessage"
        :confirm-label="$t('global.actions.ok.label')"
        :cancel-label="$t('global.actions.cancel.label')"
        @confirm="confirmCancel"
      />
    </div>
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
import { useCreatorSubscriptionsStore } from "stores/creatorSubscriptions";
import { fetchNutzapProfile, RelayConnectionError } from "stores/nostr";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import ConfirmationDialog from "components/ConfirmationDialog.vue";
import { nip19 } from "nostr-tools";
import { formatDistanceToNow } from "date-fns";
import { shortenString } from "src/js/string-utils";
import { useI18n } from "vue-i18n";
import { notifyError } from "src/js/notify";
import { showToast } from "src/js/toast";
import type { Proof } from "@cashu/cashu-ts";
import { useProofsStore } from "stores/proofs";
import { useSendTokensStore } from "stores/sendTokensStore";
import token from "src/js/token";
import SubscriptionReceipt from "components/SubscriptionReceipt.vue";
import { cashuDb } from "stores/dexie";
import { useClipboard } from "src/composables/useClipboard";
import profileCache from "src/js/profile-cache";
import { useNdk } from "src/composables/useNdk";

const bucketsStore = useBucketsStore();
const mintsStore = useMintsStore();
const uiStore = useUiStore();
const proofsStore = useProofsStore();
const sendTokensStore = useSendTokensStore();
const nutzap = useNutzapStore();
const creatorSubscriptionsStore = useCreatorSubscriptionsStore();
const { activeUnit } = storeToRefs(mintsStore);
const { sendQueue } = storeToRefs(nutzap);
const { subscriptions: creatorSubscriptions } = storeToRefs(
  creatorSubscriptionsStore
);

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

const expandedRows = ref<Record<string, boolean>>({});

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
    const soon = !!nextUnlock && nextUnlock - nowSec <= 7 * 24 * 60 * 60;
    const monthsLeft = future.length;
    const monthly = sub.amountPerInterval;
    const start = sub.startDate || null;
    const progress = tokens.length ? 1 - monthsLeft / tokens.length : 0;
    const totalPeriods = tokens.length;
    const end =
      start && totalPeriods
        ? start + (totalPeriods - 1) * 30 * 24 * 60 * 60
        : null;
    const unlocked = tokens.filter(
      (t) => !t.locktime || t.locktime <= nowSec
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
      totalPeriods,
      end,
      hasUnlocked: unlocked > 0,
      status,
      tokens,
      tierName: (sub as any).tierName,
      benefits: (sub as any).benefits || [],
      frequency: sub.frequency,
      tokensRemaining: monthsLeft,
      soon,
      expanded: expandedRows.value[sub.creatorNpub] || false,
    };
  });
});

const soonRows = computed(() => rows.value.filter((r) => r.soon));

const totalLocked = computed(() => rows.value.reduce((s, r) => s + r.total, 0));
const monthlyTotal = computed(() =>
  rows.value.reduce((s, r) => s + r.monthly, 0)
);

const profiles = ref<Record<string, any>>({});
const nostr = useNostrStore();
const messenger = useMessengerStore();
const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();
const { copy } = useClipboard();
const showMessageDialog = ref(false);
const showReceiptDialog = ref(false);
const receiptList = ref<any[]>([]);
const showConfirmDialog = ref(false);
const confirmTitle = ref("");
const confirmDialogMessage = ref("");
const confirmPubkey = ref("");
const messageText = ref("");
const messageRecipient = ref("");
const filter = ref("");
const statusFilter = ref<string | null>(null);
const bucketFilter = ref<string | null>(null);
const frequencyFilter = ref<string | null>(null);
const sortBy = ref("end-date-asc");
const sortOptions = [
  { label: t("SubscriptionsOverview.sort.end"), value: "end-date-asc" },
  { label: t("SubscriptionsOverview.sort.name"), value: "name-asc" },
  { label: t("SubscriptionsOverview.sort.cost"), value: "cost-desc" },
  {
    label: t("SubscriptionsOverview.columns.start"),
    value: "start-date-desc",
  },
];
const showFilterPanel = ref(false);
const isLoading = ref(true);

const filteredRows = computed(() => {
  const term = filter.value.toLowerCase();
  const list = rows.value.filter((r) => {
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
  let field = "end";
  let descending = false;
  switch (sortBy.value) {
    case "name-asc":
      field = "creator";
      break;
    case "cost-desc":
      field = "monthly";
      descending = true;
      break;
    case "start-date-desc":
      field = "start";
      descending = true;
      break;
    case "end-date-asc":
    default:
      field = "end";
      break;
  }
  return customSort([...list], field, descending);
});

function customSort(rows: any[], sortBy: string, descending: boolean) {
  return rows.sort((a, b) => {
    let result = 0;
    if (sortBy === "creator") {
      const profileA = profiles.value[a.creator];
      const profileB = profiles.value[b.creator];
      const nameA =
        profileA?.display_name || profileA?.name || (a.creator as string);
      const nameB =
        profileB?.display_name || profileB?.name || (b.creator as string);
      result = nameA.localeCompare(nameB);
    } else {
      const x = a[sortBy];
      const y = b[sortBy];
      if (typeof x === "number" && typeof y === "number") {
        result = x - y;
      } else {
        result = String(x).localeCompare(String(y));
      }
    }
    return descending ? -result : result;
  });
}

function toggleDetails(pubkey: string) {
  expandedRows.value[pubkey] = !expandedRows.value[pubkey];
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

async function retryQueuedSends() {
  await nutzap.retryQueuedSends();
  nutzap.clearSendQueue();
}

function cancelSubscription(pubkey: string) {
  const row = rows.value.find((r) => r.creator === pubkey);
  if (!row) return;
  confirmPubkey.value = pubkey;
  confirmTitle.value = t("SubscriptionsOverview.cancel_confirm_title");
  confirmDialogMessage.value = t("SubscriptionsOverview.cancel_confirm_text");
  showConfirmDialog.value = true;
}

function extendSubscription(pubkey: string) {
  const row = rows.value.find((r) => r.creator === pubkey);
  const sub = subscriptionsStore.subscriptions.find(
    (s) => s.creatorNpub === pubkey
  );
  if (!row || !sub) return;
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
    const startDate = lastLock + (sub.intervalDays ?? 30) * 24 * 60 * 60;
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
      const newTokens = await nutzap.send({
        npub: pubkey,
        months,
        amount: row.monthly,
        startDate,
        intervalDays: sub.intervalDays,
      });
      receiptList.value = newTokens as any[];
      showReceiptDialog.value = true;
      const newSubId = newTokens[0]?.subscriptionId;
      if (newSubId) {
        await subscriptionsStore.deleteSubscription(newSubId);
      }
      const totalPeriods = sub.intervals.length + newTokens.length;
      const existingIntervals = sub.intervals.map((i, idx) => ({
        ...i,
        monthIndex: idx + 1,
        totalPeriods,
      }));
      const addedIntervals = newTokens.map((t: any, idx: number) => ({
        intervalKey: String(sub.intervals.length + idx + 1),
        lockedTokenId: t.id,
        unlockTs: t.unlockTs,
        status: "pending",
        tokenString: t.tokenString,
        autoRedeem: false,
        redeemed: false,
        subscriptionId: sub.id,
        tierId: sub.tierId,
        monthIndex: sub.intervals.length + idx + 1,
        totalPeriods,
        htlcHash: t.htlcHash ?? null,
        htlcSecret: t.htlcSecret ?? null,
      }));
      await cashuDb.lockedTokens.bulkPut(
        newTokens.map((t: any, idx: number) => ({
          ...t,
          tierId: sub.tierId,
          ...(sub.tierName ? { tierName: sub.tierName } : {}),
          subscriptionId: sub.id,
          monthIndex: sub.intervals.length + idx + 1,
          totalPeriods,
        }))
      );
      await subscriptionsStore.addSubscription({
        ...sub,
        id: sub.id,
        commitmentLength: totalPeriods,
        intervals: [...existingIntervals, ...addedIntervals],
      } as any);
      showToast(
        t("SubscriptionsOverview.notifications.extend_success"),
        "positive"
      );
    } catch (e: any) {
      showToast(e.message, "negative");
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
  showToast(
    t("SubscriptionsOverview.notifications.export_success"),
    "positive"
  );
}

function confirmCancel() {
  const pubkey = confirmPubkey.value;
  if (!pubkey) return;
  subscriptionsStore
    .cancelSubscription(pubkey)
    .then(() =>
      showToast(
        t("SubscriptionsOverview.notifications.cancel_success"),
        "positive"
      )
    )
    .catch((e: any) => showToast(e.message, "negative"))
    .finally(() => {
      showConfirmDialog.value = false;
    });
}

async function updateProfiles() {
  const missing: string[] = [];
  for (const sub of subscriptionsStore.subscriptions) {
    const pk = sub.creatorNpub;
    const cached = profileCache.get(pk);
    if (cached) {
      profiles.value[pk] = cached;
    } else if (profiles.value[pk] === undefined) {
      missing.push(pk);
    }
  }
  if (!missing.length) return;
  try {
    await nostr.initNdkReadOnly();
    const ndk = await useNdk({ requireSigner: false });
    const events = await ndk.fetchEvents({ kinds: [0], authors: missing });
    const found = new Set<string>();
    events.forEach((ev: any) => {
      try {
        const profile = JSON.parse(ev.content || "{}");
        profileCache.set(ev.pubkey, profile);
        profiles.value[ev.pubkey] = profile;
        found.add(ev.pubkey);
      } catch (e) {
        profiles.value[ev.pubkey] = {};
      }
    });
    for (const pk of missing) {
      if (!found.has(pk)) {
        profiles.value[pk] = {};
      }
    }
  } catch (e) {
    console.error("Failed to fetch profiles", e);
    for (const pk of missing) {
      profiles.value[pk] = {};
    }
  }
}

onMounted(async () => {
  try {
    await updateProfiles();
    isLoading.value = false;
  } catch (e: any) {
    notifyError(e.message);
  }
});
watch(() => subscriptionsStore.subscriptions, updateProfiles);
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

.placeholder-card {
  animation: placeholder-pulse 1.5s ease-in-out infinite;
}

.subscription-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
}

@media (min-width: 600px) {
  .subscription-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .subscription-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@keyframes placeholder-pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}
</style>
