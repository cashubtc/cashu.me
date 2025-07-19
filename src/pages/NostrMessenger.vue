<template>
  <q-page
    class="row full-height no-horizontal-scroll"
    :class="[$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark']"
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
          <q-btn flat round dense icon="menu" @click="drawer = !drawer" />
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
      <q-banner v-if="connecting && !loading" dense class="bg-grey-3">
        Connecting...
      </q-banner>
      <q-banner
        v-else-if="!messenger.connected && !loading"
        dense
        class="bg-grey-3"
      >
        <div class="row items-center q-gutter-sm">
          <span>Offline - unable to connect to relays</span>
          <q-btn flat dense label="Reconnect" @click="reconnect" />
        </div>
      </q-banner>
      <q-spinner v-if="loading" size="lg" color="primary" />
      <ActiveChatHeader :pubkey="selected" />
      <MessageList :messages="messages" class="col" />
      <MessageInput @send="sendMessage" @sendToken="openSendTokenDialog" />
      <ChatSendTokenDialog ref="chatSendTokenDialogRef" :recipient="selected" />
    </div>
  </q-page>
  <NostrSetupWizard v-model="showSetupWizard" @complete="setupComplete" />
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
import NostrSetupWizard from "components/NostrSetupWizard.vue";

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
    NostrSetupWizard,
  },
  setup() {
    const loading = ref(true);
    const connecting = ref(false);
    const messenger = useMessengerStore();
    const nostr = useNostrStore();
    const showSetupWizard = ref(false);

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
      connecting.value = true;
      try {
        await nostr.initSignerIfNotSet();
        await messenger.loadIdentity();
        await useNdk();
        await Promise.race([messenger.start(), timeout(10000)]);
      } catch (e) {
        console.error(e);
      } finally {
        connecting.value = false;
        loading.value = false;
        const qp = route.query.pubkey as string | undefined;
        if (qp) {
          const hex = bech32ToHex(qp);
          messenger.startChat(hex);
          selected.value = hex;
        }
      }
    }

    async function checkAndInit() {
      if (!nostr.pubkey || nostr.relays.length === 0) {
        loading.value = false;
        showSetupWizard.value = true;
        return;
      }
      await init();
    }

    onMounted(checkAndInit);

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
      () => messenger.conversations[selected.value] || []
    );
    const showRelays = useLocalStorage<boolean>(
      "cashu.messenger.showRelays",
      true
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
      messenger.startChat(pubkey);
      selected.value = pubkey;
    };

    const sendMessage = (text: string) => {
      if (!selected.value) return;
      messenger.sendDm(selected.value, text);
    };

    function openSendTokenDialog() {
      if (!selected.value) return;
      (chatSendTokenDialogRef.value as any)?.show();
    }

    const reconnect = async () => {
      connecting.value = true;
      try {
        messenger.disconnect();
        messenger.started = false;
        await messenger.start();
      } catch (e) {
        console.error(e);
      } finally {
        connecting.value = false;
      }
    };

    const setupComplete = async () => {
      showSetupWizard.value = false;
      loading.value = true;
      await init();
    };

    return {
      loading,
      connecting,
      messenger,
      drawer,
      selected,
      chatSendTokenDialogRef,
      messages,
      showRelays,
      showSetupWizard,
      selectConversation,
      startChat,
      sendMessage,
      openSendTokenDialog,
      goBack,
      reconnect,
      setupComplete,
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
