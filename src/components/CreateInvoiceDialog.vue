<template>
  <q-dialog
    v-model="showCreateInvoiceDialog"
    maximized
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
        <div class="row items-center q-pa-md sheet-column-header">
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
              class="dialog-header"
              :class="$q.dark.isActive ? 'text-white' : 'text-black'"
            >
              {{
                isOnchain
                  ? $t("CreateInvoiceDialog.onchain_title")
                  : isBolt12 && !showNpubCashPreview
                  ? $t("CreateInvoiceDialog.bolt12_title")
                  : $t("InvoiceDetailDialog.title")
              }}
            </q-item-label>
          </div>
          <div class="row items-center no-wrap sheet-header-actions">
            <q-btn
              flat
              round
              no-caps
              color="primary"
              class="sheet-unit-toggle"
              @click="toggleUnit()"
              :label="activeUnitLabel"
            />
          </div>
        </div>

        <!-- Mint selection -->
        <div class="row justify-center">
          <div
            class="col-12 q-px-md q-mb-sm"
            style="max-width: var(--app-column)"
          >
            <ChooseMint
              :filter-payment-method="mintFilterMethod"
              filter-mint-operation="mint"
              :disable="createInvoiceButtonBlocked"
            />
            <div
              v-if="!isOnchain && bolt11Supported && bolt12Supported"
              class="row justify-center q-mt-sm"
            >
              <q-btn-toggle
                :model-value="isBolt12"
                :disable="createInvoiceButtonBlocked"
                @update:model-value="
                  (v) => v !== isBolt12 && toggleInvoiceType()
                "
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
                rounded
                unelevated
                no-caps
                toggle-color="primary"
                class="invoice-type-toggle"
              />
            </div>
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
                  class="app-callout app-callout--warning mint-error-warning column items-center text-center q-pa-lg"
                >
                  <q-icon name="warning" size="42px" color="warning" />
                  <div class="mint-error-title q-mt-md">
                    {{ $t("CreateInvoiceDialog.mint_unreachable") }}
                  </div>
                  <div class="mint-error-text q-mt-sm">
                    {{ $t("CreateInvoiceDialog.mint_unreachable_text") }}
                  </div>
                  <q-btn
                    flat
                    dense
                    no-caps
                    color="primary"
                    icon="refresh"
                    class="q-mt-md"
                    :label="$t('CreateInvoiceDialog.reconnect_mint')"
                    :loading="refreshingMint"
                    @click="refreshActiveMint"
                  >
                    <template v-slot:loading
                      ><q-spinner-dots size="20px" class="on-left" />{{
                        $t("CreateInvoiceDialog.reconnect_mint")
                      }}</template
                    >
                  </q-btn>
                </div>
                <template v-else>
                  <div
                    class="qr-container cursor-pointer"
                    @click="copyQrPreview"
                  >
                    <q-responsive :ratio="1" class="app-qr">
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
                    class="q-mt-sm text-center text-grey-7 qr-copy-text app-mono app-mono--wrap cursor-pointer"
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
                  <OnchainDepositLimits
                    v-if="isOnchain"
                    class="q-mt-md"
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
              <q-spinner size="48px" color="primary" />
              <div class="text-grey-6 q-mt-md">
                {{ $t("CreateInvoiceDialog.checking_address") }}
              </div>
            </div>
            <!-- A plain keyed wrapper: the out-in transition then leaves a DOM element it can
                 track, so going back to the address or offer mounts its QR (R46). -->
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
                @fiat-mode-changed="fiatKeyboardMode = $event"
              >
                <template #overlay>
                  <div
                    v-if="showOnchainAmountWarning"
                    class="amount-warning-badge"
                    role="status"
                    data-testid="onchain-amount-error"
                  >
                    <transition name="wobble" mode="out-in" appear>
                      <span
                        :key="'warn-text-' + String(invoiceData.amount ?? '')"
                        class="text-caption text-weight-medium text-grey-6 amount-warning-text"
                      >
                        {{ onchainAmountError }}
                      </span>
                    </transition>
                  </div>
                </template>
              </AmountInputComponent>
            </div>
          </transition>
        </div>

        <!-- Numeric keypad -->
        <!-- Numeric keypad and Secondary Actions -->
        <div class="bottom-panel column justify-end">
          <!-- While the invoice is being created, only the busy button reads as active. -->
          <div
            class="keypad-wrapper"
            :class="{ 'keypad-wrapper--busy': createInvoiceButtonBlocked }"
            v-if="showAmountInput"
          >
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
            <div class="col-12 q-px-md" style="max-width: var(--app-column)">
              <q-btn
                class="full-width"
                outline
                rounded
                color="primary"
                size="lg"
                @click="bolt12AddAmount = true"
                :label="$t('CreateInvoiceDialog.add_amount')"
              />
            </div>
          </div>

          <!-- Primary action (Add amount / Create). From an amount step opened on an address,
               offer or Lightning address, a back chevron sits before it, as in the onboarding
               footer (user direction, R46); the header keeps its close button. -->
          <div class="row justify-center q-pb-lg q-pt-sm">
            <div
              class="col-12 q-px-md row no-wrap items-center flow-footer"
              style="max-width: var(--app-column)"
            >
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
                <!-- A label beside the spinner, so the busy state reads even with reduced motion. -->
                <template v-slot:loading>
                  <q-spinner-dots size="20px" class="on-left" />
                  {{ $t("InvoiceDetailDialog.actions.create.label_blocked") }}
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
import { ChevronLeft as ChevronLeftIcon } from "lucide-vue-next";
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import { copyToClipboard } from "quasar";
import VueQrcode from "@chenfengyuan/vue-qrcode";
import ChooseMint from "src/components/ChooseMint.vue";
import NumericKeyboard from "src/components/NumericKeyboard.vue";
import AmountInputComponent from "src/components/AmountInputComponent.vue";
import OnchainDepositLimits from "src/components/OnchainDepositLimits.vue";
import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";
import { useMintsStore } from "src/stores/mints";
import { useSettingsStore } from "src/stores/settings";
import { usePriceStore } from "src/stores/price";
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
import { notifyError } from "src/js/notify";
import { i18n } from "src/boot/i18n";
import { useNpubCashStore } from "src/stores/npubcash";
import { lightningAddressToLnurl } from "src/js/lnurl";

