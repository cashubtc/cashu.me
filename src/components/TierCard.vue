<template>
  <q-card flat bordered class="relative p-4 space-y-2">
    <q-card-section class="row items-center justify-between">
      <div class="text-subtitle2">{{ tierLocal.name || 'Tier' }}</div>
      <q-btn flat dense round icon="mdi-drag" class="drag-handle" />
    </q-card-section>
    <q-input v-model="tierLocal.name" label="Title" dense outlined />
    <q-input v-model.number="tierLocal.price" label="Price (sats/month)" type="number" dense outlined />
    <q-input v-model="tierLocal.description" label="Description" type="textarea" autogrow dense outlined />
    <q-input v-model="tierLocal.welcomeMessage" label="Welcome Message" type="textarea" autogrow dense outlined />
    <q-card-actions align="right">
      <q-btn flat dense round icon="save" @click="save" />
      <q-btn flat dense round icon="delete" color="negative" @click="remove" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useCreatorHubStore, type Tier } from 'stores/creatorHub';

const props = defineProps<{ tier: Tier }>();
const emit = defineEmits<{ (e: 'delete', id: string): void }>();

const store = useCreatorHubStore();
const tierLocal = ref<Tier>({ ...props.tier });

watch(
  () => props.tier,
  val => { tierLocal.value = { ...val }; },
  { deep: true }
);

async function save() {
  store.updateTier(tierLocal.value.id, tierLocal.value);
  await store.publishTierDefinitions();
}

function remove() {
  emit('delete', tierLocal.value.id);
}
</script>
