<template>
  <div class="amount-input-root">
    <div class="amount-container">
      <slot name="overlay" />
      <div
        ref="amountDisplayRef"
        class="amount-display text-weight-bold text-center"
        :class="{ 'text-grey-6': muted }"
      >
        {{ formattedAmountDisplay }}
      </div>
    </div>
    <div class="fiat-container q-mt-xs">
      <div
        class="fiat-display text-grey-6"
        :class="{ invisible: !secondaryFiatDisplay }"
      >
        {{ secondaryFiatDisplay || " " }}
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
  },
  emits: ["update:modelValue", "enter"],
  data() {
    return {
      amountEditBuffer: "" as string,
    };
  },
  computed: {
    ...mapState(useMintsStore, [
      "activeUnit",
      "activeUnitLabel",
      "activeUnitCurrencyMultiplyer",
    ]),
    ...mapState(useSettingsStore, ["bitcoinPriceCurrency"]),
    ...mapState(usePriceStore, ["bitcoinPrice", "currentCurrencyPrice"]),
    formattedAmountDisplay(): string {
      const amount = this.modelValue || 0;
      return this.formatCurrency(
        amount * this.activeUnitCurrencyMultiplyer,
        this.activeUnit,
        true
      );
    },
    secondaryFiatDisplay(): string {
      if (!this.modelValue || !this.bitcoinPrice || this.activeUnit !== "sat") {
        return "";
      }
      const fiat = this.formatCurrency(
        (this.currentCurrencyPrice / 100000000) *
          this.modelValue *
          this.activeUnitCurrencyMultiplyer,
        this.bitcoinPriceCurrency,
        true
      );
      return `(${fiat})`;
    },
  },
  watch: {
    formattedAmountDisplay() {
      this.$nextTick(() => this.adjustAmountFontSize());
    },
    modelValue(newVal: number | null) {
      if (newVal == null) return;
      if (newVal > MAX_AMOUNT) {
        this.$emit("update:modelValue", MAX_AMOUNT);
        this.amountEditBuffer = String(MAX_AMOUNT);
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
    initializeKeyHandling(): void {
      // initialize buffer from current value
      this.amountEditBuffer =
        this.modelValue == null ? "0" : String(this.modelValue);
      window.addEventListener("keydown", this.onGlobalAmountKeydown);
      window.addEventListener("resize", this.adjustAmountFontSize);
    },
    teardownKeyHandling(): void {
      window.removeEventListener("keydown", this.onGlobalAmountKeydown);
      window.removeEventListener("resize", this.adjustAmountFontSize);
      this.amountEditBuffer = "";
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
      const allowDecimal =
        this.activeUnit !== "sat" && this.activeUnit !== "msat";
      const key = (e as KeyboardEvent).key;
      let buf =
        this.amountEditBuffer ||
        (this.modelValue == null ? "0" : String(this.modelValue));
      let handled = false;

      if (/^[0-9]$/.test(key)) {
        buf = buf === "0" ? key : buf + key;
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
      this.amountEditBuffer = buf;
      if (buf === "" || buf === ".") {
        this.$emit("update:modelValue", null);
      } else {
        const num = Number(buf);
        if (isNaN(num)) {
          this.$emit("update:modelValue", null);
        } else if (num > MAX_AMOUNT) {
          this.amountEditBuffer = String(MAX_AMOUNT);
          this.$emit("update:modelValue", MAX_AMOUNT);
        } else {
          this.$emit("update:modelValue", num);
        }
      }
    },
  },
});
</script>
<style scoped>
.amount-container {
  position: relative;
  display: inline-block;
  max-width: 90vw;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.amount-display {
  font-size: clamp(56px, 11vw, 80px);
  line-height: 1.1;
  white-space: nowrap;
  max-width: 100%;
}
.fiat-container {
  height: 18px;
}
.fiat-display {
  font-size: 14px;
}
.invisible {
  visibility: hidden;
}
</style>
