<template>
  <q-dialog
    v-model="payInvoiceData.show"
    @hide="closeParseDialog"
    v-if="!camera.show"
    maximized
    backdrop-filter="blur(2px) brightness(60%)"
    transition-show="fade"
    transition-hide="fade"
    no-backdrop-dismiss
    @keydown.esc="payInvoiceData.show = false"
  >
    <q-card class="q-pa-none q-pt-none qcard">
      <div
        class="column fit pay-fullscreen"
        :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
      >
        <!-- Header with centered title and unit toggle on right -->
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
            <div>
              <q-item-label
                class="dialog-header q-mt-sm"
                :class="$q.dark.isActive ? 'text-white' : 'text-black'"
                style="
                  display: inline-block;
                  white-space: normal;
                  word-break: break-word;
                "
              >
                {{ $t("PayInvoiceDialog.input_data.title") || "Pay Lightning" }}
              </q-item-label>
            </div>
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

        <!-- Mint selection (match SendTokenDialog layout) -->
        <div class="row justify-center">
          <div
            class="col-12 col-sm-11 col-md-8 q-px-lg q-mb-sm"
            style="max-width: 600px"
          >
            <ChooseMint />
          </div>
        </div>

        <!-- Content area -->
        <div
          class="col column items-center justify-start q-px-lg scroll-container"
        >
          <div class="row justify-center full-width">
            <div
              class="col-12 col-sm-11 col-md-8 q-px-sm q-mb-sm"
              style="max-width: 600px"
            >
              <!-- INVOICE CONTENT -->
              <div v-if="payInvoiceData.invoice">
                <div class="invoice-state-container">
                  <transition name="slide-down">
                    <div :key="invoiceStateKey" class="invoice-state-content">
                      <div v-if="isPaid" class="q-mb-md">
                        <div class="row">
                          <div class="col-12 text-h4 text-weight-bold">
                            {{ $t("PayInvoiceDialog.invoice.paid") }}
                            {{
                              payInvoiceData.meltQuote.response &&
                              payInvoiceData.meltQuote.response.amount > 0
                                ? formatCurrency(
                                    payInvoiceData.meltQuote.response.amount,
                                    activeUnit,
                                    true
                                  )
                                : ""
                            }}
                            <q-icon
                              color="positive"
                              name="check_circle"
                              size="md"
                              class="q-mb-sm"
                            />
                          </div>
                        </div>
                        <div
                          v-if="payInvoiceData.fee_paid != null"
                          class="text-subtitle2 text-grey-6"
                        >
                          {{ $t("PayInvoiceDialog.invoice.fee") }}:
                          {{
                            formatCurrency(
                              payInvoiceData.fee_paid,
                              activeUnit,
                              true
                            )
                          }}
                        </div>
                      </div>
                      <div v-else-if="isPaying" class="q-mb-md">
                        <div class="row">
                          <div class="col-12 text-h4 text-weight-bold q-mb-xs">
                            {{ $t("PayInvoiceDialog.invoice.paying") }}
                            {{
                              payInvoiceData.meltQuote.response &&
                              payInvoiceData.meltQuote.response.amount > 0
                                ? formatCurrency(
                                    payInvoiceData.meltQuote.response.amount,
                                    activeUnit,
                                    true
                                  )
                                : ""
                            }}
                            <q-spinner class="q-mb-sm" />
                          </div>
                        </div>
                      </div>
                      <div
                        v-else-if="
                          payInvoiceData.meltQuote.response &&
                          payInvoiceData.meltQuote.response.amount > 0
                        "
                        class="q-mb-md"
                      >
                        <div class="text-h4 text-weight-bold q-mb-xs">
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
                        </div>
                        <div
                          v-if="bitcoinPrice && activeUnit == 'sat'"
                          class="text-subtitle2 text-grey-6 q-ml-xs"
                        >
                          {{
                            formatCurrency(
                              (currentCurrencyPrice / 100000000) *
                                payInvoiceData.meltQuote.response.amount,
                              bitcoinPriceCurrency,
                              true
                            )
                          }}
                        </div>
                        <MeltQuoteInformation
                          v-if="showMeltQuoteInformation"
                          class="q-mt-sm"
                          :melt-quote="payInvoiceData.meltQuote.response"
                          :mint-url="activeMintUrl"
                        />
                        <p
                          class="text-wrap q-mt-xl"
                          style="max-width: 600px; font-size: 1.1rem"
                          v-if="
                            payInvoiceData.invoice.description &&
                            payInvoiceData.meltQuote.response
                          "
                        >
                          <strong
                            >{{
                              $t("PayInvoiceDialog.invoice.memo.label")
                            }}:</strong
                          >
                          {{ payInvoiceData.invoice.description }}<br />
                        </p>
                      </div>
                      <div v-else-if="payInvoiceData.meltQuote.error != ''">
                        <div class="text-h6 q-my-none">
                          Error: {{ payInvoiceData.meltQuote.error }}
                        </div>
                      </div>
                      <div v-else>
                        <div class="row">
                          <div class="col-12 text-h4 text-weight-bold q-mb-xs">
                            {{
                              $t(
                                "PayInvoiceDialog.invoice.processing_info_text"
                              )
                            }}
                            <q-spinner />
                          </div>
                        </div>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>

              <!-- LNURL PAY CONTENT -->
              <div v-else-if="payInvoiceData.lnurlpay">
                <!-- Fixed amount display (when maxSendable == minSendable) -->
                <div
                  v-if="
                    payInvoiceData.lnurlpay.maxSendable ==
                    payInvoiceData.lnurlpay.minSendable
                  "
                >
                  <p
                    v-if="payInvoiceData.lnurlpay.lightningAddress"
                    class="q-my-none text-h6 text-center"
                  >
                    <i18n-t
                      keypath="PayInvoiceDialog.lnurlpay.sending_to_lightning_address"
                    >
                      <template v-slot:address>
                        <b>{{ payInvoiceData.lnurlpay.lightningAddress }}</b>
                      </template>
                    </i18n-t>
                  </p>
                  <p v-else class="q-my-none text-h6 text-center">
                    <i18n-t
                      keypath="PayInvoiceDialog.lnurlpay.amount_exact_label"
                    >
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
                  <q-separator class="q-my-sm"></q-separator>
                  <div class="row" v-if="payInvoiceData.lnurlpay.description">
                    <p class="col text-justify text-italic">
                      {{ payInvoiceData.lnurlpay.description }}
                    </p>
                    <p
                      class="col-4 q-pl-md"
                      v-if="payInvoiceData.lnurlpay.image"
                    >
                      <q-img :src="payInvoiceData.lnurlpay.image" />
                    </p>
                  </div>
                  <!-- Comment input for fixed amount -->
                  <div
                    class="row justify-center q-mt-md"
                    v-if="payInvoiceData.lnurlpay.commentAllowed > 0"
                  >
                    <div
                      class="col-12 col-sm-11 col-md-8 q-px-sm"
                      style="max-width: 600px"
                    >
                      <q-input
                        round
                        outlined
                        v-model="payInvoiceData.input.comment"
                        :type="
                          payInvoiceData.lnurlpay.commentAllowed > 64
                            ? 'textarea'
                            : 'text'
                        "
                        :label="
                          $t('PayInvoiceDialog.lnurlpay.inputs.comment.label')
                        "
                        :maxlength="payInvoiceData.lnurlpay.commentAllowed"
                      ></q-input>
                    </div>
                  </div>
                </div>

                <!-- Variable amount with AmountInputComponent -->
                <div v-else>
                  <p
                    v-if="payInvoiceData.lnurlpay.lightningAddress"
                    class="q-my-none text-h6 text-center"
                  >
                    <i18n-t
                      keypath="PayInvoiceDialog.lnurlpay.sending_to_lightning_address"
                    >
                      <template v-slot:address>
                        <b>{{ payInvoiceData.lnurlpay.lightningAddress }}</b>
                      </template>
                    </i18n-t>
                  </p>
                  <p v-else class="q-my-none text-h6 text-center">
                    <i18n-t
                      keypath="PayInvoiceDialog.lnurlpay.amount_range_label"
                    >
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

                  <div class="row" v-if="payInvoiceData.lnurlpay.description">
                    <p class="col text-justify text-italic">
                      {{ payInvoiceData.lnurlpay.description }}
                    </p>
                    <p
                      class="col-4 q-pl-md"
                      v-if="payInvoiceData.lnurlpay.image"
                    >
                      <q-img :src="payInvoiceData.lnurlpay.image" />
                    </p>
                  </div>

                  <!-- Amount display area -->
                  <div
                    class="column items-center justify-center q-px-lg q-py-lg amount-area"
                  >
                    <AmountInputComponent
                      v-model="payInvoiceData.input.amount"
                      :enabled="true"
                      :muted="
                        insufficientFunds ||
                        (payInvoiceData.lnurlpay.minSendable &&
                          payInvoiceData.input.amount <
                            payInvoiceData.lnurlpay.minSendable / 1000) ||
                        (payInvoiceData.lnurlpay.maxSendable &&
                          payInvoiceData.input.amount >
                            payInvoiceData.lnurlpay.maxSendable / 1000)
                      "
                      :max-amount="
                        Math.min(
                          payInvoiceData.lnurlpay.maxSendable / 1000,
                          maxAmountFromBalance
                        )
                      "
                      @enter="handleLnurlPaySecond"
                      @fiat-mode-changed="fiatKeyboardMode = $event"
                    />
                  </div>

                  <!-- Comment input below amount -->
                  <div
                    class="row justify-center q-mt-md"
                    v-if="payInvoiceData.lnurlpay.commentAllowed > 0"
                  >
                    <div
                      class="col-12 col-sm-11 col-md-8 q-px-sm"
                      style="max-width: 600px"
                    >
                      <q-input
                        round
                        outlined
                        v-model="payInvoiceData.input.comment"
                        type="text"
                        :label="
                          $t('PayInvoiceDialog.lnurlpay.inputs.comment.label')
                        "
                        :maxlength="payInvoiceData.lnurlpay.commentAllowed"
                      ></q-input>
                    </div>
                  </div>
                </div>
              </div>

              <!-- INPUT CONTENT -->
              <div v-else>
                <ParseInputComponent
                  v-if="!camera.show"
                  v-model="payInvoiceData.input.request"
                  :placeholder="$t('ParseInputComponent.placeholder.pay')"
                  :has-camera="hasCameraAvailable"
                  :ndef-supported="false"
                  @update:model-value="decodeAndQuote($event)"
                  @paste="pasteToParseDialog"
                  @scan="showCamera"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom fixed pay action -->
        <div class="bottom-panel" v-if="payInvoiceData.invoice">
          <div class="row justify-center q-pb-lg q-pt-sm">
            <div
              class="col-12 col-sm-11 col-md-8 q-px-md"
              style="max-width: 600px"
            >
              <template
                v-if="
                  enoughtotalUnitBalance ||
                  (hasMultinutSupport && multinutEnabled) ||
                  globalMutexLock
                "
              >
                <q-btn
                  class="full-width"
                  unelevated
                  size="lg"
                  color="primary"
                  rounded
                  :disabled="
                    payInvoiceData.blocking ||
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
                >
                  <template v-slot:loading>
                    <q-spinner />
                  </template>
                </q-btn>
              </template>
              <template v-else>
                <q-btn
                  class="full-width"
                  unelevated
                  size="lg"
                  color="yellow"
                  text-color="black"
                  rounded
                  disabled
                >
                  {{
                    $t("PayInvoiceDialog.invoice.balance_too_low_warning_text")
                  }}
                </q-btn>
              </template>
            </div>
          </div>
        </div>

        <!-- Bottom fixed LNURL pay action -->
        <div
          class="bottom-panel"
          v-if="
            payInvoiceData.lnurlpay &&
            !payInvoiceData.invoice &&
            payInvoiceData.lnurlpay.maxSendable !=
              payInvoiceData.lnurlpay.minSendable
          "
        >
          <div class="keypad-wrapper" v-if="showNumericKeyboard">
            <NumericKeyboard
              :force-visible="true"
              :hide-close="true"
              :hide-enter="true"
              :hide-comma="
                (activeUnit === 'sat' || activeUnit === 'msat') &&
                !fiatKeyboardMode
              "
              :model-value="String(payInvoiceData.input.amount ?? 0)"
              @update:modelValue="
                (val: string | number) =>
                  (payInvoiceData.input.amount = Number(val))
              "
              @done="handleLnurlPaySecond"
            />
          </div>
          <!-- LNURL pay action below keyboard -->
          <div class="row justify-center q-pb-lg q-pt-sm">
            <div
              class="col-12 col-sm-11 col-md-8 q-px-md"
              style="max-width: 600px"
            >
              <q-btn
                class="full-width"
                unelevated
                size="lg"
                color="primary"
                rounded
                @click="handleLnurlPaySecond"
                :disabled="
                  payInvoiceData.blocking ||
                  payInvoiceData.input.amount == null ||
                  payInvoiceData.input.amount <= 0 ||
                  payInvoiceData.input.amount <
                    payInvoiceData.lnurlpay.minSendable / 1000 ||
                  payInvoiceData.input.amount >
                    payInvoiceData.lnurlpay.maxSendable / 1000 ||
                  insufficientFunds
                "
                :loading="payInvoiceData.blocking"
              >
                {{
                  payInvoiceData.blocking
                    ? $t("PayInvoiceDialog.lnurlpay.actions.send.in_progress")
                    : $t("PayInvoiceDialog.lnurlpay.actions.send.label")
                }}
                <template v-slot:loading>
                  <q-spinner />
                </template>
              </q-btn>
            </div>
          </div>
        </div>

        <!-- Bottom fixed LNURL pay action (fixed amount, no keyboard) -->
        <div
          class="bottom-panel"
          v-if="
            payInvoiceData.lnurlpay &&
            !payInvoiceData.invoice &&
            payInvoiceData.lnurlpay.maxSendable ==
              payInvoiceData.lnurlpay.minSendable
          "
        >
          <div class="row justify-center q-pb-lg q-pt-sm">
            <div
              class="col-12 col-sm-11 col-md-8 q-px-md"
              style="max-width: 600px"
            >
              <q-btn
                class="full-width"
                unelevated
                size="lg"
                color="primary"
                rounded
                @click="handleLnurlPaySecond"
                :disabled="payInvoiceData.blocking"
                :loading="payInvoiceData.blocking"
              >
                {{
                  payInvoiceData.blocking
                    ? $t("PayInvoiceDialog.lnurlpay.actions.send.in_progress")
                    : $t("PayInvoiceDialog.lnurlpay.actions.send.label")
                }}
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
import MultinutPaymentDialog from "./MultinutPaymentDialog.vue";
import MeltQuoteInformation from "components/MeltQuoteInformation.vue";
import NumericKeyboard from "components/NumericKeyboard.vue";
import AmountInputComponent from "components/AmountInputComponent.vue";
import ParseInputComponent from "components/ParseInputComponent.vue";

