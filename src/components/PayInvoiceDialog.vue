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
                    (bitcoinPrice / 100000000) *
                      payInvoiceData.meltQuote.response.amount,
                    "USD",
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
              (!enoughtotalUnitBalance &&
                !(
                  hasMultinutSupport &&
                  multinutEnabled &&
                  multinutAutoEnabled
                )) ||
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
              !payInvoiceData.blocking &&
              hasMultinutSupport &&
              multinutEnabled &&
              !multinutAutoEnabled
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
      <div
        v-if="multinutBreakdown && multinutBreakdown.length > 0"
        class="multi-mint-banner q-mt-md q-pa-md"
      >
        <div class="row items-center q-mb-xs">
          <q-icon name="bolt" class="q-mr-sm" />
          <span class="text-weight-bold"
            >This payment will use multiple mints:</span
          >
        </div>
        <div v-for="entry in multinutBreakdown" :key="entry.mint.url">
          {{ entry.mint.nickname || entry.mint.info?.name || entry.mint.url }}:
          {{ entry.amount }} sats
        </div>
      </div>
      <div class="auto-multinut-progress" v-if="autoMultinutInProgress">
        <q-spinner color="primary" size="20px" class="q-mr-sm" />
        <span
          >Processing payment across {{ autoMultinutMintCount }} mints...</span
        >
      </div>
    </q-card>
    <!-- Multinut Payment Dialog -->
    <MultinutPaymentDialog
      ref="multinutDialog"
      @return-to-pay-dialog="handleReturnToPayDialog"
    />
  </q-dialog>
