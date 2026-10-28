<template>
  <!-- One row of a bottom-sheet list: the standard option row, with the selected row marked
       by a check (not colour alone) and exposed as a listbox option. -->
  <OptionRow
    role="option"
    icon-size="sm"
    class="sheet-option"
    label-class="sheet-option__label"
    :label="label"
    :caption="caption"
    :selected="selected"
    :icon-src="iconSrc"
    @click="$emit('select')"
  >
    <template v-if="$slots.icon" #icon><slot name="icon" /></template>
    <template v-if="$slots.label" #label><slot name="label" /></template>
    <template v-if="$slots.caption" #caption><slot name="caption" /></template>
    <template #trailing>
      <CheckIcon
        v-if="selected"
        :size="20"
        class="sheet-option__check"
        aria-hidden="true"
      />
    </template>
  </OptionRow>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Check as CheckIcon } from "lucide-vue-next";
import OptionRow from "src/components/ui/OptionRow.vue";

export default defineComponent({
  name: "SheetOption",
  components: { CheckIcon, OptionRow },
  props: {
    label: { type: String, default: "" },
    caption: { type: String, default: "" },
    selected: { type: Boolean, default: false },
    /** A picture for the icon slot (a mint's icon); the icon slot is the fallback. */
    iconSrc: { type: String, default: "" },
  },
  emits: ["select"],
});
</script>

<style scoped>
.sheet-option + .sheet-option {
  margin-top: 8px;
}
.sheet-option :deep(.sheet-option__label) {
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
