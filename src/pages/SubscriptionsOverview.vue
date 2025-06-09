<template>
  <div class="q-pa-md">
    <h5 class="q-my-none q-mb-md">{{ $t('SubscriptionsOverview.title') }}</h5>
    <div class="row items-center q-mb-md">
      <div class="col">
        {{ $t('SubscriptionsOverview.summary.monthly') }}:
        {{ formatCurrency(monthlyTotal) }}
      </div>
      <div class="col text-right">
        {{ $t('SubscriptionsOverview.summary.total') }}:
        {{ formatCurrency(totalLocked) }}
      </div>
    </div>
    <q-table
      flat
      bordered
      dense
      :rows="rows"
      :columns="columns"
      row-key="creator"
    >
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
        {{ props.row.bucketName || '-' }}
      </template>
      <template #body-cell-monthly="props">
        {{ formatCurrency(props.row.monthly) }}
      </template>
      <template #body-cell-total="props">
        {{ formatCurrency(props.row.total) }}
      </template>
      <template #body-cell-start="props">
        {{ props.row.start ? formatTs(props.row.start) : '-' }}
      </template>
      <template #body-cell-next_unlock="props">
        {{ props.row.nextUnlock ? formatTs(props.row.nextUnlock) : '-' }}
      </template>
      <template #body-cell-remaining="props">
        <div class="row items-center">
          <span class="q-mr-sm">{{ props.row.monthsLeft }}</span>
          <q-linear-progress
            rounded
            size="8px"
            :value="props.row.progress"
            style="width: 80px"
          />
        </div>
      </template>
      <template #body-cell-actions="props">
        <q-btn
          flat
          dense
          size="sm"
          @click="openDetails(props.row.creator)"
        >
          {{ $t('SubscriptionsOverview.view') }}
        </q-btn>
        <q-btn
          flat
          dense
          size="sm"
          class="q-ml-xs"
          @click="sendMessage(props.row.creator)"
        >
          {{ $t('SubscriptionsOverview.message') }}
        </q-btn>
      </template>
      <template #no-data>
        <div class="text-center q-pa-md">
          {{ $t('SubscriptionsOverview.empty') }}
          <q-btn
            flat
            color="primary"
            to="/find-creators"
            class="q-ml-md"
          >
            {{ $t('SubscriptionsOverview.discover') }}
          </q-btn>
        </div>
      </template>
    </q-table>
    <q-dialog v-model="showDialog">
      <q-card style="min-width:300px">
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
                  {{ t.locktime ? formatTs(t.locktime) : '-' }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
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
            {{ $t('LockedTokensTable.empty_text') }}
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat color="primary" v-close-popup>
            {{ $t('global.actions.close.label') }}
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useLockedTokensStore, type LockedToken } from 'stores/lockedTokens';
import { useBucketsStore } from 'stores/buckets';
import { useMintsStore } from 'stores/mints';
import { useUiStore } from 'stores/ui';
import { useNostrStore } from 'stores/nostr';
import { useQuasar, copyToClipboard } from 'quasar';
import { nip19 } from 'nostr-tools';
import { shortenString } from 'src/js/string-utils';
import { useI18n } from 'vue-i18n';
import { notifySuccess, notifyError } from 'src/js/notify';

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
    const nextUnlock = future.sort((a, b) => a.locktime! - b.locktime!)[0]?.locktime || null;
    const monthsLeft = future.length;
    const monthly = tokens[0]?.amount || 0;
    const start = tokens.reduce((m, t) => (t.locktime && (!m || t.locktime < m) ? t.locktime : m), null as number | null);
    const progress = tokens.length ? 1 - monthsLeft / tokens.length : 0;
    const bucketNames = [...new Set(
      tokens
        .map((t) => bucketsStore.bucketList.find((b) => b.id === t.bucketId)?.name)
        .filter(Boolean)
    )].join(", ");
    return {
      creator,
      bucketName: bucketNames,
      total,
      monthly,
      start,
      nextUnlock,
      monthsLeft,
      progress,
      tokens,
    };
  });
});

const totalLocked = computed(() => rows.value.reduce((s, r) => s + r.total, 0));
const monthlyTotal = computed(() => rows.value.reduce((s, r) => s + r.monthly, 0));

const profiles = ref<Record<string, any>>({});
const nostr = useNostrStore();
const $q = useQuasar();
const { t } = useI18n();
const showDialog = ref(false);
const selectedCreator = ref("");

const creatorTokens = computed(() => {
  const row = rows.value.find((r) => r.creator === selectedCreator.value);
  return row ? row.tokens : [];
});

function openDetails(pubkey: string) {
  selectedCreator.value = pubkey;
  showDialog.value = true;
}

async function sendMessage(pubkey: string) {
  const { success } = await nostr.sendNip04DirectMessage(pubkey, "");
  if (success) {
    notifySuccess(t("wallet.notifications.nostr_dm_sent"));
  } else {
    notifyError(t("wallet.notifications.nostr_dm_failed"));
  }
}

function copyToken(token: string) {
  copyToClipboard(token).then(() => {
    $q.notify({ message: t("global.copy_to_clipboard.success"), position: "bottom" });
  });
}

function updateProfiles() {
  Object.keys(groups.value).forEach(async (pk) => {
    if (!profiles.value[pk]) {
      const p = await nostr.getProfile(pk);
      if (p) profiles.value[pk] = p;
    }
  });
}

onMounted(updateProfiles);
watch(groups, updateProfiles);

const columns = computed(() => [
  { name: "creator", label: t("SubscriptionsOverview.columns.creator"), field: "creator" },
  { name: "bucket", label: t("SubscriptionsOverview.columns.bucket"), field: "bucketName" },
  { name: "monthly", label: t("SubscriptionsOverview.columns.monthly"), field: "monthly", align: "right" },
  { name: "total", label: t("SubscriptionsOverview.columns.total"), field: "total", align: "right" },
  { name: "start", label: t("SubscriptionsOverview.columns.start"), field: "start" },
  { name: "next_unlock", label: t("SubscriptionsOverview.columns.next_unlock"), field: "nextUnlock" },
  { name: "remaining", label: t("SubscriptionsOverview.columns.remaining"), field: "monthsLeft", align: "right" },
  { name: "actions", label: t("SubscriptionsOverview.columns.actions"), field: "creator" },
]);
</script>

<style scoped>
</style>

