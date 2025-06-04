<template>
  <q-page
    class="column full-height"
    :class="[$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark', 'q-pa-md']"
  >
    <div class="text-h5 q-mb-md">Nostr Messenger</div>
    <NostrIdentityManager class="q-mb-md" />
    <div class="row col-grow">
      <ConversationList @select="selectConversation" />
      <div class="col column">
        <MessageList :messages="messages" class="col" />
        <MessageInput @send="sendMessage" />
      </div>
    </div>
    <EventLog class="q-mt-md" />
  </q-page>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useMessengerStore } from 'src/stores/messenger';

import NostrIdentityManager from 'components/NostrIdentityManager.vue';
import ConversationList from 'components/ConversationList.vue';
import MessageList from 'components/MessageList.vue';
import MessageInput from 'components/MessageInput.vue';
import EventLog from 'components/EventLog.vue';

const messenger = useMessengerStore();
messenger.loadIdentity();

const selected = ref('');
const messages = computed(() => messenger.conversations[selected.value] || []);

const selectConversation = (pubkey: string) => {
  selected.value = pubkey;
};

const sendMessage = (text: string) => {
  if (!selected.value) return;
  messenger.sendDm(selected.value, text);
};
</script>
