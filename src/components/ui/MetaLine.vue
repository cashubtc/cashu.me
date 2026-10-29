<!-- A row's secondary line of short facts ("Lightning · USD · 5 minutes ago"), joined by
     middle dots. Each part is its own bidi island, so in right-to-left locales the parts keep
     their order instead of adjacent Latin parts merging into one left-to-right run
     (council R84). -->
<template>
  <span class="meta-line">
    <template v-for="(part, i) in shown" :key="i">
      <span v-if="i > 0" class="meta-line__sep">{{ " · " }}</span>
      <bdi>{{ part }}</bdi>
    </template>
  </span>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  name: "MetaLine",
  props: {
    /** The facts, in reading order; empty ones are skipped. */
    parts: { type: Array as PropType<string[]>, required: true },
  },
  computed: {
    shown(): string[] {
      return this.parts.filter((part) => !!part);
    },
  },
});
</script>
