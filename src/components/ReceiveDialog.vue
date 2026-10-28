<template>
  <BottomSheet v-model="showReceiveDialog" :title="$t('ReceiveDialog.title')">
    <template #trailing>
      <IconButton :label="$t('global.actions.scan.label')" @click="showCamera">
        <ScanIcon :size="20" />
      </IconButton>
    </template>
    <div>
      <div class="q-gutter-y-md">
        <!-- Ecash Option -->
        <OptionRow
          data-testid="receive-ecash-option"
          @click="toggleReceiveEcashDrawer"
        >
          <template #icon><CoinsIcon :size="24" /></template>
          <template #label>{{
            $t("ReceiveDialog.actions.ecash.label")
          }}</template>
          <template #caption>{{ $t("ReceiveDialog.captions.ecash") }}</template>
        </OptionRow>

        <!-- Lightning Invoice Option -->
        <OptionRow
          v-if="canReceiveLightning"
          data-testid="receive-lightning-option"
          @click="showInvoiceCreateDialog"
        >
          <template #icon><ZapIcon :size="24" /></template>
          <template #label>{{
            $t("ReceiveDialog.actions.lightning.label")
          }}</template>
          <template #caption>{{
            $t("ReceiveDialog.captions.lightning")
          }}</template>
        </OptionRow>

        <!-- On-chain Option -->
        <OptionRow
          v-if="canReceiveOnchain"
          data-testid="receive-onchain-option"
          @click="showOnchainCreateDialog"
        >
          <template #icon><BitcoinIcon :size="24" /></template>
          <template #label>{{ $t("common.on_chain") }}</template>
          <template #caption>{{
            $t("ReceiveDialog.captions.onchain")
          }}</template>
        </OptionRow>
      </div>
    </div>
  </BottomSheet>
  <ReceiveEcashDrawer />
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
import ReceiveEcashDrawer from "src/components/ReceiveEcashDrawer.vue";
import { useMintsStore } from "src/stores/mints";
import { notifyWarning } from "src/js/notify.ts";
import {
  Coins as CoinsIcon,
  Zap as ZapIcon,
  ScanLine as ScanIcon,
  Bitcoin as BitcoinIcon,
} from "lucide-vue-next";
import { PaymentMethod } from "src/stores/walletTypes";
import { useNpubCashStore } from "src/stores/npubcash";
import {
  ensurePaymentMintActive,
  firstMintSupportingPaymentMethods,
} from "src/js/mint-payment-methods";

export default defineComponent({
  name: "ReceiveDialog",
  components: {
    IconButton,
    OptionRow,
    BottomSheet,
    CoinsIcon,
    ZapIcon,
    ScanIcon,
    BitcoinIcon,
    ReceiveEcashDrawer,
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
    ...mapWritableState(useUiStore, [
      "showInvoiceDetails",
      "showBolt12OfferDetails",
      "showReceiveDialog",
      "showReceiveEcashDrawer",
      "showCreateInvoiceDialog",
    ]),
    ...mapWritableState(useReceiveTokensStore, [
      "showReceiveTokens",
      "receiveData",
    ]),
    ...mapWritableState(useWalletStore, ["invoiceData"]),
    ...mapState(useMintsStore, ["mints", "activeMintUrl", "activeUnit"]),
    ...mapState(useNpubCashStore, {
      npubCashEnabled: "enabled",
      npubCashAddress: "address",
      npubCashMintUrl: "mintUrl",
      showAddressOnReceive: "showAddressOnReceive",
    }),
    hasConfiguredNpubCashAddress: function (): boolean {
      return Boolean(
        this.npubCashEnabled &&
          this.npubCashAddress &&
          this.npubCashMintUrl &&
          this.mints.some((mint: any) => mint.url === this.npubCashMintUrl)
      );
    },
    canReceivePayments: function () {
      if (!this.mints.length) {
        return false;
      } else {
        return true;
      }
    },
    canReceiveLightning: function (): boolean {
      return Boolean(
        firstMintSupportingPaymentMethods(
          this.mints as any,
          this.activeMintUrl as string,
          [PaymentMethod.Bolt11, PaymentMethod.Bolt12],
          "mint",
          this.activeUnit as string
        )
      );
    },
    canReceiveOnchain: function (): boolean {
      return Boolean(
        firstMintSupportingPaymentMethods(
          this.mints as any,
          this.activeMintUrl as string,
          [PaymentMethod.Onchain],
          "mint",
          this.activeUnit as string
        )
      );
    },
  },
  methods: {
    ...mapActions(useMintsStore, ["selectMintUrl"]),
    ...mapActions(useWalletStore, ["resetInvoiceData"]),
    toggleReceiveEcashDrawer: function () {
      this.showReceiveDialog = false;
      this.showReceiveTokens = false;
      this.showReceiveEcashDrawer = true;
    },
    showReceiveTokensDialog: function () {
      this.receiveData.tokensBase64 = "";
      this.showReceiveTokens = true;
      this.showReceiveDialog = false;
    },
    showInvoiceCreateDialog: async function () {
      if (
        this.showAddressOnReceive &&
        this.hasConfiguredNpubCashAddress &&
        this.npubCashMintUrl
      ) {
        this.selectMintUrl(this.npubCashMintUrl);
      }
      const mintResult = await ensurePaymentMintActive(
        this.mints as any,
        this.activeMintUrl as string,
        this.selectMintUrl,
        [PaymentMethod.Bolt11, PaymentMethod.Bolt12],
        "mint",
        this.activeUnit as string
      );
      if (!mintResult.ok) {
        notifyWarning(
          this.$i18n.t("ReceiveDialog.actions.lightning.error_no_mints")
        );
        this.showReceiveDialog = false;
        return;
      }
      console.log("##### showInvoiceCreateDialog");
      this.resetInvoiceData(mintResult.method);
      this.invoiceData.amount = "";
      this.showCreateInvoiceDialog = true;
      this.showReceiveDialog = false;
    },
    showOnchainCreateDialog: async function () {
      const mintResult = await ensurePaymentMintActive(
        this.mints as any,
        this.activeMintUrl as string,
        this.selectMintUrl,
        [PaymentMethod.Onchain],
        "mint",
        this.activeUnit as string
      );
      if (!mintResult.ok) {
        notifyWarning(this.$t("ReceiveDialog.actions.ecash.error_no_mints"));
        this.showReceiveDialog = false;
        return;
      }
      this.resetInvoiceData(PaymentMethod.Onchain);
      this.showCreateInvoiceDialog = true;
      this.showReceiveDialog = false;
    },
    ...mapActions(useCameraStore, ["closeCamera", "showCamera"]),
  },
  created: function () {},
});
</script>
