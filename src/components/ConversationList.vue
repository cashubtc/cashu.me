<template>
  <div>
    <q-toolbar>
      <q-toolbar-title>Conversations</q-toolbar-title>
    </q-toolbar>
    <q-list bordered>
      <ConversationListItem
        v-for="item in sorted"
        :key="item.pubkey"
        :pubkey="item.pubkey"
        :profile="profiles[item.pubkey]"
        :snippet="item.snippet"
        :timestamp="item.timestamp"
        :unread="unread[item.pubkey] || 0"
        @click="select(item.pubkey)"
      />
      <div v-if="sorted.length === 0" class="q-pa-md text-caption text-grey-7">
        No active conversations.
      </div>
    </q-list>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, watch, onMounted } from 'vue';
import { useMessengerStore } from 'src/stores/messenger';
import { useNostrStore } from 'src/stores/nostr';
import ConversationListItem from './ConversationListItem.vue';

const emit = defineEmits(['select']);
const messenger = useMessengerStore();
const nostr = useNostrStore();

const profiles = reactive<Record<string, any>>({});
const conversations = computed(() => messenger.conversations);
const unread = computed(() => messenger.unreadCounts);

const sorted = computed(() => {
  const entries = Object.entries(conversations.value);
  return entries
    .map(([pubkey, msgs]) => {
      const last = msgs[msgs.length - 1];
      return {
        pubkey,
        snippet: last ? last.content.slice(0, 30) : '',
        timestamp: last ? last.created_at : 0,
      };
    })
    .sort((a, b) => b.timestamp - a.timestamp);
});

const loadProfiles = async () => {
  for (const { pubkey } of sorted.value) {
    if (!profiles[pubkey]) {
      profiles[pubkey] = await nostr.getProfile(pubkey);
    }
  }
};

onMounted(loadProfiles);
watch(sorted, loadProfiles);

const select = (pubkey: string) => emit('select', pubkey);
</script>

