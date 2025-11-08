<template>
  <q-dialog
    v-model="showSendTokens"
    maximized
    backdrop-filter="blur(2px) brightness(60%)"
    transition-show="fade"
    transition-hide="fade"
    no-backdrop-dismiss
  >
    <q-card class="q-pa-none q-pt-none qcard">
      <!--  enter send data (full-screen) -->
      <div
        v-if="!sendData.tokens"
        class="column fit send-fullscreen"
        :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
      >
        <!-- Header -->
        <div class="row items-center justify-between q-pa-md">
          <q-btn v-close-popup flat round icon="close" color="grey" />
          <div class="row items-center q-gutter-sm">
            <q-badge
              v-if="canSpendOffline && !sendData.p2pkPubkey && !showLockInput"
              outline
              rounded
              color="grey"
              size="md"
            >
              <q-icon name="check" color="primary" size="xs" class="q-mr-xs" />
              <span class="text-caption text-weight-medium">{{
                $t("SendTokenDialog.badge_offline_text")
              }}</span>
            </q-badge>
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
                          sendData.p2pkPubkey &&
                          !isValidPubkey(sendData.p2pkPubkey)
                            ? $t(
                                'SendTokenDialog.inputs.p2pk_pubkey.label_invalid'
                              )
                            : $t('SendTokenDialog.inputs.p2pk_pubkey.label')
                        "
                        outlined
                        clearable
                        :color="
                          sendData.p2pkPubkey &&
                          !isValidPubkey(sendData.p2pkPubkey)
                            ? 'red'
                            : ''
                        "
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
          <div class="amount-container">
            <q-badge
              v-if="isLocked"
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
              class="amount-display text-weight-bold text-center"
              :class="{ 'text-grey-6': insufficientFunds }"
            >
              {{ formattedAmountDisplay }}
            </div>
            <q-badge
              v-if="insufficientFunds && sendData.amount"
              outline
              rounded
              color="grey"
              size="md"
              class="amount-warning-badge"
            >
              <span class="text-caption text-weight-medium">
                {{
                  $t("PayInvoiceDialog.invoice.balance_too_low_warning_text")
                }}
              </span>
            </q-badge>
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
              :model-value="String(sendData.amount ?? 0)"
              @update:modelValue="(val: string | number) => (sendData.amount = Number(val))"
              @done="sendTokens"
            />
          </div>
          <!-- Send action below keyboard -->
          <div class="row justify-center q-pb-md q-pt-sm">
            <div
              class="col-12 col-sm-11 col-md-8 q-px-md"
              style="max-width: 600px"
            >
              <q-btn
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
                  <q-spinner-hourglass />
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
import {
  ChevronLeft as ChevronLeftIcon,
  Clipboard as ClipboardIcon,
  FileText as FileTextIcon,
  Lock as LockIcon,
  Scan as ScanIcon,
} from "lucide-vue-next";
export default defineComponent({
  name: "SendTokenDialog",
  mixins: [windowMixin],
  components: {
    ChooseMint,
    NumericKeyboard,
    DisplayTokenComponent,
    ScanIcon,
    LockIcon,
  },
  props: {},
  data: function () {
    return {
      amountEditBuffer: "",
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
    insufficientFunds: function () {
      if (this.sendData.amount == null) return false;
      return this.activeBalance < this.sendData.amount;
    },
    canSpendOffline: function () {
      if (!this.sendData.amount) {
        return false;
      }
      // check if entered amount is the same as the result of coinSelect(spendableProofs(activeProofs), amount)
      let spendableProofs = this.spendableProofs(this.activeProofs);
      const mintWallet = useWalletStore().wallet;
      let selectedProofs = this.coinSelect(
        spendableProofs,
        mintWallet,
        this.sendData.amount * this.activeUnitCurrencyMultiplyer,
        this.includeFeesInSendAmount
      );
      const feesToAdd = this.includeFeesInSendAmount
        ? this.getFeesForProofs(selectedProofs)
        : 0;
      const sumSelectedProofs = selectedProofs
        .flat()
        .reduce((sum: number, el: any) => (sum += el.amount), 0);
      return (
        sumSelectedProofs ==
        this.sendData.amount * this.activeUnitCurrencyMultiplyer + feesToAdd
      );
    },
    isLocked: function () {
      return (
        this.sendData.p2pkPubkey != "" &&
        this.isValidPubkey(this.sendData.p2pkPubkey)
      );
    },
    secondaryFiatDisplay: function () {
      if (
        !this.sendData.amount ||
        !this.bitcoinPrice ||
        this.activeUnit !== "sat"
      ) {
        return "";
      }
      const fiat = this.formatCurrency(
        (this.currentCurrencyPrice / 100000000) *
          this.sendData.amount *
          this.activeUnitCurrencyMultiplyer,
        this.bitcoinPriceCurrency,
        true
      );
      return `(${fiat})`;
    },
    formattedAmountDisplay: function () {
      const amount = this.sendData.amount || 0;
      return this.formatCurrency(
        amount * this.activeUnitCurrencyMultiplyer,
        this.activeUnit
      );
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
          // initialize keyboard editing buffer from current amount
          this.amountEditBuffer =
            this.sendData.amount == null ? "0" : String(this.sendData.amount);
          // attach keyboard listener for desktop editing
          window.addEventListener("keydown", this.onGlobalAmountKeydown);
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
        // detach keyboard listener
        window.removeEventListener("keydown", this.onGlobalAmountKeydown);
        this.amountEditBuffer = "";
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
    onGlobalAmountKeydown: function (e: KeyboardEvent) {
      // only handle when amount entry screen is shown
      if (this.sendData.tokens) return;
      // ignore if an input/textarea/contenteditable is focused
      const ae = document.activeElement;
      if (
        ae &&
        (ae.tagName === "INPUT" ||
          ae.tagName === "TEXTAREA" ||
          ae.getAttribute("contenteditable") === "true")
      ) {
        return;
      }
      // modifier keys: ignore
      if ((e as any).metaKey || (e as any).ctrlKey || (e as any).altKey) return;
      const allowDecimal =
        this.activeUnit !== "sat" && this.activeUnit !== "msat";
      const key = (e as KeyboardEvent).key;
      let buf =
        this.amountEditBuffer ||
        (this.sendData.amount == null ? "0" : String(this.sendData.amount));
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
        // attempt to send if valid
        if (
          this.sendData.amount != null &&
          this.sendData.amount > 0 &&
          !this.insufficientFunds &&
          !(
            this.sendData.p2pkPubkey != "" &&
            !this.isValidPubkey(this.sendData.p2pkPubkey)
          )
        ) {
          this.sendTokens();
        }
        handled = true;
      }

      if (!handled) return;
      (e as Event).preventDefault();

      // sanitize buffer
      if (allowDecimal) {
        buf = buf.replace(/,/g, ".");
        buf = buf.replace(/[^\d.]/g, "").replace(/^(\d*\.\d*).*$/, "$1");
        // limit to two decimal places
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
        this.sendData.amount = null;
      } else {
        const num = Number(buf);
        this.sendData.amount = isNaN(num) ? null : num;
      }
    },
    lockTokens: async function () {
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
        this.addPendingToken(historyToken);
        this.sendData.historyToken = historyToken;

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
        this.addPendingToken(historyToken);
        this.sendData.historyToken = historyToken;

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
.send-fullscreen {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.amount-area {
  flex: 1;
  position: relative;
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
  top: calc(100% + 16px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  pointer-events: none;
}
.bottom-panel {
  margin-top: auto;
  background: var(--q-color-grey-1);
  box-shadow: 0 -8px 16px rgba(0, 0, 0, 0.05);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.keypad-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
