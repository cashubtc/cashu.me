<template>
  <Suspense>
    <template #default>
      <q-page
        class="row full-height no-horizontal-scroll"
        :class="[$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark']"
        @touchstart="onTouchStart"
        @touchend="onTouchEnd"
      >
    <q-responsive>
      <q-drawer
        v-model="drawer"
        side="left"
        show-if-above
        :breakpoint="600"
        bordered
        :width="300"
        :class="$q.screen.gt.xs ? 'q-pa-lg column' : 'q-pa-md column'"
      >
        <NostrIdentityManager class="q-mb-md" />
        <q-expansion-item
          class="q-mb-md"
          dense
          dense-toggle
          label="Relays"
          v-model="showRelays"
        >
          <RelayManager class="q-mb-md" />
        </q-expansion-item>
        <NewChat class="q-mb-md" @start="startChat" />
        <q-scroll-area class="col" style="min-height: 0">
          <ConversationList @select="selectConversation" />
        </q-scroll-area>
      </q-drawer>
    </q-responsive>

    <div :class="['col column', $q.screen.gt.xs ? 'q-pa-lg' : 'q-pa-md']">
      <q-header elevated class="q-mb-md bg-transparent">
        <q-toolbar>
          <q-btn flat round dense icon="arrow_back" @click="goBack" />
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
      <MessageInput @send="sendMessage" @sendToken="openSendTokenDialog" />
      <ChatSendTokenDialog ref="chatSendTokenDialogRef" :recipient="selected" />
      </q-page>
    </template>
    <template #fallback>
      <q-skeleton height="100vh" square />
    </template>
  </Suspense>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useLocalStorage } from "@vueuse/core";
import { useMessengerStore } from "src/stores/messenger";
import { useNdk } from "src/composables/useNdk";

import NostrIdentityManager from "components/NostrIdentityManager.vue";
import RelayManager from "components/RelayManager.vue";
import NewChat from "components/NewChat.vue";
import ConversationList from "components/ConversationList.vue";
import ActiveChatHeader from "components/ActiveChatHeader.vue";
import MessageList from "components/MessageList.vue";
import MessageInput from "components/MessageInput.vue";
import ChatSendTokenDialog from "components/ChatSendTokenDialog.vue";

await useNdk();

const messenger = useMessengerStore();
messenger.loadIdentity();
onMounted(() => {
  messenger.start();
});

const router = useRouter();

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/wallet");
  }
};

const drawer = computed({
  get: () => messenger.drawerOpen,
  set: (val) => messenger.setDrawer(val),
});
const selected = ref("");
const chatSendTokenDialogRef = ref<InstanceType<
  typeof ChatSendTokenDialog
> | null>(null);
const messages = computed(() => messenger.conversations[selected.value] || []);
const showRelays = useLocalStorage<boolean>("cashu.messenger.showRelays", true);

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

function openSendTokenDialog() {
  if (!selected.value) return;
  (chatSendTokenDialogRef.value as any)?.show();
}

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
