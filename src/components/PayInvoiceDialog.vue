<template>
  <FlowDialog
    v-model="payInvoiceData.show"
    @hide="closeParseDialog"
    v-if="!camera.show"
  >
    <div class="column fit overflow-hidden pay-fullscreen">
      <!-- Header: centred title, the unit switch trailing -->
      <FullscreenDialogHeader @close="closeDialog">
        <template #title>
          <div>
            <q-item-label
              class="dialog-header"
              style="
                display: inline-block;
                white-space: normal;
                word-break: break-word;
              "
            >
              {{ dialogTitle }}
            </q-item-label>
          </div>
        </template>
        <template v-if="unitCanChange" #actions>
          <div class="row items-center no-wrap sheet-header-actions">
            <UnitToggle @toggle="toggleUnit()" />
          </div>
        </template>
      </FullscreenDialogHeader>

      <!-- Mint selection -->
      <FlowColumn class="q-px-md">
        <ChooseMint
          v-if="!showNoMintForMethodError"
          dense
          :filter-payment-method="payPaymentMethod"
          :filter-mint-operation="payMintOperation"
        />
      </FlowColumn>

      <!-- Content area -->
      <div class="col column items-center scroll-container invoice-scroll-area">
        <FlowColumn
          class="q-px-md q-mb-sm invoice-main-column full-width invoice-main-area"
        >
          <!-- INVOICE CONTENT -->
          <div v-if="payInvoiceData.invoice" class="invoice-content-fill">
            <div
              class="invoice-state-container"
              :class="{
                'invoice-state-container--centered': showInvoiceErrorState,
              }"
            >
              <transition name="slide-down">
                <div :key="invoiceStateKey" class="invoice-state-content">
                  <PaymentStatus
                    v-if="isPaid"
                    state="paid"
                    class="q-mb-md"
                    :label="$t('PayInvoiceDialog.invoice.paid')"
                    :caption="
                      payInvoiceData.fee_paid != null
                        ? `${$t(
                            'PayInvoiceDialog.invoice.fee'
                          )}: ${formatCurrency(
                            payInvoiceData.fee_paid,
                            activeUnit,
                            true
                          )}`
                        : ''
                    "
                    >{{ meltAmountLabel }}</PaymentStatus
                  >
                  <PaymentStatus
                    v-else-if="paymentInProgress"
                    state="pending"
                    class="q-mb-md"
                    :label="$t('PayInvoiceDialog.invoice.paying')"
                    >{{ meltAmountLabel }}</PaymentStatus
                  >
                  <div
                    v-else-if="
                      payInvoiceData.meltQuote.response &&
                      payInvoiceData.meltQuote.response.amount > 0
                    "
                    class="q-mb-md"
                  >
                    <!-- The amount as on every payment screen (owner 2026-11-01: the
                         confirm step is redesigned to match Receive): centred, its fiat
                         under it; the details follow in one table. -->
                    <AmountHeadline>{{
                      formatCurrency(
                        payInvoiceData.meltQuote.response.amount,
                        activeUnit,
                        true
                      )
                    }}</AmountHeadline>
                    <div
                      v-if="bitcoinPrice && activeUnit == 'sat'"
                      class="pay-fiat text-app-muted"
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
                    <div
                      v-if="showOnchainFeeOptions"
                      class="onchain-fee-options q-mt-lg"
                    >
                      <div class="text-subtitle2 text-app-muted q-mb-sm">
                        {{ $t("PayInvoiceDialog.onchain.choose_speed") }}
                      </div>
                      <div class="q-gutter-y-sm">
                        <div
                          v-for="option in onchainFeeOptions"
                          :key="option.fee_index"
                          class="fee-option-row"
                          :class="{
                            'fee-option-row--selected':
                              option.fee_index === selectedOnchainFeeIndex,
                          }"
                          @click="selectOnchainFeeOption(option)"
                        >
                          <div class="row items-center no-wrap">
                            <div class="col text-left">
                              <div class="text-weight-medium">
                                {{
                                  $t(
                                    "PayInvoiceDialog.onchain.blocks",
                                    option.estimated_blocks
                                  )
                                }}
                              </div>
                              <div class="text-caption text-app-muted">
                                {{
                                  $t(
                                    "PayInvoiceDialog.onchain.estimated_confirmation"
                                  )
                                }}
                              </div>
                            </div>
                            <div class="text-right q-mr-sm">
                              <div class="text-weight-bold">
                                {{
                                  formatCurrency(
                                    option.fee_reserve,
                                    activeUnit,
                                    true
                                  )
                                }}
                              </div>
                              <div class="text-caption text-app-muted">
                                {{ $t("PayInvoiceDialog.onchain.fee_reserve") }}
                              </div>
                            </div>
                            <!-- The standard radio, display only: the row takes the tap. -->
                            <q-radio
                              :model-value="
                                option.fee_index === selectedOnchainFeeIndex
                              "
                              :val="true"
                              color="primary"
                              dense
                              tabindex="-1"
                              aria-hidden="true"
                              style="pointer-events: none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    v-else-if="showInvoiceErrorState"
                    class="invoice-error-state"
                  >
                    <div class="text-h6 q-my-none">
                      {{ payInvoiceData.meltQuote.error }}
                    </div>
                  </div>
                  <div v-else-if="showAmountlessPaymentAmountEntry">
                    <p
                      v-if="payInvoiceData.invoice.description"
                      class="text-wrap q-mb-md"
                      style="max-width: 600px; font-size: 1.1rem"
                    >
                      <strong
                        >{{
                          $t("PayInvoiceDialog.invoice.memo.label")
                        }}:</strong
                      >
                      {{ payInvoiceData.invoice.description }}
                    </p>
                    <div
                      v-if="showAmountlessPaymentAmountKeyboard"
                      class="column items-center justify-center q-px-lg q-py-lg amount-area"
                    >
                      <AmountInputComponent
                        v-model="payInvoiceData.input.amount"
                        :enabled="true"
                        :muted="insufficientFundsForAmountlessPayment"
                        :max-amount="amountlessPaymentMaxAmountFromBalance"
                        @enter="handleAmountlessQuote"
                      />
                    </div>
                  </div>
                  <div v-else>
                    <div class="row">
                      <div class="col-12 text-h4 text-weight-bold q-mb-xs">
                        {{
                          $t("PayInvoiceDialog.invoice.processing_info_text")
                        }}
                        <PendingDots />
                      </div>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
            <div
              v-if="showBottomMeltQuoteInformation"
              class="invoice-details-bottom"
            >
              <MeltQuoteInformation
                :melt-quote="payInvoiceData.meltQuote.response"
                :mint-url="activeMintUrl"
                :show-amount="false"
                hide-status
                :memo="payInvoiceData.invoice.description || ''"
              />
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
                style="word-break: break-all"
              >
                <i18n-t
                  keypath="PayInvoiceDialog.lnurlpay.sending_to_lightning_address"
                >
                  <template v-slot:address>
                    <b>{{ payInvoiceData.lnurlpay.lightningAddress }}</b>
                  </template>
                </i18n-t>
              </p>
              <p
                v-else
                class="q-my-none text-h6 text-center"
                style="word-break: break-all"
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
              <q-separator class="q-my-sm"></q-separator>
              <div class="row" v-if="payInvoiceData.lnurlpay.description">
                <p class="col text-justify text-italic">
                  {{ payInvoiceData.lnurlpay.description }}
                </p>
                <p class="col-4 q-pl-md" v-if="payInvoiceData.lnurlpay.image">
                  <q-img :src="payInvoiceData.lnurlpay.image" />
                </p>
              </div>
              <!-- Comment input for fixed amount -->
              <FlowColumn
                v-if="payInvoiceData.lnurlpay.commentAllowed > 0"
                class="q-mt-md"
              >
                <q-input
                  outlined
                  v-model="payInvoiceData.input.comment"
                  :type="
                    payInvoiceData.lnurlpay.commentAllowed > 64
                      ? 'textarea'
                      : 'text'
                  "
                  :label="$t('PayInvoiceDialog.lnurlpay.inputs.comment.label')"
                  :maxlength="payInvoiceData.lnurlpay.commentAllowed"
                ></q-input>
              </FlowColumn>
            </div>

            <!-- Variable amount with AmountInputComponent -->
            <div v-else>
              <p
                v-if="payInvoiceData.lnurlpay.lightningAddress"
                class="q-my-none text-h6 text-center"
                style="word-break: break-all"
              >
                <i18n-t
                  keypath="PayInvoiceDialog.lnurlpay.sending_to_lightning_address"
                >
                  <template v-slot:address>
                    <b>{{ payInvoiceData.lnurlpay.lightningAddress }}</b>
                  </template>
                </i18n-t>
              </p>
              <p
                v-else
                class="q-my-none text-h6 text-center"
                style="word-break: break-all"
              >
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

              <div class="row" v-if="payInvoiceData.lnurlpay.description">
                <p class="col text-justify text-italic">
                  {{ payInvoiceData.lnurlpay.description }}
                </p>
                <p class="col-4 q-pl-md" v-if="payInvoiceData.lnurlpay.image">
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
                />
              </div>

              <!-- Comment input below amount -->
              <FlowColumn
                v-if="payInvoiceData.lnurlpay.commentAllowed > 0"
                class="q-mt-md"
              >
                <q-input
                  outlined
                  v-model="payInvoiceData.input.comment"
                  type="text"
                  :label="$t('PayInvoiceDialog.lnurlpay.inputs.comment.label')"
                  :maxlength="payInvoiceData.lnurlpay.commentAllowed"
                ></q-input>
              </FlowColumn>
            </div>
          </div>

          <!-- INPUT CONTENT -->
          <div v-else>
            <!-- One 16px gap under the mint picker (its own bottom inset); picker, field
                 and NFC button share the column's 16px edge. -->
            <ParseInputComponent
              v-if="!camera.show"
              v-model="payInvoiceData.input.request"
              test-id="payment-request-input"
              :placeholder="parseInputPlaceholder"
              :has-camera="hasCameraAvailable"
              :ndef-supported="false"
              @update:model-value="decodeAndQuote($event)"
              @paste="pasteToParseDialog"
              @scan="showCamera"
            />
          </div>
        </FlowColumn>
      </div>

      <!-- Bottom fixed pay action -->
      <FlowFooter
        v-if="
          payInvoiceData.invoice &&
          (hasMeltQuote || payInvoiceData.meltQuote.error != '')
        "
      >
        <!-- Close button when paid or error -->
        <template v-if="isPaid || payInvoiceData.meltQuote.error != ''">
          <q-btn
            class="full-width"
            unelevated
            color="primary"
            rounded
            @click="closeDialog"
            :label="$t('PayInvoiceDialog.invoice.actions.close.label')"
          />
        </template>
        <!-- Pay button when ready to pay -->
        <template
          v-else-if="
            enoughtotalUnitBalance ||
            (hasMultinutSupport && multinutEnabled) ||
            waitingForWallet ||
            paymentInProgress
          "
        >
          <q-btn
            class="full-width"
            unelevated
            color="primary"
            rounded
            data-testid="pay-payment-request"
            :disabled="
              payInvoiceData.blocking || waitingForWallet || paymentInProgress
            "
            @click="handleMeltButton"
            :label="paymentButtonLabel"
            :loading="waitingForWallet || paymentInProgress"
          >
            <template #loading
              ><BusyLabel
                ><span>{{ paymentButtonLabel }}</span></BusyLabel
              ></template
            >
          </q-btn>
          <q-btn
            v-if="hasMultinutSupport && multinutEnabled"
            class="full-width q-mt-sm"
            flat
            color="primary"
            rounded
            @click="openMultinutDialog"
            :label="$t('PayInvoiceDialog.multinut.label')"
          />
        </template>
        <!-- Balance too low -->
        <template v-else>
          <q-btn class="full-width" unelevated color="primary" rounded disabled>
            {{ $t("PayInvoiceDialog.invoice.balance_too_low_warning_text") }}
          </q-btn>
        </template>
      </FlowFooter>

      <!-- Bottom fixed amountless payment quote action -->
      <FlowFooter
        v-if="showAmountlessPaymentAmountKeyboard && payInvoiceData.invoice"
      >
        <template #above>
          <AmountKeypadPanel
            v-model="payInvoiceData.input.amount"
            @done="handleAmountlessQuote"
          />
        </template>
        <q-btn
          class="full-width"
          unelevated
          color="primary"
          rounded
          data-testid="quote-payment-request"
          @click="handleAmountlessQuote"
          :disabled="
            payInvoiceData.blocking ||
            payInvoiceData.input.amount == null ||
            payInvoiceData.input.amount <= 0 ||
            insufficientFundsForAmountlessPayment
          "
          :loading="payInvoiceData.blocking"
        >
          {{ $t("PayInvoiceDialog.quote.label") }}
          <template #loading
            ><BusyLabel>{{
              $t("PayInvoiceDialog.quote.label")
            }}</BusyLabel></template
          >
        </q-btn>
      </FlowFooter>

      <!-- Bottom fixed LNURL pay action -->
      <FlowFooter
        v-if="
          payInvoiceData.lnurlpay &&
          !payInvoiceData.invoice &&
          payInvoiceData.lnurlpay.maxSendable !=
            payInvoiceData.lnurlpay.minSendable
        "
      >
        <template #above>
          <AmountKeypadPanel
            v-if="showNumericKeyboard"
            v-model="payInvoiceData.input.amount"
            @done="handleLnurlPaySecond"
          />
          <!-- LNURL pay action below keyboard -->
        </template>
        <q-btn
          class="full-width"
          unelevated
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
          <template #loading
            ><BusyLabel>{{
              payInvoiceData.blocking
                ? $t("PayInvoiceDialog.lnurlpay.actions.send.in_progress")
                : $t("PayInvoiceDialog.lnurlpay.actions.send.label")
            }}</BusyLabel></template
          >
        </q-btn>
      </FlowFooter>

      <!-- Bottom fixed LNURL pay action (fixed amount, no keyboard) -->
      <FlowFooter
        v-if="
          payInvoiceData.lnurlpay &&
          !payInvoiceData.invoice &&
          payInvoiceData.lnurlpay.maxSendable ==
            payInvoiceData.lnurlpay.minSendable
        "
      >
        <q-btn
          class="full-width"
          unelevated
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
          <template #loading
            ><BusyLabel>{{
              payInvoiceData.blocking
                ? $t("PayInvoiceDialog.lnurlpay.actions.send.in_progress")
                : $t("PayInvoiceDialog.lnurlpay.actions.send.label")
            }}</BusyLabel></template
          >
        </q-btn>
      </FlowFooter>
    </div>
  </FlowDialog>

  <!-- Multinut Payment Dialog -->
  <MultinutPaymentDialog
    ref="multinutDialog"
    @return-to-pay-dialog="handleReturnToPayDialog"
  />
