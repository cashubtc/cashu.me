<template>
  <div class="space-y-4">
    <!-- Summary cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div class="p-4 border rounded text-center">
        <div class="font-semibold">{{ t('CreatorSubscribers.summary.subscribers') }}</div>
        <div class="mt-2 text-sm">
          {{ t('CreatorSubscribers.summary.active') }}: {{ totalActiveSubscribers }}
        </div>
        <div class="text-sm">
          {{ t('CreatorSubscribers.summary.pending') }}: {{ totalPendingSubscribers }}
        </div>
      </div>
      <div class="p-4 border rounded text-center">
        <div class="font-semibold">{{ t('CreatorSubscribers.summary.receivedPeriods') }}</div>
        <div class="text-lg">{{ totalReceivedPeriods }}</div>
      </div>
      <div class="p-4 border rounded text-center">
        <div class="font-semibold">{{ t('CreatorSubscribers.summary.revenue') }}</div>
        <div class="text-lg">{{ formatCurrency(totalRevenue) }}</div>
      </div>
    </div>

    <!-- Bulk action bar -->
    <div v-if="selected.length" class="flex flex-wrap gap-2">
      <button class="px-4 py-2 text-white bg-blue-500 rounded" @click="sendGroupMessage">
        {{ t('CreatorSubscribers.actions.sendGroupMessage') }}
      </button>
      <button class="px-4 py-2 text-white bg-blue-500 rounded" @click="exportSelected">
        {{ t('CreatorSubscribers.actions.exportSelected') }}
      </button>
    </div>

    <!-- List container -->
    <div v-if="filteredSubscriptions.length" class="space-y-2">
      <div
        v-for="item in filteredSubscriptions"
        :key="item.subscriptionId"
        class="relative p-4 border rounded cursor-pointer"
        @click="viewSubscriber(item)"
      >
        <input
          type="checkbox"
          class="absolute top-2 right-2"
          :checked="isSelected(item)"
          @change.stop="toggleSelection(item)"
        />
        <div class="font-medium">{{ item.tierName }}</div>
        <div class="text-sm">{{ item.subscriberNpub }}</div>
        <div class="text-xs">{{ t('CreatorSubscribers.status.' + item.status) }}</div>
      </div>
    </div>
    <div v-else class="flex flex-col items-center w-full p-4">
      <div>{{ t('CreatorSubscribers.noData') }}</div>
      <router-link to="/my-profile" class="mt-2 text-blue-500 underline">
        {{ t('CreatorSubscribers.shareProfile') }}
      </router-link>
    </div>

    <!-- Filter modal -->
    <div v-if="showFilters" class="fixed inset-0 flex justify-end bg-black bg-opacity-50">
      <div class="w-80 p-4 overflow-y-auto bg-white">
        <button class="mb-4" @click="showFilters = false">&times;</button>
        <div class="flex flex-col space-y-2">
          <select v-model="tierFilter" class="p-2 border">
            <option value="">{{ t('CreatorSubscribers.columns.tier') }}</option>
            <option v-for="opt in tierOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <select v-model="statusFilter" class="p-2 border">
            <option value="">{{ t('CreatorSubscribers.columns.status') }}</option>
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <select v-model="frequencyFilter" class="p-2 border">
            <option value="">{{ t('CreatorSubscribers.filter.frequency') }}</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Twice Monthly</option>
            <option value="monthly">Monthly</option>
          </select>
          <input v-model="startFrom" type="date" class="p-2 border" />
          <input v-model="startTo" type="date" class="p-2 border" />
          <input v-model="nextRenewalFrom" type="date" class="p-2 border" />
          <input v-model="nextRenewalTo" type="date" class="p-2 border" />
          <input
            v-model.number="monthsRemaining"
            type="number"
            class="p-2 border"
            :placeholder="t('CreatorSubscribers.filter.monthsRemaining')"
          />
          <button class="px-4 py-2 text-white bg-blue-500 rounded" @click="downloadCsv">
            {{ t('CreatorSubscribers.actions.downloadCsv') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Drawer anchor -->
    <SubscriberDrawer v-model="showDrawer" :subscription="selectedSubscription" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { useCreatorSubscriptionsStore } from "stores/creatorSubscriptions";
import { useMessengerStore } from "stores/messenger";
import { useCreatorsStore } from "stores/creators";
import { useUiStore } from "stores/ui";
import { useMintsStore } from "stores/mints";
import { useNostrStore } from "stores/nostr";
import { useNdk } from "src/composables/useNdk";
import profileCache from "src/js/profile-cache";
import { exportSubscribers } from "src/utils/subscriberCsv";
import SubscriberDrawer from "./SubscriberDrawer.vue";
import type { CreatorSubscription } from "stores/creatorSubscriptions";

const store = useCreatorSubscriptionsStore();
const { subscriptions } = storeToRefs(store);

const { t } = useI18n();
const messenger = useMessengerStore();
const creators = useCreatorsStore();
const ui = useUiStore();
const mints = useMintsStore();
const { activeUnit } = storeToRefs(mints);
const nostr = useNostrStore();

const props = withDefaults(
  defineProps<{ filter?: string; showFilters?: boolean }>(),
  { filter: "", showFilters: false }
);
const emit = defineEmits(["update:filter", "update:showFilters"]);
const filter = computed({
  get: () => props.filter,
  set: (val: string) => emit("update:filter", val),
});
const showFilters = computed({
  get: () => props.showFilters,
  set: (val: boolean) => emit("update:showFilters", val),
});

const tierFilter = ref<string | null>(null);
const statusFilter = ref<string | null>(null);
const startFrom = ref<string | null>(null);
const startTo = ref<string | null>(null);
const nextRenewalFrom = ref<string | null>(null);
const nextRenewalTo = ref<string | null>(null);
const monthsRemaining = ref<number | null>(null);
const frequencyFilter = ref<string | null>(null);

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
  const idx = selected.value.findIndex((s) => s.subscriptionId === sub.subscriptionId);
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
      (!frequencyFilter.value || s.frequency === frequencyFilter.value) &&
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
const totalPendingSubscribers = computed(
  () => filteredSubscriptions.value.filter((s) => s.status === "pending").length
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

async function sendGroupMessage() {
  const val = window.prompt(
    t("CreatorSubscribers.actions.sendMessage"),
    ""
  );
  if (!val) return;
  const recipients = selected.value.slice();
  const promises = recipients.map((sub) =>
    messenger.sendDm(sub.subscriberNpub, val).catch((e) => console.error(e))
  );
  await Promise.all(promises);
  window.alert(`Sent to ${recipients.length} subscribers`);
  selected.value = [];
}

onMounted(() => {
  updateProfiles();
  if (!creators.tiersMap[nostr.pubkey]) {
    creators.fetchTierDefinitions(nostr.pubkey);
  }
});
watch(subscriptions, updateProfiles);
</script>

