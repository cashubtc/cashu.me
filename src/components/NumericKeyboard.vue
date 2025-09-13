<!-- NumericKeyboard.vue -->
<template>
  <transition name="slide-up-fade">
    <q-card
      class="numeric-keyboard q-pa-md q-pb-xl q-pt-lg"
      style="
        position: fixed;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        max-width: 650px;
      "
      v-if="showNumericKeyboard"
    >
      <div class="keyboard-grid">
        <q-btn flat dense class="text-h5" @click="addDigit('1')">1</q-btn>
        <q-btn flat dense class="text-h5" @click="addDigit('2')">2</q-btn>
        <q-btn flat dense class="text-h5" @click="addDigit('3')">3</q-btn>

        <q-btn flat dense class="text-h5" @click="addDigit('4')">4</q-btn>
        <q-btn flat dense class="text-h5" @click="addDigit('5')">5</q-btn>
        <q-btn flat dense class="text-h5" @click="addDigit('6')">6</q-btn>

        <q-btn flat dense class="text-h5" @click="addDigit('7')">7</q-btn>
        <q-btn flat dense class="text-h5" @click="addDigit('8')">8</q-btn>
        <q-btn flat dense class="text-h5" @click="addDigit('9')">9</q-btn>

        <q-btn flat dense class="text-h5" @click="addComma">.</q-btn>
        <q-btn flat dense class="text-h5" @click="addDigit('0')">0</q-btn>
        <q-btn flat dense class="text-h5" @click="backspace">
          <q-icon name="backspace" size="sm" />
        </q-btn>
        <q-btn flat dense @click="closeKeyboard">{{
          $t("NumericKeyboard.actions.close.label")
        }}</q-btn>
        <br />
        <q-btn flat dense @click="emitDone">{{
          $t("NumericKeyboard.actions.enter.label")
        }}</q-btn>
      </div>
    </q-card>
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
  },
  emits: ["update:modelValue", "done"],
  computed: {
    ...mapWritableState(useUiStore, ["showNumericKeyboard"]),
    ...mapWritableState(useSettingsStore, ["useNumericKeyboard"]),
  },
  methods: {
    addDigit(digit) {
      const current = this.modelValue || "0";
      const newVal = current === "0" ? digit : current + digit;
      this.$emit("update:modelValue", newVal);
    },
    backspace() {
      const current = this.modelValue || "0";
      const newVal = current.length > 1 ? current.slice(0, -1) : "0";
      this.$emit("update:modelValue", newVal);
    },
    addComma() {
      const current = this.modelValue || "0";
      if (!current.includes(".")) {
        this.$emit("update:modelValue", current + ".");
      }
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
  background: var(--q-color-grey-1);
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
  max-width: 300px;
  margin: 0 auto;
}

.q-btn {
  border-radius: 8px;
  font-weight: 600;
  text-transform: capitalize;
  transition: background-color 0.3s, transform 0.2s;
  background-color: var(--q-color-grey-2);
  color: var(--q-color-grey-10);
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
  transform: translateY(-2px);
}

.q-btn:active {
  transform: translateY(0); /* Reset position on click */
  box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.2); /* Pressed effect */
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
