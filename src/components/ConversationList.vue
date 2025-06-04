<template>
  <div>
    <q-toolbar>
      <q-toolbar-title>Conversations</q-toolbar-title>
    </q-toolbar>
    <q-list>
      <q-item
        v-for="(msgs, pubkey) in conversations"
        :key="pubkey"
        clickable
        @click="select(pubkey)"
      >
        <q-item-section>{{ pubkey }}</q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useMessengerStore } from 'src/stores/messenger';

const emit = defineEmits(['select']);
const messenger = useMessengerStore();
const conversations = computed(() => messenger.conversations);

const select = (pubkey: string) => {
  emit('select', pubkey);
};
</script>
