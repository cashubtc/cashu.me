<template>
  <div :class="[$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark', 'q-pa-md']">
    <q-list bordered>
      <div v-for="(messages, pubkey) in chats" :key="pubkey" class="q-mb-md">
        <div class="text-h6 q-mb-sm">{{ shorten(pubkey) }}</div>
        <q-item v-for="msg in messages" :key="msg.id">
          <q-item-section>
            <q-item-label>{{ msg.content }}</q-item-label>
            <q-item-label caption>{{ formatDate(msg.created_at) }} - {{ msg.outgoing ? 'out' : 'in' }}</q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </q-list>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { useDmChatsStore } from 'src/stores/dmChats';
import { storeToRefs } from 'pinia';

export default defineComponent({
  name: 'ChatsPage',
  setup() {
    const store = useDmChatsStore();
    store.loadChats();
    const { chats } = storeToRefs(store);
    const shorten = (p) => p.slice(0, 8) + '...' + p.slice(-4);
    const formatDate = (ts) => new Date(ts * 1000).toLocaleString();
    return { chats, shorten, formatDate };
  }
});
</script>
