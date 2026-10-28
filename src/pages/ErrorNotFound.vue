<template>
  <!-- Under the full-screen layout, so the back button sits in the shared header inside the
       page column; the body is the shared blocking state (AlreadyRunning uses it too). -->
  <q-page class="blocking-state column flex-center text-center q-pa-md">
    <div class="app-icon-circle app-icon-circle--lg blocking-state__icon">
      <CompassIcon :size="26" />
    </div>
    <div class="blocking-state__title q-mt-md">
      {{ $t("ErrorNotFound.text") }}
    </div>
    <div class="blocking-state__text q-mt-sm">
      {{ $t("ErrorNotFound.title") }}
    </div>
    <q-btn
      rounded
      unelevated
      no-caps
      color="primary"
      class="blocking-state__action q-mt-lg"
      to="/"
      :label="$t('ErrorNotFound.actions.home.label')"
    />
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Compass as CompassIcon } from "lucide-vue-next";

export default defineComponent({
  name: "ErrorNotFound",
  components: { CompassIcon },
});
</script>
