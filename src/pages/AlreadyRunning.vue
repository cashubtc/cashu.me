<template>
  <div class="blocking-state fullscreen column flex-center text-center q-pa-md">
    <q-icon name="tab" size="48px" class="blocking-state__icon" />
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

export default defineComponent({
  name: "AlreadyRunning",
});
</script>

<style scoped>
.blocking-state {
  background: var(--app-surface, #000);
  color: var(--app-text);
}

.blocking-state__icon {
  color: var(--app-text-muted);
}

.blocking-state__title {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.3;
  max-width: 320px;
}

.blocking-state__text {
  font-size: 15px;
  color: var(--app-text-muted);
  max-width: 320px;
}

.blocking-state__action {
  width: 100%;
  max-width: 320px;
  min-height: 52px;
  font-size: 16px;
  font-weight: 600;
}
</style>
