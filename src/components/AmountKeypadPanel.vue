<template>
  <!-- The always-on amount keypad of the full-screen amount flows (send, pay, receive): the
       numeric keyboard without close or enter keys, dimmed and inert while busy. -->
  <div class="keypad-wrapper" :class="{ 'keypad-wrapper--busy': busy }">
    <NumericKeyboard />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NumericKeyboard from "src/components/NumericKeyboard.vue";

export default defineComponent({
  name: "AmountKeypadPanel",
  components: { NumericKeyboard },
  props: {
    busy: { type: Boolean, default: false },
  },
});
</script>

<style scoped>
.keypad-wrapper--busy {
  opacity: 0.4;
  pointer-events: none;
  transition: opacity 0.2s ease;
}
</style>
