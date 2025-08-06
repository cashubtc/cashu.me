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
      :total-received-periods="totalReceivedPeriods"
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
      :rows="paginatedSubscriptions"
      :row-count="filteredSubscriptions.length"
      :columns="columns"
      selection="multiple"
      v-model:selected="selected"
      :pagination="pagination"
      @request="onRequest"
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
                  received: props.row.receivedPeriods,
                  total: props.row.totalPeriods,
                })
              }}
              <span v-if="props.row.totalPeriods">
                (
                {{
                  Math.round(
                    (props.row.receivedPeriods / props.row.totalPeriods) * 100
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
                <template
                  v-if="profiles[props.row.subscriberNpub] === undefined"
                >
                  <q-skeleton type="circle" size="32px" />
                </template>
                <template
                  v-else-if="profiles[props.row.subscriberNpub]?.picture"
                >
                  <img :src="profiles[props.row.subscriberNpub].picture" />
                </template>
                <template v-else>
                  <q-icon name="account_circle" />
                </template>
              </q-avatar>
              <div class="q-ml-sm">
                <template
                  v-if="profiles[props.row.subscriberNpub] === undefined"
                >
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
                          received: props.row.receivedPeriods,
                          total: props.row.totalPeriods,
                        })
                      }}
                      <span v-if="props.row.totalPeriods">
                        (
                        {{
                          Math.round(
                            (props.row.receivedPeriods / props.row.totalPeriods) *
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
                      props.row.totalPeriods != null
                        ? props.row.totalPeriods - props.row.receivedPeriods
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
import pLimit from "p-limit";

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

const columns = computed(() => {
  const cols: any[] = [
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
  ];

  if (!isSmallScreen.value) {
    cols.push(
      {
        name: "followers",
        label: t("CreatorSubscribers.columns.followers"),
        field: (row: any) =>
          profiles.value[row.subscriberNpub]?.followerCount ?? null,
        align: "right",
        sortable: true,
        sort: (a: number | null, b: number | null) => (a ?? 0) - (b ?? 0),
      },
      {
        name: "following",
        label: t("CreatorSubscribers.columns.following"),
        field: (row: any) =>
          profiles.value[row.subscriberNpub]?.followingCount ?? null,
        align: "right",
        sortable: true,
        sort: (a: number | null, b: number | null) => (a ?? 0) - (b ?? 0),
      },
      {
        name: "latestNote",
        label: t("CreatorSubscribers.columns.latestNote"),
        field: (row: any) => profiles.value[row.subscriberNpub]?.latestNote,
        align: "left",
        sortable: false,
        format: (val: string | undefined) =>
          val ? (val.length > 50 ? `${val.slice(0, 50)}…` : val) : "-",
      }
    );
  }

  cols.push(
    {
      name: "start",
      label: t("CreatorSubscribers.columns.start"),
      field: "startDate",
      align: "left",
      sortable: true,
      sort: (a: number | null, b: number | null) => (a ?? 0) - (b ?? 0),
      format: (val: number | null) => (val ? formatTs(val) : "-"),
    },
    {
      name: "nextRenewal",
      label: t("CreatorSubscribers.columns.nextRenewal"),
      field: "nextRenewal",
      align: "left",
      sortable: true,
      sort: (a: number | null, b: number | null) => (a ?? 0) - (b ?? 0),
      format: (val: number | null) => (val ? formatTs(val) : "-"),
    },
    {
      name: "months",
      label: t("CreatorSubscribers.columns.months"),
      field: "receivedPeriods",
      align: "center",
      sortable: true,
      sort: (a: number, b: number, rowA: any, rowB: any) =>
        rowA.receivedPeriods / (rowA.totalPeriods || 1) -
        rowB.receivedPeriods / (rowB.totalPeriods || 1),
    },
    {
      name: "remaining",
      label: t("CreatorSubscribers.columns.remaining"),
      field: (row: any) =>
        (row.totalPeriods ?? row.receivedPeriods) - row.receivedPeriods,
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
    }
  );

  return cols;
});

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
    const remaining = (s.totalPeriods ?? s.receivedPeriods) - s.receivedPeriods;
    const text = filter.value.toLowerCase();
    const matchesText =
      !text ||
      s.subscriberNpub.toLowerCase().includes(text) ||
      s.tierName.toLowerCase().includes(text) ||
      s.status.toLowerCase().includes(text);
    return (
      matchesText &&
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

const paginatedSubscriptions = computed(() => {
  const { page, rowsPerPage } = pagination.value;
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  return filteredSubscriptions.value.slice(start, end);
});

function onRequest(props: { pagination: any }) {
  pagination.value = props.pagination;
}

const totalActiveSubscribers = computed(
  () => filteredSubscriptions.value.filter((s) => s.status === "active").length
);
const totalReceivedPeriods = computed(() =>
  filteredSubscriptions.value.reduce((sum, s) => sum + s.receivedPeriods, 0)
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
const limit = pLimit(5);

async function updateProfiles() {
  const missing: string[] = [];
  const subs = subscriptions.value;

  for (const { subscriberNpub: pk } of subs) {
    const cached = profileCache.get(pk);
    if (cached) {
      profiles.value[pk] = {
        ...cached,
        followerCount: cached.followerCount,
        followingCount: cached.followingCount,
        latestNote: cached.latestNote,
      };
    } else if (profiles.value[pk] === undefined) {
      missing.push(pk);
    }
  }

  await Promise.all(
    missing.map((pk) =>
      limit(async () => {
        try {
          const p = await nostr.getProfile(pk);
          if (p) {
            profileCache.set(pk, p);
            profiles.value[pk] = p;
          } else {
            profiles.value[pk] = {};
          }
        } catch (e) {
          console.error("Failed to fetch profile", pk, e);
          profiles.value[pk] = {};
        }
      })
    )
  );
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
    title: t("CreatorSubscribers.actions.sendGroupMessage"),
    prompt: {
      model: "",
      type: "textarea",
      label: t("CreatorSubscribers.actions.sendMessage"),
    },
    cancel: true,
    persistent: true,
  }).onOk(async (val: string) => {
    const recipients = selected.value.slice();
    const notif = $q.notify({
      spinner: true,
      timeout: 0,
      message: `Sending to ${recipients.length} subscribers...`,
    });

    const promises = recipients.map((sub) =>
      messenger
        .sendDm(sub.subscriberNpub, val)
        .catch((e) => console.error(e)),
    );

    await Promise.all(promises);

    notif({
      type: "positive",
      spinner: false,
      timeout: 3000,
      message: `Sent to ${recipients.length} subscribers`,
    });

    selected.value = [];
  });
}
</script>
