<!-- An icon in a round tinted slot (src/css/elements.scss .app-icon-circle): option rows (md),
     sheet rows (sm), empty and blocking states (lg), onboarding (xl). -->
<template>
  <span class="app-icon-circle" :class="sizeClass">
    <slot>
      <component :is="icon" v-if="icon" :size="ICON_SIZES[size]" />
    </slot>
  </span>
</template>

<script lang="ts">
import { defineComponent, type Component, type PropType } from "vue";

export type IconCircleSize = "sm" | "md" | "lg" | "xl";

// The glyph that fits each slot: about half its diameter.
const ICON_SIZES: Record<IconCircleSize, number> = {
  sm: 20,
  md: 24,
  lg: 26,
  xl: 36,
};

export default defineComponent({
  name: "IconCircle",
  props: {
    /** A Lucide icon component; the default slot overrides it (an image, a spinner). */
    icon: { type: [Object, Function] as PropType<Component>, default: null },
    size: { type: String as PropType<IconCircleSize>, default: "md" },
  },
  setup() {
    return { ICON_SIZES };
  },
  computed: {
    sizeClass(): string | undefined {
      return this.size === "md" ? undefined : `app-icon-circle--${this.size}`;
    },
  },
});
</script>
