<template>
  <!-- One entry on /ui: a pattern's name, where it is implemented, and a live sample. -->
  <section class="ui-kit-item" :data-ui-item="title">
    <div class="ui-kit-item__title">{{ title }}</div>
    <div v-if="sources" class="ui-kit-item__sources">{{ sources }}</div>
    <div class="ui-kit-item__sample">
      <slot />
    </div>
    <div v-if="note" class="ui-kit-item__note">{{ note }}</div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "UiKitItem",
  props: {
    title: { type: String, required: true },
    sources: { type: String, default: "" },
    note: { type: String, default: "" },
  },
});
</script>

<style scoped>
.ui-kit-item {
  margin-bottom: 28px;
}
.ui-kit-item__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--app-text);
}
.ui-kit-item__sources {
  margin-top: 2px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  line-height: 1.4;
  color: var(--app-text-subtle);
  direction: ltr;
  text-align: start;
}
.ui-kit-item__sample {
  margin-top: 12px;
}
.ui-kit-item__note {
  margin-top: 8px;
  font-size: 13px;
  color: var(--app-text-muted);
}
</style>
