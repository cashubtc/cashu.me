<template>
  <q-dialog
    v-model="showInvoiceDetails"
    position="top"
    :maximized="$q.screen.lt.sm"
    :full-width="$q.screen.lt.sm"
    :full-height="$q.screen.lt.sm"
    backdrop-filter="blur(2px) brightness(60%)"
    transition-show="fade"
    transition-hide="fade"
    no-backdrop-dismiss
  >
    <q-card class="q-pa-lg q-px-sm qcard q-card-top">
      <NumericKeyboard
        v-if="showNumericKeyboard && useNumericKeyboard"
        :model-value="invoiceData.amount"
        @update:modelValue="(val) => (invoiceData.amount = val)"
        @done="requestMintButton"
      />
      <!-- invoice is not entered -->
      <div v-if="!invoiceData.bolt11">
        <div class="row items-center no-wrap q-mb-sm q-pr-md q-py-lg">
          <div class="col-10">
            <span class="text-h6">{{ $t("InvoiceDetailDialog.title") }}</span>
            <span
              v-if="invoiceData.amount && bitcoinPrice && activeUnit == 'sat'"
              class="q-ml-xs text-subtitle2 text-grey-6"
            >
              ({{
                formatCurrency(
                  (currentCurrencyPrice / 100000000) *
                    invoiceData.amount *
                    activeUnitCurrencyMultiplyer,
                  bitcoinPriceCurrency,
                  true
                )
              }})
            </span>
          </div>
        </div>
        <div class="row items-center no-wrap q-my-sm q-py-none">
          <div class="col-12">
            <ChooseMint />
          </div>
        </div>
        <q-input
          round
          outlined
          type="number"
          v-model.number="invoiceData.amount"
          :label="
            $t('InvoiceDetailDialog.inputs.amount.label', {
              ticker: tickerShort,
            })
          "
          mask="#"
          fill-mask="0"
          reverse-fill-mask
          autofocus
          class="q-mb-lg"
          @keyup.enter="requestMintButton"
        >
          <q-btn
            flat
            color="primary"
            @click="toggleUnit()"
            :label="activeUnitLabel"
          />
        </q-input>
        <div class="row items-center no-wrap q-my-sm q-py-none">
          <q-btn
            color="primary"
            rounded
            @click="requestMintButton"
            :disable="!(invoiceData.amount > 0) || createInvoiceButtonBlocked"
            :label="
              createInvoiceButtonBlocked
                ? $t('InvoiceDetailDialog.actions.create.label_blocked')
                : $t('InvoiceDetailDialog.actions.create.label')
            "
            :loading="globalMutexLock"
          >
            <template v-slot:loading>
              <q-spinner-hourglass />
              {{ $t("InvoiceDetailDialog.actions.create.in_progress") }}
            </template>
          </q-btn>
          <q-btn v-close-popup rounded flat color="grey" class="q-ml-auto">{{
            $t("InvoiceDetailDialog.actions.close.label")
          }}</q-btn>
        </div>
      </div>

      <!-- invoice is entered -->

      <div v-else class="text-center q-mt-none q-pt-none">
        <a class="text-secondary" :href="'lightning:' + invoiceData.bolt11">
          <q-responsive :ratio="1" class="q-ma-none q-ma-none">
            <vue-qrcode
              :value="'lightning:' + invoiceData.bolt11.toUpperCase()"
              :options="{ width: 340 }"
              class="rounded-borders"
            >
            </vue-qrcode>
          </q-responsive>
        </a>
        <div class="row justify-center">
          <q-card-section class="q-pa-sm">
            <div class="row justify-center">
              <q-item-label
                overline
                class="q-mb-sm q-pt-md text-white"
                style="font-size: 1rem"
                >{{ $t("InvoiceDetailDialog.invoice.caption") }}</q-item-label
              >
            </div>
            <div class="row justify-center q-py-md">
              <q-item-label style="font-size: 28px" class="text-weight-bold">
                <q-icon
                  :name="
                    invoiceData.amount >= 0 ? 'call_received' : 'call_made'
                  "
                  :color="
                    invoiceData.status === 'paid'
                      ? invoiceData.amount >= 0
                        ? 'green'
                        : 'red'
                      : ''
                  "
                  class="q-mr-sm"
                  size="sm"
                />

                <strong>{{ displayUnit }}</strong></q-item-label
              >
            </div>
            <div
              v-if="this.invoiceData.mint != undefined"
              class="row justify-center q-pt-sm"
            >
              <q-chip
                outline
                class="q-pa-md"
                style="height: 36px; font-family: monospace"
              >
                <q-icon name="account_balance" size="xs" class="q-mr-sm" />
                {{ shortUrl }}
              </q-chip>
            </div>
            <div
              v-if="invoiceData.amount > 0 && invoiceData.status === 'paid'"
              class="row justify-center"
            >
              <transition appear enter-active-class="animated tada">
                <span class="q-mt-lg text-h6">
                  <q-icon
                    name="check_circle"
                    size="1.5rem"
                    color="positive"
                    class="q-mr-sm q-mb-xs"
                  />{{ $t("InvoiceDetailDialog.invoice.status_paid_text") }}
                </span>
              </transition>
            </div>
          </q-card-section>
        </div>
        <div class="row q-mt-lg">
          <q-btn
            v-if="invoiceData.bolt11"
            class="q-mx-xs"
            size="md"
            flat
            @click="copyText(invoiceData.bolt11)"
            >{{ $t("InvoiceDetailDialog.invoice.actions.copy.label") }}</q-btn
          >
          <q-btn v-close-popup flat color="grey" class="q-ml-auto">{{
            $t("InvoiceDetailDialog.invoice.actions.close.label")
          }}</q-btn>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import VueQrcode from "@chenfengyuan/vue-qrcode";

