<template>
  <div v-if="src">
    <img v-if="type === 'image'" :src="src" class="q-mb-sm" />
    <iframe
      v-else-if="type === 'youtube'"
      :src="src"
      frameborder="0"
      allowfullscreen
      class="q-mb-sm"
    ></iframe>
    <iframe
      v-else-if="type === 'iframe'"
      :src="src"
      frameborder="0"
      class="q-mb-sm"
    ></iframe>
    <video v-else-if="type === 'video'" :src="src" controls class="q-mb-sm"></video>
    <audio v-else-if="type === 'audio'" :src="src" controls class="q-mb-sm"></audio>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  isTrustedUrl,
  normalizeMediaUrl,
  determineMediaType,
} from 'src/utils/validateMedia';

const props = defineProps<{ url: string }>();

const src = computed(() => {
  const n = normalizeMediaUrl(props.url);
  return isTrustedUrl(n) ? n : '';
});

const type = computed(() => (src.value ? determineMediaType(src.value) : 'image'));
</script>

<style scoped></style>
