<template>
  <div class="not-found fullscreen column flex-center text-center q-pa-md">
    <!-- The shared header slot: the same way out as every other page (R19). -->
    <q-btn
      flat
      round
      to="/"
      class="not-found__close"
      :aria-label="$t('ErrorNotFound.actions.home.label')"
    >
      <ChevronLeftIcon />
    </q-btn>
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
import { ChevronLeft as ChevronLeftIcon } from "lucide-vue-next";

export default defineComponent({
  name: "ErrorNotFound",
  components: { ChevronLeftIcon },
});
</script>

<style scoped>
.not-found {
  background: var(--app-surface, #000);
  color: var(--app-text);
}

.not-found__close {
  position: absolute;
  top: 3px; /* centre y 25, the shared header slot (measured on every other page) */
  inset-inline-start: 6px;
  width: 44px;
  height: 44px;
  color: var(--app-text);
}

.not-found__code {
  font-size: 64px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  line-height: 1;
  color: var(--app-text-muted);
}

.not-found__action {
  min-width: 200px;
}
</style>
