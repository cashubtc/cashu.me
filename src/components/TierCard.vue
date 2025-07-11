<template>
  <q-card flat bordered class="relative-position">
    <q-card-section class="row items-center justify-between">
      <div class="row items-center">
        <div class="text-subtitle2">{{ tierLocal.name || 'Tier' }}</div>
        <div class="text-caption text-grey q-ml-sm">{{ tierLocal.price }} sats</div>
      </div>
      <q-btn flat dense round icon="mdi-drag" class="drag-handle" />
    </q-card-section>
    <q-card-section>
      <q-input v-model="tierLocal.name" label="Title" dense outlined class="q-mt-sm" />
      <q-input
        v-model.number="tierLocal.price"
        label="Price (sats/month)"
        type="number"
        dense
        outlined
        class="q-mt-sm"
      />
      <q-input
        v-model="tierLocal.description"
        label="Description"
        type="textarea"
        autogrow
        dense
        outlined
        class="q-mt-sm"
      />
      <q-input
        v-model="tierLocal.welcomeMessage"
        label="Welcome Message"
        type="textarea"
        autogrow
        dense
        outlined
        class="q-mt-sm"
      />
    </q-card-section>
    <q-card-actions align="right">
      <q-btn flat dense round icon="save" @click="emitEdit" />
      <q-btn flat dense round icon="delete" color="negative" @click="emitDelete" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { reactive, watch, defineProps, defineEmits } from 'vue';
import type { Tier } from 'stores/creatorHub';

const props = defineProps<{ tier: Tier }>();
const emit = defineEmits(['edit', 'delete', 'update:tier']);

const tierLocal = reactive<Tier>({ ...props.tier });

watch(
  () => props.tier,
  (val) => {
    Object.assign(tierLocal, val);
  },
  { immediate: true, deep: true },
);

watch(
  tierLocal,
  () => {
    emit('update:tier', { ...tierLocal });
  },
  { deep: true },
);

function emitEdit() {
  emit('edit');
}

function emitDelete() {
  emit('delete');
}
</script>

<style scoped>
.relative-position {
  position: relative;
}
</style>
