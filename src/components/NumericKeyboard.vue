<!-- NumericKeyboard.vue -->
<template>
  <div class="numeric-keyboard q-pa-md q-pb-lg q-pt-lg">
    <div class="keyboard-grid">
      <q-btn flat class="keypad-key" @click="addDigit('1')">1</q-btn>
      <q-btn flat class="keypad-key" @click="addDigit('2')">2</q-btn>
      <q-btn flat class="keypad-key" @click="addDigit('3')">3</q-btn>

      <q-btn flat class="keypad-key" @click="addDigit('4')">4</q-btn>
      <q-btn flat class="keypad-key" @click="addDigit('5')">5</q-btn>
      <q-btn flat class="keypad-key" @click="addDigit('6')">6</q-btn>

      <q-btn flat class="keypad-key" @click="addDigit('7')">7</q-btn>
      <q-btn flat class="keypad-key" @click="addDigit('8')">8</q-btn>
      <q-btn flat class="keypad-key" @click="addDigit('9')">9</q-btn>

      <q-btn flat class="keypad-key invisible" disable>•</q-btn>
      <q-btn flat class="keypad-key" @click="addDigit('0')">0</q-btn>
      <q-btn
        flat
        class="keypad-key"
        :aria-label="$t('common.backspace')"
        @click="backspace"
      >
        <DeleteIcon :size="24" />
      </q-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Delete as DeleteIcon } from "lucide-vue-next";

export default defineComponent({
  name: "NumericKeyboard",
  components: { DeleteIcon },
  methods: {
    sendKey(key: string) {
      // Delegate input handling to the global keyboard listener in AmountInputComponent
      window.dispatchEvent(new KeyboardEvent("keydown", { key }));
    },
    addDigit(digit: string) {
      this.sendKey(digit);
    },
    backspace() {
      this.sendKey("Backspace");
    },
  },
});
</script>

<style scoped lang="scss">
.numeric-keyboard {
  border-top-left-radius: 20px !important;
  border-top-right-radius: 20px !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: inherit;
  width: 100%;
  max-width: 650px;
}

/* Responsive adjustment: Full width on small screens */
@media (max-width: 600px) {
  .numeric-keyboard {
    left: 0;
    transform: none;
    max-width: 100%;
  }
}

.keyboard-grid {
  direction: ltr; /* keypads keep 1-2-3 order in right-to-left locales */
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
}

.q-btn {
  border-radius: var(--app-radius-md);
  font-weight: 600;
  text-transform: capitalize;
  transition: none;
  background-color: var(--q-color-grey-2);
  color: var(--q-color-grey-10);
  min-height: 56px;
  padding: 12px 0;
}

// The digits are a numeric role of their own, not button text: the global .q-btn standard
// (15px, src/css/app.scss) loads after Quasar's text-h5 and shrank them (owner 2026-10-29b,
// item 4). Scoped, so it beats that rule without !important; the same size on every screen
// height, where only the gaps and insets tighten.
.q-btn.keypad-key {
  font-size: 26px;
  font-variant-numeric: tabular-nums lining-nums;
  font-weight: 500;
  letter-spacing: 0;
  line-height: 32px;
  text-transform: none;
}

// on not tall screens, make the keyboard smaller
@media (max-height: 700px) {
  .numeric-keyboard {
    max-height: 300px;
  }
  .keyboard-grid {
    gap: 6px;
  }
}

// on even smaller screens, make the keyboard even smaller: a 568px phone closes the keypad's
// insets (24px to 8px) and its keys are 44px, the touch target (the digits keep their size), so the amount, its
// fiat line and Send's lock field still fit.
@media (max-height: 600px) {
  .numeric-keyboard {
    max-height: 260px;
  }
  .numeric-keyboard.q-pt-lg {
    padding-top: 8px !important;
  }
  .numeric-keyboard.q-pb-lg {
    padding-bottom: 8px !important;
  }
  .q-btn.keypad-key {
    min-height: 44px;
    padding: 6px 0;
  }
  .keyboard-grid {
    gap: 0px;
  }
}

.q-btn:hover {
  background-color: var(--q-color-grey-3);
}

/* Remove click animations */

.invisible {
  visibility: hidden;
}
</style>
