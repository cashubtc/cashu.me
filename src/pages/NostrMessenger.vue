<template>
  <q-page
    class="row full-height"
    :class="[$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark']"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <q-drawer
      v-model="drawer"
      side="left"
      show-if-above
      bordered
      :width="300"
      class="q-pa-md"
    >
      <NostrIdentityManager class="q-mb-md" />
      <RelayManager class="q-mb-md" />
      <NewChat class="q-mb-md" @start="startChat" />
      <ConversationList @select="selectConversation" />
    </q-drawer>

    <div class="col column q-pa-md">
      <q-header elevated class="q-mb-md bg-transparent">
        <q-toolbar>
          <q-toolbar-title class="text-h6 ellipsis">
            Nostr Messenger
            <q-badge
              :color="messenger.connected ? 'positive' : 'negative'"
              class="q-ml-sm"
            >
              {{ messenger.connected ? "Online" : "Offline" }}
            </q-badge>
          </q-toolbar-title>
        </q-toolbar>
      </q-header>
      <ActiveChatHeader :pubkey="selected" />
      <MessageList :messages="messages" class="col" />
      <MessageInput @send="sendMessage" />
      <q-expansion-item
        class="q-mt-md"
        dense
        dense-toggle
        label="Event Log"
        v-model="showEventLog"
      >
        <EventLog :events="eventLog" />
      </q-expansion-item>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, watch } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { useMessengerStore } from "src/stores/messenger";

import NostrIdentityManager from "components/NostrIdentityManager.vue";
import RelayManager from "components/RelayManager.vue";
import NewChat from "components/NewChat.vue";
import ConversationList from "components/ConversationList.vue";
import ActiveChatHeader from "components/ActiveChatHeader.vue";
import MessageList from "components/MessageList.vue";
import MessageInput from "components/MessageInput.vue";
import EventLog from "components/EventLog.vue";

const messenger = useMessengerStore();
messenger.loadIdentity();
onMounted(() => {
  messenger.start();
});

const drawer = computed({
  get: () => messenger.drawerOpen,
  set: (val) => messenger.setDrawer(val),
});
const selected = ref("");
const messages = computed(() => messenger.conversations[selected.value] || []);
const eventLog = computed(() => messenger.eventLog);
const showEventLog = useLocalStorage<boolean>(
  "cashu.messenger.showEventLog",
  false,
);

watch(
  selected,
  (val) => {
    messenger.setCurrentConversation(val);
  },
  { immediate: true }
);

const selectConversation = (pubkey: string) => {
  selected.value = pubkey;
  messenger.markRead(pubkey);
  messenger.setCurrentConversation(pubkey);
};

const startChat = (pubkey: string) => {
  messenger.createConversation(pubkey);
  selected.value = pubkey;
  messenger.markRead(pubkey);
  messenger.setCurrentConversation(pubkey);
};

const sendMessage = (text: string) => {
  if (!selected.value) return;
  messenger.sendDm(selected.value, text);
};

let touchStartX = 0;
const onTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0].clientX;
};

const onTouchEnd = (e: TouchEvent) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (dx > 50) messenger.setDrawer(true);
  if (dx < -50) messenger.setDrawer(false);
};
</script>
<style scoped>
.q-toolbar {
  flex-wrap: nowrap;
}
</style>
