<template>
  <BottomSheet v-model="showReceiveDialog" :title="$t('ReceiveDialog.title')">
    <template #trailing>
      <q-btn
        flat
        round
        class="app-icon-btn"
        :aria-label="$t('global.actions.scan.label')"
        @click="showCamera"
        color="primary"
      >
        <ScanIcon />
      </q-btn>
    </template>
    <div>
      <div class="q-gutter-y-md">
        <!-- Ecash Option -->
        <div
          class="app-option-row"
          role="button"
          tabindex="0"
          data-testid="receive-ecash-option"
          @click="toggleReceiveEcashDrawer"
          @keydown.enter.prevent="toggleReceiveEcashDrawer"
          @keydown.space.prevent="toggleReceiveEcashDrawer"
        >
          <div class="row items-center no-wrap">
            <div class="app-icon-circle">
              <CoinsIcon :size="24" />
            </div>
            <div class="col q-ml-md">
              <div class="app-option-row__label">
                {{ $t("ReceiveDialog.actions.ecash.label") }}
              </div>
              <div class="app-option-row__caption">
                {{ $t("ReceiveDialog.captions.ecash") }}
              </div>
            </div>
          </div>
        </div>

        <!-- Lightning Invoice Option -->
        <div
          v-if="canReceiveLightning"
          class="app-option-row"
          role="button"
          tabindex="0"
          data-testid="receive-lightning-option"
          @click="showInvoiceCreateDialog"
          @keydown.enter.prevent="showInvoiceCreateDialog"
          @keydown.space.prevent="showInvoiceCreateDialog"
        >
          <div class="row items-center no-wrap">
            <div class="app-icon-circle">
              <ZapIcon :size="24" />
            </div>
            <div class="col q-ml-md">
              <div class="app-option-row__label">
                {{ $t("ReceiveDialog.actions.lightning.label") }}
              </div>
              <div class="app-option-row__caption">
                {{ $t("ReceiveDialog.captions.lightning") }}
              </div>
            </div>
          </div>
        </div>

        <!-- On-chain Option -->
        <div
          v-if="canReceiveOnchain"
          class="app-option-row"
          role="button"
          tabindex="0"
          data-testid="receive-onchain-option"
          @click="showOnchainCreateDialog"
          @keydown.enter.prevent="showOnchainCreateDialog"
          @keydown.space.prevent="showOnchainCreateDialog"
        >
          <div class="row items-center no-wrap">
            <div class="app-icon-circle">
              <BitcoinIcon :size="24" />
            </div>
            <div class="col q-ml-md">
              <div class="app-option-row__label">
                {{ $t("common.on_chain") }}
              </div>
              <div class="app-option-row__caption">
                {{ $t("ReceiveDialog.captions.onchain") }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BottomSheet>
  <ReceiveEcashDrawer />
</template>

<script lang="ts">
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
  Scan as ScanIcon,
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
