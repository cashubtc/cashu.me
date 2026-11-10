<!-- An icon, or a picture, in a round tinted slot (src/css/elements.scss .app-icon-circle):
     avatars (xs), option and sheet rows (sm, md), empty and blocking states (lg), onboarding
     (xl). With `src` it shows the picture (a mint's or a person's), falling back to the icon or
     the default slot when there is none or it fails to load. -->
<template>
  <span class="app-icon-circle" :class="sizeClass">
    <img
      v-if="src && !failed"
      :src="src"
      alt=""
      class="app-icon-circle__img"
      @error="failed = true"
    />
    <slot v-else>
      <component :is="icon" v-if="icon" :size="ICON_SIZES[size]" />
    </slot>
  </span>
</template>

<script lang="ts">
import { defineComponent, type Component, type PropType } from "vue";

export type IconCircleSize = "xs" | "sm" | "md" | "lg" | "xl";

// The glyph that fits each slot: about half its diameter.
const ICON_SIZES: Record<IconCircleSize, number> = {
  xs: 18,
  sm: 20,
  md: 24,
  lg: 26,
  xl: 36,
};

export default defineComponent({
  name: "IconCircle",
  props: {
    /** A Lucide icon component; the default slot overrides it (a spinner, a smaller glyph). */
    icon: { type: [Object, Function] as PropType<Component>, default: null },
    /** A picture to show instead of the icon (mint icon, profile picture). */
    src: { type: String, default: "" },
    size: { type: String as PropType<IconCircleSize>, default: "md" },
  },
  setup() {
    return { ICON_SIZES };
  },
  data() {
    return { failed: false };
  },
  computed: {
    sizeClass(): string | undefined {
      return this.size === "md" ? undefined : `app-icon-circle--${this.size}`;
    },
  },
  watch: {
    src() {
      this.failed = false;
    },
  },
});
</script>
