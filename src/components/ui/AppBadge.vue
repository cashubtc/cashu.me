<!-- A small status pill (src/css/elements.scss .app-badge): neutral by default, a quiet primary
     tint for emphasis, or a status tone. -->
<template>
  <component
    :is="tag"
    class="app-badge"
    :class="tone === 'neutral' ? null : `app-badge--${tone}`"
    :type="tag === 'button' ? 'button' : undefined"
  >
    <slot>{{ label }}</slot>
  </component>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

export type BadgeTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger";

export default defineComponent({
  name: "AppBadge",
  props: {
    label: { type: String, default: "" },
    tone: { type: String as PropType<BadgeTone>, default: "neutral" },
    /** "button" for a badge that acts (the reload countdown), "a" for one that links. */
    tag: { type: String as PropType<"span" | "button" | "a">, default: "span" },
  },
});
</script>
