<template>
  <FlowDialog v-model="showCreateInvoiceDialog">
    <!-- enter invoice amount (full-screen) -->
    <div class="column fit overflow-hidden send-fullscreen">
      <!-- Header -->
      <FullscreenDialogHeader
        :title="
          isOnchain
            ? $t('CreateInvoiceDialog.onchain_title')
            : isBolt12 && !showNpubCashPreview
            ? $t('CreateInvoiceDialog.bolt12_title')
            : $t('InvoiceDetailDialog.title')
        "
        balanced
      >
        <!-- The unit switch stays on every step: an address, an offer and the Lightning
             address each belong to one unit, so switching loads the other unit's
             (UnitToggle hides itself when the mint offers a single unit). -->
        <template #actions>
          <div class="row items-center no-wrap sheet-header-actions">
            <UnitToggle @toggle="toggleUnit()" />
          </div>
        </template>
      </FullscreenDialogHeader>

      <!-- Mint selection -->
      <FlowColumn class="q-px-md q-mb-sm">
        <ChooseMint
          dense
          :filter-payment-method="mintFilterMethod"
          filter-mint-operation="mint"
          :disable="createInvoiceButtonBlocked"
        />
        <!-- The mint's deposit range, the info callout under the picker while an amount is
             typed; the address step repeats it under the QR. -->
        <OnchainDepositLimits
          v-if="isOnchain && showAmountInput"
          class="picker-limits"
          data-testid="deposit-limits-picker"
          :mint-url="activeMintUrl"
          :unit="activeUnit"
        />
        <div
          v-if="!isOnchain && bolt11Supported && bolt12Supported"
          class="row justify-center q-mt-sm"
        >
          <SegmentedControl
            :model-value="isBolt12"
            :disable="createInvoiceButtonBlocked"
            :label="$t('CreateInvoiceDialog.format_label')"
            @update:model-value="(v) => v !== isBolt12 && toggleInvoiceType()"
            :options="[
              {
                label: $t('CreateInvoiceDialog.formats.bolt11'),
                value: false,
              },
              {
                label: $t('CreateInvoiceDialog.formats.bolt12'),
                value: true,
              },
            ]"
          />
        </div>
      </FlowColumn>

      <!-- Amount display -->
      <div class="col column items-center q-px-lg amount-area">
        <transition name="receive-content" mode="out-in">
          <div
            v-if="qrPreview"
            :key="qrPreview.key"
            class="row justify-center full-width receive-qr-preview q-mb-auto"
          >
            <div class="col-12" style="max-width: 400px">
              <div
                v-if="qrPreview.kind === 'reusable' && activeMintErrored"
                class="mint-error-warning"
              >
                <AppCallout
                  variant="warning"
                  :title="$t('CreateInvoiceDialog.mint_unreachable')"
                  :text="$t('CreateInvoiceDialog.mint_unreachable_text')"
                >
                  <template #actions>
                    <q-btn
                      flat
                      dense
                      color="primary"
                      :loading="refreshingMint"
                      @click="refreshActiveMint"
                    >
                      <RefreshCwIcon :size="18" class="q-mr-sm" />
                      {{ $t("CreateInvoiceDialog.reconnect_mint") }}
                      <template #loading
                        ><BusyLabel>{{
                          $t("CreateInvoiceDialog.reconnect_mint")
                        }}</BusyLabel></template
                      >
                    </q-btn>
                  </template>
                </AppCallout>
              </div>
              <template v-else>
                <div class="qr-container cursor-pointer" @click="copyQrPreview">
                  <QrBlock :value="qrPreview.value" />
                </div>
                <QrCopyLine
                  :text="qrPreview.text"
                  :copied="qrPreview.copied"
                  :data-testid="
                    qrPreview.kind === 'npubcash'
                      ? 'npub-cash-lightning-address'
                      : null
                  "
                  @copy="copyQrPreview"
                />
                <OnchainDepositLimits
                  v-if="isOnchain"
                  class="q-mt-md"
                  data-testid="deposit-limits-address"
                  :mint-url="activeMintUrl"
                  :unit="activeUnit"
                />
              </template>
            </div>
          </div>
          <div
            v-else-if="isOnchain && checkingReusableOnchainQuote"
            key="checking-onchain"
            class="column items-center justify-center q-pa-xl q-my-auto"
          >
            <PendingDots size="48px" />
            <div class="text-app-muted q-mt-md">
              {{ $t("CreateInvoiceDialog.checking_address") }}
            </div>
          </div>
          <!-- A plain keyed wrapper: the out-in transition then leaves a DOM element it can
                 track, so going back to the address or offer mounts its QR. -->
          <div
            v-else-if="showAmountInput"
            key="amount-input"
            class="amount-step column justify-center full-width q-my-auto"
          >
            <AmountInputComponent
              class="q-my-auto"
              v-model="invoiceData.amount"
              :enabled="!isOnchain || !createInvoiceButtonBlocked"
              :muted="showOnchainAmountWarning"
              :show-fiat-conversion="!showOnchainAmountWarning"
              @enter="requestMintButton"
            >
              <template #overlay>
                <AmountWarning
                  v-if="showOnchainAmountWarning"
                  data-testid="onchain-amount-error"
                  :text="onchainAmountError"
                  :amount-key="invoiceData.amount ?? ''"
                />
              </template>
            </AmountInputComponent>
          </div>
        </transition>
      </div>

      <!-- Numeric keypad -->
      <!-- Numeric keypad and Secondary Actions -->
      <FlowFooter class="column justify-end">
        <template #above>
          <!-- While the invoice is being created, only the busy button reads as active. -->
          <AmountKeypadPanel
            v-if="showAmountInput"
            :busy="createInvoiceButtonBlocked"
          />

          <!-- Secondary Actions Container (Add Amount) -->
          <FlowColumn
            v-if="isBolt12 && !showAmountInput && !showNpubCashPreview"
            class="q-px-md"
          >
            <q-btn
              class="full-width"
              outline
              rounded
              color="primary"
              @click="bolt12AddAmount = true"
              :label="$t('CreateInvoiceDialog.add_amount')"
            />
          </FlowColumn>

          <!-- Primary action (Add amount / Create). From an amount step opened on an address,
               offer or Lightning address, a back chevron sits before it, as in the onboarding
               footer; the header keeps its close button. -->
        </template>
        <div class="row no-wrap items-center flow-footer">
          <q-btn
            v-if="canReturnToPreview"
            flat
            round
            class="flow-footer__back"
            data-testid="invoice-amount-back"
            :aria-label="$t('common.back')"
            @click="returnToPreview"
          >
            <ChevronLeftIcon :size="24" class="rtl-flip" />
          </q-btn>
          <q-btn
            v-if="showNpubCashPreview"
            class="full-width"
            unelevated
            rounded
            color="primary"
            data-testid="npub-cash-add-amount"
            :label="$t('PaymentRequestDialog.actions.add_amount.label')"
            @click="enterNpubCashAmountMode"
          />
          <q-btn
            v-else
            class="full-width"
            unelevated
            data-testid="create-payment-request"
            :disable="!canCreate"
            @click="requestMintButton"
            color="primary"
            rounded
            type="submit"
            :loading="globalMutexLock || createInvoiceButtonBlocked"
          >
            {{ createButtonLabel }}
            <!-- A label beside the spinner, so the busy state reads even with reduced motion. -->
            <template #loading
              ><BusyLabel>{{
                $t("InvoiceDetailDialog.actions.create.label_blocked")
              }}</BusyLabel></template
            >
          </q-btn>
        </div>
      </FlowFooter>
    </div>
  </FlowDialog>
