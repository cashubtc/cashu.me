<template>
  <q-page :class="[$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark', 'q-pa-md']">
    <div class="text-h5 q-mb-md">{{ $t("AboutPage.title") }}</div>
    <p>
      Cashu.me is a free and open-source Bitcoin wallet built on the Cashu ecash
      protocol. It aims to provide privacy and ease of use for everyone.
    </p>
    <p>
      The project embraces the values of the Nostr ecosystem: openness,
      censorship resistance and user empowerment.
    </p>
    <div class="video-placeholder q-my-xl flex flex-center">
      {{ $t("AboutPage.video_placeholder") }}
    </div>
  </q-page>
</template>

<script setup></script>

<style scoped>
.video-placeholder {
  height: 200px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  color: #ccc;
  width: 100%;
}
</style>
