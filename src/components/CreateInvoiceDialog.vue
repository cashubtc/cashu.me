<template>
  <q-dialog
    v-model="showCreateInvoiceDialog"
    maximized
    backdrop-filter="blur(2px) brightness(60%)"
    transition-show="fade"
    transition-hide="fade"
    no-backdrop-dismiss
  >
    <q-card class="q-pa-none q-pt-none qcard">
      <!-- enter invoice amount (full-screen) -->
      <div
        class="column fit send-fullscreen"
        :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
      >
        <!-- Header -->
        <div class="row items-center justify-between q-pa-md">
          <q-btn v-close-popup flat round icon="close" color="grey" />
          <div class="row items-center q-gutter-sm">
            <q-btn
              flat
              dense
              color="primary"
              @click="toggleUnit()"
              :label="activeUnitLabel"
            />
          </div>
        </div>

        <!-- Mint selection -->
        <div class="q-px-lg q-mb-sm" style="width: 100%">
          <ChooseMint />
        </div>

        <!-- Amount display -->
        <div class="col column items-center justify-center q-px-lg amount-area">
          <div class="amount-container">
            <div class="amount-display text-weight-bold text-center">
              {{ formattedAmountDisplay }}
            </div>
          </div>
          <div
            v-if="secondaryFiatDisplay"
            class="fiat-display text-grey-6 q-mt-xs"
          >
            {{ secondaryFiatDisplay }}
          </div>
        </div>

        <!-- Numeric keypad -->
        <div class="bottom-panel">
          <div class="keypad-wrapper">
            <NumericKeyboard
              :force-visible="true"
              :hide-close="true"
              :hide-enter="true"
              :hide-comma="activeUnit === 'sat' || activeUnit === 'msat'"
              :model-value="String(invoiceData.amount ?? 0)"
              @update:modelValue="(val) => (invoiceData.amount = Number(val))"
              @done="requestMintButton"
            />
          </div>
          <!-- Create action below keyboard -->
          <div class="q-px-md q-pb-md q-pt-sm">
            <q-btn
              class="full-width"
              unelevated
              size="lg"
              :disable="
                invoiceData.amount == null || Number(invoiceData.amount) <= 0
              "
              @click="requestMintButton"
              color="primary"
              rounded
              type="submit"
              :loading="globalMutexLock || createInvoiceButtonBlocked"
            >
              {{ $t("InvoiceDetailDialog.actions.create.label") }}
              <template v-slot:loading>
                <q-spinner-hourglass />
              </template>
            </q-btn>
          </div>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import ChooseMint from "components/ChooseMint.vue";
import NumericKeyboard from "components/NumericKeyboard.vue";
import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";
import { useMintsStore } from "src/stores/mints";
import { useSettingsStore } from "src/stores/settings";
import { usePriceStore } from "src/stores/price";

