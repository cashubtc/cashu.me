<template>
  <q-page
    class="row full-height no-horizontal-scroll"
    :class="[$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark']"
  >
    <q-responsive>
      <q-drawer
        :model-value="true"
        side="left"
        show-if-above
        :breakpoint="600"
        bordered
        :width="drawerOpen ? 240 : 64"
        class="drawer-transition drawer-container"
        :style="{ overflowX: 'hidden' }"
        :class="[
          $q.screen.gt.xs ? 'q-pa-lg column' : 'q-pa-md column',
          { 'drawer-collapsed': !drawerOpen },
        ]"
      >
        <template v-if="drawerOpen">
          <div class="column no-wrap full-height">
            <div class="row items-center justify-between q-mb-md">
              <div class="text-subtitle1">Chats</div>
              <q-btn flat dense round icon="add" @click="openNewChatDialog" />
            </div>
            <q-input
              dense
              rounded
              debounce="300"
              v-model="conversationSearch"
              placeholder="Search"
              class="q-mb-md"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-scroll-area class="col" style="min-height: 0">
              <Suspense>
                <template #default>
                  <ConversationList
                    :selected-pubkey="selected"
                    :search="conversationSearch"
                    @select="selectConversation"
                  />
                </template>
                <template #fallback>
                  <q-skeleton height="100px" square />
                </template>
              </Suspense>
            </q-scroll-area>
            <UserInfo />
          </div>
        </template>
        <template v-else>
          <div class="column items-center q-gutter-md" style="overflow-y: auto">
            <q-avatar
              v-for="item in miniList"
              :key="item.pubkey"
              size="40px"
              class="cursor-pointer"
              @click="selectConversation(item.pubkey)"
            >
              <img v-if="item.profile?.picture" :src="item.profile.picture" />
              <span v-else>{{ item.initials }}</span>
              <q-tooltip>{{ item.displayName }}</q-tooltip>
            </q-avatar>
          </div>
        </template>
      </q-drawer>
    </q-responsive>

    <div :class="['col column', $q.screen.gt.xs ? 'q-pa-lg' : 'q-pa-md']">
      <q-header elevated class="q-mb-md bg-transparent">
        <q-toolbar>
          <q-btn
            flat
            round
            dense
            icon="menu"
            @click="messenger.toggleDrawer()"
          />
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
          <span>
            Offline - {{ connectedCount }}/{{ totalRelays }} connected
            <span v-if="nextReconnectIn !== null">
              - reconnecting in {{ nextReconnectIn }}s
            </span>
          </span>
          <q-btn flat dense label="Reconnect All" @click="reconnectAll" />
        </div>
      </q-banner>
      <q-spinner v-if="loading" size="lg" color="primary" />
      <ActiveChatHeader :pubkey="selected" />
      <MessageList :messages="messages" class="col" />
      <MessageInput @send="sendMessage" @sendToken="openSendTokenDialog" />
      <ChatSendTokenDialog ref="chatSendTokenDialogRef" :recipient="selected" />
      <NewChatDialog ref="newChatDialogRef" @start="startChat" />
    </div>
  </q-page>
  <NostrSetupWizard v-model="showSetupWizard" @complete="setupComplete" />
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  ref,
  onMounted,
  onUnmounted,
  watch,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { useLocalStorage } from "@vueuse/core";
import { useMessengerStore } from "src/stores/messenger";
import { useNdk } from "src/composables/useNdk";
import { useNostrStore } from "src/stores/nostr";
import { nip19 } from "nostr-tools";
import type NDK from "@nostr-dev-kit/ndk";

import NewChatDialog from "components/NewChatDialog.vue";
import ConversationList from "components/ConversationList.vue";
import ActiveChatHeader from "components/ActiveChatHeader.vue";
import MessageList from "components/MessageList.vue";
import MessageInput from "components/MessageInput.vue";
import ChatSendTokenDialog from "components/ChatSendTokenDialog.vue";
import NostrSetupWizard from "components/NostrSetupWizard.vue";
import UserInfo from "components/UserInfo.vue";
import { shortenString } from "src/js/string-utils";

