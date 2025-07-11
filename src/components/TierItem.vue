<template>
  <TierCard
    :tier="tierData"
    @edit="emit('save')"
    @delete="emit('delete')"
    @reorder="emit('reorder', $event)"
    @update:tier="emit('update:tierData', $event)"
  />
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import TierCard from './TierCard.vue';
import type { Tier } from 'stores/creatorHub';

const props = defineProps<{ tierData: Tier; saved: boolean }>();
const emit = defineEmits(['save', 'delete', 'reorder', 'update:tierData']);
</script>

<style scoped></style>