</template>
<script lang="ts">
import FlowColumn from "src/components/ui/FlowColumn.vue";
import PaymentStatus from "src/components/ui/PaymentStatus.vue";
import AmountHeadline from "src/components/ui/AmountHeadline.vue";
import FlowDialog from "src/components/ui/FlowDialog.vue";
import BusyLabel from "src/components/ui/BusyLabel.vue";
import FlowFooter from "src/components/ui/FlowFooter.vue";
import PendingDots from "src/components/ui/PendingDots.vue";
import UnitToggle from "src/components/ui/UnitToggle.vue";
import { defineComponent } from "vue";
import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";
import { useCameraStore } from "src/stores/camera";
import { useMintsStore, MintClass } from "src/stores/mints";
import type { StoredMint } from "src/stores/mints";
import { useSettingsStore } from "src/stores/settings";
import { usePriceStore } from "src/stores/price";
import { useProofsStore } from "src/stores/proofs";
import { mapActions, mapState, mapWritableState } from "pinia";
import ChooseMint from "components/ChooseMint.vue";
import MultinutPaymentDialog from "./MultinutPaymentDialog.vue";
import MeltQuoteInformation from "components/MeltQuoteInformation.vue";
import AmountKeypadPanel from "src/components/AmountKeypadPanel.vue";
import FullscreenDialogHeader from "src/components/ui/FullscreenDialogHeader.vue";
import AmountInputComponent from "components/AmountInputComponent.vue";
import ParseInputComponent from "components/ParseInputComponent.vue";
import { mintsSupportingPaymentMethod } from "src/js/mint-payment-methods";
import { PaymentMethod } from "src/stores/walletTypes";

