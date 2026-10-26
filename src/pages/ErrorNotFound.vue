<template>
  <div class="not-found fullscreen column flex-center text-center q-pa-md">
    <div class="not-found__code">{{ $t("ErrorNotFound.title") }}</div>
    <div class="text-h6 text-weight-bold q-mt-sm">
      {{ $t("ErrorNotFound.text") }}
    </div>
    <q-btn
      rounded
      unelevated
      no-caps
      color="primary"
      class="not-found__action q-mt-lg"
      to="/"
      :label="$t('ErrorNotFound.actions.home.label')"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ErrorNotFound",
});
</script>

<style scoped>
.not-found {
  background: var(--app-surface, #000);
  color: var(--app-text);
}

.not-found__code {
  font-size: 64px;
  font-weight: 700;
  line-height: 1;
  color: var(--app-text-muted);
}

.not-found__action {
  min-width: 200px;
}
</style>