import * as _ from "underscore";
import { Proof } from "@cashu/cashu-ts";

declare const windowMixin: any;

export default defineComponent({
  name: "PayInvoiceDialog",
  mixins: [windowMixin],
  components: {
    ChooseMint,
    MultinutPaymentDialog,
    MeltQuoteInformation,
    NumericKeyboard,
    AmountInputComponent,
    ParseInputComponent,
  },
  props: {},
  data: function () {
    return {
      fiatKeyboardMode: false as boolean,
      isPaying: false as boolean,
      isPaid: false as boolean,
    };
  },
  watch: {
    activeMintUrl: async function () {
      if (this.payInvoiceData.show && this.payInvoiceData.invoice) {
        await this.meltQuoteInvoiceData();
      }
    },
    activeUnit: async function () {
      if (this.payInvoiceData.show && this.payInvoiceData.invoice) {
        await this.meltQuoteInvoiceData();
      }
    },
    "payInvoiceData.lnurlpay": {
      handler: function (newVal) {
        if (newVal && newVal.maxSendable == newVal.minSendable) {
          // Set fixed amount
          this.payInvoiceData.input.amount = newVal.minSendable / 1000;
          this.showNumericKeyboard = false;
        } else {
          this.showNumericKeyboard = true;
        }
      },
      immediate: true,
    },
    "payInvoiceData.show": {
      handler: async function (val, oldVal) {
        // Intercept automatic close after successful payment
        if (
          !val &&
          oldVal &&
          this.isPaying &&
          !this.payInvoiceData.meltQuote.error
        ) {
          // Payment just succeeded and store is trying to close dialog
          // Re-open it to show success state
          this.isPaying = false;
          this.isPaid = true;
          this.payInvoiceData.show = true; // Prevent close

          // Wait 2 seconds then allow close
          await new Promise((resolve) => setTimeout(resolve, 2000));
          this.isPaid = false;
          this.payInvoiceData.show = false;
        } else if (!val) {
          // Normal close - reset states
          this.showNumericKeyboard = false;
          this.isPaying = false;
          this.isPaid = false;
        }
      },
    },
  },
  computed: {
    ...mapState(useUiStore, ["tickerShort", "globalMutexLock"]),
    ...mapState(useSettingsStore, ["multinutEnabled"]),
    ...mapWritableState(useCameraStore, ["camera", "hasCamera"]),
    ...mapWritableState(useUiStore, ["showNumericKeyboard"]),
    // mints store via direct getters to avoid strict typing issues
    activeMintUrl: function (): any {
      return (useMintsStore() as any).activeMintUrl;
    },
    activeProofs: function (): any {
      return (useMintsStore() as any).activeProofs;
    },
    mints: function (): any {
      return (useMintsStore() as any).mints;
    },
    activeUnit: function (): any {
      return (useMintsStore() as any).activeUnit;
    },
    activeUnitCurrencyMultiplyer: function (): any {
      return (useMintsStore() as any).activeUnitCurrencyMultiplyer;
    },
    totalUnitBalance: function (): any {
      return (useMintsStore() as any).totalUnitBalance;
    },
    activeBalance: function (): any {
      return (useMintsStore() as any).activeBalance;
    },
    multiMints: function (): any {
      return (useMintsStore() as any).multiMints;
    },
    ...mapState(usePriceStore, [
      "bitcoinPrice",
      "bitcoinPrices",
      "currentCurrencyPrice",
    ]),
    ...mapState(useSettingsStore, ["bitcoinPriceCurrency"]),
    payInvoiceData: function (): any {
      return (useWalletStore() as any).payInvoiceData;
    },
    hasCameraAvailable: function (): boolean {
      return Boolean((useCameraStore() as any).hasCamera);
    },
    showMeltQuoteInformation: function (): boolean {
      const quote = this.payInvoiceData?.meltQuote?.response;
      if (!quote) {
        return false;
      }
      if (!quote.quote) {
        return false;
      }
      const hasAmount = typeof quote.amount === "number" && quote.amount > 0;
      const hasFeeReserve =
        typeof quote.fee_reserve === "number" && quote.fee_reserve > 0;
      const feePaidRaw = (quote as any).fee_paid;
      const hasFeePaid =
        (typeof feePaidRaw === "number" && Number.isFinite(feePaidRaw)) ||
        (typeof feePaidRaw === "string" && feePaidRaw.trim() !== "");
      const paidRaw =
        (quote as any).paid_at ??
        (quote as any).paid_timestamp ??
        (quote as any).paid_time ??
        (quote as any).paid;
      const hasPaidTimestamp =
        paidRaw !== undefined &&
        paidRaw !== null &&
        typeof paidRaw !== "boolean";
      return hasAmount || hasFeeReserve || hasFeePaid || hasPaidTimestamp;
    },
    enoughtotalUnitBalance: function () {
      return (
        this.activeBalance >= this.payInvoiceData.meltQuote.response.amount
      );
    },
    hasMultinutSupport: function (): boolean {
      const totalMultinutBalance = this.multiMints.reduce(
        (acc: number, mint: any) =>
          acc + new MintClass(mint).unitBalance(this.activeUnit),
        0
      );
      return (
        this.multiMints.length > 1 &&
        this.payInvoiceData.meltQuote.response.amount > 0 &&
        totalMultinutBalance >= this.payInvoiceData.meltQuote.response.amount
      );
    },
    activeUnitLabel: function (): string {
      // Access directly from store to avoid typing friction in mapState
      return (useMintsStore() as any).activeUnitLabel;
    },
    insufficientFunds: function (): boolean {
      if (
        !this.payInvoiceData.lnurlpay ||
        this.payInvoiceData.input.amount == null
      ) {
        return false;
      }
      return (
        this.activeBalance <
        this.payInvoiceData.input.amount * this.activeUnitCurrencyMultiplyer
      );
    },
    maxAmountFromBalance: function (): number {
      if (!this.payInvoiceData.lnurlpay) return Infinity;
      // Convert balance to the unit being displayed (e.g., sats -> BTC)
      const balanceInDisplayUnit =
        this.activeBalance / this.activeUnitCurrencyMultiplyer;
      return balanceInDisplayUnit;
    },
    invoiceStateKey: function (): string {
      if (this.isPaid) {
        return "paid";
      } else if (this.isPaying) {
        return "paying";
      } else if (
        this.payInvoiceData.meltQuote.response &&
        this.payInvoiceData.meltQuote.response.amount > 0
      ) {
        return "success";
      } else if (this.payInvoiceData.meltQuote.error != "") {
        return "error";
      } else {
        return "processing";
      }
    },
  },
  methods: {
    ...mapActions(useWalletStore, [
      "meltInvoiceData",
      "meltQuoteInvoiceData",
      "decodeRequest",
      "lnurlPaySecond",
    ]),
    ...mapActions(useMintsStore, ["toggleUnit"]),
    ...mapActions(useCameraStore, ["closeCamera", "showCamera"]),
    formatCurrency(value: number, currency: string, showBalance = false) {
      return useUiStore().formatCurrency(value, currency, showBalance);
    },
    canPay: function () {
      if (!this.payInvoiceData.invoice) return false;
      return (
        this.payInvoiceData.meltQuote.response.amount +
          this.payInvoiceData.meltQuote.response.fee_reserve <=
        this.totalUnitBalance
      );
    },
    closeParseDialog: function () {},
    decodeAndQuote: async function (request: string) {
      await this.decodeRequest(request);
    },
    pasteToParseDialog: async function () {
      console.log("pasteToParseDialog");
      const text = await useUiStore().pasteFromClipboard();
      if (text) {
        this.payInvoiceData.input.request = text.trim();
        await this.decodeAndQuote(text.trim());
      }
    },
    handleMeltButton: async function () {
      if (this.payInvoiceData.blocking) {
        throw new Error("already processing an invoice.");
      }
      this.isPaying = true;
      try {
        const result = await this.meltInvoiceData(true);
        const returnedChange = result.change.reduce(
          (acc: number, p: Proof) => acc + p.amount,
          0
        );
        this.payInvoiceData.fee_paid =
          this.payInvoiceData.meltQuote.response.fee_reserve - returnedChange;
        console.log("### fee_paid", this.payInvoiceData.fee_paid);
        // Success state and closing is handled by the watcher on payInvoiceData.show
      } catch (error) {
        // Error handling is done in the store, but we ensure isPaying is reset
        console.error("Payment error:", error);
        this.isPaying = false;
      }
    },
    openMultinutDialog: function () {
      this.payInvoiceData.show = false;
      (this.$refs as any).multinutDialog.openMultinutDialog();
    },
    handleReturnToPayDialog: function () {
      this.payInvoiceData.show = true;
    },
    handleLnurlPaySecond: async function () {
      // Hide keyboard before sending payment
      this.showNumericKeyboard = false;
      await this.lnurlPaySecond();
    },
  },
  created: function () {},
});
</script>

