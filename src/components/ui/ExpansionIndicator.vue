<!-- The open/close mark inside an expansion header (the wallet's History and Mints panel): one
     chevron that turns to point up while open and down while closed, with the action named for
     screen readers. It is not a control itself; the q-expansion-item header around it is. -->
<template>
  <span
    class="expansion-indicator"
    :class="{ 'expansion-indicator--expanded': expanded }"
  >
    <ChevronDownIcon
      class="expansion-indicator__icon"
      :size="24"
      aria-hidden="true"
      focusable="false"
    />
    <span class="visually-hidden">{{ label }}</span>
  </span>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ChevronDown as ChevronDownIcon } from "lucide-vue-next";

export default defineComponent({
  name: "ExpansionIndicator",
  components: { ChevronDownIcon },
  props: {
    expanded: { type: Boolean, default: false },
    /** What activating the header does now, e.g. "Show history and mints". */
    label: { type: String, required: true },
  },
});
</script>

<style scoped>
.expansion-indicator {
  align-items: center;
  color: var(--app-text-muted);
  display: inline-flex;
  justify-content: center;
}
/* The same glyph stays mounted and turns, so the change reads as opening and closing. */
.expansion-indicator__icon {
  transform: rotate(0deg);
  transition: transform 180ms ease;
}
.expansion-indicator--expanded .expansion-indicator__icon {
  transform: rotate(180deg);
}
@media (prefers-reduced-motion: reduce) {
  .expansion-indicator__icon {
    transition: none;
  }
}
</style>
