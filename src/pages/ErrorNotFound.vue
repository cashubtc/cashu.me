<template>
  <div
    class="fullscreen bg-dark text-white text-center q-pa-md flex flex-center"
  >
    <div>
      <div style="font-size: 30vh">{{ $t("ErrorNotFound.title") }}</div>
      <div class="text-h3 q-pb-lg" style="opacity: 0.8">
        {{ $t("ErrorNotFound.text") }}
      </div>
      <q-btn
        rounded
        size="lg"
        class="q-mt-xl"
        color="white"
        text-color="black"
        unelevated
        to="/"
        :label="$t('ErrorNotFound.actions.home.label')"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ErrorNotFound",
});
</script>
