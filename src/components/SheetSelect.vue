<template>
  <div class="sheet-select">
    <!-- A labelled field that opens a bottom sheet of options: the same field as the
         Lightning address mint picker and the same sheet as Send and Receive. -->
    <!-- As a settings row: the setting's name and description on the start side, the
         current value and a chevron on the end side, like every other settings row. -->
    <q-item
      v-if="row"
      clickable
      v-ripple
      role="combobox"
      class="sheet-select__row"
      :aria-label="label"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :disable="disable"
      @click="open = true"
    >
      <q-item-section>
        <q-item-label>{{ label }}</q-item-label>
        <q-item-label v-if="caption" caption>{{ caption }}</q-item-label>
      </q-item-section>
      <q-item-section side class="row no-wrap items-center sheet-select__side">
        <span class="sheet-select__value">{{
          selectedOption?.label ?? placeholder
        }}</span>
        <ChevronRightIcon
          :size="18"
          class="settings-menu-chevron"
          aria-hidden="true"
        />
      </q-item-section>
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
      :disabled="disable"
      @click="open = true"
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
        role="listbox"
        :aria-label="title || label"
        class="sheet-select__list"
      >
        <SheetOption
          v-for="option in options"
          :key="String(option.value)"
          :label="option.label"
          :caption="option.caption"
          :selected="option.value === modelValue"
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
import { defineComponent, type PropType } from "vue";
import {
  ChevronDown as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
} from "lucide-vue-next";
import BottomSheet from "src/components/BottomSheet.vue";
import SheetOption from "src/components/SheetOption.vue";

export type SheetSelectOption = {
  value: string | number;
  label: string;
  caption?: string;
};

export default defineComponent({
  name: "SheetSelect",
  components: { BottomSheet, SheetOption, ChevronDownIcon, ChevronRightIcon },
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
    return { open: false };
  },
  computed: {
    selectedOption(): SheetSelectOption | undefined {
      return this.options.find((option) => option.value === this.modelValue);
    },
  },
  methods: {
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
.sheet-select__value {
  color: var(--app-text-muted);
  font-size: 15px;
  margin-inline-end: 4px;
}
.sheet-select__icon {
  display: inline-flex;
}
</style>
