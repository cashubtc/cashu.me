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
      <ConversationListItem
        v-for="item in filtered"
        :key="item.pubkey"
        :pubkey="item.pubkey"
        :lastMsg="item.lastMsg"
        @click="select(item.pubkey)"
      />
      <div
        v-if="uniqueConversations.length === 0"
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
    }))
    .sort((a, b) => b.timestamp - a.timestamp);
});

const filtered = computed(() => {
  const q = filterQuery.value.toLowerCase();
  if (!q) return uniqueConversations.value;
  return uniqueConversations.value.filter(({ pubkey }) => {
    const entry: any = (nostr.profiles as any)[pubkey];
    const profile = entry?.profile ?? entry ?? {};
    const name =
      profile.display_name || profile.name || profile.displayName || pubkey;
    return name.toLowerCase().includes(q) || pubkey.toLowerCase().includes(q);
  });
});

const loadProfiles = async () => {
  for (const { pubkey } of uniqueConversations.value) {
    if (!(nostr.profiles as any)[pubkey]) {
      await nostr.getProfile(pubkey);
    }
  }
};

onMounted(loadProfiles);
watch(uniqueConversations, loadProfiles);

const select = (pubkey: string) => emit("select", pubkey);
</script>
