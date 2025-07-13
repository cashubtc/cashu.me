<template>
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
        class="drawer-transition"
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
          <Suspense>
            <template #default>
              <ConversationList
                :selected-pubkey="selected"
                @select="selectConversation"
              />
            </template>
            <template #fallback>
              <q-skeleton height="100px" square />
            </template>
          </Suspense>
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
      <q-banner v-if="!messenger.connected && !loading" dense class="bg-grey-3">
        Offline - unable to connect to relays
      </q-banner>
      <q-spinner v-if="loading" size="lg" color="primary" />
      <ActiveChatHeader :pubkey="selected" />
      <MessageList :messages="messages" class="col" />
      <MessageInput @send="sendMessage" @sendToken="openSendTokenDialog" />
      <ChatSendTokenDialog ref="chatSendTokenDialogRef" :recipient="selected" />
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useLocalStorage } from "@vueuse/core";
import { useMessengerStore } from "src/stores/messenger";
import { useNdk } from "src/composables/useNdk";
import { useNostrStore } from "src/stores/nostr";
import { nip19 } from "nostr-tools";

import NostrIdentityManager from "components/NostrIdentityManager.vue";
import RelayManager from "components/RelayManager.vue";
import NewChat from "components/NewChat.vue";
import ConversationList from "components/ConversationList.vue";
import ActiveChatHeader from "components/ActiveChatHeader.vue";
import MessageList from "components/MessageList.vue";
import MessageInput from "components/MessageInput.vue";
import ChatSendTokenDialog from "components/ChatSendTokenDialog.vue";

export default defineComponent({
  name: "NostrMessenger",
  components: {
    NostrIdentityManager,
    RelayManager,
    NewChat,
    ConversationList,
    ActiveChatHeader,
    MessageList,
    MessageInput,
    ChatSendTokenDialog,
  },
  setup() {
    const loading = ref(true);
    const messenger = useMessengerStore();
    const nostr = useNostrStore();

    function bech32ToHex(pubkey: string): string {
      try {
        const decoded = nip19.decode(pubkey);
        return typeof decoded.data === "string" ? decoded.data : pubkey;
      } catch {
        return pubkey;
      }
    }

    function timeout(ms: number) {
      return new Promise<void>((resolve) => setTimeout(resolve, ms));
    }

    async function init() {
      try {
        await nostr.initSignerIfNotSet();
        await messenger.loadIdentity();
        await useNdk();
        await Promise.race([messenger.start(), timeout(10000)]);
      } catch (e) {
        console.error(e);
      } finally {
        loading.value = false;
        const qp = route.query.pubkey as string | undefined;
        if (qp) {
          const hex = bech32ToHex(qp);
          messenger.startChat(hex);
          selected.value = hex;
        }
      }
    }

    onMounted(init);

    const router = useRouter();
    const route = useRoute();

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
    const messages = computed(
      () => messenger.conversations[selected.value] || [],
    );
    const showRelays = useLocalStorage<boolean>(
      "cashu.messenger.showRelays",
      true,
    );

    watch(
      selected,
      (val) => {
        messenger.setCurrentConversation(val);
      },
      { immediate: true },
    );

    const selectConversation = (pubkey: string) => {
      const hex = bech32ToHex(pubkey);
      selected.value = hex;
      messenger.markRead(hex);
      messenger.setCurrentConversation(hex);
    };

    const startChat = (pubkey: string) => {
      const hex = bech32ToHex(pubkey);
      messenger.startChat(hex);
      selected.value = hex;
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

    return {
      loading,
      messenger,
      drawer,
      selected,
      chatSendTokenDialogRef,
      messages,
      showRelays,
      selectConversation,
      startChat,
      sendMessage,
      openSendTokenDialog,
      goBack,
      onTouchStart,
      onTouchEnd,
    };
  },
});
</script>
<style scoped>
.q-toolbar {
  flex-wrap: nowrap;
}
.drawer-transition {
  transition: transform 0.3s;
}
</style>
