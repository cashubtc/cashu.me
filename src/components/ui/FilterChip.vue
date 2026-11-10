<!-- A filter choice as a quiet pill. Unselected it is a muted label on the tint; selected it
     takes the ink colour, a hairline edge and a leading check (not colour alone). It is a
     toggle button: pressing the selected chip clears it. `removable` is the applied filter
     shown outside its sheet (the history row): selected, with a trailing × instead of the
     check. -->
<template>
  <button
    type="button"
    class="filter-chip"
    :class="{
      'filter-chip--on': selected || removable,
      'filter-chip--removable': removable,
    }"
    :aria-pressed="removable ? undefined : selected"
  >
    <CheckIcon
      v-if="!removable"
      :size="14"
      class="filter-chip__check"
      aria-hidden="true"
    />
    <span class="filter-chip__label"><slot /></span>
    <XIcon v-if="removable" :size="14" aria-hidden="true" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Check as CheckIcon, X as XIcon } from "lucide-vue-next";

export default defineComponent({
  name: "FilterChip",
  components: { CheckIcon, XIcon },
  props: {
    selected: { type: Boolean, default: false },
    /** An applied filter that the press removes: × on the end, no check. */
    removable: { type: Boolean, default: false },
  },
});
</script>

<style scoped>
.filter-chip {
  align-items: center;
  background: var(--app-tint);
  border: 1px solid transparent;
  border-radius: var(--app-radius-pill);
  color: var(--app-text-muted);
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  max-width: 100%;
  min-height: 40px;
  padding: 0 14px;
  position: relative;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}
/* The 40px pill answers across a 44px target. */
.filter-chip::after {
  content: "";
  inset: -2px 0;
  position: absolute;
}
.filter-chip--on {
  background: var(--app-tint-strong);
  border-color: var(--app-border-strong);
  color: var(--app-text);
}
/* The applied filter over the list is smaller than the choices in the sheet. */
.filter-chip--removable {
  gap: 4px;
  min-height: 32px;
  padding: 0 10px 0 12px;
}
.filter-chip--removable::after {
  inset: -6px 0;
}
/* The check grows into the pill, so the chips beside it slide rather than jump. */
.filter-chip__check {
  flex-shrink: 0;
  margin-inline-end: 0;
  opacity: 0;
  transition: margin 0.15s ease, opacity 0.15s ease, width 0.15s ease;
  width: 0;
}
.filter-chip--on .filter-chip__check {
  margin-inline-end: 6px;
  opacity: 1;
  width: 14px;
}
.filter-chip__label {
  max-width: 14em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
@media (hover: hover) {
  .filter-chip:hover {
    background: var(--app-tint-strong);
    color: var(--app-text);
  }
}
.filter-chip:focus-visible {
  box-shadow: var(--app-focus-ring);
  outline: none;
}
@media (prefers-reduced-motion: reduce) {
  .filter-chip,
  .filter-chip__check {
    transition: none;
  }
}
</style>
