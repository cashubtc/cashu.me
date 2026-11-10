<template>
  <div class="sheet-select">
    <!-- A labelled field that opens a bottom sheet of options: the same field as the
         Lightning address mint picker and the same sheet as Send and Receive. -->
    <!-- As a settings row: the setting's name and description on the start side, the current
         value's short form (an option's `short`, e.g. "USD") muted beside one centred chevron
         on the end side, like platform settings. -->
    <!-- Both triggers are comboboxes tied to the sheet's listbox: the arrow keys open it, and
         inside it they move through the options (Home and End jump to the ends), starting
         from the selected one. -->
    <q-item
      v-if="row"
      clickable
      v-ripple
      role="combobox"
      class="sheet-select__row"
      :aria-label="label"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="listId"
      :disable="disable"
      @click="open = true"
      @keydown.down.prevent="openFromKey"
      @keydown.up.prevent="openFromKey"
    >
      <q-item-section>
        <q-item-label>{{ label }}</q-item-label>
        <q-item-label v-if="caption" caption
          ><CjkText :text="caption"
        /></q-item-label>
      </q-item-section>
      <RowValue
        :value="selectedOption?.short ?? selectedOption?.label ?? placeholder"
      />
    </q-item>
    <button
      v-else
      type="button"
      role="combobox"
      class="mint-chip mint-chip--field sheet-select__field"
      :class="{ 'sheet-select__field--empty': !selectedOption }"
      :aria-label="label"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="listId"
      :disabled="disable"
      @click="open = true"
      @keydown.down.prevent="openFromKey"
      @keydown.up.prevent="openFromKey"
    >
      <span v-if="$slots.icon" class="sheet-select__icon">
        <slot name="icon" :option="selectedOption" />
      </span>
      <span class="mint-chip__field-text">
        <span class="mint-chip__label">{{ label }}</span>
        <span class="mint-chip__name">{{
          selectedOption?.label ?? placeholder
        }}</span>
      </span>
      <ChevronDownIcon :size="20" class="mint-chip__icon" aria-hidden="true" />
    </button>

    <BottomSheet v-model="open" :title="title || label">
      <div
        :id="listId"
        role="listbox"
        :aria-label="title || label"
        class="sheet-select__list"
        :class="{ 'sheet-select__list--grouped': options.length > 8 }"
        @keydown="onListKeydown"
      >
        <SheetOption
          v-for="option in options"
          :key="String(option.value)"
          :label="option.label"
          :caption="option.caption"
          :selected="option.value === modelValue"
          :data-autofocus="option.value === modelValue ? '' : undefined"
          @select="choose(option)"
        >
          <template v-if="$slots.icon" #icon>
            <slot name="icon" :option="option" />
          </template>
        </SheetOption>
      </div>
    </BottomSheet>
  </div>
</template>

<script lang="ts">
import CjkText from "src/components/ui/CjkText.vue";
import { defineComponent, type PropType } from "vue";
import { ChevronDown as ChevronDownIcon } from "lucide-vue-next";
import RowValue from "src/components/ui/RowValue.vue";
import BottomSheet from "src/components/BottomSheet.vue";
import SheetOption from "src/components/SheetOption.vue";

export type SheetSelectOption = {
  value: string | number;
  label: string;
  /** A short form for the settings-row value slot (e.g. a currency code). */
  short?: string;
  caption?: string;
};

// Each select's listbox needs its own id for the trigger's aria-controls.
let nextSelectId = 0;

export default defineComponent({
  name: "SheetSelect",
  components: { CjkText, BottomSheet, SheetOption, ChevronDownIcon, RowValue },
  props: {
    /** Draw as a settings row (name and caption, value and chevron) instead of a field. */
    row: { type: Boolean, default: false },
    caption: { type: String, default: "" },
    modelValue: {
      type: [String, Number] as PropType<string | number | null>,
      default: null,
    },
    options: {
      type: Array as PropType<SheetSelectOption[]>,
      required: true,
    },
    label: { type: String, required: true },
    title: { type: String, default: "" },
    placeholder: { type: String, default: "" },
    disable: { type: Boolean, default: false },
  },
  emits: ["update:modelValue"],
  data() {
    return { open: false, listId: `sheet-select-${++nextSelectId}-options` };
  },
  computed: {
    selectedOption(): SheetSelectOption | undefined {
      return this.options.find((option) => option.value === this.modelValue);
    },
  },
  methods: {
    openFromKey() {
      if (!this.disable) this.open = true;
    },
    // The listbox's keys: the arrows step through the options, Home and End reach the ends.
    onListKeydown(event: KeyboardEvent) {
      const steps: Record<string, number> = { ArrowDown: 1, ArrowUp: -1 };
      const step = steps[event.key];
      if (step === undefined && event.key !== "Home" && event.key !== "End")
        return;
      const rows = Array.from(
        (event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>(
          '[role="option"]'
        )
      );
      if (!rows.length) return;
      const at = rows.indexOf(document.activeElement as HTMLElement);
      const last = rows.length - 1;
      const next =
        event.key === "Home"
          ? 0
          : event.key === "End"
          ? last
          : Math.min(last, Math.max(0, at + (step ?? 0)));
      event.preventDefault();
      rows[next].focus();
    },
    choose(option: SheetSelectOption) {
      this.$emit("update:modelValue", option.value);
      this.open = false;
    },
  },
});
</script>

<style scoped>
.sheet-select__field:disabled {
  cursor: default;
  opacity: 0.5;
}
.sheet-select__field--empty .mint-chip__name {
  color: var(--app-text-muted);
}
.sheet-select__icon {
  display: inline-flex;
}
</style>
