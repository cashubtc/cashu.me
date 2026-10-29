<template>
  <FlowDialog v-model="showSendTokens">
    <!--  enter send data (full-screen) -->
    <div
      v-if="!sendData.tokens"
      class="column fit overflow-hidden send-fullscreen"
      :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
    >
      <!-- Header -->
      <FullscreenDialogHeader :title="$t('SendTokenDialog.title')" balanced>
        <template #actions>
          <div class="row items-center no-wrap sheet-header-actions">
            <IconButton
              class="lock-toggle-btn"
              tooltip
              :label="$t('SendTokenDialog.actions.lock.label')"
              @click="showLockInput = !showLockInput"
            >
              <LockIcon :size="20" />
            </IconButton>
            <UnitToggle :label="activeUnitLabel" @toggle="toggleUnit()" />
          </div>
        </template>
      </FullscreenDialogHeader>

      <!-- Payment request info -->
      <FlowColumn v-if="sendData.paymentRequest" class="q-px-lg q-pt-sm">
        <PaymentRequestInfo :request="sendData.paymentRequest" />
      </FlowColumn>

      <!-- Mint selection -->
      <FlowColumn class="q-px-md q-mb-sm">
        <ChooseMint />
        <AppCallout
          v-if="paymentRequestMintWarning"
          variant="danger"
          class="q-mt-sm"
          :text="paymentRequestMintWarning"
        />
      </FlowColumn>

      <!-- Amount display -->
      <div class="col column items-center justify-center q-px-lg amount-area">
        <!-- Floating P2PK input overlay -->
        <transition
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
        >
          <div v-if="showLockInput" class="p2pk-overlay">
            <FlowColumn class="q-px-lg">
              <div class="row items-center">
                <div :class="!sendData.p2pkPubkey ? 'col-8' : 'col-12'">
                  <q-input
                    v-model="sendData.p2pkPubkey"
                    :label="
                      sendData.p2pkPubkey && !isLocked
                        ? $t('SendTokenDialog.inputs.p2pk_pubkey.label_invalid')
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
                    :aria-label="
                      $t(
                        'SendTokenDialog.actions.paste_p2pk_pubkey.tooltip_text'
                      )
                    "
                    @click="pasteToP2PKField"
                  >
                    <ClipboardPasteIcon :size="20" />
                    <q-tooltip>{{
                      $t(
                        "SendTokenDialog.actions.paste_p2pk_pubkey.tooltip_text"
                      )
                    }}</q-tooltip>
                  </q-btn>
                  <IconButton
                    :label="$t('global.actions.scan.label')"
                    @click="showCamera"
                  >
                    <ScanIcon :size="20" />
                  </IconButton>
                </div>
              </div>
            </FlowColumn>
          </div>
        </transition>
        <AmountInputComponent
          v-if="!showLockInput"
          v-model="sendData.amount"
          :muted="insufficientFunds"
          :enabled="!sendData.tokens"
          :show-fiat-conversion="!insufficientFunds"
          @enter="sendTokens"
        >
          <template #overlay>
            <AppBadge v-if="isLocked && !showLockInput" class="locked-badge">
              <LockIcon :size="14" aria-hidden="true" />
              {{ $t("SendTokenDialog.badge_locked") }}
            </AppBadge>
            <AmountWarning
              v-if="insufficientFunds && sendData.amount"
              :text="
                $t('PayInvoiceDialog.invoice.balance_too_low_warning_text')
              "
              :amount-key="sendData.amount ?? ''"
            />
          </template>
        </AmountInputComponent>
      </div>

      <!-- Numeric keypad -->
      <FlowFooter>
        <template #above>
          <AmountKeypadPanel v-model="sendData.amount" @done="sendTokens" />
          <!-- Send action below keyboard -->
        </template>
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
            sendingEcash ||
            sendData.amount == null ||
            sendData.amount <= 0 ||
            insufficientFunds ||
            (sendData.p2pkPubkey != '' && !isValidPubkey(sendData.p2pkPubkey))
          "
          data-testid="send-ecash"
          @click="sendTokens"
          color="primary"
          rounded
          type="submit"
          :loading="sendingEcash"
        >
          {{ $t("SendTokenDialog.actions.send.label") }}
          <template #loading
            ><BusyLabel
              ><span>{{
                $t("SendTokenDialog.actions.send.in_progress")
              }}</span></BusyLabel
            ></template
          >
        </q-btn>
      </FlowFooter>
    </div>

    <!-- show ecash details -->
    <div v-else class="text-center">
      <DisplayTokenComponent />
    </div>
  </FlowDialog>
