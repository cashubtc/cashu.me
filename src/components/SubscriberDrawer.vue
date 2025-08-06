<template>
  <div>
    <div
      v-if="model"
      class="fixed inset-0 bg-black/50 z-40"
      @click="close"
    ></div>
    <div
      class="fixed top-0 right-0 h-full w-80 bg-white z-50 flex flex-col transform transition-transform duration-300"
      :class="model ? 'translate-x-0' : 'translate-x-full'"
    >
      <q-toolbar>
        <q-btn flat round dense icon="close" @click="close" />
        <q-toolbar-title>{{ displayName }}</q-toolbar-title>
      </q-toolbar>
      <div class="flex-1 overflow-y-auto">
        <div class="p-4">
          <q-avatar size="64px" class="mb-4">
            <template v-if="profile?.picture">
              <img :src="profile.picture" />
            </template>
            <template v-else>
              <div class="placeholder text-white">{{ initials }}</div>
            </template>
          </q-avatar>
          <div v-if="profile?.about" class="text-body2 mb-4">
            {{ profile.about }}
          </div>
          <q-list dense>
            <q-item v-if="followers !== null">
              <q-item-section>Followers</q-item-section>
              <q-item-section side>{{ followers }}</q-item-section>
            </q-item>
            <q-item v-if="following !== null">
              <q-item-section>Following</q-item-section>
              <q-item-section side>{{ following }}</q-item-section>
            </q-item>
            <q-item v-if="latestNote">
              <q-item-section>
                <div class="text-subtitle1 mb-2">Most Recent Note</div>
                <div class="text-body2">{{ latestNote }}</div>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
      <div class="p-4 flex flex-col space-y-2">
        <button
          class="w-full flex items-center justify-center gap-2 bg-primary text-white py-2 rounded"
          @click="openSendDialog"
        >
          <span class="material-icons">chat</span>
          <span>Send DM</span>
        </button>
        <button
          class="w-full flex items-center justify-center gap-2 bg-primary text-white py-2 rounded"
          @click="copyNpub"
        >
          <span class="material-icons">content_copy</span>
          <span>Copy Npub</span>
        </button>
      </div>
      <SendMessageDialog v-model="showSendDialog" @send="sendDm" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { nip19 } from 'nostr-tools';
import { useQuasar, copyToClipboard } from 'quasar';
import { useMessengerStore } from 'stores/messenger';
import { useNostrStore } from 'stores/nostr';
import { useNdk } from 'src/composables/useNdk';
import profileCache from 'src/js/profile-cache';
import SendMessageDialog from './SendMessageDialog.vue';
import type { CreatorSubscription } from 'stores/creatorSubscriptions';
import { NDKKind, type NDKEvent, type NDKFilter } from '@nostr-dev-kit/ndk';

const props = defineProps<{ modelValue: boolean; subscription: CreatorSubscription | null }>();
const emit = defineEmits(['update:modelValue']);

const model = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
});

const nostr = useNostrStore();
const messenger = useMessengerStore();
const $q = useQuasar();

const profile = ref<any>(null);
const followers = ref<number | null>(null);
const following = ref<number | null>(null);
const latestNote = ref<string | null>(null);
const showSendDialog = ref(false);

function close() {
  emit('update:modelValue', false);
}

function openSendDialog() {
  showSendDialog.value = true;
}

function copyNpub() {
  if (!props.subscription) return;
  copyToClipboard(props.subscription.subscriberNpub).then(() => {
    $q.notify({ type: 'positive', message: 'Copied', timeout: 1500 });
  });
}

async function sendDm(message: string) {
  if (!props.subscription) return;
  await messenger.sendDm(props.subscription.subscriberNpub, message);
}

async function fetchLatestText(pubkey: string): Promise<string | null> {
  const hex = nostr.resolvePubkey(pubkey);
  await nostr.initNdkReadOnly();
  const ndk = await useNdk({ requireSigner: false });
  const filter: NDKFilter = { kinds: [NDKKind.Text], authors: [hex], limit: 1 };
  const events = await ndk.fetchEvents(filter);
  let latest: NDKEvent | undefined;
  events.forEach((ev: any) => {
    if (!latest || ev.created_at > (latest.created_at || 0)) latest = ev;
  });
  return latest ? (latest.content as string) : null;
}

async function load() {
  if (!props.subscription) return;
  const pk = props.subscription.subscriberNpub;
  const cached = profileCache.get(pk);
  if (cached) {
    profile.value = cached;
    followers.value = cached.followerCount ?? null;
    following.value = cached.followingCount ?? null;
    latestNote.value = cached.latestNote ?? null;
  } else {
    profile.value = await nostr.getProfile(pk);
  }
  let updated = false;
  if (followers.value === null) {
    followers.value = await nostr.fetchFollowerCount(pk);
    updated = true;
  }
  if (following.value === null) {
    following.value = await nostr.fetchFollowingCount(pk);
    updated = true;
  }
  if (latestNote.value === null) {
    latestNote.value = await fetchLatestText(pk);
    updated = true;
  }
  if (!cached || updated) {
    profileCache.set(pk, {
      ...profile.value,
      followerCount: followers.value,
      followingCount: following.value,
      latestNote: latestNote.value,
    });
  }
}

watch(
  () => props.subscription,
  () => {
    load();
  },
  { immediate: true }
);

const displayName = computed(() => {
  const pk = props.subscription?.subscriberNpub;
  if (!pk) return '';
  const p: any = profile.value;
  if (p?.display_name) return p.display_name;
  if (p?.name) return p.name;
  try {
    return nip19.npubEncode(nostr.resolvePubkey(pk));
  } catch (e) {
    return pk.slice(0, 8) + '...' + pk.slice(-4);
  }
});

const initials = computed(() => {
  const name = displayName.value.trim();
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
});
</script>

<style scoped>
.placeholder {
  background: var(--divider-color);
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
</style>

