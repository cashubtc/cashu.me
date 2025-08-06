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
    <div v-if="filteredSubscriptions.length">
      <q-virtual-scroll
        :items="filteredSubscriptions"
        item-key="subscriptionId"
        scroll-target="body"
        items-size="auto"
        scroll-padding
      >
        <template #default="{ item }">
          <div class="q-pa-xs">
            <div class="relative-position">
              <q-checkbox
                class="absolute-top-right q-ma-sm z-top"
                dense
                :model-value="isSelected(item)"
                @update:model-value="() => toggleSelection(item)"
                @click.stop
              />
              <SubscriberCard
                :class="{ 'bg-grey-2': isSelected(item) }"
                :subscription="item"
                :profile="profiles[item.subscriberNpub]"
                @view="viewSubscriber(item)"
              />
            </div>
          </div>
        </template>
      </q-virtual-scroll>
    </div>
    <div v-else class="full-width column items-center q-pa-md">
      <div>{{ t("CreatorSubscribers.noData") }}</div>
      <q-btn
        flat
        color="primary"
        :label="t('CreatorSubscribers.shareProfile')"
        to="/my-profile"
        class="q-mt-sm"
      />
    </div>
    <SubscriberDrawer
      v-model="showDrawer"
      :subscription="selectedSubscription"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import { useCreatorSubscriptionsStore } from "stores/creatorSubscriptions";
import { useMessengerStore } from "stores/messenger";
import { useCreatorsStore } from "stores/creators";
import { useUiStore } from "stores/ui";
import { useMintsStore } from "stores/mints";
import { useNostrStore } from "stores/nostr";
import { useNdk } from "src/composables/useNdk";
import profileCache from "src/js/profile-cache";
import { exportSubscribers } from "src/utils/subscriberCsv";
import CreatorSubscribersFilters from "./CreatorSubscribersFilters.vue";
import CreatorSubscribersSummary from "./CreatorSubscribersSummary.vue";
import SubscriberCard from "./SubscriberCard.vue";
import SubscriberDrawer from "./SubscriberDrawer.vue";
import type { CreatorSubscription } from "stores/creatorSubscriptions";

const store = useCreatorSubscriptionsStore();
const { subscriptions } = storeToRefs(store);

const { t } = useI18n();
const $q = useQuasar();
const messenger = useMessengerStore();
const creators = useCreatorsStore();
const ui = useUiStore();
const mints = useMintsStore();
const { activeUnit } = storeToRefs(mints);
const nostr = useNostrStore();

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

function dateStringToTs(val: string | null): number | null {
  return val ? Math.floor(new Date(val).getTime() / 1000) : null;
}
const startFromTs = computed(() => dateStringToTs(startFrom.value));
const startToTs = computed(() => dateStringToTs(startTo.value));
const nextRenewalFromTs = computed(() => dateStringToTs(nextRenewalFrom.value));
const nextRenewalToTs = computed(() => dateStringToTs(nextRenewalTo.value));

const selected = ref<any[]>([]);

function isSelected(sub: any) {
  return selected.value.some((s) => s.subscriptionId === sub.subscriptionId);
}
function toggleSelection(sub: any) {
  const idx = selected.value.findIndex(
    (s) => s.subscriptionId === sub.subscriptionId
  );
  if (idx >= 0) {
    selected.value.splice(idx, 1);
  } else {
    selected.value.push(sub);
  }
}

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
const showDrawer = ref(false);
const selectedSubscription = ref<CreatorSubscription | null>(null);

async function updateProfiles() {
  const subs = subscriptions.value;
  const missing: string[] = [];
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
  if (!missing.length) return;
  try {
    await nostr.initNdkReadOnly();
    const ndk = await useNdk({ requireSigner: false });
    const filter: any = { kinds: [0], authors: missing };
    const events = await ndk.fetchEvents(filter);
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

function viewSubscriber(sub: CreatorSubscription) {
  selectedSubscription.value = sub;
  showDrawer.value = true;
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
      messenger.sendDm(sub.subscriberNpub, val).catch((e) => console.error(e))
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

onMounted(() => {
  updateProfiles();
  if (!creators.tiersMap[nostr.pubkey]) {
    creators.fetchTierDefinitions(nostr.pubkey);
  }
});
watch(subscriptions, updateProfiles);
</script>
