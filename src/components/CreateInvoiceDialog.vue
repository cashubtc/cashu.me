<template>
  <q-dialog
    v-model="showCreateInvoiceDialog"
    maximized
    backdrop-filter="blur(2px) brightness(60%)"
    transition-show="fade"
    transition-hide="fade"
    no-backdrop-dismiss
    @keydown.esc="showCreateInvoiceDialog = false"
  >
    <q-card class="q-pa-none q-pt-none qcard">
      <!-- enter invoice amount (full-screen) -->
      <div
        class="column fit send-fullscreen"
        :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
      >
        <!-- Header -->
        <div class="row items-center q-pa-md" style="position: relative">
          <q-btn
            v-close-popup
            flat
            round
            icon="close"
            color="grey"
            class="floating-close-btn"
          />
          <div class="col text-center fixed-title-height">
            <q-item-label
              class="dialog-header q-mt-sm"
              :class="$q.dark.isActive ? 'text-white' : 'text-black'"
            >
              {{ $t("InvoiceDetailDialog.title") }}
            </q-item-label>
          </div>
          <div
            class="row items-center q-gutter-sm"
            style="position: absolute; right: 16px"
          >
            <q-btn
              flat
              dense
              size="lg"
              color="primary"
              @click="toggleUnit()"
              :label="activeUnitLabel"
            />
          </div>
        </div>

        <!-- Mint selection -->
        <div class="row justify-center">
          <div
            class="col-12 col-sm-11 col-md-8 q-px-lg q-mb-sm"
            style="max-width: 600px"
          >
            <ChooseMint />
          </div>
        </div>

        <!-- Amount display -->
        <div class="col column items-center justify-center q-px-lg amount-area">
          <AmountInputComponent
            v-model="invoiceData.amount"
            :enabled="true"
            @enter="requestMintButton"
            @fiat-mode-changed="fiatKeyboardMode = $event"
          />
        </div>

        <!-- Numeric keypad -->
        <div class="bottom-panel">
          <div class="keypad-wrapper">
            <NumericKeyboard
              :force-visible="true"
              :hide-close="true"
              :hide-enter="true"
              :hide-comma="
                (activeUnit === 'sat' || activeUnit === 'msat') &&
                !fiatKeyboardMode
              "
              :model-value="String(invoiceData.amount ?? 0)"
              @update:modelValue="(val: string | number) => (invoiceData.amount = Number(val))"
              @done="requestMintButton"
            />
          </div>
          <!-- Create action below keyboard -->
          <div class="row justify-center q-pb-lg q-pt-sm">
            <div
              class="col-12 col-sm-11 col-md-8 q-px-md"
              style="max-width: 600px"
            >
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
                  <q-spinner />
                </template>
              </q-btn>
            </div>
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
import AmountInputComponent from "components/AmountInputComponent.vue";
import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";
import { useMintsStore } from "src/stores/mints";
import { useSettingsStore } from "src/stores/settings";
import { usePriceStore } from "src/stores/price";
declare const windowMixin: any;

export default defineComponent({
  name: "CreateInvoiceDialog",
  mixins: [windowMixin],
  components: {
    ChooseMint,
    NumericKeyboard,
    AmountInputComponent,
  },
  props: {},
  data: function () {
    return {
      createInvoiceButtonBlocked: false,
      fiatKeyboardMode: false as boolean,
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
  },
  watch: {
    showCreateInvoiceDialog: function (val) {
      if (val) {
        this.$nextTick(() => {
          this.showNumericKeyboard = true;
        });
      } else {
      }
    },
  },
  methods: {
    ...mapActions(useWalletStore, ["requestMint", "mintOnPaid", "mintWallet"]),
    ...mapActions(useMintsStore, ["toggleUnit"]),
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
.floating-close-btn {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}
.fixed-title-height {
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.amount-area {
  flex: 1;
}
.amount-container {
  position: relative;
  display: inline-block;
  max-width: 90vw;
  overflow: hidden;
}
.amount-display {
  font-size: clamp(56px, 11vw, 80px);
  line-height: 1.1;
  overflow-wrap: break-word;
  word-break: break-all;
  max-width: 100%;
}
.fiat-display {
  font-size: 14px;
}
.bottom-panel {
  margin-top: auto;
  background: var(--q-color-grey-1);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.keypad-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
