<template>
  <q-card
    :class="[{ 'q-mb-sm': !compact, 'q-mb-xs': compact }, 'cursor-pointer']"
    :style="{ height: cardHeight }"
    @click="emit('select')"
  >
    <q-card-section :class="compact ? 'q-pa-xs' : 'q-pa-sm'">
      <div class="row items-start justify-between no-wrap">
        <div class="row items-start no-wrap">
          <q-avatar size="40px" class="q-mr-sm">
            <img v-if="profile?.picture" :src="profile.picture" />
            <span v-else>{{ initials }}</span>
          </q-avatar>
          <div class="column">
            <div class="text-body2">{{ displayName }}</div>
            <div class="text-caption text-grey-6">{{ nip05Domain }}</div>
            <div class="row items-center q-mt-xs no-wrap">
              <q-chip dense color="primary" text-color="white" class="q-mr-xs">
                {{ subscription.tierName }}
              </q-chip>
              <q-chip dense outline class="q-mr-xs">
                {{ subscription.frequency }}
              </q-chip>
              <q-chip dense :color="statusColor" text-color="white">
                {{ subscription.status }}
              </q-chip>
            </div>
          </div>
        </div>
        <div class="column items-end">
          <div class="text-subtitle2">{{ amountPerInterval }}</div>
          <div class="text-caption text-grey-6">{{ renewsText }}</div>
          <q-btn flat dense round icon="chevron_right" @click.stop="emit('open')" />
        </div>
      </div>
      <q-linear-progress :value="progress" class="q-mt-sm" />
      <div class="text-caption text-grey-6 q-mt-xs">
        Lifetime {{ lifetimeTotal }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatDistanceToNow } from 'date-fns';
import { useMintsStore } from 'stores/mints';
import { useUiStore } from 'stores/ui';
import type { CreatorSubscription } from 'stores/creatorSubscriptions';

const props = defineProps<{
  profile: any;
  subscription: CreatorSubscription;
  compact?: boolean;
}>();

const emit = defineEmits<{
  (e: 'select'): void;
  (e: 'open'): void;
}>();

const uiStore = useUiStore();
const { activeUnit } = useMintsStore();

function formatCurrency(amount: number): string {
  return uiStore.formatCurrency(amount, activeUnit.value);
}

const cardHeight = computed(() => (props.compact ? '96px' : '120px'));

const initials = computed(() => {
  const n =
    props.profile?.display_name ||
    props.profile?.name ||
    props.subscription.subscriberNpub;
  return n
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p: string) => p[0])
    .join('')
    .toUpperCase();
});

const displayName = computed(
  () =>
    props.profile?.display_name ||
    props.profile?.name ||
    props.subscription.subscriberNpub,
);

const nip05Domain = computed(() => {
  const nip05 = props.profile?.nip05;
  if (!nip05) return '';
  return nip05.split('@')[1] || nip05;
});

const amountPerInterval = computed(() => {
  const periodAmount =
    props.subscription.receivedPeriods > 0
      ? props.subscription.totalAmount / props.subscription.receivedPeriods
      : props.subscription.totalAmount;
  return `${formatCurrency(periodAmount)} / ${props.subscription.frequency}`;
});

const lifetimeTotal = computed(() =>
  formatCurrency(props.subscription.totalAmount),
);

const statusColor = computed(() => {
  if (props.subscription.status === 'active') return 'positive';
  if (props.subscription.status === 'pending') return 'warning';
  return 'grey';
});

const renewsText = computed(() => {
  if (!props.subscription.nextRenewal) return 'renews in —';
  return `renews in ${formatDistanceToNow(
    props.subscription.nextRenewal * 1000,
  )}`;
});

const progress = computed(() => {
  if (!props.subscription.nextRenewal) return 0;
  const periodSeconds = props.subscription.intervalDays * 24 * 60 * 60;
  const lastRenewal = props.subscription.nextRenewal - periodSeconds;
  const now = Date.now() / 1000;
  const elapsed = now - lastRenewal;
  return Math.min(Math.max(elapsed / periodSeconds, 0), 1);
});
</script>
