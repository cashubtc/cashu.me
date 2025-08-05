<template>
  <div>
    <div class="q-mb-md">
      <q-btn
        v-if="isSmallScreen"
        flat
        color="primary"
        icon="filter_list"
        label="Filters"
        @click="showFilters = !showFilters"
        class="q-mb-sm"
      />
      <q-slide-transition>
        <div
          v-show="!isSmallScreen || showFilters"
          class="row q-gutter-sm"
        >
          <q-input
            v-model="filter"
            dense
            outlined
            debounce="300"
            clearable
            :placeholder="$t('CreatorSubscribers.filter.placeholder')"
            class="col"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-select
            v-model="tierFilter"
            :options="tierOptions"
            dense
            outlined
            clearable
            emit-value
            map-options
            :label="t('CreatorSubscribers.columns.tier')"
            class="col-3"
          />
          <q-select
            v-model="statusFilter"
            :options="statusOptions"
            dense
            outlined
            clearable
            :label="t('CreatorSubscribers.columns.status')"
            class="col-3"
          />
        </div>
      </q-slide-transition>
    </div>
    <q-table
      flat
      bordered
      row-key="subscriptionId"
      :rows="filteredSubscriptions"
      :columns="columns"
      :filter="filter"
      v-model:pagination="pagination"
      :loading="loading"
      :rows-per-page-options="[5, 10, 20]"
      :grid="isSmallScreen"
    >
      <template #body-cell-subscriber="props">
        <q-td :props="props">
          <div class="row items-center no-wrap">
            <q-avatar
              size="32px"
              v-if="profiles[props.row.subscriberNpub]?.picture"
            >
              <img :src="profiles[props.row.subscriberNpub].picture" />
            </q-avatar>
            <div class="q-ml-sm">
              {{
                profiles[props.row.subscriberNpub]?.display_name ||
                profiles[props.row.subscriberNpub]?.name ||
                shortenString(pubkeyNpub(props.row.subscriberNpub), 15, 6)
              }}
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
                    (props.row.receivedMonths / props.row.totalMonths) * 100,
                  )
                }}%
                )
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
          <q-card>
            <q-card-section class="row items-center no-wrap">
              <q-avatar
                size="32px"
                v-if="profiles[props.row.subscriberNpub]?.picture"
              >
                <img :src="profiles[props.row.subscriberNpub].picture" />
              </q-avatar>
              <div class="q-ml-sm">
                {{
                  profiles[props.row.subscriberNpub]?.display_name ||
                  profiles[props.row.subscriberNpub]?.name ||
                  shortenString(pubkeyNpub(props.row.subscriberNpub), 15, 6)
                }}
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
                              100,
                          )
                        }}%
                        )
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
                    {{ t("CreatorSubscribers.columns.start") }}
                  </q-item-label>
                  <q-item-label>
                    {{ props.row.startDate ? formatTs(props.row.startDate) : "-" }}
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
    <SubscriberProfileDialog
      v-model="showProfileDialog"
      :npub="profileNpub"
    />
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
import { useCreatorsStore } from "stores/creators";

const store = useCreatorSubscriptionsStore();
const { subscriptions, loading } = storeToRefs(store);

const { t, d } = useI18n();
const router = useRouter();
const messenger = useMessengerStore();
const $q = useQuasar();
const creators = useCreatorsStore();
const isSmallScreen = computed(() => $q.screen.lt.md);

const showFilters = ref(!isSmallScreen.value);
watch(isSmallScreen, (val) => {
  showFilters.value = !val;
});

const filter = ref("");
const tierFilter = ref<string | null>(null);
const statusFilter = ref<string | null>(null);
const pagination = ref({
  page: 1,
  rowsPerPage: 5,
  sortBy: "subscriber",
  descending: false,
});

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
  subscriptions.value.filter(
    (s) =>
      (!tierFilter.value || s.tierName === tierFilter.value) &&
      (!statusFilter.value || s.status === statusFilter.value)
  )
);

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
    } else if (!profiles.value[pk]) {
      missing.push(pk);
    }
  }

  if (missing.length) {
    const fetched = await Promise.all(
      missing.map(async (pk) => {
        const p = await nostr.getProfile(pk);
        return [pk, p] as const;
      })
    );

    for (const [pk, p] of fetched) {
      if (p) {
        profileCache.set(pk, p);
        profiles.value[pk] = p;
      }
    }
  }
}

onMounted(() => {
  updateProfiles();
  if (!creators.tiersMap[nostr.pubkey]) {
    creators.fetchTierDefinitions(nostr.pubkey);
  }
});
watch(subscriptions, updateProfiles);

watch([filter, tierFilter, statusFilter, showFilters], () => {
  pagination.value.page = 1;
});

function pubkeyNpub(hex: string): string {
  try {
    return nip19.npubEncode(hex);
  } catch {
    return hex;
  }
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
</script>