</template>
<script lang="ts">
import AmountWarning from "src/components/ui/AmountWarning.vue";
import FlowColumn from "src/components/ui/FlowColumn.vue";
import FlowDialog from "src/components/ui/FlowDialog.vue";
import BusyLabel from "src/components/ui/BusyLabel.vue";
import FlowFooter from "src/components/ui/FlowFooter.vue";
import QrCopyLine from "src/components/ui/QrCopyLine.vue";
import SegmentedControl from "src/components/ui/SegmentedControl.vue";
import PendingDots from "src/components/ui/PendingDots.vue";
import {
  ChevronLeft as ChevronLeftIcon,
  RefreshCw as RefreshCwIcon,
} from "lucide-vue-next";
import AppCallout from "src/components/AppCallout.vue";
import UnitToggle from "src/components/ui/UnitToggle.vue";
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import { copyToClipboard } from "quasar";
import ChooseMint from "src/components/ChooseMint.vue";
import AmountKeypadPanel from "src/components/AmountKeypadPanel.vue";
import QrBlock from "src/components/QrBlock.vue";
import FullscreenDialogHeader from "src/components/ui/FullscreenDialogHeader.vue";
import AmountInputComponent from "src/components/AmountInputComponent.vue";
import OnchainDepositLimits from "src/components/OnchainDepositLimits.vue";
import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";
import { useMintsStore } from "src/stores/mints";
import { useSettingsStore } from "src/stores/settings";
import type { InvoiceHistory } from "src/stores/wallet";
import { PaymentMethod } from "src/stores/walletTypes";
import {
  mintPaymentMethodLimits,
  mintSupportsPaymentMethod,
} from "src/js/mint-payment-methods";
import {
  onchainDepositAmountError,
  onchainDepositAmountInBaseUnits,
  onchainDepositQrValue,
} from "src/js/onchain";
import { notifyCopied, notifyError } from "src/js/notify";
import { i18n } from "src/boot/i18n";
import { useNpubCashStore } from "src/stores/npubcash";
import { lightningAddressToLnurl } from "src/js/lnurl";

