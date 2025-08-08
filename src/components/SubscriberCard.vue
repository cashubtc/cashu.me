<template>
  <q-card :class="[{ 'q-mb-sm': !compact }, 'cursor-pointer']" @click="$emit('click')">
    <q-card-section class="q-pa-sm">
      <div class="text-subtitle2">{{ subscription.tierName }}</div>
      <div class="text-caption text-grey">{{ subscription.subscriberNpub }}</div>
    </q-card-section>
  </q-card>
</template>
<script setup lang="ts">
import type { CreatorSubscription } from 'stores/creatorSubscriptions';

defineProps<{ subscription: CreatorSubscription; compact?: boolean }>();
</script>
