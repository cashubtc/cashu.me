<template>
  <div v-if="src">
    <div v-if="type === 'image'" class="media-preview-container q-mb-sm">
      <img :src="src" />
    </div>
    <div v-else-if="type === 'youtube'" class="media-preview-container q-mb-sm">
      <iframe :src="src" frameborder="0" allowfullscreen></iframe>
    </div>
    <div v-else-if="type === 'iframe'" class="media-preview-container q-mb-sm">
      <iframe :src="src" frameborder="0"></iframe>
    </div>
    <div v-else-if="type === 'nostr'" class="media-preview-container q-mb-sm">
      <iframe :src="src" frameborder="0"></iframe>
    </div>
    <div v-else-if="type === 'video'" class="media-preview-container q-mb-sm">
      <video :src="src" controls></video>
    </div>
    <audio
      v-else-if="type === 'audio'"
      :src="src"
      controls
      class="q-mb-sm"
    ></audio>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  isTrustedUrl,
  normalizeMediaUrl,
  determineMediaType,
} from "src/utils/validateMedia";

const props = defineProps<{ url: string }>();

const src = computed(() => {
  const n = normalizeMediaUrl(props.url);
  return isTrustedUrl(n) ? n : "";
});

const type = computed(() =>
  src.value ? determineMediaType(src.value) : "image"
);
</script>

<style lang="scss" src="../css/media-preview.scss" scoped></style>
