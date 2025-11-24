<!-- NumericKeyboard.vue -->
<template>
  <transition name="slide-up-fade">
    <div
      class="numeric-keyboard q-pa-md q-pb-lg q-pt-lg"
      v-if="forceVisible || showNumericKeyboard"
    >
      <div class="keyboard-grid">
        <q-btn flat class="text-h5" @click="addDigit('1')">1</q-btn>
        <q-btn flat class="text-h5" @click="addDigit('2')">2</q-btn>
        <q-btn flat class="text-h5" @click="addDigit('3')">3</q-btn>

        <q-btn flat :ripple="true" class="text-h5" @click="addDigit('4')"
          >4</q-btn
        >
        <q-btn flat class="text-h5" @click="addDigit('5')">5</q-btn>
        <q-btn flat class="text-h5" @click="addDigit('6')">6</q-btn>

        <q-btn flat class="text-h5" @click="addDigit('7')">7</q-btn>
        <q-btn flat class="text-h5" @click="addDigit('8')">8</q-btn>
        <q-btn flat class="text-h5" @click="addDigit('9')">9</q-btn>

        <q-btn v-if="!hideComma" flat class="text-h5" @click="addComma"
          >.</q-btn
        >
        <q-btn v-else flat class="text-h5 invisible" disable>•</q-btn>
        <q-btn flat class="text-h5" @click="addDigit('0')">0</q-btn>
        <q-btn flat class="text-h5" @click="backspace">
          <q-icon name="chevron_left" size="md" />
        </q-btn>
        <q-btn v-if="!hideClose" flat @click="closeKeyboard">{{
          $t("NumericKeyboard.actions.close.label")
        }}</q-btn>
        <br v-if="!hideClose || !hideEnter" />
        <q-btn v-if="!hideEnter" flat @click="emitDone">{{
          $t("NumericKeyboard.actions.enter.label")
        }}</q-btn>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useUiStore } from "../stores/ui";
import { mapWritableState } from "pinia";
import { useSettingsStore } from "../stores/settings";
import { notify } from "src/js/notify";

export default defineComponent({
  name: "NumericKeyboard",
  props: {
    modelValue: {
      type: String,
      default: "0",
    },
    forceVisible: {
      type: Boolean,
      default: false,
    },
    hideClose: {
      type: Boolean,
      default: false,
    },
    hideEnter: {
      type: Boolean,
      default: false,
    },
    hideComma: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "done"],
  data() {
    return {
      // Decimal handling for fiat-style input (when hideComma === false)
      hasDecimal: false as boolean,
      decimalDigits: 0 as number, // 0..2
    };
  },
  computed: {
    ...mapWritableState(useUiStore, ["showNumericKeyboard"]),
    ...mapWritableState(useSettingsStore, ["useNumericKeyboard"]),
    isIntegerCurrency(): boolean {
      return this.hideComma;
    },
  },
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
    addComma() {
      if (this.isIntegerCurrency) return;
      this.sendKey(".");
    },
    closeKeyboard() {
      (this as any).useNumericKeyboard = false;
      (this as any).showNumericKeyboard = false;
      notify(
        this.$t("NumericKeyboard.actions.close.closed_info_text") as any,
        "bottom"
      );
    },
    emitDone() {
      this.sendKey("Enter");
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
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
}

.q-btn {
  border-radius: 8px;
  font-weight: 600;
  text-transform: capitalize;
  transition: none;
  background-color: var(--q-color-grey-2);
  color: var(--q-color-grey-10);
  min-height: 56px;
  padding: 12px 0;
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

// on even smaller screens, make the keyboard even smaller
@media (max-height: 600px) {
  .numeric-keyboard {
    max-height: 260px;
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

/* Transition styles */
.slide-up-fade-enter-active,
.slide-up-fade-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-up-fade-enter,
.slide-up-fade-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
