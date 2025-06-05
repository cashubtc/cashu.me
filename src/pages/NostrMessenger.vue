<template>
  <q-page
    class="row full-height"
    :class="[$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark']"
  >
    <q-drawer v-model="drawer" side="left" show-if-above bordered :width="300" class="q-pa-md">
      <NostrIdentityManager class="q-mb-md" />
      <RelayManager class="q-mb-md" />
      <NewChat class="q-mb-md" @start="startChat" />
      <ConversationList @select="selectConversation" />
    </q-drawer>

    <div class="col column q-pa-md">
      <div class="text-h5 q-mb-md">
        Nostr Messenger
        <q-badge
          :color="messenger.connected ? 'positive' : 'negative'"
          class="q-ml-sm"
        >
          {{ messenger.connected ? 'Online' : 'Offline' }}
        </q-badge>
      </div>
      <ActiveChatHeader :pubkey="selected" />
      <MessageList :messages="messages" class="col" />
      <MessageInput @send="sendMessage" />
      <EventLog class="q-mt-md" :events="eventLog" />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue';
import { useMessengerStore } from 'src/stores/messenger';

import NostrIdentityManager from 'components/NostrIdentityManager.vue';
import RelayManager from 'components/RelayManager.vue';
import NewChat from 'components/NewChat.vue';
import ConversationList from 'components/ConversationList.vue';
import ActiveChatHeader from 'components/ActiveChatHeader.vue';
import MessageList from 'components/MessageList.vue';
import MessageInput from 'components/MessageInput.vue';
import EventLog from 'components/EventLog.vue';

const messenger = useMessengerStore();
messenger.loadIdentity();
onMounted(() => {
  messenger.start();
});

const drawer = ref(true);
const selected = ref('');
const messages = computed(() => messenger.conversations[selected.value] || []);
const eventLog = computed(() => messenger.eventLog);

const selectConversation = (pubkey: string) => {
  selected.value = pubkey;
  messenger.markRead(pubkey);
};

const startChat = (pubkey: string) => {
  messenger.createConversation(pubkey);
  selected.value = pubkey;
  messenger.markRead(pubkey);
};

const sendMessage = (text: string) => {
  if (!selected.value) return;
  messenger.sendDm(selected.value, text);
};
</script>
