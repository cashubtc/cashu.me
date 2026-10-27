<template>
  <!-- One row of a bottom-sheet list: the Send and Receive row look, with the selected row
       marked by a check (not colour alone) and exposed as a listbox option. -->
  <div
    role="option"
    class="sheet-option"
    :class="{ 'sheet-option--selected': selected }"
    :aria-selected="selected"
    tabindex="0"
    @click="$emit('select')"
    @keydown.enter.prevent="$emit('select')"
    @keydown.space.prevent="$emit('select')"
  >
    <div v-if="$slots.icon" class="sheet-option__icon">
      <slot name="icon" />
    </div>
    <div class="sheet-option__text">
      <div class="sheet-option__label">
        <slot name="label">{{ label }}</slot>
      </div>
      <div v-if="caption || $slots.caption" class="sheet-option__caption">
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

<style scoped>
.sheet-option {
  align-items: center;
  background: var(--app-tint);
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  gap: 16px;
  min-height: 56px;
  padding: 12px 16px;
  transition: background 0.2s ease;
}
.sheet-option + .sheet-option {
  margin-top: 8px;
}
.sheet-option:hover {
  background: var(--app-tint-strong);
}
.sheet-option:active {
  background: var(--app-tint-strong);
}
.sheet-option:focus-visible {
  outline: 2px solid var(--app-text);
  outline-offset: 2px;
}
.sheet-option--selected {
  background: var(--app-card-fill-active);
  border-color: var(--app-card-edge-active);
}
.sheet-option__icon {
  align-items: center;
  background: var(--app-tint-strong);
  border-radius: 50%;
  color: var(--app-text);
  display: flex;
  flex-shrink: 0;
  height: 40px;
  justify-content: center;
  overflow: hidden;
  width: 40px;
}
.sheet-option__text {
  flex: 1;
  min-width: 0;
}
.sheet-option__label {
  color: var(--app-text);
  font-size: 16px;
  font-weight: 500;
  line-height: 22px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sheet-option__caption {
  color: var(--app-text-muted);
  font-size: 13px;
  line-height: 18px;
  margin-top: 2px;
}
.sheet-option__check {
  color: var(--app-text);
  flex-shrink: 0;
}
</style>
