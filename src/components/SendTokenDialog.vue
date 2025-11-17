<template>
  <q-dialog
    v-model="showSendTokens"
    maximized
    backdrop-filter="blur(2px) brightness(60%)"
    transition-show="fade"
    transition-hide="fade"
    no-backdrop-dismiss
    @keydown.esc="showSendTokens = false"
  >
    <q-card class="q-pa-none q-pt-none qcard">
      <!--  enter send data (full-screen) -->
      <div
        v-if="!sendData.tokens"
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
              {{ $t("SendTokenDialog.title") }}
            </q-item-label>
          </div>
          <div
            class="row items-center q-gutter-sm"
            style="position: absolute; right: 16px"
          >
            <q-btn
              flat
              dense
              color="primary"
              round
              @click="showLockInput = !showLockInput"
            >
              <LockIcon size="1.2em" />
              <q-tooltip>{{
                $t("SendTokenDialog.actions.lock.label")
              }}</q-tooltip>
            </q-btn>
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

        <!-- Payment request info -->
        <div v-if="sendData.paymentRequest" class="row justify-center q-pt-sm">
          <div
            class="col-12 col-sm-11 col-md-8 q-px-lg"
            style="max-width: 600px"
          >
            <PaymentRequestInfo :request="sendData.paymentRequest" />
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
          <!-- Floating P2PK input overlay -->
          <transition
            appear
            enter-active-class="animated fadeIn"
            leave-active-class="animated fadeOut"
          >
            <div v-if="showLockInput" class="p2pk-overlay">
              <div class="row justify-center">
                <div class="col-12 q-px-lg" style="max-width: 600px">
                  <div class="row items-center">
                    <div :class="!sendData.p2pkPubkey ? 'col-8' : 'col-12'">
                      <q-input
                        v-model="sendData.p2pkPubkey"
                        :label="
                          sendData.p2pkPubkey && !isLocked
                            ? $t(
                                'SendTokenDialog.inputs.p2pk_pubkey.label_invalid'
                              )
                            : $t('SendTokenDialog.inputs.p2pk_pubkey.label')
                        "
                        outlined
                        clearable
                        :color="sendData.p2pkPubkey && !isLocked ? 'red' : ''"
                        @keyup.enter="lockTokens"
                      />
                    </div>
                    <div class="col-4 q-pl-sm" v-if="!sendData.p2pkPubkey">
                      <q-btn
                        unelevated
                        v-if="canPasteFromClipboard"
                        icon="content_paste"
                        @click="pasteToP2PKField"
                      >
                        <q-tooltip>{{
                          $t(
                            "SendTokenDialog.actions.paste_p2pk_pubkey.tooltip_text"
                          )
                        }}</q-tooltip>
                      </q-btn>
                      <q-btn
                        align="center"
                        flat
                        outline
                        color="primary"
                        round
                        @click="showCamera"
                      >
                        <ScanIcon size="1.5em" />
                      </q-btn>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
          <AmountInputComponent
            v-if="!showLockInput"
            v-model="sendData.amount"
            :muted="insufficientFunds"
            :enabled="!sendData.tokens"
            :show-fiat-conversion="!insufficientFunds"
            @enter="sendTokens"
            @fiat-mode-changed="fiatKeyboardMode = $event"
          >
            <template #overlay>
              <q-badge
                v-if="isLocked && !showLockInput"
                rounded
                color="positive"
                class="locked-badge"
              >
                <LockIcon
                  size="1.3em"
                  style="margin-right: 6px; margin-bottom: 4px"
                />
                <span
                  class="text-caption text-weight-medium"
                  style="font-size: 14px"
                  >locked</span
                >
              </q-badge>
              <div
                v-if="insufficientFunds && sendData.amount"
                outline
                rounded
                size="md"
                class="amount-warning-badge"
              >
                <transition name="wobble" mode="out-in" appear>
                  <span
                    v-if="insufficientFunds && sendData.amount"
                    :key="'warn-text-' + String(sendData.amount ?? '')"
                    class="text-caption text-weight-medium text-grey-6"
                    style="font-size: 16px; display: inline-block"
                  >
                    {{
                      $t(
                        "PayInvoiceDialog.invoice.balance_too_low_warning_text"
                      )
                    }}
                  </span>
                </transition>
              </div>
            </template>
          </AmountInputComponent>
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
              :model-value="String(sendData.amount ?? 0)"
              @update:modelValue="(val: string | number) => (sendData.amount = Number(val))"
              @done="sendTokens"
            />
          </div>
          <!-- Send action below keyboard -->
          <div class="row justify-center q-pb-lg q-pt-sm">
            <div
              class="col-12 col-sm-11 col-md-8 q-px-md"
              style="max-width: 600px; max-height: 60px"
            >
              <SendPaymentRequest
                v-if="sendData.paymentRequest"
                :button-label="$t('SendTokenDialog.actions.pay.label')"
                :disable="paymentRequestButtonDisabled"
                :show-details="false"
                :full-width="true"
                :button-rounded="true"
                :button-dense="false"
                :button-unelevated="true"
                button-size="lg"
                button-color="primary"
                :button-class="[]"
                :prepare-token="preparePaymentRequestTokens"
                @success="handlePaymentRequestSuccess"
              />
              <q-btn
                v-else
                class="full-width"
                unelevated
                size="lg"
                :disable="
                  sendData.amount == null ||
                  sendData.amount <= 0 ||
                  insufficientFunds ||
                  (sendData.p2pkPubkey != '' &&
                    !isValidPubkey(sendData.p2pkPubkey))
                "
                @click="sendTokens"
                color="primary"
                rounded
                type="submit"
                :loading="globalMutexLock"
              >
                {{ $t("SendTokenDialog.actions.send.label") }}
                <template v-slot:loading>
                  <q-spinner />
                </template>
              </q-btn>
            </div>
          </div>
        </div>
      </div>

      <!-- show ecash details -->
      <div v-else class="text-center">
        <DisplayTokenComponent />
      </div>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useSendTokensStore } from "src/stores/sendTokensStore";
