<template>
  <div class="amount-input-root">
    <slot name="overlay" />
    <transition name="swap-primary">
      <div
        :key="`primary-${fiatMode}`"
        ref="amountDisplayRef"
        class="amount-display text-weight-bold text-center"
        :class="{ 'text-grey-6': muted }"
      >
        {{ primaryAmountDisplay }}
      </div>
    </transition>
    <div v-if="showFiatConversion" class="fiat-container">
      <div class="fiat-wrapper">
        <transition name="swap-secondary">
          <div :key="`secondary-${fiatMode}`" class="fiat-wrapper-content">
            <div
              class="fiat-display text-grey-6"
              :class="{ invisible: !secondaryDisplay }"
              @click="toggleFiatMode"
            >
              {{ secondaryDisplay || " " }}
            </div>
            <q-icon
              v-if="showSwap"
              name="swap_vert"
              size="24px"
              class="fiat-icon text-grey-6 cursor-pointer"
              @click="toggleFiatMode"
              aria-label="Swap amount/fiat input mode"
              :aria-pressed="fiatMode ? 'true' : 'false'"
              role="button"
            />
          </div>
        </transition>
      </div>
    </div>
  </div>
  <!-- amount-input-root keeps structure minimal so parents can place it within their layout -->
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "pinia";
import { useMintsStore } from "src/stores/mints";
import { useSettingsStore } from "src/stores/settings";
import { usePriceStore } from "src/stores/price";
declare const windowMixin: any;

const MAX_AMOUNT = 999_999_999;

