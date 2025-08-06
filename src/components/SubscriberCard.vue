<template>
  <q-card class="subscriber-card cursor-pointer" @click="emit('view')">
    <div class="row items-center no-wrap q-pa-sm">
      <q-avatar size="40px">
        <template v-if="profile === undefined">
          <q-skeleton type="circle" size="40px" />
        </template>
        <template v-else-if="profile?.picture">
          <img :src="profile.picture" />
        </template>
        <template v-else>
          <q-icon name="account_circle" />
        </template>
      </q-avatar>
      <div class="q-ml-sm column flex">
        <div class="row items-center q-gutter-xs">
          <template v-if="profile === undefined">
            <q-skeleton type="text" width="120px" />
          </template>
          <template v-else>
            <div class="text-subtitle2">
              {{
                profile?.display_name ||
                profile?.name ||
                shortenString(pubkeyNpub(subscription.subscriberNpub), 15, 6)
              }}
            </div>
          </template>
          <q-chip dense size="sm" class="q-ml-xs" v-if="subscription.tierName">
            {{ subscription.tierName }}
          </q-chip>
          <q-chip dense size="sm" class="q-ml-xs">
            {{ frequencyLabel }}
          </q-chip>
        </div>
        <q-linear-progress
          class="q-mt-xs"
          :value="progress"
          color="primary"
          track-color="grey-3"
        >
          <div class="absolute-center text-caption text-white">
            {{ progressLabel }}
          </div>
        </q-linear-progress>
      </div>
      <q-space />
      <q-badge
        :color="subscription.status === 'active' ? 'positive' : 'warning'"
      >
        {{ t("CreatorSubscribers.status." + subscription.status) }}
      </q-badge>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { nip19 } from "nostr-tools";
import { shortenString } from "src/js/string-utils";
import { useI18n } from "vue-i18n";
import type { CreatorSubscription } from "stores/creatorSubscriptions";

const props = defineProps<{
  subscription: CreatorSubscription;
  profile: any;
}>();
const emit = defineEmits(["view"]);
const { t } = useI18n();

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
</script>