</template>
<script lang="ts">
import AmountWarning from "src/components/ui/AmountWarning.vue";
import FlowColumn from "src/components/ui/FlowColumn.vue";
import FlowDialog from "src/components/ui/FlowDialog.vue";
import BusyLabel from "src/components/ui/BusyLabel.vue";
import FlowFooter from "src/components/ui/FlowFooter.vue";
import IconButton from "src/components/ui/IconButton.vue";
import AppBadge from "src/components/ui/AppBadge.vue";
import UnitToggle from "src/components/ui/UnitToggle.vue";
import { defineComponent } from "vue";
import AppCallout from "src/components/AppCallout.vue";
import { useSendTokensStore } from "src/stores/sendTokensStore";
import { PaymentRequest } from "@cashu/cashu-ts";
import { useWalletStore } from "src/stores/wallet";
import { type MutexPriority, useUiStore } from "src/stores/ui";
import { useProofsStore } from "src/stores/proofs";
import { useMintsStore } from "src/stores/mints";
import { useTokensStore } from "src/stores/tokens";
import { getShortUrl } from "src/js/wallet-helpers";
import { useSettingsStore } from "src/stores/settings";
import { useTransactionWorkerStore } from "src/stores/transactionWorker";
import { usePriceStore } from "src/stores/price";
import { useCameraStore } from "src/stores/camera";
import { useP2PKStore } from "src/stores/p2pk";
import { mapActions, mapState, mapWritableState } from "pinia";
import ChooseMint from "components/ChooseMint.vue";
import AmountKeypadPanel from "src/components/AmountKeypadPanel.vue";
import FullscreenDialogHeader from "src/components/ui/FullscreenDialogHeader.vue";
import DisplayTokenComponent from "components/DisplayTokenComponent.vue";
import AmountInputComponent from "components/AmountInputComponent.vue";
import SendPaymentRequest from "components/SendPaymentRequest.vue";
import PaymentRequestInfo from "components/PaymentRequestInfo.vue";
import {
  ClipboardPaste as ClipboardPasteIcon,
  Lock as LockIcon,
  ScanLine as ScanIcon,
} from "lucide-vue-next";
declare const windowMixin: any;
export default defineComponent({
  name: "SendTokenDialog",
  mixins: [windowMixin],
  components: {
    AmountWarning,
    FlowColumn,
    UnitToggle,
    FlowDialog,
    BusyLabel,
    FlowFooter,
    IconButton,
    AppBadge,
    ClipboardPasteIcon,
    AppCallout,
    ChooseMint,
    AmountKeypadPanel,
    FullscreenDialogHeader,
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
      sendingEcash: false as boolean,
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
    //     const mints = useMintsStore() as any;
    //     const mintWallet = this.mintWalletSync(
    //       mints.activeMintUrl,
    //       mints.activeUnit
    //     );
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
    // NUT-18's `m` field is mandatory today (cashu-ts `PaymentRequest.mints`
    // is a plain `string[]`). This constraint helper wraps that so when the
    // spec change at https://github.com/cashubtc/nuts/pull/381 lands we can
    // also return `{ kind: "preferred", allowed }` without touching callers:
    // the button disable + warning logic just keys off `kind`.
    paymentRequestMintConstraint(): {
      kind: "mandatory";
      allowed: string[];
    } | null {
      const allowed =
        this.sendData.paymentRequest?.mints?.filter((m): m is string => !!m) ??
        [];
      if (allowed.length === 0) return null;
      return { kind: "mandatory", allowed };
    },
    selectedMintViolatesRequest(): boolean {
      const c = this.paymentRequestMintConstraint;
      if (!c) return false;
      if (!this.activeMintUrl) return true;
      return !c.allowed.includes(this.activeMintUrl);
    },
    paymentRequestMintWarning(): string {
      // Only block (and warn) for mandatory constraints. Preferred-mint
      // copy can be added later as a separate i18n key without reshaping
      // this method.
      const c = this.paymentRequestMintConstraint;
      if (!c || c.kind !== "mandatory") return "";
      if (!this.selectedMintViolatesRequest) return "";
      return this.$t(
        "SendTokenDialog.errors.mint_not_allowed_by_request"
      ) as string;
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
      const c = this.paymentRequestMintConstraint;
      if (c && c.kind === "mandatory" && this.selectedMintViolatesRequest) {
        return true;
      }
      return false;
    },
  },
  watch: {
    activeMintUrl: function (newUrl, oldUrl) {
      // When the user switches mint inside the Pay-PaymentRequest sheet, any
      // proofs we already prepared belong to the previous mint (and embed
      // that mint URL in the serialized token). Drop them so the next pay
      // attempt rebuilds from the newly-selected mint.
      if (!this.showSendTokens) return;
      if (!this.sendData.paymentRequest) return;
      if (!newUrl || !oldUrl || newUrl === oldUrl) return;
      useSendTokensStore().invalidatePreparedPaymentRequestToken();
    },
    activeUnit: function (newUnit, oldUnit) {
      // When the user switches active unit (e.g. from sat to usd or vice-versa) inside
      // the Pay-PaymentRequest sheet, any proofs we already prepared belong to the
      // previous unit. Drop them so the next pay attempt rebuilds with the new unit.
      if (!this.showSendTokens) return;
      if (!this.sendData.paymentRequest) return;
      if (!newUnit || !oldUnit || newUnit === oldUnit) return;
      useSendTokensStore().invalidatePreparedPaymentRequestToken();
    },
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
          this.addOutgoingTokenToChecker(
            this.sendData.historyToken.token,
            true
          );
          this.onTokenPaid(this.sendData.historyToken).catch((error: any) => {
            console.error("Could not start token status checker", error);
          });
        }
      } else {
        clearInterval(this.qrInterval);
        this.sendData.tokensBase64 = "";
        this.sendData.historyToken = undefined;
        this.sendData.paymentRequest = undefined;
      }
    },
  },
  methods: {
    ...mapActions(useTransactionWorkerStore, ["addOutgoingTokenToChecker"]),
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
      const mintWallet = await this.mintWallet(
        this.activeMintUrl,
        this.activeUnit,
        true
      );
      // NUT-18 payment requests may require the proofs to be locked with a
      // NUT-10 spending condition. PaymentRequest.toP2PKOptions() builds the
      // P2PK/HTLC lock cashu-ts can honour, or returns undefined for any other
      // kind, in which case we fall back to a normal unlocked send.
      // History contains plain request data, so build the SDK lock converter here.
      const lockRequest = new PaymentRequest();
      lockRequest.nut10 = this.sendData.paymentRequest.nut10;
      const lockOptions = lockRequest.toP2PKOptions();
      const { sendProofs } = lockOptions
        ? await this.sendToLock(
            this.activeProofs,
            mintWallet,
            sendAmount,
            lockOptions
          )
        : await this.send(
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
      const _id = this.addPendingToken(historyToken);
      (historyToken as any).id = _id;
      if (!this.g.offline) {
        this.onTokenPaid(historyToken);
      }
      this.sendData.historyToken = historyToken as any;
      return serialized;
    },
    lockTokens: async function (mutexPriority: MutexPriority = "normal") {
      if (!this.sendData.amount) {
        throw new Error("Amount is required");
      }
      const sendAmount = Math.floor(
        this.sendData.amount * this.activeUnitCurrencyMultiplyer
      );
      try {
        // keep firstProofs, send scndProofs and delete them (invalidate=true)
        const mintWallet = await this.mintWallet(
          this.activeMintUrl,
          this.activeUnit,
          true
        );
        const { sendProofs } = await this.sendToLock(
          this.activeProofs,
          mintWallet,
          sendAmount,
          this.sendData.p2pkPubkey,
          mutexPriority
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
      if (this.sendingEcash) return;

      const uiStore = useUiStore();
      this.sendingEcash = true;
      uiStore.beginForegroundPayment();

      try {
        this.sendData.p2pkPubkey = this.maybeConvertNpub(
          this.sendData.p2pkPubkey
        );
        if (
          this.sendData.p2pkPubkey &&
          this.isValidPubkey(this.sendData.p2pkPubkey)
        ) {
          await this.lockTokens("foreground");
          return;
        }

        const sendAmount = Math.floor(
          this.sendData.amount * this.activeUnitCurrencyMultiplyer
        );
        const mintWallet = await this.mintWallet(
          this.activeMintUrl,
          this.activeUnit,
          false
        );
        // keep firstProofs, send scndProofs and delete them (invalidate=true)
        const { sendProofs } = await this.send(
          this.activeProofs,
          mintWallet,
          sendAmount,
          true,
          this.includeFeesInSendAmount,
          "foreground"
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
      } finally {
        this.sendingEcash = false;
        uiStore.endForegroundPayment();
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
</style>