export default defineComponent({
  name: "CreateInvoiceDialog",
  mixins: [windowMixin],
  components: {
    ChooseMint,
    NumericKeyboard,
  },
  props: {},
  data: function () {
    return {
      createInvoiceButtonBlocked: false,
      amountEditBuffer: "",
    };
  },
  computed: {
    ...mapWritableState(useUiStore, [
      "showNumericKeyboard",
      "showInvoiceDetails",
    ]),
    ...mapWritableState(useUiStore, ["tickerShort", "globalMutexLock"]),
    ...mapWritableState(useUiStore, ["showCreateInvoiceDialog"]),
    ...mapWritableState(useWalletStore, ["invoiceData"]),
    ...mapState(useMintsStore, [
      "activeUnit",
      "activeUnitLabel",
      "activeUnitCurrencyMultiplyer",
      "activeMintUrl",
    ]),
    ...mapState(useSettingsStore, [
      "bitcoinPriceCurrency",
      "useNumericKeyboard",
    ]),
    ...mapState(usePriceStore, ["bitcoinPrice", "currentCurrencyPrice"]),
    secondaryFiatDisplay: function () {
      if (
        !this.invoiceData.amount ||
        !this.bitcoinPrice ||
        this.activeUnit !== "sat"
      ) {
        return "";
      }
      const fiat = this.formatCurrency(
        (this.currentCurrencyPrice / 100000000) *
          this.invoiceData.amount *
          this.activeUnitCurrencyMultiplyer,
        this.bitcoinPriceCurrency,
        true
      );
      return `(${fiat})`;
    },
    formattedAmountDisplay: function () {
      const amount = this.invoiceData.amount || 0;
      return this.formatCurrency(
        amount * this.activeUnitCurrencyMultiplyer,
        this.activeUnit
      );
    },
  },
  watch: {
    showCreateInvoiceDialog: function (val) {
      if (val) {
        this.$nextTick(() => {
          this.showNumericKeyboard = true;
          this.amountEditBuffer =
            this.invoiceData.amount == null
              ? "0"
              : String(this.invoiceData.amount);
          window.addEventListener("keydown", this.onGlobalAmountKeydown);
        });
      } else {
        window.removeEventListener("keydown", this.onGlobalAmountKeydown);
        this.amountEditBuffer = "";
      }
    },
  },
  methods: {
    ...mapActions(useWalletStore, ["requestMint", "mintOnPaid", "mintWallet"]),
    ...mapActions(useMintsStore, ["toggleUnit"]),
    onGlobalAmountKeydown: function (e: KeyboardEvent) {
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
        (this.invoiceData.amount == null
          ? "0"
          : String(this.invoiceData.amount));
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
        if (this.invoiceData.amount != null && this.invoiceData.amount > 0) {
          this.requestMintButton();
        }
        handled = true;
      }
      if (!handled) return;
      (e as Event).preventDefault();

      if (allowDecimal) {
        buf = buf.replace(/,/g, ".");
        buf = buf.replace(/[^\d.]/g, "").replace(/^(\d*\.\d*).*$/, "$1");
      } else {
        buf = buf.replace(/[^\d]/g, "");
      }
      if (buf.startsWith("0") && buf.length > 1 && buf[1] !== ".") {
        buf = String(parseInt(buf, 10) || 0);
      }
      this.amountEditBuffer = buf;
      if (buf === "" || buf === ".") {
        this.invoiceData.amount = null as any;
      } else {
        const num = Number(buf);
        this.invoiceData.amount = isNaN(num) ? (null as any) : num;
      }
    },
    requestMintButton: async function () {
      if (!this.invoiceData.amount) {
        return;
      }
      try {
        this.showNumericKeyboard = false;
        const mintStore = useMintsStore();
        const amount = Math.floor(
          this.invoiceData.amount * this.activeUnitCurrencyMultiplyer
        );
        this.createInvoiceButtonBlocked = true;
        const wallet = this.mintWallet(
          mintStore.activeMintUrl,
          mintStore.activeUnit
        );
        const mintQuote = await this.requestMint(amount, wallet);
        // Switch to QR display dialog
        this.showCreateInvoiceDialog = false;
        this.showInvoiceDetails = true;
        await this.mintOnPaid(mintQuote.quote);
      } catch (e) {
        console.log("#### requestMintButton", e);
      } finally {
        this.createInvoiceButtonBlocked = false;
      }
    },
  },
});
</script>
<style scoped>
.send-fullscreen {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.amount-area {
  flex: 1;
}
.amount-container {
  position: relative;
  display: inline-block;
}
.amount-display {
  font-size: clamp(56px, 11vw, 80px);
  line-height: 1.1;
}
.fiat-display {
  font-size: 14px;
}
.bottom-panel {
  margin-top: auto;
  background: var(--q-color-grey-1);
  box-shadow: 0 -8px 16px rgba(0, 0, 0, 0.05);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
</style>
