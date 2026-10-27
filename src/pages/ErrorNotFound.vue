<template>
  <!-- Under the full-screen layout, so the back button sits in the shared header inside the
       page column; the body is the shared blocking state (AlreadyRunning uses it too). -->
  <q-page class="blocking-state column flex-center text-center q-pa-md">
    <div class="not-found__code">{{ $t("ErrorNotFound.title") }}</div>
    <div class="blocking-state__title q-mt-sm">
      {{ $t("ErrorNotFound.text") }}
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

export default defineComponent({
  name: "ErrorNotFound",
});
</script>

<style scoped>
.not-found__code {
  font-size: 64px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  line-height: 1;
  color: var(--app-text-muted);
}
</style>
