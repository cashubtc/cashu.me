<template>
  <div :class="[$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark', 'q-pa-md']">
    <q-list bordered>
      <q-item v-for="pubkey in pubkeys" :key="pubkey" clickable @click="openChat(pubkey)">
        <q-item-section avatar>
          <q-avatar v-if="profiles[pubkey]?.picture" :src="profiles[pubkey].picture" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-subtitle1">{{ displayName(pubkey) }}</q-item-label>
          <q-item-label caption>{{ lastMessageTime(pubkey) }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDmChatsStore } from 'stores/dmChats';
import { useNostrStore } from 'stores/nostr';
import { storeToRefs } from 'pinia';

export default defineComponent({
  name: 'ChatsPage',
  setup() {
    const store = useDmChatsStore();
    store.loadChats();
    const { chats } = storeToRefs(store);
    const router = useRouter();
    const nostrStore = useNostrStore();
    const profiles = ref<Record<string, any>>({});

    const loadProfiles = async () => {
      for (const pk of Object.keys(chats.value)) {
        if (!profiles.value[pk]) {
          profiles.value[pk] = await nostrStore.getProfile(pk);
        }
      }
    };

    onMounted(loadProfiles);
    watch(chats, loadProfiles, { deep: true });

    const pubkeys = computed(() => Object.keys(chats.value));

    const displayName = (pk: string) =>
      profiles.value[pk]?.display_name ||
      profiles.value[pk]?.name ||
      pk.slice(0, 8) + '...' + pk.slice(-4);

    const lastMessageTime = (pk: string) => {
      const msgs = chats.value[pk];
      if (!msgs || !msgs.length) return '';
      const ts = msgs[msgs.length - 1].created_at;
      return new Date(ts * 1000).toLocaleString();
    };

    const openChat = (pk: string) => {
      router.push(`/chats/${pk}`);
    };

    return { chats, pubkeys, profiles, displayName, lastMessageTime, openChat };
  },
});
</script>
