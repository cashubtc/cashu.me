<template>
  <div class="q-pa-sm row items-center" v-if="pubkey">
    <q-avatar v-if="profile?.picture" size="md" class="q-mr-sm">
      <img :src="profile.picture" />
    </q-avatar>
    <div class="text-h6 ellipsis">{{ displayName }}</div>
  </div>
  <div class="q-pa-sm text-grey-6" v-else>
    Select a conversation to start chatting.
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import { useNostrStore } from 'src/stores/nostr';

const props = defineProps<{ pubkey: string }>();
const nostr = useNostrStore();
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
  if (!props.pubkey) return '';
  const p: any = profile.value;
  return (
    p?.display_name ||
    p?.name ||
    props.pubkey.slice(0, 8) + '...' + props.pubkey.slice(-4)
  );
});
</script>

