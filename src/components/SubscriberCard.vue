<template>
  <div
    class="flex items-center gap-3 p-2 border rounded cursor-pointer"
    @click="emit('view')"
  >
    <input
      type="checkbox"
      class="w-4 h-4"
      :checked="selected"
      @change.stop="toggleSelected"
    />
    <div
      class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 overflow-hidden"
    >
      <template v-if="profile === undefined">
        <div class="w-full h-full bg-gray-300 animate-pulse"></div>
      </template>
      <template v-else-if="profile?.picture">
        <img :src="profile.picture" class="object-cover w-full h-full" />
      </template>
      <template v-else>
        <UserIcon class="w-6 h-6 text-gray-500" />
      </template>
    </div>
    <div class="flex-1">
      <div class="flex flex-wrap items-center gap-1">
        <template v-if="profile === undefined">
          <div class="w-28 h-4 rounded bg-gray-300 animate-pulse"></div>
        </template>
        <template v-else>
          <div class="text-sm font-medium">
            {{
              profile?.display_name ||
              profile?.name ||
              shortenString(pubkeyNpub(subscription.subscriberNpub), 15, 6)
            }}
          </div>
        </template>
        <span
          v-if="subscription.tierName"
          class="px-1 text-xs rounded"
          :class="tierColorClass"
        >
          {{ subscription.tierName }}
        </span>
        <span class="px-1 text-xs rounded bg-gray-100 text-gray-600">
          {{ frequencyLabel }}
        </span>
      </div>
      <div class="relative w-full h-3 mt-1 bg-gray-200 rounded">
        <div
          class="h-full bg-blue-500 rounded"
          :style="{ width: `${progress * 100}%` }"
        ></div>
        <div
          class="absolute inset-0 flex items-center justify-center text-[10px] text-white"
        >
          {{ progressLabel }}
        </div>
      </div>
    </div>
    <span class="px-2 py-1 text-xs rounded" :class="statusColorClass">
      {{ t("CreatorSubscribers.status." + subscription.status) }}
    </span>
    <button
      @click.stop="emit('view')"
      class="ml-2 text-sm text-blue-600 hover:underline"
    >
      {{ t("CreatorSubscribers.view") }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs, withDefaults } from "vue";
import { nip19 } from "nostr-tools";
import { shortenString } from "src/js/string-utils";
import { useI18n } from "vue-i18n";
import { User as UserIcon } from "lucide-vue-next";
import type { CreatorSubscription } from "stores/creatorSubscriptions";

const props = withDefaults(
  defineProps<{
    subscription: CreatorSubscription;
    profile: any;
    selected?: boolean;
  }>(),
  { selected: false }
);
const emit = defineEmits(["view", "update:selected"]);
const { t } = useI18n();
const { selected } = toRefs(props);

function toggleSelected() {
  emit("update:selected", !selected.value);
}

function pubkeyNpub(hex: string): string {
  try {
    return nip19.npubEncode(hex);
  } catch {
    return hex;
  }
}

const frequencyLabel = computed(() => {
  switch (props.subscription.frequency) {
    case "weekly":
      return "Weekly";
    case "biweekly":
      return "Biweekly";
    default:
      return "Monthly";
  }
});

const progress = computed(() => {
  return props.subscription.totalPeriods
    ? props.subscription.receivedPeriods / props.subscription.totalPeriods
    : 0;
});

const progressLabel = computed(() => {
  return props.subscription.totalPeriods != null
    ? `${props.subscription.receivedPeriods}/${props.subscription.totalPeriods}`
    : `${props.subscription.receivedPeriods}/\u221E`;
});

const statusColorClass = computed(() =>
  props.subscription.status === "active"
    ? "bg-green-100 text-green-800"
    : "bg-yellow-100 text-yellow-800"
);

const tierColorClass = computed(() => {
  switch (props.subscription.tierName) {
    case "Gold":
      return "bg-yellow-100 text-yellow-800";
    case "Silver":
      return "bg-gray-200 text-gray-800";
    case "Bronze":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
});
</script>
