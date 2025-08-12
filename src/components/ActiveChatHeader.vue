<template>
  <div class="q-pa-sm row items-center justify-between">
    <div class="row items-center">
      <q-btn
        flat
        round
        dense
        icon="payments"
        class="q-mr-sm"
        @click="openSendTokenDialog"
      />
      <q-btn
        v-if="$q.screen.lt.sm"
        flat
        round
        dense
        icon="menu"
        class="q-mr-sm"
        @click="messenger.toggleDrawer()"
      />
      <template v-if="pubkey">
        <q-avatar size="md" class="q-mr-sm relative-position">
          <img v-if="profile?.picture" :src="profile.picture" />
          <span v-else>{{ initials }}</span>
          <q-badge
            class="status-dot"
            rounded
            :color="messenger.connected ? 'positive' : 'grey'"
          />
        </q-avatar>
        <div class="row items-center">
          <div class="text-h6 ellipsis">{{ displayName }}</div>
          <q-badge
            class="q-ml-sm"
            :color="messenger.connected ? 'positive' : 'negative'"
            >{{ messenger.connected ? "Online" : "Offline" }}</q-badge
          >
        </div>
        <q-btn
          flat
          round
          dense
          icon="more_vert"
          class="q-ml-xs"
          @click="showProfileDialog = true"
        />
        <q-btn
          flat
          round
          dense
          icon="rss_feed"
          class="q-ml-xs"
          @click="openRelayDialog"
        />
        <ProfileInfoDialog
          v-model="showProfileDialog"
          :pubkey="props.pubkey"
          @clear-chat="clearChat"
        />
      </template>
      <template v-else>
        <div class="text-grey-6">Select a conversation to start chatting.</div>
      </template>
    </div>
    <ChatSendTokenDialog
      ref="chatSendTokenDialogRef"
      :recipient="props.pubkey"
    />
    <RelayManagerDialog ref="relayManagerDialogRef" />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from "vue";
import { useQuasar } from "quasar";
import { useNostrStore } from "src/stores/nostr";
import { useMessengerStore } from "src/stores/messenger";
import ChatSendTokenDialog from "./ChatSendTokenDialog.vue";
import { nip19 } from "nostr-tools";
import ProfileInfoDialog from "./ProfileInfoDialog.vue";
import RelayManagerDialog from "./RelayManagerDialog.vue";

const props = defineProps<{ pubkey: string }>();
const nostr = useNostrStore();
const messenger = useMessengerStore();
const $q = useQuasar();
const profile = ref<any>(null);

const loadProfile = async () => {
  if (props.pubkey) {
    profile.value = await nostr.getProfile(props.pubkey);
  } else {
    profile.value = null;
  }
};

watch(
  () => props.pubkey,
  () => {
    loadProfile();
  },
  { immediate: true }
);

const displayName = computed(() => {
  if (!props.pubkey) return "";
  const alias = messenger.aliases[props.pubkey];
  if (alias) return alias;
  const p: any = profile.value;
  if (p?.display_name) return p.display_name;
  if (p?.name) return p.name;
  try {
    return nip19.npubEncode(nostr.resolvePubkey(props.pubkey));
  } catch (e) {
    return props.pubkey.slice(0, 8) + "..." + props.pubkey.slice(-4);
  }
});

const initials = computed(() => {
  const name = displayName.value.trim();
  if (!name) return "";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
});

const chatSendTokenDialogRef = ref<InstanceType<
  typeof ChatSendTokenDialog
> | null>(null);
const relayManagerDialogRef = ref<InstanceType<
  typeof RelayManagerDialog
> | null>(null);
const showProfileDialog = ref(false);

function openSendTokenDialog() {
  if (!props.pubkey) return;
  (chatSendTokenDialogRef.value as any)?.show();
}

function openRelayDialog() {
  (relayManagerDialogRef.value as any)?.show();
}

function clearChat() {
  if (!props.pubkey) return;
  messenger.conversations[props.pubkey] = [];
  messenger.unreadCounts[props.pubkey] = 0;
}
</script>

<style scoped>
.status-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--q-color-white);
}
</style>
