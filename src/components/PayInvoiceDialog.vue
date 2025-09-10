<template>
  <q-dialog
    v-model="payInvoiceData.show"
    @hide="closeParseDialog"
    position="top"
    v-if="!camera.show"
    :maximized="$q.screen.lt.sm"
    backdrop-filter="blur(2px) brightness(60%)"
    transition-show="fade"
    transition-hide="fade"
    no-backdrop-dismiss
    full-height
  >
    <q-card class="q-pa-lg q-pt-xl qcard">
      <div v-if="payInvoiceData.invoice">
        <div class="row items-center no-wrap q-mb-sm">
          <div class="col-10">
            <div
              v-if="
                payInvoiceData.meltQuote.response &&
                payInvoiceData.meltQuote.response.amount > 0
              "
            >
              <h6 class="q-my-none inline-block">
                <i18n-t keypath="PayInvoiceDialog.invoice.title">
                  <template v-slot:value>
                    {{
                      formatCurrency(
                        payInvoiceData.meltQuote.response.amount,
                        activeUnit,
                        true
                      )
                    }}
                  </template>
                </i18n-t>
              </h6>
              <span
                v-if="bitcoinPrice && activeUnit == 'sat'"
                class="q-ml-xs text-subtitle2 text-grey-6"
              >
                ({{
                  formatCurrency(
                    (currentCurrencyPrice / 100000000) *
                      payInvoiceData.meltQuote.response.amount,
                    bitcoinPriceCurrency,
                    true
                  )
                }})
              </span>
            </div>
            <h6
              v-else-if="payInvoiceData.meltQuote.error != ''"
              class="q-my-none"
            >
              {{ payInvoiceData.meltQuote.error }}
            </h6>
            <h6 v-else class="q-my-none">
              {{ $t("PayInvoiceDialog.invoice.processing_info_text") }}
            </h6>
          </div>
          <div class="col-2">
            <ToggleUnit class="q-mt-md" />
          </div>
        </div>
        <p class="text-wrap">
          <strong v-if="payInvoiceData.invoice.description"
            >{{ $t("PayInvoiceDialog.invoice.memo.label") }}:</strong
          >
          {{ payInvoiceData.invoice.description }}<br />
        </p>
        <div class="col-12">
          <ChooseMint />
        </div>
        <div
          v-if="
            enoughtotalUnitBalance ||
            (hasMultinutSupport && multinutEnabled) ||
            globalMutexLock
          "
          class="row q-mt-lg"
        >
          <q-btn
            unelevated
            rounded
            color="primary"
            :disabled="
              payInvoiceData.blocking ||
              !enoughtotalUnitBalance ||
              payInvoiceData.meltQuote.error != ''
            "
            @click="handleMeltButton"
            :label="
              payInvoiceData.meltQuote.error != ''
                ? $t('PayInvoiceDialog.invoice.actions.pay.error')
                : !payInvoiceData.blocking
                ? $t('PayInvoiceDialog.invoice.actions.pay.label')
                : $t('PayInvoiceDialog.invoice.actions.pay.in_progress')
            "
            :loading="globalMutexLock && !payInvoiceData.blocking"
            class="q-px-lg"
          >
            <template v-slot:loading>
              <q-spinner-hourglass />
            </template>
          </q-btn>
          <q-btn
            v-if="
              !payInvoiceData.blocking && hasMultinutSupport && multinutEnabled
            "
            unelevated
            rounded
            outline
            :disabled="!hasMultinutSupport"
            @click="openMultinutDialog"
            label="Multi"
            class="q-px-lg q-ml-sm"
          />
          <q-btn v-close-popup flat color="grey" class="q-ml-auto">{{
            $t("PayInvoiceDialog.invoice.actions.close.label")
          }}</q-btn>
        </div>
        <div v-else class="row q-mt-lg">
          <q-btn
            unelevated
            rounded
            disabled
            color="yellow"
            text-color="black"
            >{{
              $t("PayInvoiceDialog.invoice.balance_too_low_warning_text")
            }}</q-btn
          >
          <q-btn v-close-popup flat color="grey" class="q-ml-auto">{{
            $t("PayInvoiceDialog.invoice.actions.close.label")
          }}</q-btn>
        </div>
      </div>
      <div v-else-if="payInvoiceData.lnurlpay">
        <q-form @submit="lnurlPaySecond" class="q-gutter-md">
          <p
            v-if="
              payInvoiceData.lnurlpay.maxSendable ==
              payInvoiceData.lnurlpay.minSendable
            "
            class="q-my-none text-h6 text-center"
          >
            <i18n-t keypath="PayInvoiceDialog.lnurlpay.amount_exact_label">
              <template v-slot:payee>
                <b>{{ payInvoiceData.lnurlpay.domain }}</b>
              </template>
              <template v-slot:value>
                {{ payInvoiceData.lnurlpay.maxSendable / 1000 }}
              </template>
              <template v-slot:ticker>
                {{ tickerShort }}
              </template>
            </i18n-t>
          </p>
          <p v-else class="q-my-none text-h6 text-center">
            <i18n-t keypath="PayInvoiceDialog.lnurlpay.amount_range_label">
              <template v-slot:payee>
                <b>{{
                  payInvoiceData.lnurlpay.targetUser ||
                  payInvoiceData.lnurlpay.domain
                }}</b>
              </template>
              <template v-slot:br>
                <br />
              </template>
              <template v-slot:min>
                <b>{{ payInvoiceData.lnurlpay.minSendable / 1000 }}</b>
              </template>
              <template v-slot:max>
                <b>{{ payInvoiceData.lnurlpay.maxSendable / 1000 }}</b>
              </template>
              <template v-slot:ticker>
                {{ tickerShort }}
              </template>
            </i18n-t>
          </p>
          <q-separator class="q-my-sm"></q-separator>
          <div class="row" v-if="payInvoiceData.lnurlpay.description">
            <p class="col text-justify text-italic">
              {{ payInvoiceData.lnurlpay.description }}
            </p>
            <p class="col-4 q-pl-md" v-if="payInvoiceData.lnurlpay.image">
              <q-img :src="payInvoiceData.lnurlpay.image" />
            </p>
          </div>
          <div class="row">
            <div class="col">
              <q-input
                filled
                dense
                autofocus
                v-model.number="payInvoiceData.input.amount"
                type="number"
                :label="
                  $t('PayInvoiceDialog.lnurlpay.inputs.amount.label', {
                    ticker: tickerShort,
                  })
                "
                :min="payInvoiceData.lnurlpay.minSendable / 1000"
                :max="payInvoiceData.lnurlpay.maxSendable / 1000"
                :readonly="
                  payInvoiceData.lnurlpay.maxSendable ==
                  payInvoiceData.lnurlpay.minSendable
                "
              >
              </q-input>
            </div>
            <div
              class="col-8 q-pl-md"
              v-if="payInvoiceData.lnurlpay.commentAllowed > 0"
            >
              <q-input
                filled
                dense
                v-model="payInvoiceData.input.comment"
                _type="payInvoiceData.lnurlpay.commentAllowed > 64 ? 'textarea' : 'text'"
                :label="$t('PayInvoiceDialog.lnurlpay.inputs.comment.label')"
                :maxlength="payInvoiceData.lnurlpay.commentAllowed"
              ></q-input>
            </div>
          </div>
          <div class="row q-mt-lg">
            <q-btn unelevated color="primary" type="submit">{{
              $t("PayInvoiceDialog.lnurlpay.actions.send.label")
            }}</q-btn>
            <q-btn v-close-popup flat color="grey" class="q-ml-auto">{{
              $t("PayInvoiceDialog.lnurlpay.actions.close.label")
            }}</q-btn>
          </div>
        </q-form>
      </div>
      <div v-else>
        <div class="row items-center no-wrap q-mb-xl">
          <div class="col-10">
            <span class="text-h6">{{
              $t("PayInvoiceDialog.input_data.title")
            }}</span>
          </div>
        </div>
        <q-form
          v-if="!camera.show"
          @submit="decodeAndQuote(payInvoiceData.input.request)"
          class="q-gutter-md relative-container"
        >
          <q-input
            ref="parseDialogInput"
            round
            outlined
            class="request-input"
            spellcheck="false"
            v-model.trim="payInvoiceData.input.request"
            type="textarea"
            :label="$t('PayInvoiceDialog.input_data.inputs.invoice_data.label')"
            autofocus
            @keyup.enter="decodeAndQuote(payInvoiceData.input.request)"
          >
            <q-icon
              name="close"
              color="dark"
              v-if="payInvoiceData.input.request"
              class="cursor-pointer floating-button"
              @click="payInvoiceData.input.request = ''"
            />
          </q-input>
          <div class="row q-mt-lg">
            <q-btn
              rounded
              color="primary"
              class="q-mr-sm"
              v-if="payInvoiceData.input.request != ''"
              type="submit"
              >{{
                $t("PayInvoiceDialog.input_data.actions.enter.label")
              }}</q-btn
            >
            <q-btn
              unelevated
              dense
              v-if="canPasteFromClipboard && payInvoiceData.input.request == ''"
              @click="pasteToParseDialog"
              ><q-icon name="content_paste" class="q-pr-sm" />{{
                $t("PayInvoiceDialog.input_data.actions.paste.label")
              }}</q-btn
            >
            <q-btn
              unelevated
              class="q-mx-0"
              v-if="hasCamera && payInvoiceData.input.request == ''"
              @click="showCamera"
            >
              <ScanIcon />
              <span class="q-pl-sm">{{
                $t("PayInvoiceDialog.input_data.actions.scan.label")
              }}</span>
            </q-btn>
            <q-btn v-close-popup flat rounded color="grey" class="q-ml-auto">{{
              $t("PayInvoiceDialog.input_data.actions.close.label")
            }}</q-btn>
          </div>
        </q-form>
      </div>
    </q-card>
  </q-dialog>

  <!-- Multinut Payment Dialog -->
  <MultinutPaymentDialog
    ref="multinutDialog"
    @return-to-pay-dialog="handleReturnToPayDialog"
  />
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";
import { useCameraStore } from "src/stores/camera";
import { useMintsStore, MintClass } from "src/stores/mints";
import { useSettingsStore } from "src/stores/settings";
import { usePriceStore } from "src/stores/price";
import { mapActions, mapState, mapWritableState } from "pinia";
import ChooseMint from "components/ChooseMint.vue";
import ToggleUnit from "components/ToggleUnit.vue";
import MultinutPaymentDialog from "./MultinutPaymentDialog.vue";

