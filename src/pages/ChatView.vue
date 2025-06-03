<template>
  <q-page
    :class="[$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark']"
    class="flex column full-height"
  >
    <q-toolbar class="border-bottom q-pa-sm" style="border-bottom: 1px solid rgba(0,0,0,0.1)">
      <q-btn
        flat
        dense
        round
        icon="arrow_back"
        color="primary"
        @click="goBack"
        aria-label="Go back"
        class="q-mr-sm"
      />
      <q-avatar v-if="avatar" size="md" class="q-mr-sm">
        <img :src="avatar" />
      </q-avatar>
      <q-toolbar-title class="text-h6">{{ displayName }}</q-toolbar-title>
    </q-toolbar>
    <div class="q-pa-md scroll-area col" ref="scrollArea">
      <q-chat-message
        v-for="msg in messages"
        :key="msg.id"
        :sent="msg.outgoing"
        :name="msg.outgoing ? 'You' : displayName"
        :avatar="msg.outgoing ? '' : avatar"
        :text="[sanitizeMessage(msg.content)]"
        :stamp="formatDate(msg.created_at)"
      />
      <div ref="bottomMarker"></div>
    </div>
    <div class="q-pa-sm row no-wrap items-center">
      <q-input
        v-model="newMessage"
        dense
        outlined
        class="col q-mr-sm"
        placeholder="Type a message"
        autofocus
        @keyup.enter="sendMessage"
      />
      <q-btn
        flat
        round
        icon="send"
        color="primary"
        @click="sendMessage"
        :disable="!newMessage.trim()"
      />
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDmChatsStore } from 'stores/dmChats';
import { storeToRefs } from 'pinia';
import { useNostrStore } from 'stores/nostr';
import { sanitizeMessage } from 'src/js/message-utils';

export default defineComponent({
  name: 'ChatView',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const pubkey = route.params.pubkey as string;
    const dmStore = useDmChatsStore();
    dmStore.loadChats();
    const { chats } = storeToRefs(dmStore);
    const nostrStore = useNostrStore();
    const profile = ref<any>(null);
    const newMessage = ref('');
    const bottomMarker = ref<HTMLElement | null>(null);

    const messages = computed(() => chats.value[pubkey] || []);

    const loadProfile = async () => {
      profile.value = await nostrStore.getProfile(pubkey);
    };

    const scrollToBottom = () => {
      nextTick(() => {
        if (bottomMarker.value) {
          bottomMarker.value.scrollIntoView({ behavior: 'smooth' });
        }
      });
    };

    watch(messages, () => {
      scrollToBottom();
      dmStore.markChatRead(pubkey);
    });

    onMounted(async () => {
      await loadProfile();
      scrollToBottom();
      dmStore.markChatRead(pubkey);
    });

    const sendMessage = async () => {
      const content = newMessage.value.trim();
      if (!content) return;
      const ev = await nostrStore.sendNip04DirectMessage(pubkey, content);
      if (ev) {
        dmStore.addOutgoing(ev);
        newMessage.value = '';
      }
    };

    const goBack = () => {
      router.push('/chats');
    };

    const displayName = computed(() => {
      return (
        profile.value?.display_name ||
        profile.value?.name ||
        pubkey.slice(0, 8) + '...' + pubkey.slice(-4)
      );
    });

    const avatar = computed(() => profile.value?.picture || '');

    const formatDate = (ts: number) => new Date(ts * 1000).toLocaleString();

    return {
      messages,
      displayName,
      avatar,
      newMessage,
      sendMessage,
      sanitizeMessage,
      formatDate,
      bottomMarker,
      goBack,
    };
  },
});
</script>

<style scoped>
.scroll-area {
  overflow-y: auto;
}
.border-bottom {
  border-color: rgba(0, 0, 0, 0.1);
}
</style>
