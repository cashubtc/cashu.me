<template>
  <div>
    <q-toolbar>
      <q-toolbar-title>Conversations</q-toolbar-title>
    </q-toolbar>
    <q-input
      dense
      rounded
      debounce="300"
      v-model="filterQuery"
      placeholder="Search…"
      class="q-px-md q-mt-sm"
    />
    <q-list bordered>
      <template v-if="filteredPinned.length">
        <q-item-label header>Pinned</q-item-label>
        <ConversationListItem
          v-for="item in filteredPinned"
          :key="'pinned-' + item.pubkey"
          :pubkey="item.pubkey"
          :lastMsg="item.lastMsg"
          :selected="item.pubkey === selectedPubkey"
          @click="select(item.pubkey)"
          @pin="togglePin(item.pubkey)"
          @delete="deleteConversation(item.pubkey)"
        />
        <q-separator spaced />
      </template>

      <q-item-label header>All Conversations</q-item-label>
      <ConversationListItem
        v-for="item in filteredRegular"
        :key="'reg-' + item.pubkey"
        :pubkey="item.pubkey"
        :lastMsg="item.lastMsg"
        :selected="item.pubkey === selectedPubkey"
        @click="select(item.pubkey)"
        @pin="togglePin(item.pubkey)"
        @delete="deleteConversation(item.pubkey)"
      />
      <div
        v-if="filteredPinned.length + filteredRegular.length === 0"
        class="q-pa-md text-caption text-grey-7"
      >
        No active conversations.
      </div>
    </q-list>
  </div>
</template>

<script lang="ts" setup>
import { computed, watch, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useMessengerStore } from "src/stores/messenger";
import { useNostrStore } from "src/stores/nostr";
import ConversationListItem from "./ConversationListItem.vue";

const props = defineProps<{ selectedPubkey: string }>();

const emit = defineEmits(["select"]);
const messenger = useMessengerStore();
const nostr = useNostrStore();
const { conversations } = storeToRefs(messenger);
const filterQuery = ref("");

const uniqueConversations = computed(() => {
  return Object.entries(conversations.value)
    .map(([pubkey, msgs]) => ({
      pubkey,
      lastMsg: msgs[msgs.length - 1],
      timestamp: msgs[msgs.length - 1]?.created_at,
      pinned: messenger.pinned[pubkey] || false,
    }))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (b.pinned && !a.pinned) return 1;
      return b.timestamp - a.timestamp;
    });
});

const pinnedConversations = computed(() =>
  uniqueConversations.value.filter((c) => c.pinned)
);

const regularConversations = computed(() =>
  uniqueConversations.value.filter((c) => !c.pinned)
);

const applyFilter = (list: typeof uniqueConversations.value) => {
  const q = filterQuery.value.toLowerCase();
  if (!q) return list;
  return list.filter(({ pubkey }) => {
    const entry: any = (nostr.profiles as any)[pubkey];
    const profile = entry?.profile ?? entry ?? {};
    const name =
      profile.display_name || profile.name || profile.displayName || pubkey;
    return name.toLowerCase().includes(q) || pubkey.toLowerCase().includes(q);
  });
};

const filteredPinned = computed(() => applyFilter(pinnedConversations.value));
const filteredRegular = computed(() => applyFilter(regularConversations.value));

const loadProfiles = async () => {
  for (const { pubkey } of uniqueConversations.value) {
    if (!(nostr.profiles as any)[pubkey]) {
      await nostr.getProfile(pubkey);
    }
  }
};

onMounted(loadProfiles);
watch(uniqueConversations, loadProfiles);

const select = (pubkey: string) => emit("select", nostr.resolvePubkey(pubkey));
const togglePin = (pubkey: string) => {
  messenger.togglePin(nostr.resolvePubkey(pubkey));
};

const deleteConversation = (pubkey: string) => {
  messenger.deleteConversation(nostr.resolvePubkey(pubkey));
};
</script>
