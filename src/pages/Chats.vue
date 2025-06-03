<template>
  <q-page :class="[$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark']" class="column full-height">
    <q-header elevated reveal class="border-bottom" style="border-bottom: 1px solid rgba(0,0,0,0.1)">
      <q-toolbar class="q-pa-sm">
        <q-toolbar-title class="text-h6">Chats</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-virtual-scroll
      class="col scroll-area"
      :items="pubkeys"
      :virtual-scroll-item-size="72"
    >
      <template #default="{ item }">
        <chat-list-item
          :pubkey="item"
          :profile="profiles[item]"
          :snippet="lastMessageSnippet(item)"
          :timestamp="lastMessageTimestamp(item)"
          :unread="unreadCounts[item] || 0"
          @click="openChat(item)"
        />
      </template>
    </q-virtual-scroll>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDmChatsStore } from 'stores/dmChats';
import { useNostrStore } from 'stores/nostr';
import { storeToRefs } from 'pinia';
import { sanitizeMessage } from 'src/js/message-utils';
import ChatListItem from 'components/ChatListItem.vue';

export default defineComponent({
  name: 'ChatsPage',
  components: { ChatListItem },
  setup() {
    const store = useDmChatsStore();
    store.loadChats();
    const { chats, unreadCounts } = storeToRefs(store);
    const router = useRouter();
    const nostrStore = useNostrStore();
    const profiles = ref<Record<string, any>>({});

    const loadProfiles = async () => {
      for (const pk of Object.keys(chats.value)) {
        if (!profiles.value[pk]) {
          profiles.value[pk] = await nostrStore.getProfile(pk);
        }
      }
    };

    onMounted(loadProfiles);
    watch(chats, loadProfiles, { deep: true });

    const pubkeys = computed(() => Object.keys(chats.value));

    const displayName = (pk: string) =>
      profiles.value[pk]?.display_name ||
      profiles.value[pk]?.name ||
      pk.slice(0, 8) + '...' + pk.slice(-4);

    const lastMessageTimestamp = (pk: string) => {
      const msgs = chats.value[pk];
      if (!msgs || !msgs.length) return 0;
      return msgs[msgs.length - 1].created_at;
    };

    const lastMessageSnippet = (pk: string) => {
      const msgs = chats.value[pk];
      if (!msgs || !msgs.length) return '';
      return sanitizeMessage(msgs[msgs.length - 1].content).slice(0, 40);
    };

    const openChat = (pk: string) => {
      router.push(`/chats/${pk}`);
    };

    return {
      chats,
      pubkeys,
      profiles,
      displayName,
      lastMessageTimestamp,
      lastMessageSnippet,
      unreadCounts,
      openChat,
    };
  },
});
</script>

<style scoped>
.scroll-area {
  overflow-y: auto;
}
</style>