export default defineComponent({
  name: "AmountInputComponent",
  mixins: [windowMixin],
  props: {
    modelValue: {
      type: Number,
      default: null,
    },
    // gray out amount (e.g. insufficient funds)
    muted: {
      type: Boolean,
      default: false,
    },
    // whether the component should react to global keyboard input
    enabled: {
      type: Boolean,
      default: true,
    },
    showFiatConversion: {
      type: Boolean,
      default: true,
    },
    // maximum allowed amount (in base units, before currency multiplier)
    maxAmount: {
      type: Number,
      default: null,
    },
    // minimum allowed amount (in base units, before currency multiplier)
    minAmount: {
      type: Number,
      default: null,
    },
  },
  emits: ["update:modelValue", "enter", "fiat-mode-changed"],
  data() {
    return {
      amountEditBuffer: "" as string,
      fiatEditBuffer: "" as string,
      fiatMode: false as boolean,
      isFiatTyping: false as boolean,
    };
  },
  computed: {
    ...mapState(
      useMintsStore as any,
      ["activeUnit", "activeUnitLabel", "activeUnitCurrencyMultiplyer"] as any
    ),
    ...mapState(useSettingsStore, ["bitcoinPriceCurrency"]),
    ...mapState(usePriceStore, ["bitcoinPrice", "currentCurrencyPrice"]),
    formattedAmountDisplay(): string {
      const amount = this.modelValue || 0;
      return (this as any).formatCurrency(
        amount * this.activeUnitCurrencyMultiplyer,
        this.activeUnit,
        true
      );
    },
    primaryAmountDisplay(): string {
      if (this.fiatMode) {
        const fiat = this.getFiatBufferNumber();
        return (this as any).formatCurrency(
          fiat,
          this.bitcoinPriceCurrency,
          true
        );
      }
      return this.formattedAmountDisplay;
    },
    secondaryFiatDisplay(): string {
      if (!this.bitcoinPrice || this.activeUnit !== "sat") {
        return "";
      }
      const baseAmount = this.modelValue ?? 0;
      const fiat = (this as any).formatCurrency(
        (this.currentCurrencyPrice / 100000000) *
          baseAmount *
          this.activeUnitCurrencyMultiplyer,
        this.bitcoinPriceCurrency,
        true
      );
      return fiat;
    },
    secondaryDisplay(): string {
      if (this.fiatMode) {
        // show converted sats (actual emitted amount)
        if (!this.currentCurrencyPrice || this.activeUnit !== "sat") return "";
        const sats = this.derivedSatsFromFiatBuffer;
        return (this as any).formatCurrency(
          sats * this.activeUnitCurrencyMultiplyer,
          this.activeUnit,
          true
        );
      }
      return this.secondaryFiatDisplay;
    },
    showSwap(): boolean {
      // Show when fiat pricing is available and unit is sats (or currently in fiat mode)
      return (
        (this.activeUnit === "sat" && !!this.currentCurrencyPrice) ||
        this.fiatMode
      );
    },
    derivedSatsFromFiatBuffer(): number {
      if (!this.bitcoinPrice || !this.currentCurrencyPrice) return 0;
      const fiat = this.getFiatBufferNumber();
      if (!isFinite(fiat) || fiat <= 0) return 0;
      // sats = fiat * 100_000_000 / price_per_BTC
      let sats = Math.round((fiat * 100000000) / this.currentCurrencyPrice);
      sats = Math.max(0, Math.min(sats, MAX_AMOUNT));
      // Apply min/max constraints
      if (this.minAmount != null && sats < this.minAmount) {
        sats = this.minAmount;
      } else if (this.maxAmount != null && sats > this.maxAmount) {
        sats = this.maxAmount;
      }
      return sats;
    },
  },
  watch: {
    formattedAmountDisplay() {
      this.$nextTick(() => this.adjustAmountFontSize());
    },
    modelValue(newVal: number | null) {
      if (newVal == null) return;
      // Apply min/max constraints
      let clampedVal = newVal;
      if (this.minAmount != null && clampedVal < this.minAmount) {
        clampedVal = this.minAmount;
      } else if (this.maxAmount != null && clampedVal > this.maxAmount) {
        clampedVal = this.maxAmount;
      } else if (clampedVal > MAX_AMOUNT) {
        clampedVal = MAX_AMOUNT;
      }
      if (clampedVal !== newVal) {
        this.$emit("update:modelValue", clampedVal);
        this.amountEditBuffer = String(clampedVal);
        if (this.fiatMode) {
          // keep fiat buffer in sync with clamped sat value
          const fiat = this.fiatFromSats(clampedVal);
          this.fiatEditBuffer = this.numberToFiatBuffer(fiat);
        }
        return;
      }
      // Sync buffers when modelValue changes externally (e.g., from NumericKeyboard)
      if (this.fiatMode) {
        // Do not override user's fiat typing buffer during input
        if (this.isFiatTyping) return;
        const fiat = this.fiatFromSats(newVal);
        this.fiatEditBuffer = this.numberToFiatBuffer(fiat);
      } else {
        this.amountEditBuffer = String(newVal);
      }
    },
    enabled(val: boolean) {
      if (val) {
        this.initializeKeyHandling();
      } else {
        this.teardownKeyHandling();
      }
    },
  },
  mounted() {
    this.$nextTick(() => this.adjustAmountFontSize());
    if (this.enabled) {
      this.initializeKeyHandling();
    }
  },
  beforeUnmount() {
    this.teardownKeyHandling();
  },
  methods: {
    adjustAmountFontSize(): void {
      const element = this.$refs.amountDisplayRef as HTMLElement | undefined;
      if (!element) return;
      element.style.fontSize = "";
      const container = element.parentElement as HTMLElement | null;
      if (!container) return;
      const containerWidth = container.offsetWidth;
      const scrollWidth = element.scrollWidth;
      if (scrollWidth > containerWidth) {
        const baseFontSize = parseFloat(
          window.getComputedStyle(element).fontSize
        );
        const scaleFactor = containerWidth / scrollWidth;
        const newFontSize = Math.max(baseFontSize * scaleFactor * 0.95, 24);
        element.style.fontSize = `${newFontSize}px`;
      }
    },
    toggleFiatMode(): void {
      // Only allow switching when price data is available and activeUnit is sat
      if (!this.currentCurrencyPrice || this.activeUnit !== "sat") return;
      this.fiatMode = !this.fiatMode;
      if (this.fiatMode) {
        // initialize fiat buffer from current model value
        const sats = this.modelValue == null ? 0 : this.modelValue;
        const fiat = this.fiatFromSats(sats);
        this.fiatEditBuffer = this.numberToFiatBuffer(fiat);
      } else {
        // initialize sats buffer from current model value
        this.amountEditBuffer =
          this.modelValue == null ? "0" : String(this.modelValue);
      }
      this.$nextTick(() => this.adjustAmountFontSize());
      this.$emit("fiat-mode-changed", this.fiatMode);
    },
    fiatFromSats(sats: number): number {
      // fiat = sats * price_per_BTC / 100_000_000
      return (sats * this.currentCurrencyPrice) / 100000000;
    },
    satsFromFiat(fiat: number): number {
      if (!this.currentCurrencyPrice) return 0;
      const sats = Math.round((fiat * 100000000) / this.currentCurrencyPrice);
      return Math.max(0, Math.min(sats, MAX_AMOUNT));
    },
    getFiatBufferNumber(): number {
      const buf = this.fiatEditBuffer;
      if (!buf || buf === ".") return 0;
      const num = Number(buf.replace(/,/g, "."));
      return isNaN(num) ? 0 : num;
    },
    numberToFiatBuffer(num: number): string {
      // keep at most 2 decimals for fiat buffer
      return (Math.round(num * 100) / 100).toFixed(2).replace(/\.00$/, "");
    },
    initializeKeyHandling(): void {
      // initialize buffer from current value
      this.amountEditBuffer =
        this.modelValue == null ? "0" : String(this.modelValue);
      if (this.currentCurrencyPrice && this.activeUnit === "sat") {
        const fiat = this.fiatFromSats(this.modelValue || 0);
        this.fiatEditBuffer = this.numberToFiatBuffer(fiat);
      } else {
        this.fiatEditBuffer = "";
      }
      window.addEventListener("keydown", this.onGlobalAmountKeydown);
      window.addEventListener("resize", this.adjustAmountFontSize);
    },
    teardownKeyHandling(): void {
      window.removeEventListener("keydown", this.onGlobalAmountKeydown);
      window.removeEventListener("resize", this.adjustAmountFontSize);
      this.amountEditBuffer = "";
      this.fiatEditBuffer = "";
    },
    onGlobalAmountKeydown(e: KeyboardEvent): void {
      // ignore if an input/textarea/contenteditable is focused
      const ae = document.activeElement as HTMLElement | null;
      if (
        ae &&
        (ae.tagName === "INPUT" ||
          ae.tagName === "TEXTAREA" ||
          ae.getAttribute("contenteditable") === "true")
      ) {
        return;
      }
      if ((e as any).metaKey || (e as any).ctrlKey || (e as any).altKey) return;
      const allowDecimal = this.fiatMode
        ? true
        : this.activeUnit !== "sat" && this.activeUnit !== "msat";
      const key = (e as KeyboardEvent).key;
      let buf = this.fiatMode
        ? this.fiatEditBuffer ||
          this.numberToFiatBuffer(this.fiatFromSats(this.modelValue || 0))
        : this.amountEditBuffer ||
          (this.modelValue == null ? "0" : String(this.modelValue));
      let handled = false;

      if (/^[0-9]$/.test(key)) {
        // If buffer represents zero (0, 0.0, 0.00, etc.), reset completely
        const bufNum = allowDecimal
          ? Number(buf.replace(/,/g, "."))
          : Number(buf);
        if (bufNum === 0 || isNaN(bufNum)) {
          buf = key;
        } else {
          buf = buf + key;
        }
        handled = true;
      } else if (key === "Backspace" || key === "Delete") {
        buf = buf.length > 1 ? buf.slice(0, -1) : "0";
        handled = true;
      } else if ((key === "." || key === ",") && allowDecimal) {
        if (!buf.includes(".")) {
          buf = buf + ".";
        }
        handled = true;
      } else if (key === "Enter") {
        if (this.modelValue != null && this.modelValue > 0) {
          this.$emit("enter");
        }
        handled = true;
      }
      if (!handled) return;
      (e as Event).preventDefault();

      // sanitize buffer
      if (allowDecimal) {
        buf = buf.replace(/,/g, ".");
        buf = buf.replace(/[^\d.]/g, "").replace(/^(\d*\.\d*).*$/, "$1");
        if (buf.includes(".")) {
          const parts = buf.split(".");
          const decimals = parts[1] ?? "";
          buf = parts[0] + "." + decimals.slice(0, 2);
        }
      } else {
        buf = buf.replace(/[^\d]/g, "");
      }
      if (buf.startsWith("0") && buf.length > 1 && buf[1] !== ".") {
        buf = String(parseInt(buf, 10) || 0);
      }
      if (this.fiatMode) {
        this.fiatEditBuffer = buf;
        if (buf === "" || buf === ".") {
          this.$emit("update:modelValue", null);
        } else {
          const fiatNum = Number(buf);
          if (isNaN(fiatNum)) {
            this.$emit("update:modelValue", null);
          } else {
            let sats = this.satsFromFiat(fiatNum);
            if (sats >= MAX_AMOUNT) {
              sats = MAX_AMOUNT;
              // reflect clamp back into fiat buffer
              this.fiatEditBuffer = this.numberToFiatBuffer(
                this.fiatFromSats(MAX_AMOUNT)
              );
            }
            // Apply min/max constraints
            if (this.minAmount != null && sats < this.minAmount) {
              sats = this.minAmount;
              this.fiatEditBuffer = this.numberToFiatBuffer(
                this.fiatFromSats(this.minAmount)
              );
            } else if (this.maxAmount != null && sats > this.maxAmount) {
              sats = this.maxAmount;
              this.fiatEditBuffer = this.numberToFiatBuffer(
                this.fiatFromSats(this.maxAmount)
              );
            }
            this.isFiatTyping = true;
            this.$emit("update:modelValue", sats);
            this.$nextTick(() => {
              this.isFiatTyping = false;
            });
          }
        }
      } else {
        this.amountEditBuffer = buf;
        if (buf === "" || buf === ".") {
          this.$emit("update:modelValue", null);
        } else {
          let num = Number(buf);
          if (isNaN(num)) {
            this.$emit("update:modelValue", null);
          } else {
            // Apply min/max constraints
            if (this.minAmount != null && num < this.minAmount) {
              num = this.minAmount;
              this.amountEditBuffer = String(this.minAmount);
            } else if (this.maxAmount != null && num > this.maxAmount) {
              num = this.maxAmount;
              this.amountEditBuffer = String(this.maxAmount);
            } else if (num > MAX_AMOUNT) {
              num = MAX_AMOUNT;
              this.amountEditBuffer = String(MAX_AMOUNT);
            }
            this.$emit("update:modelValue", num);
          }
        }
      }
    },
  },
});
</script>
<style scoped>
.amount-input-root {
  position: relative;
  width: 100%;
  min-height: 120px; /* Ensure enough space for both displays */
}
.amount-display {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  font-size: clamp(56px, 11vw, 80px);
  line-height: 1.1;
  white-space: nowrap;
  max-width: 90vw;
}
.fiat-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 18px;
}
.fiat-wrapper {
  position: relative;
  width: 100%;
  height: 18px;
}
.fiat-wrapper-content {
  position: absolute;
  left: 50%;
  top: 50%;
  display: inline-flex;
  align-items: center;
  transform: translate(-50%, -50%);
}
.fiat-display {
  font-size: 20px;
  text-align: center;
}
.fiat-icon {
  position: absolute;
  left: 100%;
  margin-left: 4px;
}
.invisible {
  visibility: hidden;
}
/* Primary amount swap animation (top position) - Apple-like */
.swap-primary-enter-active {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform-origin: center;
}
.swap-primary-leave-active {
  transition: all 0.25s cubic-bezier(0.55, 0.06, 0.68, 0.19);
  transform-origin: center;
}
.swap-primary-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(40px) scale(0.85);
}
.swap-primary-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-40px) scale(0.85);
}
.swap-primary-enter-to,
.swap-primary-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
}
/* Secondary amount swap animation (bottom position) - Apple-like */
.swap-secondary-enter-active {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform-origin: center;
}
.swap-secondary-leave-active {
  transition: all 0.25s cubic-bezier(0.55, 0.06, 0.68, 0.19);
  transform-origin: center;
}
.swap-secondary-leave-to {
  opacity: 0;
  transform: translate(-50%, calc(-50% - 40px)) scale(0.85);
}
.swap-secondary-enter-from {
  opacity: 0;
  transform: translate(-50%, calc(-50% + 40px)) scale(0.85);
}
.swap-secondary-enter-to,
.swap-secondary-leave-from {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}
</style>
