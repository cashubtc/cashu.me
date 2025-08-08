<template>
  <q-drawer side="right" v-model="model" bordered>
    <q-toolbar>
      <q-toolbar-title>{{ subscription?.subscriberNpub }}</q-toolbar-title>
      <q-btn flat round dense icon="close" @click="model = false" />
    </q-toolbar>
    <div class="q-pa-md" v-if="subscription">
      <div class="text-subtitle1">{{ subscription.tierName }}</div>
      <div class="text-body2">{{ subscription.frequency }}</div>
    </div>
  </q-drawer>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import type { CreatorSubscription } from 'stores/creatorSubscriptions';

const props = defineProps<{ modelValue: boolean; subscription: CreatorSubscription | null }>();
const emit = defineEmits(['update:modelValue']);

const model = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
});
</script>
