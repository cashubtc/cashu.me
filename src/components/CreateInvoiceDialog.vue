<template>
  <q-dialog
    v-model="showCreateInvoiceDialog"
    maximized
    backdrop-filter="blur(2px) brightness(60%)"
    transition-show="fade"
    transition-hide="fade"
    no-backdrop-dismiss
    @keydown.esc="showCreateInvoiceDialog = false"
  >
    <q-card class="q-pa-none q-pt-none qcard">
      <!-- enter invoice amount (full-screen) -->
      <div
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
              {{
                isOnchain
                  ? "Receive On-chain"
                  : isBolt12 && !showNpubCashPreview
                  ? "Receive Bolt12"
                  : $t("InvoiceDetailDialog.title")
              }}
            </q-item-label>
          </div>
          <div
            class="row items-center q-gutter-sm"
            style="position: absolute; right: 16px"
          >
            <q-btn
              v-if="!isOnchain && bolt11Supported && bolt12Supported"
              flat
              dense
              size="lg"
              color="primary"
              @click="toggleInvoiceType"
              :label="isBolt12 ? 'B12' : 'B11'"
            />
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
            <ChooseMint
              :filter-payment-method="mintFilterMethod"
              filter-mint-operation="mint"
            />
          </div>
        </div>

        <!-- Amount display -->
        <div class="col column items-center q-px-lg amount-area">
          <transition name="receive-content" mode="out-in">
            <div
              v-if="qrPreview"
              :key="qrPreview.key"
              class="row justify-center full-width q-mt-lg q-mb-auto"
            >
              <div class="col-12" style="max-width: 400px">
                <div
                  v-if="qrPreview.kind === 'reusable' && activeMintErrored"
                  class="mint-error-warning column items-center text-center q-pa-lg"
                >
                  <q-icon name="warning" size="42px" color="warning" />
                  <div class="mint-error-title q-mt-md">Mint unreachable</div>
                  <div class="mint-error-text q-mt-sm">
                    Reconnect to the mint to receive payments.
                  </div>
                  <q-btn
                    flat
                    dense
                    no-caps
                    color="primary"
                    icon="refresh"
                    class="q-mt-md"
                    label="Reconnect mint"
                    :loading="refreshingMint"
                    @click="refreshActiveMint"
                  />
                </div>
                <template v-else>
                  <div
                    class="qr-container cursor-pointer"
                    @click="copyQrPreview"
                  >
                    <q-responsive :ratio="1" class="q-mx-none">
                      <vue-qrcode
                        :value="qrPreview.value"
                        :options="{ width: 400 }"
                        class="rounded-borders"
                        style="width: 100%"
                      >
                      </vue-qrcode>
                    </q-responsive>
                  </div>
                  <div
                    class="q-mt-sm text-center text-grey-7 qr-copy-text cursor-pointer"
                    :data-testid="
                      qrPreview.kind === 'npubcash'
                        ? 'npub-cash-lightning-address'
                        : null
                    "
                    @click="copyQrPreview"
                  >
                    <q-icon
                      :name="qrPreview.copied ? 'check' : 'content_copy'"
                      size="xs"
                      class="q-mr-xs"
                    />
                    {{ qrPreview.text }}
                  </div>
                </template>
              </div>
            </div>
            <div
              v-else-if="isOnchain && checkingReusableOnchainQuote"
              key="checking-onchain"
              class="column items-center justify-center q-pa-xl q-my-auto"
            >
              <q-spinner size="48px" color="primary" />
              <div class="text-grey-6 q-mt-md">Checking address...</div>
            </div>

            <AmountInputComponent
              v-else-if="showAmountInput"
              key="amount-input"
              class="q-my-auto"
              v-model="invoiceData.amount"
              :enabled="true"
              @enter="requestMintButton"
              @fiat-mode-changed="fiatKeyboardMode = $event"
            />
          </transition>
        </div>

        <!-- Numeric keypad -->
        <!-- Numeric keypad and Secondary Actions -->
        <div class="bottom-panel column justify-end">
          <div class="keypad-wrapper" v-if="showAmountInput">
            <NumericKeyboard
              :force-visible="true"
              :hide-close="true"
              :hide-enter="true"
              :hide-comma="
                (activeUnit === 'sat' || activeUnit === 'msat') &&
                !fiatKeyboardMode
              "
              :model-value="String(invoiceData.amount ?? 0)"
              @update:modelValue="
                (val: string | number) => (invoiceData.amount = Number(val))
              "
              @done="requestMintButton"
            />
          </div>

          <!-- Secondary Actions Container (Add Amount) -->
          <div
            class="row justify-center"
            v-if="isBolt12 && !showAmountInput && !showNpubCashPreview"
          >
            <div
              class="col-12 col-sm-11 col-md-8 q-px-md"
              style="max-width: 600px"
            >
              <q-btn
                class="full-width"
                outline
                rounded
                color="primary"
                size="lg"
                @click="bolt12AddAmount = true"
                label="Add amount"
              />
            </div>
          </div>

          <!-- Primary action (Add amount / Create) -->
          <div class="row justify-center q-pb-lg q-pt-sm">
            <div
              class="col-12 col-sm-11 col-md-8 q-px-md"
              style="max-width: 600px"
            >
              <q-btn
                v-if="showNpubCashPreview"
                class="full-width"
                unelevated
                rounded
                color="primary"
                size="lg"
                data-testid="npub-cash-add-amount"
                :label="$t('PaymentRequestDialog.actions.add_amount.label')"
                @click="enterNpubCashAmountMode"
              />
              <q-btn
                v-else
                class="full-width"
                unelevated
                data-testid="create-payment-request"
                size="lg"
                :disable="!canCreate"
                @click="requestMintButton"
                color="primary"
                rounded
                type="submit"
                :loading="globalMutexLock || createInvoiceButtonBlocked"
              >
                {{ createButtonLabel }}
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
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import { copyToClipboard } from "quasar";
import VueQrcode from "@chenfengyuan/vue-qrcode";
import ChooseMint from "components/ChooseMint.vue";
import NumericKeyboard from "components/NumericKeyboard.vue";
import AmountInputComponent from "components/AmountInputComponent.vue";
import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";
import { useMintsStore } from "src/stores/mints";
import { useSettingsStore } from "src/stores/settings";
import { usePriceStore } from "src/stores/price";
import type { InvoiceHistory } from "src/stores/wallet";
import { PaymentMethod } from "src/stores/walletTypes";
import { mintSupportsPaymentMethod } from "src/js/mint-payment-methods";
import { displayAmountToBaseUnits } from "src/js/amount-entry";
import { useNpubCashStore } from "src/stores/npubcash";
import { lightningAddressToLnurl } from "src/js/lnurl";

