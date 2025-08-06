<template>
  <div>
    <CreatorSubscribersFilters
      v-model:filter="filter"
      v-model:tierFilter="tierFilter"
      v-model:statusFilter="statusFilter"
      v-model:startFrom="startFrom"
      v-model:startTo="startTo"
      v-model:nextRenewalFrom="nextRenewalFrom"
      v-model:nextRenewalTo="nextRenewalTo"
      v-model:monthsRemaining="monthsRemaining"
      :tier-options="tierOptions"
      :status-options="statusOptions"
      :is-small-screen="isSmallScreen"
      v-model:showFilters="showFilters"
      @download-csv="downloadCsv"
    />
    <CreatorSubscribersSummary
      :total-active-subscribers="totalActiveSubscribers"
      :total-received-months="totalReceivedMonths"
      :total-revenue="totalRevenue"
      :format-currency="formatCurrency"
    />
    <div
      v-if="selected.length"
      class="row q-gutter-sm q-mb-md"
      :class="{ column: isSmallScreen }"
    >
      <q-btn
        color="primary"
        icon="chat"
        :label="t('CreatorSubscribers.actions.sendGroupMessage')"
        @click="sendGroupMessage"
        class="q-mb-sm"
      />
      <q-btn
        color="primary"
        icon="download"
        :label="t('CreatorSubscribers.actions.exportSelected')"
        @click="exportSelected"
        class="q-mb-sm"
      />
    </div>
    <q-table
      flat
      bordered
      row-key="subscriptionId"
      :rows="filteredSubscriptions"
      :columns="columns"
      :filter="filter"
      selection="multiple"
      v-model:selected="selected"
      v-model:pagination="pagination"
      :loading="loading"
      :rows-per-page-options="[5, 10, 20]"
      :grid="isSmallScreen"
    >
      <template #body-cell-subscriber="props">
        <q-td :props="props">
          <div class="row items-center no-wrap">
            <q-avatar size="32px">
              <template v-if="profiles[props.row.subscriberNpub] === undefined">
                <q-skeleton type="circle" size="32px" />
              </template>
              <template v-else-if="profiles[props.row.subscriberNpub]?.picture">
                <img :src="profiles[props.row.subscriberNpub].picture" />
              </template>
              <template v-else>
                <q-icon name="account_circle" />
              </template>
            </q-avatar>
            <div class="q-ml-sm">
              <template v-if="profiles[props.row.subscriberNpub] === undefined">
                <q-skeleton type="text" width="120px" />
              </template>
              <template v-else>
                {{
                  profiles[props.row.subscriberNpub]?.display_name ||
                  profiles[props.row.subscriberNpub]?.name ||
                  shortenString(pubkeyNpub(props.row.subscriberNpub), 15, 6)
                }}
              </template>
            </div>
          </div>
        </q-td>
      </template>
      <template #body-cell-months="props">
        <q-td :props="props">
          <div class="column">
            <div>
              {{
                t("CreatorSubscribers.monthsText", {
                  received: props.row.receivedMonths,
                  total: props.row.totalMonths,
                })
              }}
              <span v-if="props.row.totalMonths">
                (
                {{
                  Math.round(
                    (props.row.receivedMonths / props.row.totalMonths) * 100
                  )
                }}% )
              </span>
              <q-tooltip>
                {{ t("CreatorSubscribers.monthsTooltip") }}
              </q-tooltip>
            </div>
          </div>
        </q-td>
      </template>
      <template #body-cell-status="props">
        <q-td :props="props">
          <q-badge
            :color="props.row.status === 'active' ? 'positive' : 'warning'"
          >
            {{ t("CreatorSubscribers.status." + props.row.status) }}
          </q-badge>
        </q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props" class="text-right">
          <q-btn flat dense round icon="more_vert">
            <q-menu>
              <q-list style="min-width: 120px">
                <q-item
                  clickable
                  v-close-popup
                  @click="viewProfile(props.row.subscriberNpub)"
                >
                  <q-item-section>
                    {{ t("CreatorSubscribers.actions.viewProfile") }}
                  </q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="sendMessage(props.row.subscriberNpub)"
                >
                  <q-item-section>
                    {{ t("CreatorSubscribers.actions.sendMessage") }}
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-td>
      </template>
      <template v-if="isSmallScreen" #item="props">
        <div class="q-pa-xs col-12">
          <q-card
            class="relative-position"
            :class="props.selected ? 'bg-grey-2' : ''"
          >
            <q-checkbox
              class="absolute-top-right q-ma-sm"
              dense
              v-model="props.selected"
              @update:model-value="props.toggleSelection"
              @click.stop
            />
            <q-card-section class="row items-center no-wrap">
              <q-avatar size="32px">
                <template v-if="profiles[props.row.subscriberNpub] === undefined">
                  <q-skeleton type="circle" size="32px" />
                </template>
                <template v-else-if="profiles[props.row.subscriberNpub]?.picture">
                  <img :src="profiles[props.row.subscriberNpub].picture" />
                </template>
                <template v-else>
                  <q-icon name="account_circle" />
                </template>
              </q-avatar>
              <div class="q-ml-sm">
                <template v-if="profiles[props.row.subscriberNpub] === undefined">
                  <q-skeleton type="text" width="120px" />
                </template>
                <template v-else>
                  {{
                    profiles[props.row.subscriberNpub]?.display_name ||
                    profiles[props.row.subscriberNpub]?.name ||
                    shortenString(pubkeyNpub(props.row.subscriberNpub), 15, 6)
                  }}
                </template>
              </div>
            </q-card-section>
            <q-separator />
            <q-list dense>
              <q-item>
                <q-item-section>
                  <q-item-label caption>
                    {{ t("CreatorSubscribers.columns.tier") }}
                  </q-item-label>
                  <q-item-label>{{ props.row.tierName }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>
                    {{ t("CreatorSubscribers.columns.months") }}
                  </q-item-label>
                  <q-item-label>
                    <div>
                      {{
                        t("CreatorSubscribers.monthsText", {
                          received: props.row.receivedMonths,
                          total: props.row.totalMonths,
                        })
                      }}
                      <span v-if="props.row.totalMonths">
                        (
                        {{
                          Math.round(
                            (props.row.receivedMonths / props.row.totalMonths) *
                              100
                          )
                        }}% )
                      </span>
                      <q-tooltip>
                        {{ t("CreatorSubscribers.monthsTooltip") }}
                      </q-tooltip>
                    </div>
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>
                    {{ t("CreatorSubscribers.columns.remaining") }}
                  </q-item-label>
                  <q-item-label>
                    {{
                      props.row.totalMonths != null
                        ? props.row.totalMonths - props.row.receivedMonths
                        : 0
                    }}
                    <q-tooltip>
                      {{ t("CreatorSubscribers.monthsRemainingTooltip") }}
                    </q-tooltip>
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>
                    {{ t("CreatorSubscribers.columns.start") }}
                  </q-item-label>
                  <q-item-label>
                    {{
                      props.row.startDate ? formatTs(props.row.startDate) : "-"
                    }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>
                    {{ t("CreatorSubscribers.columns.nextRenewal") }}
                  </q-item-label>
                  <q-item-label>
                    {{
                      props.row.nextRenewal
                        ? formatTs(props.row.nextRenewal)
                        : "-"
                    }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>
                    {{ t("CreatorSubscribers.columns.status") }}
                  </q-item-label>
                  <q-item-label>
                    <q-badge
                      :color="
                        props.row.status === 'active' ? 'positive' : 'warning'
                      "
                    >
                      {{ t("CreatorSubscribers.status." + props.row.status) }}
                    </q-badge>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <q-separator />
            <q-card-actions align="right">
              <q-btn flat dense round icon="more_vert" @click.stop>
                <q-menu>
                  <q-list style="min-width: 120px">
                    <q-item
                      clickable
                      v-close-popup
                      @click="viewProfile(props.row.subscriberNpub)"
                    >
                      <q-item-section>
                        {{ t("CreatorSubscribers.actions.viewProfile") }}
                      </q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      v-close-popup
                      @click="sendMessage(props.row.subscriberNpub)"
                    >
                      <q-item-section>
                        {{ t("CreatorSubscribers.actions.sendMessage") }}
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </template>
      <template #loading>
        <q-inner-loading showing>
          <q-spinner color="primary" />
        </q-inner-loading>
      </template>
      <template #no-data>
        <div class="full-width column items-center q-pa-md">
          <div>{{ t("CreatorSubscribers.noData") }}</div>
          <q-btn
            flat
            color="primary"
            :label="t('CreatorSubscribers.shareProfile')"
            to="/my-profile"
            class="q-mt-sm"
          />
        </div>
      </template>
    </q-table>
    <SubscriberProfileDialog v-model="showProfileDialog" :npub="profileNpub" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { nip19 } from "nostr-tools";
import { useCreatorSubscriptionsStore } from "stores/creatorSubscriptions";
import { shortenString } from "src/js/string-utils";
import { useI18n } from "vue-i18n";
import { useNostrStore } from "stores/nostr";
import { useMessengerStore } from "stores/messenger";
import { useQuasar } from "quasar";
import profileCache from "src/js/profile-cache";
import SubscriberProfileDialog from "./SubscriberProfileDialog.vue";
import CreatorSubscribersFilters from "./CreatorSubscribersFilters.vue";
import CreatorSubscribersSummary from "./CreatorSubscribersSummary.vue";
import { useCreatorsStore } from "stores/creators";
import { useUiStore } from "stores/ui";
import { useMintsStore } from "stores/mints";
import { exportSubscribers } from "src/utils/subscriberCsv";

const store = useCreatorSubscriptionsStore();
const { subscriptions, loading } = storeToRefs(store);

const { t, d } = useI18n();
const router = useRouter();
const messenger = useMessengerStore();
const $q = useQuasar();
const creators = useCreatorsStore();
const ui = useUiStore();
const mints = useMintsStore();
const { activeUnit } = storeToRefs(mints);
const isSmallScreen = computed(() => $q.screen.lt.md);

const showFilters = ref(!isSmallScreen.value);
watch(isSmallScreen, (val) => {
  showFilters.value = !val;
});

const filter = ref("");
const tierFilter = ref<string | null>(null);
const statusFilter = ref<string | null>(null);
const startFrom = ref<string | null>(null);
const startTo = ref<string | null>(null);
const nextRenewalFrom = ref<string | null>(null);
const nextRenewalTo = ref<string | null>(null);
const monthsRemaining = ref<number | null>(null);
const startFromTs = computed(() => dateStringToTs(startFrom.value));
const startToTs = computed(() => dateStringToTs(startTo.value));
const nextRenewalFromTs = computed(() => dateStringToTs(nextRenewalFrom.value));
const nextRenewalToTs = computed(() => dateStringToTs(nextRenewalTo.value));
const pagination = ref({
  page: 1,
  rowsPerPage: 5,
  sortBy: "subscriber",
  descending: false,
});

const selected = ref<any[]>([]);

const columns = computed(() => [
  {
    name: "subscriber",
    label: t("CreatorSubscribers.columns.subscriber"),
    field: "subscriberNpub",
    align: "left",
    sortable: true,
  },
  {
    name: "tier",
    label: t("CreatorSubscribers.columns.tier"),
    field: "tierName",
    align: "left",
    sortable: true,
  },
  {
    name: "start",
    label: t("CreatorSubscribers.columns.start"),
    field: "startDate",
    align: "left",
    sortable: true,
    sort: (a, b) => (a ?? 0) - (b ?? 0),
    format: (val) => (val ? formatTs(val) : "-"),
  },
  {
    name: "nextRenewal",
    label: t("CreatorSubscribers.columns.nextRenewal"),
    field: "nextRenewal",
    align: "left",
    sortable: true,
    sort: (a, b) => (a ?? 0) - (b ?? 0),
    format: (val) => (val ? formatTs(val) : "-"),
  },
  {
    name: "months",
    label: t("CreatorSubscribers.columns.months"),
    field: "receivedMonths",
    align: "center",
    sortable: true,
    sort: (a, b, rowA, rowB) =>
      rowA.receivedMonths / rowA.totalMonths -
      rowB.receivedMonths / rowB.totalMonths,
  },
  {
    name: "remaining",
    label: t("CreatorSubscribers.columns.remaining"),
    field: (row) =>
      (row.totalMonths ?? row.receivedMonths) - row.receivedMonths,
    align: "center",
    sortable: true,
  },
  {
    name: "status",
    label: t("CreatorSubscribers.columns.status"),
    field: "status",
    align: "left",
    sortable: true,
  },
  {
    name: "actions",
    label: t("CreatorSubscribers.columns.actions"),
    field: "actions",
    align: "right",
    sortable: true,
  },
]);

const tierOptions = computed(() => {
  const set = new Set<string>();
  for (const sub of subscriptions.value) {
    set.add(sub.tierName);
  }
  return Array.from(set).map((tierName) => ({
    label: tierName,
    value: tierName,
  }));
});

const statusOptions = computed(() => [
  { label: t("CreatorSubscribers.status.active"), value: "active" },
  { label: t("CreatorSubscribers.status.pending"), value: "pending" },
]);

const filteredSubscriptions = computed(() =>
  subscriptions.value.filter((s) => {
    const start = s.startDate ?? 0;
    const next = s.nextRenewal ?? 0;
    const remaining = (s.totalMonths ?? s.receivedMonths) - s.receivedMonths;
    return (
      (!tierFilter.value || s.tierName === tierFilter.value) &&
      (!statusFilter.value || s.status === statusFilter.value) &&
      (!startFromTs.value || start >= startFromTs.value) &&
      (!startToTs.value || start <= startToTs.value) &&
      (!nextRenewalFromTs.value || next >= nextRenewalFromTs.value) &&
      (!nextRenewalToTs.value || next <= nextRenewalToTs.value) &&
      (monthsRemaining.value == null || remaining >= monthsRemaining.value)
    );
  })
);

const totalActiveSubscribers = computed(
  () => filteredSubscriptions.value.filter((s) => s.status === "active").length
);
const totalReceivedMonths = computed(() =>
  filteredSubscriptions.value.reduce((sum, s) => sum + s.receivedMonths, 0)
);
const totalRevenue = computed(() =>
  filteredSubscriptions.value.reduce((sum, s) => sum + (s.totalAmount || 0), 0)
);
function formatCurrency(amount: number) {
  return ui.formatCurrency(amount, activeUnit.value);
}

const profiles = ref<Record<string, any>>({});
const nostr = useNostrStore();

const showProfileDialog = ref(false);
const profileNpub = ref("");

async function updateProfiles() {
  const missing: string[] = [];
  const subs = subscriptions.value;

  for (const { subscriberNpub: pk } of subs) {
    const cached = profileCache.get(pk);
    if (cached) {
      profiles.value[pk] = cached;
    } else if (profiles.value[pk] === undefined) {
      missing.push(pk);
    }
  }

  const batchSize = 5;
  for (let i = 0; i < missing.length; i += batchSize) {
    const batch = missing.slice(i, i + batchSize);
    const fetched = await Promise.all(batch.map((pk) => nostr.getProfile(pk)));
    fetched.forEach((p, idx) => {
      const pk = batch[idx];
      if (p) {
        profileCache.set(pk, p);
        profiles.value[pk] = p;
      } else {
        profiles.value[pk] = {};
      }
    });
  }
}

onMounted(() => {
  updateProfiles();
  if (!creators.tiersMap[nostr.pubkey]) {
    creators.fetchTierDefinitions(nostr.pubkey);
  }
});
watch(subscriptions, updateProfiles);

watch(
  [
    filter,
    tierFilter,
    statusFilter,
    startFrom,
    startTo,
    nextRenewalFrom,
    nextRenewalTo,
    monthsRemaining,
    showFilters,
  ],
  () => {
    pagination.value.page = 1;
  }
);

function pubkeyNpub(hex: string): string {
  try {
    return nip19.npubEncode(hex);
  } catch {
    return hex;
  }
}

function dateStringToTs(val: string | null): number | null {
  return val ? Math.floor(new Date(val).getTime() / 1000) : null;
}

function formatTs(ts: number): string {
  return d(new Date(ts * 1000), { dateStyle: "medium" });
}

function sendMessage(pk: string) {
  const npub = pubkeyNpub(pk);
  router.push({ path: "/nostr-messenger", query: { pubkey: npub } });
  if (messenger.started) {
    messenger.startChat(pk);
  } else {
    const stop = watch(
      () => messenger.started,
      (started) => {
        if (started) {
          messenger.startChat(pk);
          stop();
        }
      }
    );
  }
}

function viewProfile(pk: string) {
  profileNpub.value = pubkeyNpub(pk);
  showProfileDialog.value = true;
}

function downloadCsv() {
  exportSubscribers(filteredSubscriptions.value, "subscribers.csv");
}

function exportSelected() {
  exportSubscribers(selected.value, "subscribers.csv");
}

function sendGroupMessage() {
  $q.dialog({
    title: t('CreatorSubscribers.actions.sendGroupMessage'),
    prompt: {
      model: '',
      type: 'textarea',
      label: t('CreatorSubscribers.actions.sendMessage'),
    },
    cancel: true,
    persistent: true,
  }).onOk(async (val: string) => {
    const recipients = selected.value.slice();
    for (const sub of recipients) {
      try {
        await messenger.sendDm(sub.subscriberNpub, val);
      } catch (e) {
        console.error(e);
      }
    }
    $q.notify({
      type: 'positive',
      message: `Sent to ${recipients.length} subscribers`,
    });
    selected.value = [];
  });
}
</script>
