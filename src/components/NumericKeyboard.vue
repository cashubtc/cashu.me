<!-- NumericKeyboard.vue -->
<template>
  <transition name="slide-up-fade">
    <div
      class="numeric-keyboard q-pa-md q-pb-lg q-pt-lg"
      v-if="forceVisible || showNumericKeyboard"
    >
      <div class="keyboard-grid">
        <q-btn flat :ripple="false" class="text-h5" @click="addDigit('1')"
          >1</q-btn
        >
        <q-btn flat :ripple="false" class="text-h5" @click="addDigit('2')"
          >2</q-btn
        >
        <q-btn flat :ripple="false" class="text-h5" @click="addDigit('3')"
          >3</q-btn
        >

        <q-btn flat :ripple="false" class="text-h5" @click="addDigit('4')"
          >4</q-btn
        >
        <q-btn flat :ripple="false" class="text-h5" @click="addDigit('5')"
          >5</q-btn
        >
        <q-btn flat :ripple="false" class="text-h5" @click="addDigit('6')"
          >6</q-btn
        >

        <q-btn flat :ripple="false" class="text-h5" @click="addDigit('7')"
          >7</q-btn
        >
        <q-btn flat :ripple="false" class="text-h5" @click="addDigit('8')"
          >8</q-btn
        >
        <q-btn flat :ripple="false" class="text-h5" @click="addDigit('9')"
          >9</q-btn
        >

        <q-btn
          v-if="!hideComma"
          flat
          :ripple="false"
          class="text-h5"
          @click="addComma"
          >.</q-btn
        >
        <q-btn v-else flat :ripple="false" class="text-h5 invisible" disable
          >•</q-btn
        >
        <q-btn flat :ripple="false" class="text-h5" @click="addDigit('0')"
          >0</q-btn
        >
        <q-btn flat :ripple="false" class="text-h5" @click="backspace">
          <q-icon name="chevron_left" size="md" />
        </q-btn>
        <q-btn v-if="!hideClose" flat :ripple="false" @click="closeKeyboard">{{
          $t("NumericKeyboard.actions.close.label")
        }}</q-btn>
        <br v-if="!hideClose || !hideEnter" />
        <q-btn v-if="!hideEnter" flat :ripple="false" @click="emitDone">{{
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
    addDigit(digit: string) {
      if (this.isIntegerCurrency) {
        // sat/msat behavior unchanged: append digits to an integer string
        const current = this.modelValue || "0";
        const newVal = current === "0" ? digit : current + digit;
        this.$emit("update:modelValue", newVal);
        return;
      }

      // Fiat-style behavior: edit using cents internally, emit dollars as decimal
      const currentCents = this.parseCents(this.modelValue) || 0;
      const dollars = Math.floor(currentCents / 100);

      if (!this.hasDecimal) {
        // Append digit to whole dollars (implicit .00)
        const newDollars = dollars * 10 + Number(digit);
        const newCents = newDollars * 100;
        this.$emit("update:modelValue", String(newCents / 100));
        return;
      }

      // We are in decimal mode, allow up to 2 decimal digits
      if (this.decimalDigits >= 2) {
        // ignore extra digits beyond 2 decimals
        return;
      }

      const fractional = currentCents % 100;
      const base = dollars * 100;
      if (this.decimalDigits === 0) {
        // first decimal digit goes to tens-of-cents
        const newCents = base + Number(digit) * 10;
        this.decimalDigits = 1;
        this.$emit("update:modelValue", String(newCents / 100));
        return;
      }
      // this.decimalDigits === 1
      const tens = Math.floor(fractional / 10); // existing tens-of-cents
      const newCents = base + tens * 10 + Number(digit);
      this.decimalDigits = 2;
      this.$emit("update:modelValue", String(newCents / 100));
    },
    backspace() {
      if (this.isIntegerCurrency) {
        // Original integer behavior
        const current = this.modelValue || "0";
        const newVal = current.length > 1 ? current.slice(0, -1) : "0";
        this.$emit("update:modelValue", newVal);
        return;
      }

      // Fiat-style deletion
      const currentCents = this.parseCents(this.modelValue) || 0;
      const dollars = Math.floor(currentCents / 100);
      const fractional = currentCents % 100;

      if (this.hasDecimal) {
        if (this.decimalDigits === 2) {
          // Drop ones-of-cents -> keep tens-of-cents
          const newCents = dollars * 100 + Math.floor(fractional / 10) * 10;
          this.decimalDigits = 1;
          this.$emit("update:modelValue", String(newCents / 100));
          return;
        }
        if (this.decimalDigits === 1) {
          // Drop tens-of-cents -> no fractional digits remain
          const newCents = dollars * 100;
          this.decimalDigits = 0;
          this.hasDecimal = false; // back to 100x input mode
          this.$emit("update:modelValue", String(newCents / 100));
          return;
        }
        // decimalDigits === 0 -> treat as non-decimal mode
        this.hasDecimal = false;
      }

      // Non-decimal mode: drop last dollars digit
      const newDollars = Math.floor(dollars / 10);
      const newCents = newDollars * 100;
      this.$emit("update:modelValue", String(newCents / 100));
    },
    addComma() {
      if (this.isIntegerCurrency) {
        // No-op for integer currencies
        return;
      }
      if (this.hasDecimal) {
        return;
      }
      // Enter decimal mode without changing the numeric value
      this.hasDecimal = true;
      this.decimalDigits = 0;
    },
    closeKeyboard() {
      this.useNumericKeyboard = false;
      this.showNumericKeyboard = false;
      notify(
        this.$i18n.t("NumericKeyboard.actions.close.closed_info_text"),
        "bottom"
      );
    },
    emitDone() {
      this.$emit("done");
    },
    parseCents(value: string | null | undefined): number {
      if (!value) return 0;
      const n = Number(value);
      if (isNaN(n)) return 0;
      return Math.max(0, Math.round(n * 100));
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
