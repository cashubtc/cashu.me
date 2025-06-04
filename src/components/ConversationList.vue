<template>
  <q-drawer v-model="drawer" side="left" bordered :width="260">
    <q-toolbar>
      <q-toolbar-title>Conversations</q-toolbar-title>
    </q-toolbar>
    <q-list>
      <q-item v-for="(msgs, pubkey) in conversations" :key="pubkey" clickable @click="select(pubkey)">
        <q-item-section>{{ pubkey }}</q-item-section>
      </q-item>
    </q-list>
  </q-drawer>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useMessengerStore } from 'src/stores/messenger';

const emit = defineEmits(['select']);
const drawer = ref(true);
const messenger = useMessengerStore();
const conversations = computed(() => messenger.conversations);

const select = (pubkey: string) => {
  emit('select', pubkey);
};
</script>