import * as _ from "underscore";
import { Scan as ScanIcon } from "lucide-vue-next";

export default defineComponent({
  name: "PayInvoiceDialog",
  mixins: [windowMixin],
  components: {
    ChooseMint,
    ToggleUnit,
    MultinutPaymentDialog,
    ScanIcon,
  },
  props: {},
  data: function () {
    return {};
  },
  watch: {
    activeMintUrl: async function () {
      if (this.payInvoiceData.show) {
        await this.meltQuoteInvoiceData();
      }
    },
    activeUnit: async function () {
      if (this.payInvoiceData.show) {
        await this.meltQuoteInvoiceData();
      }
    },
  },
  computed: {
    ...mapState(useUiStore, ["tickerShort", "globalMutexLock"]),
    ...mapState(useSettingsStore, ["multinutEnabled"]),
    ...mapWritableState(useCameraStore, ["camera", "hasCamera"]),
    ...mapState(useWalletStore, ["payInvoiceData"]),
    ...mapState(useMintsStore, [
      "activeMintUrl",
      "activeProofs",
      "mints",
      "activeUnit",
      "totalUnitBalance",
      "activeBalance",
      "multiMints",
    ]),
    ...mapState(usePriceStore, [
      "bitcoinPrice",
      "bitcoinPrices",
      "currentCurrencyPrice",
    ]),
    ...mapState(useSettingsStore, ["bitcoinPriceCurrency"]),
    canPasteFromClipboard: function () {
      return (
        window.isSecureContext &&
        navigator.clipboard &&
        navigator.clipboard.readText
      );
    },
    enoughtotalUnitBalance: function () {
      return (
        this.activeBalance >= this.payInvoiceData.meltQuote.response.amount
      );
    },
    hasMultinutSupport: function () {
      const totalMultinutBalance = this.multiMints.reduce(
        (acc, mint) => acc + new MintClass(mint).unitBalance(this.activeUnit),
        0
      );
      return (
        this.multiMints.length > 1 &&
        this.payInvoiceData.meltQuote.response.amount > 0 &&
        totalMultinutBalance >= this.payInvoiceData.meltQuote.response.amount
      );
    },
  },
  methods: {
    ...mapActions(useWalletStore, [
      "meltInvoiceData",
      "meltQuoteInvoiceData",
      "decodeRequest",
      "lnurlPaySecond",
    ]),
    ...mapActions(useCameraStore, ["closeCamera", "showCamera"]),
    canPay: function () {
      if (!this.payInvoiceData.invoice) return false;
      return (
        this.payInvoiceData.meltQuote.response.amount +
          this.payInvoiceData.meltQuote.response.fee_reserve <=
        this.totalUnitBalance
      );
    },
    closeParseDialog: function () {},
    decodeAndQuote: async function (request) {
      await this.decodeRequest(request);
    },
    pasteToParseDialog: async function () {
      console.log("pasteToParseDialog");
      const text = await useUiStore().pasteFromClipboard();
      if (text) {
        this.payInvoiceData.input.request = text.trim();
        // await this.decodeAndQuote(text.trim());
      }
    },
    handleMeltButton: function () {
      if (this.payInvoiceData.blocking) {
        throw new Error("already processing an invoice.");
      }
      this.meltInvoiceData();
    },
    openMultinutDialog: function () {
      this.payInvoiceData.show = false;
      this.$refs.multinutDialog.openMultinutDialog();
    },
    handleReturnToPayDialog: function () {
      this.payInvoiceData.show = true;
    },
  },
  created: function () {},
});
</script>

<style lang="scss" scoped>
.q-dialog__inner > div {
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
}

.qcard {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.request-input {
  word-break: break-all;
  -webkit-hyphens: none;
  -moz-hyphens: none;
  hyphens: none;
  font-size: 0.9em;
  font-family: monospace;
}

.relative-container {
  position: relative;
}

.floating-button {
  position: absolute;
  top: 10px;
  right: 0px;
  z-index: 100;
  padding: 1px;
  background-color: var(--q-primary);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
