<template>
  <q-dialog v-model="showLocal" backdrop-filter="blur(2px) brightness(60%)">
    <q-card style="min-width: 350px">
      <q-card-section class="row items-center q-gutter-sm">
        <q-avatar size="64px">
          <template v-if="profile?.picture">
            <img :src="profile.picture" />
          </template>
          <template v-else>
            <div class="placeholder text-white">{{ initials }}</div>
          </template>
        </q-avatar>
        <div class="column">
          <div class="text-h6">{{ displayName }}</div>
        </div>
      </q-card-section>
      <q-card-section v-if="profile?.about" class="text-body2">
        {{ profile.about }}
      </q-card-section>
      <q-card-section v-if="followers !== null || following !== null || latestNote">
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
              <div class="text-subtitle1 q-mb-xs">Most Recent Note</div>
              <div class="text-body2">{{ latestNote }}</div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat v-close-popup color="grey">Close</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { nip19 } from 'nostr-tools';
import { NDKKind, type NDKEvent, type NDKFilter } from '@nostr-dev-kit/ndk';
import { useNostrStore } from 'src/stores/nostr';
import { useNdk } from 'src/composables/useNdk';
import profileCache from 'src/js/profile-cache';

const props = defineProps<{ modelValue: boolean; npub: string }>();
const emit = defineEmits(['update:modelValue']);

const showLocal = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
});

const nostr = useNostrStore();
const profile = ref<any>(null);
const followers = ref<number | null>(null);
const following = ref<number | null>(null);
const latestNote = ref<string | null>(null);

async function fetchLatestText(pubkey: string): Promise<string | null> {
  const hex = nostr.resolvePubkey(pubkey);
  await nostr.initNdkReadOnly();
  const ndk = await useNdk({ requireSigner: false });
  const filter: NDKFilter = { kinds: [NDKKind.Text], authors: [hex], limit: 1 };
  const events = await ndk.fetchEvents(filter);
  let latest: NDKEvent | undefined;
  events.forEach((ev) => {
    if (!latest || ev.created_at > (latest.created_at || 0)) latest = ev;
  });
  return latest ? (latest.content as string) : null;
}

async function load() {
  if (!props.npub) return;
  const pk = props.npub;
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
  () => props.npub,
  () => {
    load();
  },
  { immediate: true }
);

const displayName = computed(() => {
  const p: any = profile.value;
  if (p?.display_name) return p.display_name;
  if (p?.name) return p.name;
  try {
    return nip19.npubEncode(nostr.resolvePubkey(props.npub));
  } catch (e) {
    const npub = props.npub || '';
    return npub.slice(0, 8) + '...' + npub.slice(-4);
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

