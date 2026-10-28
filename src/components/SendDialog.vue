<template>
  <BottomSheet v-model="showSendDialog" :title="$t('SendDialog.title')">
    <template #trailing>
      <IconButton :label="$t('global.actions.scan.label')" @click="showCamera">
        <ScanIcon :size="20" />
      </IconButton>
    </template>
    <div>
      <div class="q-gutter-y-md">
        <OptionRow
          data-testid="send-ecash-option"
          @click="showSendTokensDialog"
        >
          <template #icon><CoinsIcon :size="24" /></template>
          <template #label>{{ $t("SendDialog.actions.ecash.label") }}</template>
          <template #caption>{{ $t("SendDialog.captions.ecash") }}</template>
        </OptionRow>

        <OptionRow
          v-if="canSendLightning"
          data-testid="send-lightning-option"
          @click="showParseDialog"
        >
          <template #icon><ZapIcon :size="24" /></template>
          <template #label>{{
            $t("SendDialog.actions.lightning.label")
          }}</template>
          <template #caption>{{
            $t("SendDialog.captions.lightning")
          }}</template>
        </OptionRow>

        <OptionRow
          v-if="canSendOnchain"
          data-testid="send-onchain-option"
          @click="showOnchainPayDialog"
        >
          <template #icon><BitcoinIcon :size="24" /></template>
          <template #label>{{ $t("common.on_chain") }}</template>
          <template #caption>{{ $t("SendDialog.captions.onchain") }}</template>
        </OptionRow>
      </div>
    </div>
  </BottomSheet>
</template>

<script lang="ts">
import IconButton from "src/components/ui/IconButton.vue";
import OptionRow from "src/components/ui/OptionRow.vue";
import { defineComponent } from "vue";
import BottomSheet from "src/components/BottomSheet.vue";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useUiStore } from "src/stores/ui";
import { useWalletStore } from "src/stores/wallet";
import { useCameraStore } from "src/stores/camera";
import { useSendTokensStore } from "src/stores/sendTokensStore";
import { useSettingsStore } from "../stores/settings";
import { useMintsStore } from "src/stores/mints";
import {
  Zap as ZapIcon,
  Scan as ScanIcon,
  Coins as CoinsIcon,
  Bitcoin as BitcoinIcon,
} from "lucide-vue-next";
import { PaymentMethod } from "src/stores/walletTypes";
import { notifyWarning } from "src/js/notify";
import {
  ensurePaymentMintActive,
  firstMintSupportingPaymentMethods,
} from "src/js/mint-payment-methods";

export default defineComponent({
  name: "SendDialog",
  components: {
    IconButton,
    OptionRow,
    BottomSheet,
    CoinsIcon,
    ZapIcon,
    ScanIcon,
    BitcoinIcon,
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
  },
  methods: {
    ...mapActions(useMintsStore, ["selectMintUrl"]),
    ...mapActions(useCameraStore, ["closeCamera", "showCamera"]),
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
        notifyWarning(this.$t("SendDialog.actions.lightning.error_no_mints"));
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
