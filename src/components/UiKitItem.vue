<template>
  <!-- One entry on /ui: a pattern's name, where it is implemented, and a live sample. -->
  <section
    v-show="visible"
    :id="slug"
    class="ui-kit-item"
    :data-ui-item="title"
  >
    <div class="ui-kit-item__title">{{ title }}</div>
    <div v-if="sources" class="ui-kit-item__sources">{{ sources }}</div>
    <div class="ui-kit-item__sample">
      <slot />
    </div>
    <div v-if="note" class="ui-kit-item__note">{{ note }}</div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, inject, type ComputedRef } from "vue";

export default defineComponent({
  name: "UiKitItem",
  props: {
    title: { type: String, required: true },
    sources: { type: String, default: "" },
    note: { type: String, default: "" },
  },
  setup(props) {
    // The page's search box (UiKitPage provides it); an entry hides when it doesn't match its
    // title or the files that implement it.
    const query = inject<ComputedRef<string>>(
      "uiKitQuery",
      computed(() => "")
    );
    const visible = computed(() => {
      const q = query.value.trim().toLowerCase();
      return (
        !q ||
        props.title.toLowerCase().includes(q) ||
        props.sources.toLowerCase().includes(q)
      );
    });
    const slug = computed(
      () => "ui-" + props.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    );
    return { visible, slug };
  },
});
</script>

<style scoped>
.ui-kit-item {
  margin-bottom: 28px;
  scroll-margin-top: 120px;
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
