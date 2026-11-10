<!-- The tappable option row (src/css/elements.scss .app-option-row): an icon in a round slot,
     a label and a caption on a tinted fill. Send and Receive choices, sheet pickers (through
     SheetOption) and onboarding choices. Keyboard: Enter and Space activate it. `static`
     drops the button role for a row that only informs. -->
<template>
  <div
    class="app-option-row"
    :class="{ 'app-option-row--selected': selected }"
    :role="static ? undefined : role"
    :tabindex="static || disabled ? undefined : 0"
    :aria-disabled="disabled || undefined"
    :aria-selected="role === 'option' ? selected : undefined"
    @click="activate"
    @keydown.enter.prevent="activate"
    @keydown.space.prevent="activate"
  >
    <IconCircle
      v-if="icon || iconSrc || $slots.icon"
      :icon="icon"
      :src="iconSrc"
      :size="iconSize"
    >
      <slot name="icon" />
    </IconCircle>
    <div class="app-option-row__text">
      <div class="app-option-row__label" :class="labelClass">
        <slot name="label">{{ label }}</slot>
      </div>
      <div v-if="caption || $slots.caption" class="app-option-row__caption">
        <slot name="caption">{{ caption }}</slot>
      </div>
    </div>
    <slot name="trailing" />
  </div>
</template>

<script lang="ts">
import { defineComponent, type Component, type PropType } from "vue";
import IconCircle, {
  type IconCircleSize,
} from "src/components/ui/IconCircle.vue";

export default defineComponent({
  name: "OptionRow",
  components: { IconCircle },
  props: {
    icon: { type: [Object, Function] as PropType<Component>, default: null },
    /** md in action lists (Send, Receive), sm in sheet pickers. */
    iconSize: { type: String as PropType<IconCircleSize>, default: "md" },
    /** A picture in the icon slot (a mint's icon); the icon or slot shows if it fails. */
    iconSrc: { type: String, default: "" },
    label: { type: String, default: "" },
    caption: { type: String, default: "" },
    selected: { type: Boolean, default: false },
    role: { type: String as PropType<"button" | "option">, default: "button" },
    disabled: { type: Boolean, default: false },
    static: { type: Boolean, default: false },
    labelClass: { type: String, default: "" },
  },
  emits: ["click"],
  methods: {
    activate(event: Event) {
      if (!this.static && !this.disabled) this.$emit("click", event);
    },
  },
});
</script>
