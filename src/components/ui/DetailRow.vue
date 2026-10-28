<!-- A label/value row in quote, token, request and mint detail views: icon and muted name on
     the start edge, value on the end edge (styled by the global .detail-* rules in app.scss).
     With `action`, the whole row is a button that changes the value: the value reads as the
     current choice, a chevron says it opens something, and the row takes the tap. -->
<template>
  <component
    :is="action ? 'button' : 'div'"
    class="detail-item"
    :class="{ 'detail-item--action': action }"
    :type="action ? 'button' : undefined"
    :aria-label="action ? actionLabel || `${label}: ${value}` : undefined"
    @click="action && $emit('click', $event)"
  >
    <div class="detail-label">
      <component :is="icon" v-if="icon" :size="20" class="detail-icon" />
      <div class="detail-name">{{ label }}</div>
    </div>
    <component
      :is="href && !action ? 'a' : 'div'"
      class="detail-value"
      :class="[valueClass, { 'detail-value--placeholder': placeholder }]"
      :href="href && !action ? href : undefined"
      :target="href && !action ? '_blank' : undefined"
      @click="!action && $emit('value-click', $event)"
    >
      <slot>{{ value }}</slot>
      <ArrowUpRightIcon
        v-if="href && !action"
        :size="14"
        class="detail-value__external"
        aria-hidden="true"
      />
    </component>
    <ChevronRightIcon
      v-if="action"
      :size="18"
      class="detail-item__chevron"
      aria-hidden="true"
    />
  </component>
</template>

<script lang="ts">
import { defineComponent, type Component, type PropType } from "vue";
import {
  ArrowUpRight as ArrowUpRightIcon,
  ChevronRight as ChevronRightIcon,
} from "lucide-vue-next";

export default defineComponent({
  name: "DetailRow",
  components: { ArrowUpRightIcon, ChevronRightIcon },
  props: {
    icon: {
      type: [Object, Function] as PropType<Component>,
      default: null,
    },
    label: {
      type: String,
      required: true,
    },
    value: {
      type: [String, Number] as PropType<string | number>,
      default: "",
    },
    valueClass: {
      type: [String, Array, Object] as PropType<
        string | string[] | Record<string, boolean>
      >,
      default: "",
    },
    // When set, the value is an external link opened in a new tab.
    href: {
      type: String as PropType<string | null>,
      default: null,
    },
    /** The row is a button that changes this value (emits `click`). */
    action: { type: Boolean, default: false },
    /** The button's accessible name; defaults to "Label: value". */
    actionLabel: { type: String, default: "" },
    /** The value is an unset default ("Any amount"): muted, like a placeholder. */
    placeholder: { type: Boolean, default: false },
  },
  emits: ["value-click", "click"],
});
</script>

<style scoped>
/* External links: no underline, a trailing link glyph, like the settings link rows. */
a.detail-value {
  align-items: center;
  display: inline-flex;
  gap: 4px;
  text-decoration: none;
}
.detail-value__external {
  color: var(--app-text-subtle);
  flex-shrink: 0;
  margin-inline-start: 2px;
}
/* An editable row: the same row, made a 48px button whose tint reaches past the text by the
   row's own inset, so the label and value stay on the table's edges. */
.detail-item--action {
  background: none;
  border: 0;
  border-radius: var(--app-radius-md);
  color: inherit;
  cursor: pointer;
  font: inherit;
  margin-inline: -12px;
  min-height: 48px;
  padding: 0 12px;
  text-align: start;
  transition: background 0.15s ease;
  width: calc(100% + 24px);
}
@media (hover: hover) {
  .detail-item--action:hover {
    background: var(--app-tint);
  }
}
.detail-item--action:active {
  background: var(--app-tint);
}
.detail-item--action:focus-visible {
  box-shadow: var(--app-focus-ring);
  outline: none;
}
.detail-item--action .detail-value {
  flex: 1;
  margin-inline-start: 12px;
  /* Fill up to the chevron, so every row's value ends on the same edge. */
  max-width: none;
  min-width: 0;
}
.detail-value--placeholder {
  color: var(--app-text-muted);
}
/* The chevron's ink sits 6px inside its 18px box; its edge lands on the table's 12px inset. */
.detail-item__chevron {
  color: var(--app-text-subtle);
  flex-shrink: 0;
  margin-inline-end: -4px;
  margin-inline-start: 6px;
}
</style>