declare const windowMixin: any;

export default defineComponent({
  name: "CreateInvoiceDialog",
  mixins: [windowMixin],
  components: {
    ChevronLeftIcon,
    ChooseMint,
    NumericKeyboard,
    AmountInputComponent,
    OnchainDepositLimits,
    VueQrcode,
  },
  props: {},
  data: function () {
    return {
      createInvoiceButtonBlocked: false,
      fiatKeyboardMode: false as boolean,
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
      "activeUnitLabel",
      "activeUnitCurrencyMultiplyer",
      "activeMintUrl",
      "mints",
    ]),
    ...mapState(useSettingsStore, [
      "bitcoinPriceCurrency",
      "useNumericKeyboard",
      "bip177BitcoinSymbol",
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
.keypad-wrapper--busy {
  opacity: 0.4;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.send-fullscreen {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.qr-container {
  position: relative;
  border-radius: 8px;
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
.amount-container {
  overflow: hidden;
}
.amount-display {
  overflow-wrap: break-word;
  word-break: break-all;
  max-width: 100%;
}
.mint-error-warning {
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
.amount-warning-badge {
  position: absolute;
  top: calc(100% - 20px);
  left: 0;
  right: 0;
  z-index: 2;
  pointer-events: none;
  text-align: center;
}
.amount-warning-text {
  display: inline-block;
  font-size: 16px;
}
@media (prefers-reduced-motion: reduce) {
}
</style>