import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";
import { useProofsStore } from "src/stores/proofs";
import { useMintsStore } from "src/stores/mints";
import { useTokensStore } from "src/stores/tokens";
import { getShortUrl } from "src/js/wallet-helpers";
import { useSettingsStore } from "src/stores/settings";
import { useWorkersStore } from "src/stores/workers";
import { usePriceStore } from "src/stores/price";
import { useCameraStore } from "src/stores/camera";
import { useP2PKStore } from "src/stores/p2pk";
import { mapActions, mapState, mapWritableState } from "pinia";
import ChooseMint from "components/ChooseMint.vue";
import NumericKeyboard from "components/NumericKeyboard.vue";
import DisplayTokenComponent from "components/DisplayTokenComponent.vue";
import AmountInputComponent from "components/AmountInputComponent.vue";
import SendPaymentRequest from "components/SendPaymentRequest.vue";
import PaymentRequestInfo from "components/PaymentRequestInfo.vue";
import {
  ChevronLeft as ChevronLeftIcon,
  Clipboard as ClipboardIcon,
  FileText as FileTextIcon,
  Lock as LockIcon,
  Scan as ScanIcon,
} from "lucide-vue-next";
declare const windowMixin: any;
export default defineComponent({
  name: "SendTokenDialog",
  mixins: [windowMixin],
  components: {
    ChooseMint,
    NumericKeyboard,
    DisplayTokenComponent,
    AmountInputComponent,
    SendPaymentRequest,
    PaymentRequestInfo,
    ScanIcon,
    LockIcon,
  },
  props: {},
  data: function () {
    return {
      fiatKeyboardMode: false as boolean,
    };
  },
  computed: {
    ...mapWritableState(useSendTokensStore, [
      "showSendTokens",
      "showLockInput",
      "sendData",
    ]),
    ...mapWritableState(useCameraStore, ["camera", "hasCamera"]),
    ...mapState(useUiStore, [
      "tickerShort",
      "canPasteFromClipboard",
      "globalMutexLock",
      "ndefSupported",
      "webShareSupported",
    ]),
    ...mapWritableState(useUiStore, ["showNumericKeyboard"]),
    ...mapState(useMintsStore, [
      "mints",
      "activeProofs",
      "activeUnit",
      "activeUnitLabel",
      "activeUnitCurrencyMultiplyer",
      "activeMintUrl",
      "activeBalance",
    ]),
    ...mapState(useSettingsStore, [
      "checkSentTokens",
      "includeFeesInSendAmount",
      "nfcEncoding",
      "useNumericKeyboard",
    ]),
    ...mapState(usePriceStore, [
      "bitcoinPrice",
      "bitcoinPrices",
      "currentCurrencyPrice",
    ]),
    ...mapState(useSettingsStore, ["bitcoinPriceCurrency"]),
    ...mapState(useWorkersStore, ["tokenWorkerRunning"]),
    insufficientFunds: function (): boolean {
      if (this.sendData.amount == null) return false;
      return (
        this.activeBalance <
        this.sendData.amount * this.activeUnitCurrencyMultiplyer
      );
    },
    // canSpendOffline: function (): boolean {
    //   if (!this.sendData.amount) {
    //     return false;
    //   }
    //   // check if entered amount is the same as the result of coinSelect(spendableProofs(activeProofs), amount)
    //   try {
    //     let spendableProofs = this.spendableProofs(
    //       this.activeProofs,
    //       this.sendData.amount * this.activeUnitCurrencyMultiplyer
    //     );
    //     const mintWallet = useWalletStore().wallet;
    //     let selectedProofs = this.coinSelect(
    //       spendableProofs,
    //       mintWallet,
    //       this.sendData.amount * this.activeUnitCurrencyMultiplyer,
    //       this.includeFeesInSendAmount
    //     );
    //     const feesToAdd = this.includeFeesInSendAmount
    //       ? this.getFeesForProofs(selectedProofs)
    //       : 0;
    //     const sumSelectedProofs = selectedProofs
    //       .flat()
    //       .reduce((sum: number, el: any) => (sum += el.amount), 0);
    //     return (
    //       sumSelectedProofs ==
    //       this.sendData.amount * this.activeUnitCurrencyMultiplyer + feesToAdd
    //     );
    //   } catch (error: any) {
    //     console.error(error);
    //     return false;
    //   }
    // },
    isLocked: function (): boolean {
      return Boolean(
        this.sendData.p2pkPubkey != "" &&
          this.isValidPubkey(this.sendData.p2pkPubkey)
      );
    },
    paymentRequestButtonDisabled(): boolean {
      if (!this.sendData.paymentRequest) {
        return true;
      }
      if (
        this.sendData.amount == null ||
        this.sendData.amount <= 0 ||
        this.insufficientFunds
      ) {
        return true;
      }
      if (this.globalMutexLock) {
        return true;
      }
      return false;
    },
  },
  watch: {
    showSendTokens: function (val) {
      if (val) {
        this.$nextTick(() => {
          // if we're entering the amount etc, show the keyboard
          if (!this.sendData.tokensBase64.length) {
            this.showNumericKeyboard = true;
          } else {
            this.showNumericKeyboard = false;
          }
        });

        // if we open the dialog from the history, let's check the
        if (
          this.sendData.historyToken &&
          this.sendData.historyToken.amount < 0 &&
          this.sendData.historyToken.status === "pending"
        ) {
          if (!this.checkSentTokens) {
            console.log(
              "settingsStore.checkSentTokens is disabled, skipping token check"
            );
            return;
          }
          const unspent = this.checkTokenSpendable(
            this.sendData.historyToken,
            false
          );
          if (!unspent) {
            this.sendData.historyToken.status = "paid";
          }
        }
      } else {
        clearInterval(this.qrInterval);
        this.sendData.data = "";
        this.sendData.tokensBase64 = "";
        this.sendData.historyToken = null;
        this.sendData.paymentRequest = null;
      }
    },
  },
  methods: {
    ...mapActions(useWorkersStore, ["clearAllWorkers"]),
    ...mapActions(useWalletStore, [
      "send",
      "sendToLock",
      "coinSelect",
      "spendableProofs",
      "getFeesForProofs",
      "onTokenPaid",
      "mintWallet",
      "checkTokenSpendable",
    ]),
    ...mapActions(useProofsStore, ["serializeProofs"]),
    ...mapActions(useTokensStore, [
      "addPendingToken",
      "setTokenPaid",
      "deleteToken",
    ]),
    ...mapActions(useP2PKStore, ["isValidPubkey", "maybeConvertNpub"]),
    ...mapActions(useCameraStore, ["closeCamera", "showCamera"]),
    ...mapActions(useMintsStore, ["toggleUnit"]),
    handlePaymentRequestSuccess: function () {
      this.showSendTokens = false;
    },
    preparePaymentRequestTokens: async function () {
      if (!this.sendData.paymentRequest) {
        return undefined;
      }
      if (this.sendData.tokensBase64) {
        return this.sendData.tokensBase64;
      }
      if (this.sendData.amount == null || this.sendData.amount <= 0) {
        throw new Error(
          this.$t("SendTokenDialog.errors.amount_required") as string
        );
      }
      if (this.insufficientFunds) {
        throw new Error(
          this.$t(
            "PayInvoiceDialog.invoice.balance_too_low_warning_text"
          ) as string
        );
      }
      const sendAmount = Math.floor(
        this.sendData.amount * this.activeUnitCurrencyMultiplyer
      );
      const mintWallet = this.mintWallet(this.activeMintUrl, this.activeUnit);
      const { sendProofs } = await this.send(
        this.activeProofs,
        mintWallet,
        sendAmount,
        true,
        this.includeFeesInSendAmount
      );
      const serialized = this.serializeProofs(sendProofs);
      if (!serialized) {
        throw new Error(
          this.$t("SendTokenDialog.errors.serialization_failed") as string
        );
      }
      this.sendData.tokens = "";
      this.sendData.tokensBase64 = serialized;
      this.sendData.historyAmount = -sendAmount;
      const historyToken = {
        amount: -sendAmount,
        token: serialized,
        unit: this.activeUnit,
        mint: this.activeMintUrl,
        paymentRequest: this.sendData.paymentRequest,
        status: "pending",
      };
      if (!this.sendData.historyToken) {
        const _id = this.addPendingToken(historyToken);
        (historyToken as any).id = _id;
        if (!this.g.offline) {
          this.onTokenPaid(historyToken);
        }
      }
      this.sendData.historyToken = historyToken as any;
      return serialized;
    },
    lockTokens: async function () {
      if (!this.sendData.amount) {
        throw new Error("Amount is required");
      }
      let sendAmount = Math.floor(
        this.sendData.amount * this.activeUnitCurrencyMultiplyer
      );
      try {
        // keep firstProofs, send scndProofs and delete them (invalidate=true)
        const mintWallet = this.mintWallet(this.activeMintUrl, this.activeUnit);
        let { _, sendProofs } = await this.sendToLock(
          this.activeProofs,
          mintWallet,
          sendAmount,
          this.sendData.p2pkPubkey
        );
        // update UI
        this.sendData.tokens = sendProofs;

        this.sendData.tokensBase64 = this.serializeProofs(sendProofs);
        const historyToken = {
          amount: -this.sendData.amount,
          token: this.sendData.tokensBase64,
          unit: this.activeUnit,
          mint: this.activeMintUrl,
        };
        const _id = this.addPendingToken(historyToken as any);
        (historyToken as any).id = _id;
        this.sendData.historyToken = historyToken as any;

        if (!this.g.offline) {
          this.onTokenPaid(historyToken);
        }
      } catch (error: any) {
        console.error(error);
      }
    },
    sendTokens: async function () {
      /*
      calls send, displays token and kicks off the spendableWorker
      */
      this.sendData.p2pkPubkey = this.maybeConvertNpub(
        this.sendData.p2pkPubkey
      );
      if (
        this.sendData.p2pkPubkey &&
        this.isValidPubkey(this.sendData.p2pkPubkey)
      ) {
        await this.lockTokens();
        return;
      }

      try {
        let sendAmount = Math.floor(
          this.sendData.amount * this.activeUnitCurrencyMultiplyer
        );
        const mintWallet = this.mintWallet(this.activeMintUrl, this.activeUnit);
        // keep firstProofs, send scndProofs and delete them (invalidate=true)
        let { _, sendProofs } = await this.send(
          this.activeProofs,
          mintWallet,
          sendAmount,
          true,
          this.includeFeesInSendAmount
        );

        // update UI
        this.sendData.tokens = sendProofs;
        this.sendData.tokensBase64 = this.serializeProofs(sendProofs);
        this.sendData.historyAmount =
          -this.sendData.amount * this.activeUnitCurrencyMultiplyer;

        const historyToken = {
          amount: -sendAmount,
          token: this.sendData.tokensBase64,
          unit: this.activeUnit,
          mint: this.activeMintUrl,
          paymentRequest: this.sendData.paymentRequest,
          status: "pending",
        };
        const _id = this.addPendingToken(historyToken as any);
        (historyToken as any).id = _id;
        this.sendData.historyToken = historyToken as any;

        if (!this.g.offline) {
          this.onTokenPaid(historyToken);
        }
      } catch (error: any) {
        console.error(error);
      }
    },
    pasteToP2PKField: async function () {
      console.log("pasteToParseDialog");
      const text = await useUiStore().pasteFromClipboard();
      this.sendData.p2pkPubkey = text.trim();
    },
    shareToken: async function () {
      if (!this.webShareSupported) {
        console.log("Web Share API not supported");
        return;
      }

      const shareData = {
        text: `cashu:${this.sendData.tokensBase64}`,
      };

      try {
        await navigator.share(shareData);
        console.log("Token shared successfully");
      } catch (error: any) {
        if ((error as any).name !== "AbortError") {
          console.error("Error sharing token:", error);
        }
      }
    },
  },
});
</script>
<style scoped>
.wobble-enter-active {
  animation: wobble-keyframes 600ms ease-out;
  transform-origin: center;
  will-change: transform;
}
.wobble-leave-active {
  animation: none !important;
}
@keyframes wobble-keyframes {
  0% {
    transform: translateX(0) rotate(0deg);
  }
  15% {
    transform: translateX(-8px) rotate(-3deg);
  }
  30% {
    transform: translateX(8px) rotate(3deg);
  }
  45% {
    transform: translateX(-6px) rotate(-2deg);
  }
  60% {
    transform: translateX(6px) rotate(2deg);
  }
  75% {
    transform: translateX(-3px) rotate(-1deg);
  }
  100% {
    transform: translateX(0) rotate(0deg);
  }
}
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
  position: relative;
}
.amount-container {
  position: relative;
  display: inline-block;
  max-width: 90vw;
}
.amount-display {
  font-size: clamp(56px, 11vw, 80px);
  line-height: 1.1;
  white-space: nowrap;
  max-width: 100%;
}
.fiat-display {
  font-size: 14px;
}
.p2pk-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 3;
}
.locked-badge {
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
}
.amount-warning-badge {
  position: absolute;
  top: calc(100% - 20px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  pointer-events: none;
  font-size: 16px;
  white-space: nowrap;
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