declare const windowMixin: any;

export default defineComponent({
  name: "CreateInvoiceDialog",
  mixins: [windowMixin],
  components: {
    ChooseMint,
    NumericKeyboard,
    AmountInputComponent,
    VueQrcode,
  },
  props: {},
  data: function () {
    return {
      createInvoiceButtonBlocked: false,
      fiatKeyboardMode: false as boolean,
      bolt12AddAmount: false as boolean,
      npubCashAddAmount: false as boolean,
      npubCashAddressCopied: false,
      npubCashCopyTimeout: null as ReturnType<typeof setTimeout> | null,
      copyButtonCopied: false,
      copyButtonTimeout: null as any,
      refreshingMint: false,
      checkingReusableOnchainQuote: false,
      checkedReusableOnchainQuote: null as InvoiceHistory | null,
    };
  },
  computed: {
    ...mapWritableState(useUiStore, [
      "showNumericKeyboard",
      "showInvoiceDetails",
    ]),
    ...mapWritableState(useUiStore, ["globalMutexLock"]),
    ...mapWritableState(useUiStore, ["showCreateInvoiceDialog"]),
    ...mapWritableState(useWalletStore, ["invoiceData"]),
    ...mapWritableState(useMintsStore, [
      "activeUnit",
      "activeUnitLabel",
      "activeUnitCurrencyMultiplyer",
      "activeMintUrl",
      "mints",
    ]),
    ...mapState(useSettingsStore, [
      "bitcoinPriceCurrency",
      "useNumericKeyboard",
    ]),
    ...mapState(usePriceStore, ["bitcoinPrice", "currentCurrencyPrice"]),
    ...mapState(useNpubCashStore, {
      npubCashEnabled: "enabled",
      npubCashAddress: "address",
      npubCashMintUrl: "mintUrl",
      showAddressOnReceive: "showAddressOnReceive",
    }),
    isBolt12(): boolean {
      return this.invoiceData.type === PaymentMethod.Bolt12;
    },
    isOnchain(): boolean {
      return this.invoiceData.type === PaymentMethod.Onchain;
    },
    showAmountInput(): boolean {
      if (this.showNpubCashPreview) return false;
      if (this.isOnchain) return false;
      if (!this.isBolt12) return true;
      return this.bolt12AddAmount;
    },
    mintFilterMethod(): PaymentMethod | PaymentMethod[] {
      return this.isOnchain
        ? PaymentMethod.Onchain
        : [PaymentMethod.Bolt11, PaymentMethod.Bolt12];
    },
    bolt11Supported(): boolean {
      const mintStore = useMintsStore();
      const mint = mintStore.mints.find(
        (m) => m.url === mintStore.activeMintUrl
      );
      if (!mint) return false;
      return mintSupportsPaymentMethod(
        mint,
        PaymentMethod.Bolt11,
        "mint",
        mintStore.activeUnit
      );
    },
    bolt12Supported(): boolean {
      const mintStore = useMintsStore();
      const mint = mintStore.mints.find(
        (m) => m.url === mintStore.activeMintUrl
      );
      if (!mint) return false;
      return mintSupportsPaymentMethod(
        mint,
        PaymentMethod.Bolt12,
        "mint",
        mintStore.activeUnit
      );
    },
    onchainSupported(): boolean {
      const mintStore = useMintsStore();
      const mint = mintStore.mints.find(
        (m) => m.url === mintStore.activeMintUrl
      );
      if (!mint) return false;
      return mintSupportsPaymentMethod(
        mint,
        PaymentMethod.Onchain,
        "mint",
        mintStore.activeUnit
      );
    },
    activeMint(): any {
      return this.mints.find((mint: any) => mint.url === this.activeMintUrl);
    },
    activeMintErrored(): boolean {
      return Boolean(this.activeMint?.errored);
    },
    hasConfiguredNpubCashAddress(): boolean {
      return Boolean(
        this.npubCashEnabled &&
          this.npubCashAddress &&
          this.npubCashMintUrl &&
          this.mints.some((mint: any) => mint.url === this.npubCashMintUrl)
      );
    },
    showNpubCashPreview(): boolean {
      return Boolean(
        this.showCreateInvoiceDialog &&
          !this.isOnchain &&
          !this.isBolt12 &&
          this.activeUnit === "sat" &&
          !this.npubCashAddAmount &&
          this.hasConfiguredNpubCashAddress &&
          this.showAddressOnReceive &&
          this.activeMintUrl === this.npubCashMintUrl
      );
    },
    npubCashLnurl(): string {
      return lightningAddressToLnurl(this.npubCashAddress || "");
    },
    qrPreview(): {
      key: string;
      kind: string;
      value: string;
      text: string;
      copied: boolean;
    } | null {
      if (this.showNpubCashPreview) {
        return {
          key: "npub-cash-address",
          kind: "npubcash",
          value: this.npubCashLnurl,
          text: this.npubCashAddress,
          copied: this.npubCashAddressCopied,
        };
      }
      if (!this.checkingReusableOnchainQuote && this.showReusableQuote) {
        return {
          key: "reusable-quote",
          kind: "reusable",
          value: this.reusableQrValue,
          text: this.reusableReceiveQuote?.request || "",
          copied: this.copyButtonCopied,
        };
      }
      return null;
    },
    canCreate(): boolean {
      if (this.activeMintErrored) return false;
      // Bolt11 requires amount > 0
      // Bolt12 and on-chain allow 0 amount (amountless request)
      if (this.isBolt12 || this.isOnchain) return true;
      return (
        this.invoiceData.amount != null && Number(this.invoiceData.amount) > 0
      );
    },
    createButtonLabel(): string {
      if (this.isBolt12) {
        return this.showReusableQuote ? "New Offer" : "Create Offer";
      }
      if (this.isOnchain) {
        return this.showReusableQuote ? "Create New Address" : "Create Address";
      }
      return this.$t("InvoiceDetailDialog.actions.create.label") as string;
    },
    /**
     * Find a reusable Bolt12 offer from invoice history.
     * Reusable means: amountless (amount=0), not expired, matches current mint and unit.
     */
    reusableBolt12Offer(): InvoiceHistory | null {
      const walletStore = useWalletStore();
      const mintStore = useMintsStore();
      const now = Date.now();

      // Find offers that are:
      // 1. Type is bolt12
      // 2. Amount is 0 (amountless offer)
      // 3. Not expired (expiry is 0 or in the future)
      // 4. Matches current active mint and unit
      const reusableOffers = walletStore.invoiceHistory.filter(
        (invoice: InvoiceHistory) => {
          if (invoice.type !== PaymentMethod.Bolt12) return false;
          // Must be amountless
          const quote = invoice.mintQuote as any;
          if (quote?.amount && quote.amount > 0) return false;
          // Check expiry: 0 means no expiry, otherwise check if in the future
          if (quote?.expiry && quote.expiry > 0) {
            const expiryTime = quote.expiry * 1000; // expiry is in seconds
            if (expiryTime < now) return false;
          }
          // Must match current mint and unit
          if (invoice.mint !== mintStore.activeMintUrl) return false;
          if (invoice.unit !== mintStore.activeUnit) return false;
          if (!invoice.request) return false;
          return true;
        }
      );

      // Return the most recent one (last in array, as they're pushed chronologically)
      if (reusableOffers.length > 0) {
        return reusableOffers[reusableOffers.length - 1];
      }
      return null;
    },
    reusableOnchainQuote(): InvoiceHistory | null {
      return this.checkedReusableOnchainQuote;
    },
    reusableReceiveQuote(): InvoiceHistory | null {
      return this.isOnchain
        ? this.reusableOnchainQuote
        : this.reusableBolt12Offer;
    },
    reusableQrValue(): string {
      const request = this.reusableReceiveQuote?.request || "";
      if (this.isOnchain) return `bitcoin:${request}`;
      return `lightning:${request.toUpperCase()}`;
    },
    showReusableQuote(): boolean {
      return (
        (this.isBolt12 || this.isOnchain) &&
        !this.showAmountInput &&
        this.reusableReceiveQuote !== null
      );
    },
  },
  watch: {
    showCreateInvoiceDialog: function (val) {
      if (val) {
        this.npubCashAddAmount = false;
        this.npubCashAddressCopied = false;
        this.$nextTick(() => {
          this.showNumericKeyboard = !this.showNpubCashPreview;
        });
        this.refreshReusableOnchainQuote();
      } else {
        this.checkedReusableOnchainQuote = null;
      }
    },
    activeMintUrl: {
      handler: function (newMintUrl, oldMintUrl) {
        if (
          this.showCreateInvoiceDialog &&
          !this.npubCashAddAmount &&
          oldMintUrl === this.npubCashMintUrl &&
          newMintUrl !== this.npubCashMintUrl
        ) {
          this.enterNpubCashAmountMode();
        }
        this.syncInvoiceTypeWithActiveMint();
      },
      immediate: true,
    },
    activeUnit: function () {
      this.syncInvoiceTypeWithActiveMint();
      this.refreshReusableOnchainQuote();
    },
  },
  methods: {
    ...mapActions(useWalletStore, [
      "requestMintBolt11",
      "mintOnPaid",
      "activeWallet",
      "requestMintBolt12",
      "mintOnPaidBolt12",
      "requestMintOnchain",
      "mintOnPaidOnchain",
    ]),
    ...mapActions(useMintsStore, ["activateMintUrl", "toggleUnit"]),
    enterNpubCashAmountMode() {
      this.npubCashAddAmount = true;
      this.invoiceData.amount = "";
      this.$nextTick(() => {
        this.showNumericKeyboard = true;
      });
    },
    copyQrPreview() {
      if (!this.qrPreview) return;
      if (this.qrPreview.kind === "npubcash") {
        this.copyNpubCashAddress();
      } else {
        this.onCopyReusableOffer();
      }
    },
    async copyNpubCashAddress() {
      if (!this.npubCashAddress) return;
      try {
        await copyToClipboard(this.npubCashAddress);
        this.npubCashAddressCopied = true;
        if (this.npubCashCopyTimeout) {
          clearTimeout(this.npubCashCopyTimeout);
        }
        this.npubCashCopyTimeout = setTimeout(() => {
          this.npubCashAddressCopied = false;
        }, 3000);
      } catch (error) {
        console.error("Failed to copy lightning address:", error);
      }
    },
    toggleInvoiceType() {
      if (this.isBolt12) {
        this.invoiceData.type = PaymentMethod.Bolt11;
      } else {
        this.invoiceData.type = PaymentMethod.Bolt12;
        this.bolt12AddAmount = false;
        this.invoiceData.amount = 0;
      }
    },
    syncInvoiceTypeWithActiveMint() {
      if (this.invoiceData.type === PaymentMethod.Onchain) {
        if (!this.onchainSupported && this.bolt11Supported) {
          this.invoiceData.type = PaymentMethod.Bolt11;
        } else if (!this.onchainSupported && this.bolt12Supported) {
          this.invoiceData.type = PaymentMethod.Bolt12;
        }
        this.refreshReusableOnchainQuote();
        return;
      }
      if (this.bolt11Supported && !this.bolt12Supported) {
        this.invoiceData.type = PaymentMethod.Bolt11;
      } else if (!this.bolt11Supported && this.bolt12Supported) {
        this.invoiceData.type = PaymentMethod.Bolt12;
      }
    },
    requestMintButton: async function () {
      if (!this.canCreate) {
        return;
      }
      try {
        this.showNumericKeyboard = false;
        const amount = displayAmountToBaseUnits(
          this.invoiceData.amount || 0,
          this.activeUnitCurrencyMultiplyer
        );
        this.createInvoiceButtonBlocked = true;

        // Get wallet instance
        const wallet = await this.activeWallet(true);

        if (this.isOnchain) {
          const mintQuote = await this.requestMintOnchain(wallet);

          this.showCreateInvoiceDialog = false;
          this.showInvoiceDetails = true;
          await this.mintOnPaidOnchain(mintQuote.quote);
        } else if (this.isBolt12) {
          // BOLT12 Flow
          const mintQuote = await this.requestMintBolt12(amount, wallet);

          this.showCreateInvoiceDialog = false;
          this.showInvoiceDetails = true;

          // Start listening for payment
          await this.mintOnPaidBolt12(mintQuote.quote);
        } else {
          // BOLT11 Flow
          const mintQuote = await this.requestMintBolt11(amount, wallet);

          this.showCreateInvoiceDialog = false;
          this.showInvoiceDetails = true;
          await this.mintOnPaid(mintQuote.quote);
        }
      } catch (e) {
        console.log("#### requestMintButton", e);
      } finally {
        this.createInvoiceButtonBlocked = false;
      }
    },
    async onCopyReusableOffer() {
      if (this.activeMintErrored) {
        return;
      }
      const offer = this.reusableReceiveQuote;
      const request = offer?.request;
      if (request) {
        try {
          await copyToClipboard(request);
          this.copyButtonCopied = true;
          if (this.copyButtonTimeout) {
            clearTimeout(this.copyButtonTimeout);
          }
          this.copyButtonTimeout = setTimeout(() => {
            this.copyButtonCopied = false;
          }, 3000);
        } catch (error) {
          console.error("Failed to copy to clipboard:", error);
        }
      }
    },
    async refreshActiveMint() {
      if (!this.activeMintUrl || this.refreshingMint) {
        return;
      }
      this.refreshingMint = true;
      try {
        await this.activateMintUrl(this.activeMintUrl, false, true);
        this.refreshReusableOnchainQuote();
      } catch (error) {
        console.error("Could not refresh mint", error);
      } finally {
        this.refreshingMint = false;
      }
    },
    findReusableOnchainQuotes(): InvoiceHistory[] {
      const walletStore = useWalletStore();
      const mintStore = useMintsStore();
      const now = Date.now();
      return walletStore.invoiceHistory
        .filter((invoice: InvoiceHistory) => {
          if (invoice.type !== PaymentMethod.Onchain) return false;
          if (invoice.amount < 0) return false;
          // A paid address must never be offered again, to avoid address reuse.
          if (invoice.status !== "pending") return false;
          const quote = invoice.mintQuote as any;
          if (quote?.expiry && quote.expiry > 0 && quote.expiry * 1000 < now) {
            return false;
          }
          if (invoice.mint !== mintStore.activeMintUrl) return false;
          if (invoice.unit !== mintStore.activeUnit) return false;
          if (!invoice.request) return false;
          return true;
        })
        .reverse();
    },
    refreshReusableOnchainQuote() {
      if (!this.showCreateInvoiceDialog || !this.isOnchain) return;
      this.checkingReusableOnchainQuote = false;
      this.checkedReusableOnchainQuote =
        this.findReusableOnchainQuotes()[0] || null;
    },
  },
  beforeUnmount() {
    if (this.copyButtonTimeout) {
      clearTimeout(this.copyButtonTimeout);
    }
    if (this.npubCashCopyTimeout) {
      clearTimeout(this.npubCashCopyTimeout);
    }
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
  min-height: 0;
}
.qr-container {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}
.qr-copy-text {
  overflow-wrap: anywhere;
  word-break: break-all;
  -webkit-hyphens: none;
  -moz-hyphens: none;
  hyphens: none;
  font-size: 0.9em;
  font-family: monospace;
}
.receive-content-enter-active,
.receive-content-leave-active {
  transition: opacity 180ms ease;
}
.receive-content-enter-from {
  opacity: 0;
}
.receive-content-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .receive-content-enter-active,
  .receive-content-leave-active {
    transition: none;
  }
}
.amount-container {
  position: relative;
  display: inline-block;
  max-width: 90vw;
  overflow: hidden;
}
.amount-display {
  font-size: clamp(56px, 11vw, 80px);
  line-height: 1.1;
  overflow-wrap: break-word;
  word-break: break-all;
  max-width: 100%;
}
.fiat-display {
  font-size: 14px;
}
.mint-error-warning {
  border: 1px solid rgba(255, 193, 7, 0.28);
  border-radius: 12px;
  background: rgba(255, 193, 7, 0.08);
  color: inherit;
  min-height: 260px;
  justify-content: center;
}
.mint-error-title {
  font-size: 18px;
  font-weight: 600;
}
.mint-error-text {
  opacity: 0.68;
  font-size: 14px;
  line-height: 1.45;
  max-width: 300px;
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
