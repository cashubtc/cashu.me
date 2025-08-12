<template>
  <div class="row items-center justify-between q-mt-md">
    <div class="row items-center">
      <q-avatar size="32px" class="q-mr-sm">
        <img v-if="profile?.picture" :src="profile.picture" />
        <span v-else>{{ initials }}</span>
      </q-avatar>
      <div class="row items-center no-wrap">
        <span class="text-caption ellipsis" style="max-width: 100px">{{
          truncatedNpub
        }}</span>
        <q-btn
          flat
          dense
          round
          icon="content_copy"
          size="sm"
          class="q-ml-xs"
          @click="copyPubkey"
        />
      </div>
    </div>
    <q-btn
      flat
      dense
      round
      size="0.8em"
      :icon="$q.dark.isActive ? 'brightness_3' : 'wb_sunny'"
      color="primary"
      aria-label="Toggle Dark Mode"
      @click="toggleDark"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useQuasar } from "quasar";
import { useNostrStore } from "src/stores/nostr";
import { shortenString } from "src/js/string-utils";

const $q = useQuasar();
const nostr = useNostrStore();

const profile = computed(() => {
  const entry: any = (nostr.profiles as any)[nostr.pubkey];
  return entry?.profile ?? entry ?? {};
});

const initials = computed(() => {
  const name = profile.value.display_name || profile.value.name || "";
  const parts = name.split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
});

const truncatedNpub = computed(
  () => shortenString(nostr.npub, 12, 6) || nostr.npub
);

function copyPubkey() {
  navigator.clipboard.writeText(nostr.npub);
}

function toggleDark() {
  $q.dark.toggle();
  $q.localStorage.set("cashu.darkMode", $q.dark.isActive);
}
</script>