declare const windowMixin: any;

export default defineComponent({
  name: "CreateInvoiceDialog",
  mixins: [windowMixin],
  components: {
    AmountWarning,
    FlowColumn,
    UnitToggle,
    FlowDialog,
    BusyLabel,
    FlowFooter,
    QrCopyLine,
    SegmentedControl,
    PendingDots,
    RefreshCwIcon,
    AppCallout,
    ChevronLeftIcon,
    ChooseMint,
    AmountKeypadPanel,
    FullscreenDialogHeader,
    AmountInputComponent,
    OnchainDepositLimits,
    QrBlock,
  },
  props: {},
  data: function () {
    return {
      createInvoiceButtonBlocked: false,
      bolt12AddAmount: false as boolean,
      onchainAddAmount: false,
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
      "activeUnitCurrencyMultiplyer",
      "activeMintUrl",
      "mints",
    ]),
    ...mapState(useSettingsStore, ["bip177BitcoinSymbol"]),
    ...mapState(useNpubCashStore, {
      npubCashAddress: "address",
      npubCashMintUrl: "mintUrl",
      showAddressOnReceive: "showAddressOnReceive",
      hasConfiguredNpubCashAddress: "hasConfiguredAddress",
    }),
    isBolt12(): boolean {
      return this.invoiceData.type === PaymentMethod.Bolt12;
    },
    isOnchain(): boolean {
      return this.invoiceData.type === PaymentMethod.Onchain;
    },
    showAmountInput(): boolean {
      if (this.showNpubCashPreview) return false;
      if (this.isOnchain)
        return (
          this.onchainAddAmount ||
          (!this.checkingReusableOnchainQuote && !this.reusableOnchainQuote)
        );
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
    // The amount step was opened from a reusable address, offer or Lightning address preview.
    canReturnToPreview(): boolean {
      if (!this.showAmountInput) return false;
      if (this.isBolt12) return this.bolt12AddAmount;
      if (this.isOnchain)
        return this.onchainAddAmount && this.reusableOnchainQuote !== null;
      // Leaving the amount step shows the Lightning address again only on its own mint
      // and unit (showNpubCashPreview).
      return (
        this.npubCashAddAmount &&
        this.activeUnit === "sat" &&
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
    onchainAmountError(): string {
      if (!this.isOnchain) return "";
      return onchainDepositAmountError(
        onchainDepositAmountInBaseUnits(
          Number(this.invoiceData.amount),
          this.activeUnitCurrencyMultiplyer
        ),
        this.activeUnit,
        mintPaymentMethodLimits(
          this.activeMint,
          PaymentMethod.Onchain,
          "mint",
          this.activeUnit
        ),
        this.bip177BitcoinSymbol,
        (key: string, named: Record<string, string>) =>
          i18n.global.t(key, named)
      );
    },
    showOnchainAmountWarning(): boolean {
      // Stay quiet until an amount is entered; the disabled button covers zero.
      return (
        this.isOnchain &&
        Number(this.invoiceData.amount) > 0 &&
        !!this.onchainAmountError
      );
    },
    canCreate(): boolean {
      if (this.activeMintErrored) return false;
      if (this.isOnchain)
        return (
          this.onchainSupported &&
          !this.createInvoiceButtonBlocked &&
          !this.globalMutexLock &&
          (this.showReusableQuote || !this.onchainAmountError)
        );
      // Bolt12 supports amountless offers; Bolt11 requires a positive amount.
      if (this.isBolt12) return true;
      return (
        this.invoiceData.amount != null && Number(this.invoiceData.amount) > 0
      );
    },
    createButtonLabel(): string {
      if (this.isBolt12) {
        return i18n.global.t(
          this.showReusableQuote
            ? "CreateInvoiceDialog.new_offer"
            : "CreateInvoiceDialog.create_offer"
        );
      }
      if (this.isOnchain) {
        return i18n.global.t(
          this.showReusableQuote
            ? "CreateInvoiceDialog.create_new_address"
            : "CreateInvoiceDialog.create_address"
        );
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
      if (this.isOnchain)
        return onchainDepositQrValue(
          request,
          this.reusableReceiveQuote?.requestedAmount,
          this.reusableReceiveQuote?.unit || this.activeUnit
        );
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
        this.onchainAddAmount = false;
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
    returnToPreview() {
      if (this.isBolt12) this.bolt12AddAmount = false;
      else if (this.isOnchain) this.onchainAddAmount = false;
      else this.npubCashAddAmount = false;
    },
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
        notifyCopied();
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
      if (this.isOnchain && this.showReusableQuote) {
        this.onchainAddAmount = true;
        this.invoiceData.amount = "";
        this.$nextTick(() => {
          this.showNumericKeyboard = true;
        });
        return;
      }
      try {
        this.showNumericKeyboard = false;
        const amount = this.isOnchain
          ? onchainDepositAmountInBaseUnits(
              Number(this.invoiceData.amount),
              this.activeUnitCurrencyMultiplyer
            )
          : Math.floor(
              (this.invoiceData.amount || 0) * this.activeUnitCurrencyMultiplyer
            );
        this.createInvoiceButtonBlocked = true;

        // Get wallet instance
        const wallet = await this.activeWallet(true);

        if (this.isOnchain) {
          // Validate again against the refreshed mint before creating an address.
          const mint = this.mints.find(
            (entry) => entry.url === wallet.mint.mintUrl
          );
          if (
            !mint ||
            !mintSupportsPaymentMethod(
              mint,
              PaymentMethod.Onchain,
              "mint",
              wallet.unit
            )
          ) {
            notifyError(
              i18n.global.t("CreateInvoiceDialog.onchain_unsupported")
            );
            return;
          }
          const error = onchainDepositAmountError(
            amount,
            wallet.unit,
            mintPaymentMethodLimits(
              mint,
              PaymentMethod.Onchain,
              "mint",
              wallet.unit
            ),
            this.bip177BitcoinSymbol,
            (key: string, named: Record<string, string>) =>
              i18n.global.t(key, named)
          );
          if (error) {
            notifyError(error);
            return;
          }
          const mintQuote = await this.requestMintOnchain(wallet, amount);

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
          notifyCopied();
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
.flow-footer {
  gap: 12px;
}
.flow-footer > .q-btn:not(.flow-footer__back) {
  flex: 1;
}
.flow-footer__back {
  flex: none;
  height: 48px;
  width: 48px;
}

/* The picker's own 16px and its column's 8px already sit above: the QR lands one 16px step
   under the picker, like every gap in the stack below it. */
.receive-qr-preview {
  margin-top: -8px;
}
.qr-container {
  position: relative;
  border-radius: var(--app-radius-md);
  overflow: hidden;
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
/* 12px under the mint card (ChooseMint keeps a 16px bottom inset), so the amount and its fiat
   line still clear the keypad on a 568px or 667px phone. */
.picker-limits {
  margin-top: -4px;
}
@media (max-height: 700px) {
  .picker-limits {
    padding-block: 8px;
  }
}
.mint-error-warning {
  align-items: center;
  display: flex;
  min-height: 260px;
}
</style>
