<template>
  <q-card flat bordered :class="{ 'saved-bg': saved }" class="relative-position">
    <transition name="fade">
      <q-badge
        v-if="saved"
        color="positive"
        rounded
        icon="check"
        class="saved-check"
      />
    </transition>
    <q-card-section class="row items-center justify-between">
      <div class="text-subtitle2">{{ localTier.name || 'Tier' }}</div>
      <q-btn flat dense round icon="mdi-drag" class="drag-handle" />
    </q-card-section>
    <q-card-section>
      <q-input v-model="localTier.name" label="Title" dense outlined class="q-mt-sm" />
      <q-input
        v-model.number="localTier.price"
        label="Price (sats/month)"
        type="number"
        dense
        outlined
        class="q-mt-sm"
      />
      <q-input
        v-model="localTier.description"
        label="Description"
        type="textarea"
        autogrow
        dense
        outlined
        class="q-mt-sm"
      />
      <q-input
        v-model="localTier.welcomeMessage"
        label="Welcome Message"
        type="textarea"
        autogrow
        dense
        outlined
        class="q-mt-sm"
      />
    </q-card-section>
    <q-card-actions align="right">
      <q-btn flat dense round icon="save" @click="emit('save')" />
      <q-btn flat dense round icon="delete" color="negative" @click="emit('delete')" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, reactive, watch } from 'vue';
import type { Tier } from 'stores/creatorHub';

const props = defineProps<{ tierData: Tier; saved: boolean }>();
const emit = defineEmits(['save', 'delete', 'update:tierData']);

const localTier = reactive<Tier>({ ...props.tierData });

watch(
  () => props.tierData,
  (val) => {
    Object.assign(localTier, val);
  },
  { immediate: true, deep: true },
);

watch(
  localTier,
  () => {
    emit('update:tierData', { ...localTier });
  },
  { deep: true },
);
</script>

<style scoped>
.saved-bg {
  background-color: rgba(76, 175, 80, 0.15);
  transition: background-color 0.5s ease;
}
.saved-check {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 1;
}
.relative-position {
  position: relative;
}
</style>