import { useWalletStore } from "src/stores/wallet";
import ChooseMint from "src/components/ChooseMint.vue";
import { useUiStore } from "src/stores/ui";
import { getShortUrl } from "src/js/wallet-helpers";
import { useWorkersStore } from "src/stores/workers";
import { useMintsStore } from "src/stores/mints";
import { useSettingsStore } from "../stores/settings";
import { usePriceStore } from "src/stores/price";
import NumericKeyboard from "components/NumericKeyboard.vue";

export default defineComponent({
  name: "InvoiceDetailDialog",
  mixins: [windowMixin],
  components: {
    ChooseMint,
    VueQrcode,
    NumericKeyboard,
  },
  props: {},
  data: function () {
    return {
      createInvoiceButtonBlocked: false,
    };
  },
  watch: {
    showInvoiceDetails: function (val) {
      if (val) {
        this.$nextTick(() => {
          if (!this.invoiceData.amount) {
            this.showNumericKeyboard = true;
          } else {
            this.showNumericKeyboard = false;
          }
        });
      }
    },
  },
  computed: {
    ...mapState(useWalletStore, ["invoiceData"]),
    ...mapState(useMintsStore, [
      "activeUnit",
      "activeUnitLabel",
      "activeUnitCurrencyMultiplyer",
    ]),
    ...mapState(useWorkersStore, ["invoiceWorkerRunning"]),
    ...mapWritableState(useUiStore, [
      "showInvoiceDetails",
      "tickerShort",
      "globalMutexLock",
      "showNumericKeyboard",
    ]),
    ...mapState(useSettingsStore, [
      "useNumericKeyboard",
      "bitcoinPriceCurrency",
    ]),
    ...mapState(usePriceStore, ["bitcoinPrice", "currentCurrencyPrice"]),
    displayUnit: function () {
      let display = this.formatCurrency(
        this.invoiceData.amount,
        this.invoiceData.unit,
        true
      );
      return display;
    },
    shortUrl: function () {
      return getShortUrl(this.invoiceData.mint);
    },
    runnerActive: function () {
      return this.invoiceWorkerRunning;
    },
    isSmallScreen() {
      return this.$q.screen.lt.sm;
    },
  },
  methods: {
    ...mapActions(useWalletStore, [
      "requestMint",
      "lnurlPaySecond",
      "mintOnPaid",
    ]),
    ...mapActions(useMintsStore, ["toggleUnit"]),
    requestMintButton: async function () {
      if (!this.invoiceData.amount) {
        return;
      }
      try {
        this.showNumericKeyboard = false;
        const mintStore = useMintsStore();
        this.invoiceData.amount *= this.activeUnitCurrencyMultiplyer;
        this.createInvoiceButtonBlocked = true;
        const mintWallet = useWalletStore().mintWallet(
          mintStore.activeMintUrl,
          mintStore.activeUnit
        );
        const mintQuote = await this.requestMint(
          this.invoiceData.amount,
          mintWallet
        );
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
.qcard {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}
</style>