</template>
<script>
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
import { MultinutService } from "src/js/multinut-service.js";
import { notifyError, notifySuccess } from "src/js/notify";

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
  data() {
    return {
      autoMultinutInProgress: false,
      autoMultinutMintCount: 0,
    };
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
    ...mapState(useSettingsStore, ["multinutEnabled", "multinutAutoEnabled"]),
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
    ...mapState(usePriceStore, ["bitcoinPrice"]),
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
      const result =
        this.multiMints.length > 1 &&
        this.payInvoiceData.meltQuote.response.amount > 0 &&
        totalMultinutBalance >= this.payInvoiceData.meltQuote.response.amount;
      return result;
    },
    multinutBreakdown() {
      // Only show if auto-multinut is enabled, required, and possible
      if (
        !this.hasMultinutSupport ||
        !this.multinutEnabled ||
        !this.multinutAutoEnabled ||
        this.enoughtotalUnitBalance
      ) {
        return null;
      }
      // Calculate the distribution
      const selectedMints = [...this.multiMints];
      const totalAmount = this.payInvoiceData.meltQuote.response.amount;
      const mintProportions = MultinutService.initializeMintProportions(
        selectedMints,
        totalAmount,
        this.activeUnit
      );
      // Build breakdown: [{ mint, amount }]
      return selectedMints
        .map((mint) => {
          const percentage = mintProportions[mint.url] || 0;
          const amount = Math.round(totalAmount * (percentage / 100));
          return amount > 0
            ? {
                mint,
                amount,
              }
            : null;
        })
        .filter(Boolean);
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
    closeParseDialog() {
      // Reset the payInvoiceData and/or multinut state here
      this.payInvoiceData.input.request = "";
      this.payInvoiceData.invoice = null;
      this.payInvoiceData.meltQuote = { response: {}, error: "" };
      // If you have a specific multinut state, reset it:
      this.autoMultinutInProgress = false;
      this.autoMultinutMintCount = 0;
      // If multinutBreakdown is a computed property, make sure its dependencies are reset.
      // If it's a data property, reset it directly:
      // this.multinutBreakdown = null;
    },
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
    handleMeltButton: async function () {
      if (this.payInvoiceData.blocking) {
        throw new Error("already processing an invoice.");
      }

      if (this.enoughtotalUnitBalance) {
        this.meltInvoiceData();
        return;
      }

      if (
        this.hasMultinutSupport &&
        this.multinutEnabled &&
        this.multinutAutoEnabled
      ) {
        await this.executeAutomaticMultinutPayment();
        return;
      }
      this.showInsufficientBalanceError();
    },
    openMultinutDialog: function () {
      this.payInvoiceData.show = false;
      this.$refs.multinutDialog.openMultinutDialog();
    },
    handleReturnToPayDialog: function () {
      this.payInvoiceData.show = true;
    },
    async executeAutomaticMultinutPayment() {
      this.autoMultinutInProgress = true;
      const selectedMints = [...this.multiMints];
      this.autoMultinutMintCount = selectedMints.length;
      try {
        // Set blocking state to prevent multiple payments
        this.payInvoiceData.blocking = true;

        // Initialize proportions based on balance weights
        const totalAmount = this.payInvoiceData.meltQuote.response.amount;
        const mintProportions = MultinutService.initializeMintProportions(
          selectedMints,
          totalAmount,
          this.activeUnit
        );

        // Progress callback for UI updates
        const onProgress = (phase, mintCount) => {
          if (phase === "requesting") {
            this.payInvoiceData.blocking = true;
            // Could update UI to show "Processing payment across X mints..."
          } else if (phase === "paying") {
            // Could update UI to show payment progress
          }
        };

        // Execute the multinut payment
        const result = await MultinutService.executePayment(
          this.payInvoiceData,
          selectedMints,
          mintProportions,
          this.activeUnit,
          onProgress
        );

        if (result.success) {
          // Payment successful
          useUiStore().vibrate();
          const uiStore = useUiStore();
          notifySuccess(
            `Payment completed! Used ${result.successfulPayments.length} mints: ${result.mintBreakdown}`
          );

          // Close the dialog
          this.payInvoiceData.invoice = { sat: 0, memo: "", bolt11: "" };
          this.payInvoiceData.show = false;
        } else {
          // Some payments failed
          const failedCount = result.failedPayments.length;
          const successCount = result.successfulPayments.length;

          if (successCount > 0) {
            // Partial success
            notifyError(
              `Payment partially completed. ${successCount} mints succeeded, ${failedCount} failed.`
            );
          } else {
            // Complete failure
            notifyError(
              "Automatic multinut payment failed. Try manual multinut payment."
            );
            // Offer manual multinut as fallback
            this.offerManualMultinutFallback();
          }
        }
      } catch (error) {
        console.error("Automatic multinut payment failed:", error);
        notifyError(
          "Automatic multinut payment failed. Try manual multinut payment."
        );
        // Offer manual multinut as fallback
        this.offerManualMultinutFallback();
      } finally {
        this.payInvoiceData.blocking = false;
        this.autoMultinutInProgress = false;
        this.autoMultinutMintCount = 0;
      }
    },
    showInsufficientBalanceError() {
      const uiStore = useUiStore();
      const amount = this.payInvoiceData.meltQuote.response.amount;
      const balance = this.activeBalance;
      notifyError(
        uiStore.t("wallet.notifications.insufficient_balance", {
          amount: uiStore.formatCurrency(amount, this.activeUnit),
          balance: uiStore.formatCurrency(balance, this.activeUnit),
        })
      );
    },
    offerManualMultinutFallback() {
      // If manual multinut is available, offer it as a fallback
      if (this.hasMultinutSupport && this.multinutEnabled) {
        // Could show a dialog asking if user wants to try manual multinut
        // For now, just keep the dialog open so user can click the "Multi" button
        console.log("Manual multinut available as fallback");
      }
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

.multi-nut-summary {
  background: var(--q-dark); /* or the modal's background color */
  border-radius: 12px; /* match modal's border radius */
  padding: 16px;
  margin-top: 16px;
  margin-bottom: 0;
  color: var(--q-text); /* use the modal's default text color */
}

.multi-nut-notice {
  font-weight: 600;
  color: var(--q-primary); /* use your app's primary color */
  display: flex;
  align-items: center;
  font-size: 15px;
  margin-bottom: 8px;
}

.multi-nut-breakdown {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.mint-name {
  font-weight: 500;
  color: var(--q-primary); /* use your app's primary color */
}

.mint-amount {
  font-weight: 500;
  color: var(--q-text); /* use the modal's default text color */
  margin-left: 4px;
}

.multi-mint-banner {
  border-radius: 20px !important; /* Makes all corners rounded */
  background: #222 !important; /* Or your preferred color */
  color: #fff; /* Ensures text is visible */
  margin-bottom: 16px;
  margin-top: 16px;
  padding: 16px;
  /* Remove box-shadow or border if you want it even cleaner */
}
</style>
