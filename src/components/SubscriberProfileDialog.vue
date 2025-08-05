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
      <q-card-section class="text-caption" v-if="followers !== null && following !== null">
        Followers: {{ followers }} | Following: {{ following }}
      </q-card-section>
      <q-card-section v-if="latestNote">
        <div class="text-subtitle1 q-mb-xs">Most Recent Note</div>
        <div class="text-body2">{{ latestNote }}</div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat v-close-popup color="grey">Close</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useNostrStore } from 'src/stores/nostr';
import { nip19 } from 'nostr-tools';

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

async function load() {
  if (!props.npub) return;
  profile.value = await nostr.getProfile(props.npub);
  followers.value = await nostr.fetchFollowerCount(props.npub);
  following.value = await nostr.fetchFollowingCount(props.npub);
  latestNote.value = await nostr.fetchMostRecentPost(props.npub);
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

