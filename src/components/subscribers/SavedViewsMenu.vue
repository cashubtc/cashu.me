<template>
  <q-btn icon="save" label="Views" flat>
    <q-menu anchor="bottom right" self="top right">
      <q-list dense style="min-width: 200px">
        <q-item v-for="(view, name) in savedViews" :key="name" clickable v-close-popup @click="emit('select', name)">
          <q-item-section>{{ name }}</q-item-section>
          <q-item-section side>
            <q-btn icon="delete" flat dense round size="sm" @click.stop="emit('delete', name)" />
          </q-item-section>
        </q-item>

        <q-separator v-if="Object.keys(savedViews).length" />

        <q-item clickable @click="promptSave">
          <q-item-section>Save current view...</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';

defineProps<{
  savedViews: Record<string, any>;
}>();

const emit = defineEmits<{
  (e: 'select', name: string): void;
  (e: 'save', name: string): void;
  (e: 'delete', name: string): void;
}>();

const $q = useQuasar();

function promptSave() {
  $q.dialog({
    title: 'Save View',
    message: 'Enter a name for the current set of filters:',
    prompt: {
      model: '',
      type: 'text',
    },
    cancel: true,
    persistent: true,
  }).onOk(name => {
    if (name) {
      emit('save', name);
    }
  });
}
</script>
