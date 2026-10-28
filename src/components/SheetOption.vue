<template>
  <!-- One row of a bottom-sheet list: the Send and Receive row look, with the selected row
       marked by a check (not colour alone) and exposed as a listbox option. -->
  <div
    role="option"
    class="sheet-option app-option-row"
    :class="{ 'sheet-option--selected app-option-row--selected': selected }"
    :aria-selected="selected"
    tabindex="0"
    @click="$emit('select')"
    @keydown.enter.prevent="$emit('select')"
    @keydown.space.prevent="$emit('select')"
  >
    <div v-if="$slots.icon" class="app-icon-circle app-icon-circle--sm">
      <slot name="icon" />
    </div>
    <div class="app-option-row__text">
      <div class="app-option-row__label sheet-option__label">
        <slot name="label">{{ label }}</slot>
      </div>
      <div v-if="caption || $slots.caption" class="app-option-row__caption">
        <slot name="caption">{{ caption }}</slot>
      </div>
    </div>
    <CheckIcon
      v-if="selected"
      :size="20"
      class="sheet-option__check"
      aria-hidden="true"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Check as CheckIcon } from "lucide-vue-next";

export default defineComponent({
  name: "SheetOption",
  components: { CheckIcon },
  props: {
    label: { type: String, default: "" },
    caption: { type: String, default: "" },
    selected: { type: Boolean, default: false },
  },
  emits: ["select"],
});
</script>

<!-- Row styles are the standard option row (src/css/elements.scss). -->
<style scoped>
.sheet-option + .sheet-option {
  margin-top: 8px;
}
.sheet-option__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sheet-option__check {
  color: var(--app-text);
  flex-shrink: 0;
  /* Ink onto the shared 16px trailing guideline. */
  margin-inline-end: -4px;
}
</style>
