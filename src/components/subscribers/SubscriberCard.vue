<template>
  <q-card
    :class="['cursor-pointer', { 'q-mb-sm': !compact, 'q-mb-xs': compact, 'card-selected': selected }]"
    @click="emit('select')"
    flat
    bordered
  >
    <q-card-section :class="compact ? 'q-pa-sm' : 'q-pa-md'">
      <div class="row items-start justify-between no-wrap">
        <!-- Left side: avatar and info -->
        <div class="row items-start no-wrap" style="flex-shrink: 1; min-width: 0">
          <q-avatar size="40px" class="q-mr-sm" rounded>
            <img v-if="profile?.picture" :src="profile.picture" />
            <span v-else>{{ initials }}</span>
          </q-avatar>
          <div class="column" style="min-width: 0">
            <div class="text-body1 ellipsis">{{ displayName }}</div>
            <div class="text-caption text-grey-6 ellipsis">{{ profile?.nip05 || subscription.subscriberNpub.slice(0,24) + '...' }}</div>
          </div>
        </div>

        <!-- Right side: amount and menu -->
        <div class="column items-end no-wrap q-ml-sm">
          <div class="text-subtitle2">{{ amountPerIntervalText }}</div>
          <div class="text-caption text-grey-6">{{ renewsText }}</div>
        </div>
      </div>

      <!-- Bottom part: chips and progress -->
      <div class="row items-center justify-between no-wrap q-mt-sm">
        <div class="row items-center q-gutter-xs no-wrap">
          <q-chip dense :label="subscription.tierName" color="primary" text-color="white" />
          <q-chip dense outline :label="freqBadge">
            <q-tooltip>{{ subscription.frequency }}</q-tooltip>
          </q-chip>
          <q-chip dense :color="statusColor" text-color="white" :label="subscription.status" />
        </div>
        <q-btn flat dense round icon="more_vert" @click.stop>
          <q-menu auto-close>
            <q-list dense>
              <q-item clickable @click="emit('open')"><q-item-section>View details</q-item-section></q-item>
              <q-item clickable><q-item-section>Copy npub</q-item-section></q-item>
              <q-item clickable><q-item-section>Send DM</q-item-section></q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>

      <q-linear-progress
        :value="subscription.nextRenewalProgress || 0"
        :color="subscription.dueSoon ? 'orange' : 'primary'"
        class="q-mt-sm"
        rounded
      />
      <div class="text-caption text-grey-6 q-mt-xs text-right">
        Lifetime {{ lifetimeTotalText }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatDistanceToNowStrict } from 'date-fns';
import { useUiStore } from 'stores/ui';
import type { CreatorSubscription, Status, Frequency } from 'stores/creatorSubscriptions';
import type { NDKUserProfile } from '@nostr-dev-kit/ndk';

const props = defineProps<{
  subscription: CreatorSubscription;
  profile?: NDKUserProfile;
  compact?: boolean;
  selected?: boolean;
}>();

const emit = defineEmits<{
  (e: 'select'): void;
  (e: 'open'): void;
}>();

const uiStore = useUiStore();

function formatCurrency(amount: number): string {
  return uiStore.formatCurrency(amount);
}

const initials = computed(() => {
  const n = props.profile?.displayName || props.profile?.name || props.subscription.subscriberNpub;
  return n.split(/\s+/).filter(Boolean).slice(0, 2).map((p: string) => p[0]).join('').toUpperCase();
});

const displayName = computed(() => props.profile?.displayName || props.profile?.name || props.subscription.subscriberNpub);

const amountPerIntervalText = computed(() => {
  const amount = props.subscription.amountPerInterval;
  if (amount === undefined) return '—';
  return `${formatCurrency(amount)} / ${freqBadge.value}`;
});

const lifetimeTotalText = computed(() => formatCurrency(props.subscription.totalAmount));

const statusColor = computed(() => {
  const colors: Record<Status, string> = { active: 'positive', pending: 'warning', ended: 'grey-7' };
  return colors[props.subscription.status] || 'grey';
});

const freqBadge = computed(() => {
  const badges: Record<Frequency, string> = { weekly: 'W', biweekly: '2W', monthly: 'M' };
  return badges[props.subscription.frequency];
});

const renewsText = computed(() => {
  if (!props.subscription.nextRenewal) return '—';
  if (props.subscription.status === 'ended') return 'Ended';
  return `in ${formatDistanceToNowStrict(new Date(props.subscription.nextRenewal * 1000))}`;
});

</script>

<style scoped>
.card-selected {
  border-color: var(--q-primary);
}
</style>
