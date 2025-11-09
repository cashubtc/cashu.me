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
              overline
              class="q-mt-sm"
              :class="$q.dark.isActive ? 'text-white' : 'text-black'"
              style="font-size: 1rem"
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
            @enter="sendTokens"
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
                class="q-pt-xl amount-warning-badge"
              >
                <span
                  class="text-caption text-weight-medium text-grey-6"
                  style="font-size: 16px"
                >
                  {{
                    $t("PayInvoiceDialog.invoice.balance_too_low_warning_text")
                  }}
                </span>
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
              :hide-comma="activeUnit === 'sat' || activeUnit === 'msat'"
              :model-value="String(sendData.amount ?? 0)"
              @update:modelValue="(val: string | number) => (sendData.amount = Number(val))"
              @done="sendTokens"
            />
          </div>
          <!-- Send action below keyboard -->
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
import AmountInputComponent from "components/AmountInputComponent.vue";
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
    ScanIcon,
    LockIcon,
  },
  props: {},
  data: function () {
    return {};
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
  top: calc(100% + 16px);
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
  box-shadow: 0 -8px 16px rgba(0, 0, 0, 0.05);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.keypad-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