<style lang="scss" scoped>
.fixed-title-height {
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pay-fullscreen {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.bottom-panel {
  margin-top: auto;
  background: var(--q-color-grey-1);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.q-dialog__inner > div {
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
}

.qcard {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.cashub-nowrap {
  word-break: break-all;
  -webkit-hyphens: none;
  -moz-hyphens: none;
  hyphens: none;
  font-size: 0.9em;
  font-family: monospace;
}

.token-input {
  // rounded input border
  height: 180px;
  border-radius: 10px;
  border: 1px solid $grey-2;
  padding: 10px 20px;
  font-size: 14px;
  font-family: monospace;
  background-color: var(--q-background);
  color: var(--q-text);
  text-decoration: none !important;
  &:focus {
    border-color: $primary;
  }
  // hide inner border from q-input
  &::before {
    display: none;
  }
  &::after {
    display: none;
  }
  &:disabled {
    background-color: var(--q-background-disabled);
    color: var(--q-text-disabled);
  }
  &:hover {
    background-color: var(--q-background-hover);
    color: var(--q-text-hover);
  }
}

.scroll-container {
  overflow-y: auto;
  overflow-x: hidden;
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

.floating-close-btn {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

.amount-area {
  flex: 1;
  position: relative;
}

.keypad-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

.invoice-state-container {
  position: relative;
  min-height: 100px;
}

.invoice-state-content {
  width: 100%;
}

.slide-down-enter-active {
  transition: all 0.4s ease;
  z-index: 2;
}

.slide-down-leave-active {
  transition: all 0.4s ease;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
