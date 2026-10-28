<template>
  <!-- The always-on amount keypad of the full-screen amount flows (send, pay, receive): the
       numeric keyboard without close or enter keys, dimmed and inert while busy. -->
  <div class="keypad-wrapper" :class="{ 'keypad-wrapper--busy': busy }">
    <NumericKeyboard
      :force-visible="true"
      :hide-close="true"
      :hide-enter="true"
      :model-value="String(modelValue ?? 0)"
      @update:modelValue="
        (val: string | number) => $emit('update:modelValue', Number(val))
      "
      @done="$emit('done')"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import NumericKeyboard from "src/components/NumericKeyboard.vue";

export default defineComponent({
  name: "AmountKeypadPanel",
  components: { NumericKeyboard },
  props: {
    modelValue: {
      type: Number as PropType<number | null>,
      default: null,
    },
    busy: { type: Boolean, default: false },
  },
  emits: ["update:modelValue", "done"],
});
</script>

<style scoped>
.keypad-wrapper--busy {
  opacity: 0.4;
  pointer-events: none;
  transition: opacity 0.2s ease;
}
</style>
