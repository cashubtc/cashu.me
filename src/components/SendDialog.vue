<template>
  <q-dialog
    v-model="showSendDialog"
    position="bottom"
    :maximized="$q.screen.lt.sm"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="drawer-card text-white full-width-card q-pb-lg">
      <q-card-section class="row items-center q-pb-sm">
        <q-btn flat round dense v-close-popup class="q-ml-sm" color="primary">
          <XIcon />
        </q-btn>
        <div class="col text-center">
          <span class="text-h6">{{ $t("SendDialog.title") }}</span>
        </div>
        <q-btn
          flat
          round
          dense
          class="q-mr-sm"
          @click="showCamera"
          color="primary"
        >
          <ScanIcon />
        </q-btn>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="q-gutter-y-md">
          <div
            class="action-row"
            role="button"
            tabindex="0"
            data-testid="send-ecash-option"
            @click="showSendTokensDialog"
            @keydown.enter.prevent="showSendTokensDialog"
            @keydown.space.prevent="showSendTokensDialog"
          >
            <div class="row items-center no-wrap">
              <div class="icon-circle">
                <CoinsIcon :size="24" />
              </div>
              <div class="col q-ml-md">
                <div class="text-body1 text-weight-medium">
                  {{ $t("SendDialog.actions.ecash.label") }}
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="canSendLightning"
            class="action-row"
            role="button"
            tabindex="0"
            data-testid="send-lightning-option"
            @click="showParseDialog"
            @keydown.enter.prevent="showParseDialog"
            @keydown.space.prevent="showParseDialog"
          >
            <div class="row items-center no-wrap">
              <div class="icon-circle">
                <ZapIcon :size="24" />
              </div>
              <div class="col q-ml-md">
                <div class="text-body1 text-weight-medium">
                  {{ $t("SendDialog.actions.lightning.label") }}
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="canSendOnchain"
            class="action-row"
            role="button"
            tabindex="0"
            data-testid="send-onchain-option"
            @click="showOnchainPayDialog"
            @keydown.enter.prevent="showOnchainPayDialog"
            @keydown.space.prevent="showOnchainPayDialog"
          >
            <div class="row items-center no-wrap">
              <div class="icon-circle">
                <BitcoinIcon :size="24" />
              </div>
              <div class="col q-ml-md">
                <div class="text-body1 text-weight-medium">On-chain</div>
              </div>
            </div>
          </div>

          <!-- Custom payment method options (advertised by a mint) -->
          <div
            v-for="customMethod in customSendMethods"
            :key="customMethod.method"
            class="action-row"
            role="button"
            tabindex="0"
            :data-testid="`send-${customMethod.method}-option`"
            @click="showCustomPayDialog(customMethod.method)"
            @keydown.enter.prevent="showCustomPayDialog(customMethod.method)"
            @keydown.space.prevent="showCustomPayDialog(customMethod.method)"
          >
            <div class="row items-center no-wrap">
              <div class="icon-circle">
                <BanknoteIcon :size="24" />
              </div>
              <div class="col q-ml-md">
                <div class="text-body1 text-weight-medium">
                  {{ methodDisplay(customMethod) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useUiStore } from "src/stores/ui";
import { useWalletStore } from "src/stores/wallet";
import { useCameraStore } from "src/stores/camera";
import { useSendTokensStore } from "src/stores/sendTokensStore";
import { useSettingsStore } from "../stores/settings";
import { useMintsStore } from "src/stores/mints";
import {
  X as XIcon,
  Zap as ZapIcon,
  Scan as ScanIcon,
  Coins as CoinsIcon,
  Bitcoin as BitcoinIcon,
  Banknote as BanknoteIcon,
} from "lucide-vue-next";
import { PaymentMethod } from "src/stores/walletTypes";
import { notifyWarning } from "src/js/notify";
import {
  ensurePaymentMintActive,
  firstMintSupportingPaymentMethods,
  customPaymentMethodsForMints,
  advertisedDisplayName,
  type AdvertisedPaymentMethod,
} from "src/js/mint-payment-methods";

export default defineComponent({
  name: "SendDialog",
  components: {
    XIcon,
    CoinsIcon,
    ZapIcon,
    ScanIcon,
    BitcoinIcon,
    BanknoteIcon,
  },
  mixins: [windowMixin],
  props: {},
  data: function () {
    return {
      currentPage: 1,
      pageSize: 5,
    };
  },
  computed: {
    ...mapState(useMintsStore, ["mints", "activeMintUrl", "activeUnit"]),
    ...mapWritableState(useUiStore, [
      "showInvoiceDetails",
      "tab",
      "showSendDialog",
      "showReceiveDialog",
    ]),
    ...mapWritableState(useWalletStore, [
      "invoiceHistory",
      "invoiceData",
      "payInvoiceData",
    ]),
    ...mapWritableState(useCameraStore, ["camera"]),
    ...mapWritableState(useSendTokensStore, [
      "showSendTokens",
      "sendData",
      "showLockInput",
    ]),
    canMakePayments: function () {
      if (!this.mints.length) {
        return false;
      } else {
        return true;
      }
    },
    canSendLightning: function (): boolean {
      return Boolean(
        firstMintSupportingPaymentMethods(
          this.mints as any,
          this.activeMintUrl as string,
          [PaymentMethod.Bolt11, PaymentMethod.Bolt12],
          "melt",
          this.activeUnit as string
        )
      );
    },
    canSendOnchain: function (): boolean {
      return Boolean(
        firstMintSupportingPaymentMethods(
          this.mints as any,
          this.activeMintUrl as string,
          [PaymentMethod.Onchain],
          "melt",
          this.activeUnit as string
        )
      );
    },
    customSendMethods: function (): AdvertisedPaymentMethod[] {
      return customPaymentMethodsForMints(
        this.mints as any,
        "melt",
        this.activeUnit as string
      );
    },
  },
  methods: {
    ...mapActions(useMintsStore, ["selectMintUrl"]),
    ...mapActions(useCameraStore, ["closeCamera", "showCamera"]),
    methodDisplay: advertisedDisplayName,
    showCustomPayDialog: async function (method: string) {
      const mintResult = await ensurePaymentMintActive(
        this.mints as any,
        this.activeMintUrl as string,
        this.selectMintUrl,
        [method],
        "melt",
        this.activeUnit as string
      );
      if (!mintResult.ok) {
        notifyWarning("No mints available");
        this.showSendDialog = false;
        return;
      }
      this.payInvoiceData.show = true;
      // No parseable request for custom methods: the user declares the
      // amount (and optional memo) directly.
      this.payInvoiceData.invoice = Object.freeze({
        custom: method,
        request: "",
        memo: "",
        sat: 0,
      }) as any;
      this.payInvoiceData.lnurlpay = null;
      this.payInvoiceData.domain = "";
      this.payInvoiceData.lnurlauth = null;
      this.payInvoiceData.paymentMethod = method;
      this.payInvoiceData.meltQuote.error = "";
      this.payInvoiceData.meltQuote.response = {
        quote: "",
        amount: 0,
        fee_reserve: 0,
      };
      this.payInvoiceData.input.request = "";
      this.payInvoiceData.input.amount = undefined;
      this.payInvoiceData.input.comment = "";
      this.camera.show = false;
      this.showSendDialog = false;
    },
    showParseDialog: async function () {
      const mintResult = await ensurePaymentMintActive(
        this.mints as any,
        this.activeMintUrl as string,
        this.selectMintUrl,
        [PaymentMethod.Bolt11, PaymentMethod.Bolt12],
        "melt",
        this.activeUnit as string
      );
      if (!mintResult.ok) {
        notifyWarning(
          this.$i18n.t("SendDialog.actions.lightning.error_no_mints")
        );
        this.showSendDialog = false;
        return;
      }
      this.payInvoiceData.show = true;
      this.payInvoiceData.invoice = null;
      this.payInvoiceData.lnurlpay = null;
      this.payInvoiceData.domain = "";
      this.payInvoiceData.lnurlauth = null;
      this.payInvoiceData.paymentMethod = mintResult.method;
      this.payInvoiceData.input.request = "";
      this.payInvoiceData.input.comment = "";
      this.camera.show = false;
      this.showSendDialog = false;
    },
    showOnchainPayDialog: async function () {
      const mintResult = await ensurePaymentMintActive(
        this.mints as any,
        this.activeMintUrl as string,
        this.selectMintUrl,
        [PaymentMethod.Onchain],
        "melt",
        this.activeUnit as string
      );
      if (!mintResult.ok) {
        notifyWarning("No mints available");
        this.showSendDialog = false;
        return;
      }
      this.payInvoiceData.show = true;
      this.payInvoiceData.invoice = null;
      this.payInvoiceData.lnurlpay = null;
      this.payInvoiceData.domain = "";
      this.payInvoiceData.lnurlauth = null;
      this.payInvoiceData.paymentMethod = PaymentMethod.Onchain;
      this.payInvoiceData.input.request = "";
      this.payInvoiceData.input.amount = undefined;
      this.payInvoiceData.input.comment = "";
      this.camera.show = false;
      this.showSendDialog = false;
    },
    showSendTokensDialog: function () {
      console.log("##### showSendTokensDialog");
      if (!this.canMakePayments) {
        notifyWarning(this.$i18n.t("SendDialog.actions.ecash.error_no_mints"));
        this.showSendDialog = false;
        return;
      }
      this.sendData.tokens = "";
      this.sendData.tokensBase64 = "";
      this.sendData.amount = null;
      this.sendData.memo = "";
      this.sendData.p2pkPubkey = "";
      this.sendData.paymentRequest = undefined;
      this.showSendDialog = false;
      this.showSendTokens = true;
      this.showLockInput = false;
    },
  },
  created: function () {},
});
</script>

<style lang="scss" scoped>
:deep(.q-dialog__backdrop) {
  backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.4) !important;
}

.q-dialog__inner > div {
  border-top-left-radius: 20px !important;
  border-top-right-radius: 20px !important;
  border-bottom-left-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
}

.drawer-card {
  background: #1a1a1a;
}

.action-row {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:active {
    background: rgba(255, 255, 255, 0.1);
  }
}

.icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.lucide {
  width: 24px;
  height: 24px;
  color: white;
}
</style>
