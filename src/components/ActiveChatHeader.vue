<template>
  <div class="q-pa-sm row items-center justify-between">
    <div class="row items-center">
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
        <q-avatar v-if="profile?.picture" size="md" class="q-mr-sm">
          <img :src="profile.picture" />
        </q-avatar>
        <div class="text-h6 ellipsis">{{ displayName }}</div>
      </template>
      <template v-else>
        <div class="text-grey-6">Select a conversation to start chatting.</div>
      </template>
    </div>
    <q-btn
      flat
      dense
      round
      :icon="$q.dark.isActive ? 'wb_sunny' : 'brightness_3'"
      @click="$q.dark.toggle()"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useNostrStore } from 'src/stores/nostr';
import { useMessengerStore } from 'src/stores/messenger';

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
  if (!props.pubkey) return '';
  const p: any = profile.value;
  return (
    p?.display_name ||
    p?.name ||
    props.pubkey.slice(0, 8) + '...' + props.pubkey.slice(-4)
  );
});
</script>