export default defineComponent({
  name: "NostrMessenger",
  components: {
    NewChatDialog,
    ConversationList,
    ActiveChatHeader,
    MessageList,
    MessageInput,
    ChatSendTokenDialog,
    NostrSetupWizard,
    UserInfo,
  },
  setup() {
    const loading = ref(true);
    const connecting = ref(false);
    const messenger = useMessengerStore();
    const nostr = useNostrStore();
    const showSetupWizard = ref(false);

    const ndkRef = ref<NDK | null>(null);
    const now = ref(Date.now());
    let timer: ReturnType<typeof setInterval> | undefined;

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
        ndkRef.value = await useNdk();
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

    onMounted(() => {
      checkAndInit();
      timer = setInterval(() => (now.value = Date.now()), 1000);
    });

    onUnmounted(() => {
      if (timer) clearInterval(timer);
    });

    const router = useRouter();
    const route = useRoute();

    const goBack = () => {
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push("/wallet");
      }
    };

    const drawerOpen = computed(() => messenger.drawerOpen);
    const selected = ref("");
    const chatSendTokenDialogRef = ref<InstanceType<
      typeof ChatSendTokenDialog
    > | null>(null);
    const newChatDialogRef = ref<InstanceType<typeof NewChatDialog> | null>(
      null
    );
    const conversationSearch = ref("");
    const messages = computed(
      () => messenger.conversations[selected.value] || []
    );

    const miniList = computed(() => {
      return Object.entries(messenger.conversations)
        .map(([pubkey, msgs]) => {
          const entry: any = (nostr.profiles as any)[pubkey];
          const profile = entry?.profile ?? entry ?? {};
          const alias = messenger.aliases[pubkey];
          const displayName =
            alias ||
            profile.display_name ||
            profile.name ||
            profile.displayName ||
            pubkey.slice(0, 8) + "…";
          const initials = displayName
            .split(/\s+/)
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          return {
            pubkey,
            profile,
            displayName,
            initials,
            lastMsg: msgs[msgs.length - 1],
            pinned: messenger.pinned[pubkey] || false,
          };
        })
        .sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (b.pinned && !a.pinned) return 1;
          return (b.lastMsg?.created_at || 0) - (a.lastMsg?.created_at || 0);
        });
    });

    const connectedCount = computed(() => {
      if (!ndkRef.value) return 0;
      return Array.from(ndkRef.value.pool.relays.values()).filter(
        (r) => r.connected
      ).length;
    });

    const totalRelays = computed(() => ndkRef.value?.pool.relays.size || 0);

    const nextReconnectIn = computed(() => {
      if (!ndkRef.value) return null;
      let earliest: number | null = null;
      ndkRef.value.pool.relays.forEach((r) => {
        if (r.status !== 5) {
          const nr = r.connectionStats.nextReconnectAt;
          if (nr && (earliest === null || nr < earliest)) earliest = nr;
        }
      });
      return earliest
        ? Math.max(0, Math.ceil((earliest - now.value) / 1000))
        : null;
    });

    watch(nextReconnectIn, (val) => {
      if (val === 0 && !messenger.connected && !connecting.value) {
        reconnectAll();
      }
    });

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

    const sendMessage = (
      payload:
        | string
        | {
            text: string;
            attachment?: { dataUrl: string; name: string; type: string };
          }
    ) => {
      if (!selected.value) return;
      if (typeof payload === "string") {
        messenger.sendDm(selected.value, payload);
        return;
      }
      const { text, attachment } = payload;
      if (text) messenger.sendDm(selected.value, text);
      if (attachment) {
        messenger.sendDm(selected.value, attachment.dataUrl, undefined, {
          name: attachment.name,
          type: attachment.type,
        });
      }
    };

    function openSendTokenDialog() {
      if (!selected.value) return;
      (chatSendTokenDialogRef.value as any)?.show();
    }

    function openNewChatDialog() {
      (newChatDialogRef.value as any)?.show();
    }

    const reconnectAll = async () => {
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
      drawerOpen,
      selected,
      chatSendTokenDialogRef,
      newChatDialogRef,
      conversationSearch,
      messages,
      showSetupWizard,
      selectConversation,
      startChat,
      sendMessage,
      openSendTokenDialog,
      openNewChatDialog,
      goBack,
      reconnectAll,
      connectedCount,
      totalRelays,
      nextReconnectIn,
      setupComplete,
      miniList,
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

.drawer-container {
  min-width: 0;
}

/* When the drawer is collapsed, only show the avatar */
.drawer-collapsed .conversation-item {
  padding: 8px;
  justify-content: center;
  overflow: hidden;
}

.drawer-collapsed .conversation-item .q-item-section:not([avatar]) {
  display: none;
}

.drawer-collapsed .conversation-item q-avatar {
  width: 40px;
  height: 40px;
}

@media (max-width: 320px) {
  .drawer-container .conversation-item q-avatar {
    width: 40px;
    height: 40px;
  }
  .drawer-container .conversation-item .snippet {
    display: none;
  }
}
</style>
