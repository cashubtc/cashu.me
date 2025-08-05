<template>
  <div>
    <div class="row q-mb-md q-gutter-sm">
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
          <div class="row items-center no-wrap">
            <q-linear-progress
              :value="
                props.row.totalMonths
                  ? props.row.receivedMonths / props.row.totalMonths
                  : 0
              "
              color="primary"
              style="width: 100px"
            >
              <q-tooltip>
                {{ props.row.receivedMonths }} / {{ props.row.totalMonths }}
              </q-tooltip>
            </q-linear-progress>
            <div class="q-ml-sm text-caption">
              {{ props.row.receivedMonths }} / {{ props.row.totalMonths }}
            </div>
          </div>
        </q-td>
      </template>
      <template #body-cell-status="props">
        <q-td :props="props">
          <q-badge
            :color="props.row.status === 'active' ? 'positive' : 'warning'"
          >
            {{ props.row.status }}
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
                  :to="`/creator/${pubkeyNpub(props.row.subscriberNpub)}`"
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
      <template #no-data>
        <div class="full-width column items-center q-pa-md">
          <div>{{ t('CreatorSubscribers.noData') }}</div>
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

const store = useCreatorSubscriptionsStore();
const { subscriptions, loading } = storeToRefs(store);

const { t } = useI18n();
const router = useRouter();
const messenger = useMessengerStore();

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
  return Array.from(set).map((tierName) => ({ label: tierName, value: tierName }));
});

const statusOptions = ["active", "pending"];

const filteredSubscriptions = computed(() =>
  subscriptions.value.filter(
    (s) =>
      (!tierFilter.value || s.tierName === tierFilter.value) &&
      (!statusFilter.value || s.status === statusFilter.value)
  )
);

const profiles = ref<Record<string, any>>({});
const nostr = useNostrStore();

async function updateProfiles() {
  for (const sub of subscriptions.value) {
    const pk = sub.subscriberNpub;
    if (!profiles.value[pk]) {
      const p = await nostr.getProfile(pk);
      if (p) profiles.value[pk] = p;
    }
  }
}

onMounted(updateProfiles);
watch(subscriptions, updateProfiles);

watch([filter, tierFilter, statusFilter], () => {
  pagination.value.page = 1;
});

function pubkeyNpub(hex: string): string {
  try {
    return nip19.npubEncode(hex);
  } catch {
    return hex;
  }
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
</script>