import * as _ from "underscore";

declare const windowMixin: any;

export default defineComponent({
  name: "PayInvoiceDialog",
  mixins: [windowMixin],
  components: {
    AmountHeadline,
    FlowColumn,
    UnitToggle,
    PaymentStatus,
    FlowDialog,
    BusyLabel,
    FlowFooter,
    PendingDots,
    ChooseMint,
    MultinutPaymentDialog,
    MeltQuoteInformation,
    AmountKeypadPanel,
    FullscreenDialogHeader,
    AmountInputComponent,
    ParseInputComponent,
  },
  props: {},
  data: function () {
    return {
      isPaying: false as boolean,
      isPaid: false as boolean,
      waitingForWallet: false as boolean,
      autoCloseTimeout: null as ReturnType<typeof setTimeout> | null,
    };
  },
  watch: {
    activeMintUrl: async function () {
      if (
        this.payInvoiceData.show &&
        this.payInvoiceData.invoice &&
        !this.showAmountlessPaymentAmountEntry
      ) {
        await this.meltQuoteInvoiceData();
      }
    },
    activeUnit: async function () {
      if (
        this.payInvoiceData.show &&
        this.payInvoiceData.invoice &&
        !this.showAmountlessPaymentAmountEntry
      ) {
        await this.meltQuoteInvoiceData();
      }
    },
    showAmountlessPaymentAmountEntry: {
      handler: function (val) {
        if (val && this.payInvoiceData.meltQuote.error == "") {
          this.showNumericKeyboard = true;
        }
      },
      immediate: true,
    },
    "payInvoiceData.meltQuote.error": function (val) {
      if (val && this.showAmountlessPaymentAmountEntry) {
        this.showNumericKeyboard = false;
      }
    },
    "payInvoiceData.paying": function (val) {
      if (val) {
        this.waitingForWallet = false;
        this.isPaying = true;
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
        // A fresh open never inherits "paying" from the last payment: the previous dialog
        // can be closed while the wallet is still finishing (its toast already says Paid).
        if (val && !oldVal && !this.isPaid && !this.payInvoiceData.paying) {
          this.isPaying = false;
        }
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
          this.autoCloseTimeout = setTimeout(() => {
            if (this.isPaid) {
              // Only auto-close if still in paid state (user hasn't manually closed)
              this.isPaid = false;
              this.payInvoiceData.show = false;
            }
            this.autoCloseTimeout = null;
          }, 10000);
        } else if (!val) {
          // Normal close - reset states and clear any pending timeout
          if (this.autoCloseTimeout) {
            clearTimeout(this.autoCloseTimeout);
            this.autoCloseTimeout = null;
          }
          this.showNumericKeyboard = false;
          this.isPaying = false;
          this.isPaid = false;
        }
      },
    },
  },
  computed: {
    // The melt amount in the wallet's unit, or nothing before the quote arrives.
    meltAmountLabel(): string {
      const amount = this.payInvoiceData.meltQuote.response?.amount;
      return amount > 0
        ? this.formatCurrency(amount, this.activeUnit, true)
        : "";
    },
    ...mapState(useUiStore, ["tickerShort"]),
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
    showBottomMeltQuoteInformation: function (): boolean {
      return (
        this.showMeltQuoteInformation &&
        this.hasMeltQuote &&
        !this.isPaid &&
        !this.paymentInProgress
      );
    },
    showOnchainFeeOptions: function (): boolean {
      return this.isOnchainPay && this.onchainFeeOptions.length > 0;
    },
    onchainFeeOptions: function (): any[] {
      const options = this.payInvoiceData?.meltQuote?.response?.fee_options;
      return Array.isArray(options) ? options : [];
    },
    selectedOnchainFeeIndex: function (): number | null {
      const quote = this.payInvoiceData?.meltQuote?.response;
      return (
        quote?.selected_fee_index ??
        this.onchainFeeOptions[0]?.fee_index ??
        null
      );
    },
    hasMeltQuote: function (): boolean {
      const quote = this.payInvoiceData?.meltQuote?.response;
      return Boolean(quote?.quote) && quote.amount > 0;
    },
    payPaymentMethod: function (): PaymentMethod | null {
      if (!this.payInvoiceData?.invoice) return null;
      if (this.payInvoiceData.invoice.onchain) {
        return PaymentMethod.Onchain;
      }
      if (this.payInvoiceData.invoice.bolt12) {
        return PaymentMethod.Bolt12;
      }
      return PaymentMethod.Bolt11;
    },
    dialogTitle: function (): string {
      if (
        this.payPaymentMethod === PaymentMethod.Onchain ||
        this.payInvoiceData.paymentMethod === PaymentMethod.Onchain
      ) {
        return this.$t("PayInvoiceDialog.onchain.title") as string;
      }
      if (this.payPaymentMethod === PaymentMethod.Bolt12) {
        return this.$t("PayInvoiceDialog.input_data.title_bolt12");
      }
      return this.$t("PayInvoiceDialog.input_data.title");
    },
    parseInputPlaceholder: function (): string {
      if (this.payInvoiceData.paymentMethod === PaymentMethod.Onchain) {
        return this.$t(
          "PayInvoiceDialog.onchain.address_placeholder"
        ) as string;
      }
      return this.$t("ParseInputComponent.placeholder.pay");
    },
    payMintOperation: function (): "mint" | "melt" {
      return "melt";
    },
    hasMintForPayMethod: function (): boolean {
      if (!this.payPaymentMethod) return true;
      return (
        mintsSupportingPaymentMethod(
          this.mints as StoredMint[],
          this.payPaymentMethod,
          this.payMintOperation,
          this.activeUnit
        ).length > 0
      );
    },
    showNoMintForMethodError: function (): boolean {
      return this.payPaymentMethod != null && !this.hasMintForPayMethod;
    },
    paymentInProgress: function (): boolean {
      return Boolean(this.isPaying || this.payInvoiceData?.paying);
    },
    paymentButtonLabel: function (): string {
      if (this.waitingForWallet) {
        return this.$t(
          "PayInvoiceDialog.invoice.actions.pay.waiting_for_wallet"
        ) as string;
      }
      if (this.paymentInProgress) {
        return this.$t(
          "PayInvoiceDialog.invoice.actions.pay.in_progress"
        ) as string;
      }
      return this.$t("PayInvoiceDialog.invoice.actions.pay.label") as string;
    },
    isBolt12Pay: function (): boolean {
      return this.payPaymentMethod === PaymentMethod.Bolt12;
    },
    isOnchainPay: function (): boolean {
      return this.payPaymentMethod === PaymentMethod.Onchain;
    },
    showAmountlessPaymentAmountEntry: function (): boolean {
      return (
        (this.isBolt12Pay || this.isOnchainPay) &&
        this.hasMintForPayMethod &&
        !this.hasMeltQuote &&
        !this.payInvoiceData.blocking &&
        !this.isPaid &&
        !this.paymentInProgress &&
        this.payInvoiceData.meltQuote.error == ""
      );
    },
    showInvoiceErrorState: function (): boolean {
      if (
        !this.payInvoiceData.invoice ||
        this.isPaid ||
        this.paymentInProgress ||
        this.hasMeltQuote
      ) {
        return false;
      }
      return this.payInvoiceData.meltQuote.error != "";
    },
    showAmountlessPaymentAmountKeyboard: function (): boolean {
      return (
        this.showAmountlessPaymentAmountEntry &&
        this.payInvoiceData.meltQuote.error == ""
      );
    },
    enoughtotalUnitBalance: function () {
      return (
        this.hasMeltQuote &&
        this.activeBalance >=
          this.payInvoiceData.meltQuote.response.amount +
            this.payInvoiceData.meltQuote.response.fee_reserve
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
    // The unit switch sits in the header while a quote or an amount is on screen, the steps
    // where switching the unit re-quotes or re-enters it (not once paying or paid).
    unitCanChange: function (): boolean {
      const data = this.payInvoiceData;
      if (data.invoice) {
        if (this.isPaid || this.paymentInProgress) return false;
        if (data.meltQuote.response?.amount > 0) return true;
        return (
          !!this.showAmountlessPaymentAmountEntry &&
          !!this.showAmountlessPaymentAmountKeyboard
        );
      }
      return (
        !!data.lnurlpay &&
        data.lnurlpay.maxSendable != data.lnurlpay.minSendable
      );
    },
    insufficientFundsForAmountlessPayment: function (): boolean {
      if (
        !this.showAmountlessPaymentAmountEntry ||
        this.payInvoiceData.input.amount == null
      ) {
        return false;
      }
      return (
        this.activeBalance <
        this.payInvoiceData.input.amount * this.activeUnitCurrencyMultiplyer
      );
    },
    amountlessPaymentMaxAmountFromBalance: function (): number {
      return this.activeBalance / this.activeUnitCurrencyMultiplyer;
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
      } else if (this.paymentInProgress) {
        return "paying";
      } else if (this.hasMeltQuote) {
        return "success";
      } else if (this.showInvoiceErrorState) {
        return "error";
      } else if (this.showAmountlessPaymentAmountEntry) {
        return "amount";
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
    canPay: function () {
      if (!this.payInvoiceData.invoice) return false;
      return (
        this.payInvoiceData.meltQuote.response.amount +
          this.payInvoiceData.meltQuote.response.fee_reserve <=
        this.totalUnitBalance
      );
    },
    closeParseDialog: function () {},
    closeDialog: function () {
      // Clear any pending auto-close timeout
      if (this.autoCloseTimeout) {
        clearTimeout(this.autoCloseTimeout);
        this.autoCloseTimeout = null;
      }
      this.payInvoiceData.show = false;
      this.isPaying = false;
      this.isPaid = false;
    },
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
      if (
        this.payInvoiceData.blocking ||
        this.waitingForWallet ||
        this.paymentInProgress
      ) {
        throw new Error("already processing an invoice.");
      }
      if (
        !this.enoughtotalUnitBalance &&
        this.hasMultinutSupport &&
        this.multinutEnabled
      ) {
        this.openMultinutDialog();
        return;
      }
      const uiStore = useUiStore();
      this.waitingForWallet = true;
      uiStore.beginForegroundPayment();
      try {
        const result = await this.meltInvoiceData(true, "foreground");
        const returnedChange = useProofsStore().sumProofs(result?.change ?? []);
        this.payInvoiceData.fee_paid =
          this.payInvoiceData.meltQuote.response.fee_reserve - returnedChange;
        console.log("### fee_paid", this.payInvoiceData.fee_paid);
        // Success state and closing is handled by the watcher on payInvoiceData.show
      } catch (error) {
        // Error handling is done in the store, but we ensure isPaying is reset
        console.error("Payment error:", error);
        this.isPaying = false;
      } finally {
        this.waitingForWallet = false;
        uiStore.endForegroundPayment();
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
    handleAmountlessQuote: async function () {
      if (
        this.payInvoiceData.blocking ||
        this.payInvoiceData.input.amount == null ||
        this.payInvoiceData.input.amount <= 0 ||
        this.insufficientFundsForAmountlessPayment
      ) {
        return;
      }
      await this.meltQuoteInvoiceData();
      if (this.isOnchainPay && this.onchainFeeOptions.length) {
        this.selectOnchainFeeOption(this.onchainFeeOptions[0]);
      }
      if (this.hasMeltQuote || this.payInvoiceData.meltQuote.error != "") {
        this.showNumericKeyboard = false;
      }
    },
    selectOnchainFeeOption: function (option: any) {
      const quote = this.payInvoiceData?.meltQuote?.response;
      if (!quote || option == null) return;
      quote.selected_fee_index = option.fee_index;
      quote.fee_reserve = option.fee_reserve;
    },
  },
  created: function () {},
});
</script>

<style lang="scss" scoped>
.scroll-container {
  overflow-y: auto;
  overflow-x: hidden;
}

.invoice-scroll-area {
  flex: 1;
  min-height: 0;
}

.invoice-main-area {
  flex: 1;
  width: 100%;
  min-height: 0;
  align-items: stretch;
}

.invoice-main-column {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.invoice-content-fill {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.invoice-error-state {
  text-align: center;
  padding: 0 16px;
  width: 100%;
}

/* The details follow the amount, as on Receive; they no longer sink to the footer across an
   empty gap (owner 2026-11-01). */
.invoice-details-bottom {
  width: 100%;
  padding-top: 8px;
  padding-bottom: clamp(20px, 4vh, 36px);
}
.pay-fiat {
  font-size: 16px;
  margin-top: 4px;
  text-align: center;
}

.invoice-state-container {
  position: relative;
  min-height: 100px;

  &--centered {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}

.invoice-state-content {
  width: 100%;
}

.onchain-fee-options {
  width: 100%;
}

.onchain-fee-options .text-subtitle2 {
  margin-bottom: 12px;
}

.fee-option-row {
  background: var(--app-card-fill);
  border: 1px solid var(--app-card-edge);
  border-radius: var(--app-radius-lg);
  padding: 12px 14px;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.fee-option-row--selected {
  background: var(--app-card-fill-active);
  border-color: var(--app-card-edge-active);
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
