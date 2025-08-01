<template>
  <TierCard
    :tier="tierData"
    @edit="emit('save')"
    @delete="emit('delete')"
    @update:tier="emit('update:tierData', $event)"
  />
</template>

<script setup lang="ts">
import TierCard from "./TierCard.vue";
import type { Tier } from "stores/types";

const props = defineProps<{ tierData: Tier }>();
const emit = defineEmits(["save", "delete", "update:tierData"]);
</script>

<style scoped></style>
