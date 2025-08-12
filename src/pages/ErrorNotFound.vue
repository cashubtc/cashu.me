<template>
  <div
    :class="[
      $q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark',
      'fullscreen q-pa-md flex flex-center',
    ]"
  >
    <q-card class="q-pa-lg" style="max-width: 400px">
      <q-card-section class="text-center">
        <div class="text-h4">{{ $t("ErrorNotFound.title") }}</div>
        <div class="text-subtitle1 q-mt-sm">
          {{ $t("ErrorNotFound.text") }}
        </div>
        <div class="q-mt-md">
          <a
            class="q-pr-md"
            href="https://docs.cashu.me"
            target="_blank"
            rel="noopener"
          >
            {{ $t("ErrorNotFound.links.docs") }}
          </a>
          <a href="https://cashu.me" target="_blank" rel="noopener">
            {{ $t("ErrorNotFound.links.tips") }}
          </a>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions align="center">
        <q-btn
          color="primary"
          to="/"
          :label="$t('ErrorNotFound.actions.home.label')"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "ErrorNotFound",
});
</script>
