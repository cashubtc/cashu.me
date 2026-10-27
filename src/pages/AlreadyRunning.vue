<template>
  <div class="blocking-state fullscreen column flex-center text-center q-pa-md">
    <AppWindowIcon
      :size="48"
      :stroke-width="1.5"
      class="blocking-state__icon"
    />
    <div class="blocking-state__title q-mt-md">
      {{ $t("AlreadyRunning.title") }}
    </div>
    <div class="blocking-state__text q-mt-sm">
      {{ $t("AlreadyRunning.text") }}
    </div>
    <q-btn
      rounded
      unelevated
      no-caps
      color="primary"
      class="blocking-state__action q-mt-lg"
      to="/"
      :label="$t('AlreadyRunning.actions.retry.label')"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AppWindow as AppWindowIcon } from "lucide-vue-next";

export default defineComponent({
  name: "AlreadyRunning",
  components: { AppWindowIcon },
});
</script>

<!-- The blocking-state styles live in src/css/app.scss (shared with the 404 page). -->
