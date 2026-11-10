<!-- A choice between two to four options of equal weight (invoice or offer, the request unit):
     a quiet pill track with the selected option on a primary thumb that slides between them.
     A radio group: arrow keys move the choice. Disabled, it keeps showing the choice, locked. -->
<template>
  <div
    class="segmented"
    :class="{ 'segmented--disabled': disable }"
    role="radiogroup"
    :aria-label="label || undefined"
    :aria-disabled="disable || undefined"
    :style="{ '--segments': options.length, '--index': Math.max(index, 0) }"
  >
    <span v-if="index >= 0" class="segmented__thumb" aria-hidden="true" />
    <button
      v-for="(option, i) in options"
      :key="String(option.value)"
      ref="option"
      type="button"
      role="radio"
      class="segmented__option"
      :class="{ 'segmented__option--on': i === index }"
      :aria-checked="i === index"
      :tabindex="i === Math.max(index, 0) ? 0 : -1"
      :disabled="disable"
      :data-testid="option.testId"
      @click="choose(i)"
      @keydown.left.prevent="step(i, -1)"
      @keydown.up.prevent="step(i, -1)"
      @keydown.right.prevent="step(i, 1)"
      @keydown.down.prevent="step(i, 1)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

export type SegmentedOption = {
  label: string;
  value: unknown;
  testId?: string;
};

export default defineComponent({
  name: "SegmentedControl",
  props: {
    modelValue: { type: null as unknown as PropType<unknown>, default: null },
    options: { type: Array as PropType<SegmentedOption[]>, required: true },
    /** The group's accessible name. */
    label: { type: String, default: "" },
    disable: { type: Boolean, default: false },
  },
  emits: ["update:modelValue"],
  computed: {
    index(): number {
      return this.options.findIndex((o) => o.value === this.modelValue);
    },
  },
  methods: {
    choose(i: number) {
      if (this.disable || i === this.index) return;
      this.$emit("update:modelValue", this.options[i].value);
    },
    // Arrow keys move the choice and the focus together, wrapping at the ends; in rtl the
    // row is mirrored, so left and right follow what the user sees.
    step(i: number, by: number) {
      const rtl = getComputedStyle(this.$el).direction === "rtl";
      const n = this.options.length;
      const next = (i + (rtl ? -by : by) + n) % n;
      this.choose(next);
      (this.$refs.option as HTMLElement[])[next]?.focus();
    },
  },
});
</script>

<style scoped>
.segmented {
  background: var(--app-group-fill);
  border: 1px solid var(--app-group-edge);
  border-radius: var(--app-radius-pill);
  display: inline-grid;
  grid-auto-columns: minmax(112px, 1fr);
  grid-auto-flow: column;
  max-width: 100%;
  padding: 3px;
  position: relative;
}
/* The thumb sits under the chosen option and slides to the next one. */
.segmented__thumb {
  background: var(--q-primary);
  border-radius: var(--app-radius-pill);
  inset-block: 3px;
  inset-inline-start: 3px;
  position: absolute;
  transform: translateX(calc(var(--index) * 100%));
  transition: transform 0.25s cubic-bezier(0.2, 0, 0, 1), background 0.2s ease;
  width: calc((100% - 6px) / var(--segments));
}
[dir="rtl"] .segmented__thumb {
  transform: translateX(calc(var(--index) * -100%));
}
.segmented__option {
  background: none;
  border: 0;
  border-radius: var(--app-radius-pill);
  color: var(--app-text-muted);
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  min-height: 44px;
  padding: 0 18px;
  position: relative;
  transition: color 0.2s ease;
  white-space: nowrap;
}
.segmented__option--on {
  color: var(--app-on-primary);
  font-weight: 600;
}
@media (hover: hover) {
  .segmented__option:not(.segmented__option--on):not(:disabled):hover {
    color: var(--app-text);
  }
}
/* Disabled: the same control, selection included, dimmed as a whole like the keypad beside
   it (an outlined thumb read as a different, deselected state). */
.segmented--disabled {
  opacity: 0.5;
}
.segmented--disabled .segmented__option {
  cursor: default;
}
@media (prefers-reduced-motion: reduce) {
  .segmented__thumb,
  .segmented__option {
    transition: none;
  }
}
</style>
