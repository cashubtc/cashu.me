<template>
  <q-dialog
    v-model="showInvoiceDetails"
    maximized
    transition-show="fade"
    transition-hide="fade"
    no-backdrop-dismiss
  >
    <q-card class="q-pa-none qcard">
      <div
        :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
        class="display-token-fullscreen"
      >
        <!-- Header -->
        <FullscreenDialogHeader
          :title="
            isBolt12
              ? 'Lightning Bolt12'
              : isOnchain
              ? 'On-chain'
              : $t('InvoiceDetailDialog.invoice.caption')
          "
        />

        <!-- Content -->
        <div class="content-area">
          <q-card-section class="q-pa-none">
            <div
              v-if="invoiceData.status === 'paid'"
              class="paid-status column items-center q-mb-md"
            >
              <CircleCheckIcon
                :size="64"
                :stroke-width="1.5"
                class="text-positive"
              />
              <div class="paid-status__label q-mt-sm">
                {{ $t("InvoiceDetailDialog.invoice.status_paid_text") }}
              </div>
            </div>
            <div
              v-else-if="invoiceData.request"
              class="row justify-center q-mb-md"
            >
              <div class="col-12 q-px-md" style="max-width: var(--app-column)">
                <div class="qr-container">
                  <component
                    :is="isOnchain ? 'div' : 'a'"
                    class="text-secondary"
                    :href="qrLink"
                  >
                    <QrBlock :value="qrValue" />
                  </component>
                </div>
                <QrProgress :active="runnerActive" />
                <div
                  v-if="isOnchain"
                  class="q-mt-sm text-center text-grey-7 qr-copy-text app-mono app-mono--wrap cursor-pointer"
                  @click="onCopyBolt11"
                >
                  <CheckIcon
                    v-if="copyButtonCopied"
                    :size="16"
                    class="q-mr-xs qr-copy-text__icon"
                  />
                  <CopyIcon
                    v-else
                    :size="16"
                    class="q-mr-xs qr-copy-text__icon"
                  />
                  {{ invoiceData.request }}
                </div>
                <OnchainDepositLimits
                  v-if="isOnchain && invoiceData.status !== 'paid'"
                  class="q-mt-md"
                  :mint-url="invoiceData.mint"
                  :unit="invoiceData.unit"
                />
              </div>
            </div>

            <div v-if="invoiceData.amount" class="amount-headline text-center">
              {{ displayUnit }}
            </div>

            <q-card-section class="q-pa-none">
              <div v-if="invoiceData?.mintQuote" class="row justify-center">
                <div
                  class="col-12 q-px-md"
                  style="max-width: var(--app-column)"
                >
                  <MintQuoteInformation
                    hide-paid-status
                    :mint-quote="invoiceData.mintQuote"
                    :invoice="invoiceData"
                    :mint-url="invoiceData.mint"
                    :show-amount="!invoiceData.amount"
                    :method="invoiceMethod"
                    :refresh-trigger="metadataRefreshTrigger"
                  />
                </div>
              </div>
              <div
                v-else-if="invoiceData?.meltQuote"
                class="row justify-center q-pt-lg"
              >
                <div
                  class="col-12 q-px-md"
                  style="max-width: var(--app-column)"
                >
                  <MeltQuoteInformation
                    hide-paid-status
                    :melt-quote="invoiceData.meltQuote"
                    :invoice="invoiceData"
                    :mint-url="invoiceData.mint"
                    :history-paid-at="invoiceData.paidDate"
                    :show-amount="!invoiceData.amount"
                    :refresh-trigger="metadataRefreshTrigger"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card-section>
        </div>

        <!-- Bottom panel action -->
        <div class="bottom-panel">
          <div class="row justify-center q-pb-lg q-pt-sm">
            <div class="col-12 q-px-md" style="max-width: var(--app-column)">
              <!-- Always rendered (disabled until the request arrives), so the footer never
                   appears late and shifts the screen. -->
              <q-btn
                :disable="!invoiceData.request"
                class="full-width"
                unelevated
                size="lg"
                color="primary"
                rounded
                @click="onCopyBolt11"
              >
                {{ copyButtonLabel }}
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
import QrBlock from "src/components/QrBlock.vue";
import QrProgress from "src/components/QrProgress.vue";
import FullscreenDialogHeader from "src/components/ui/FullscreenDialogHeader.vue";
import { copyToClipboard } from "quasar";
import {
  Check as CheckIcon,
  CircleCheck as CircleCheckIcon,
  Copy as CopyIcon,
} from "lucide-vue-next";

import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";
import { useWorkersStore } from "src/stores/workers";
import MeltQuoteInformation from "src/components/MeltQuoteInformation.vue";
import MintQuoteInformation from "src/components/MintQuoteInformation.vue";
import OnchainDepositLimits from "src/components/OnchainDepositLimits.vue";
import { PaymentMethod } from "src/stores/walletTypes";
import { onchainDepositQrValue } from "src/js/onchain";
// type hint for global mixin
declare const windowMixin: any;

export default defineComponent({
  name: "InvoiceDetailDialog",
  mixins: [windowMixin],
  components: {
    CheckIcon,
    CopyIcon,
    CircleCheckIcon,
    QrBlock,
    QrProgress,
    FullscreenDialogHeader,
    MeltQuoteInformation,
    MintQuoteInformation,
    OnchainDepositLimits,
  },
  props: {},
  data: function () {
    return {
      copyButtonCopied: false,
      copyButtonTimeout: null as any,
      metadataRefreshTrigger: 0,
    };
  },
  computed: {
    ...mapState(useWalletStore, ["invoiceData"]),
    ...mapState(useWorkersStore, ["invoiceWorkerRunning"]),
    ...mapWritableState(useUiStore, ["showInvoiceDetails"]),
    displayUnit: function () {
      const display = (this as any).formatCurrency(
        this.invoiceData.amount,
        this.invoiceData.unit,
        true
      );
      // Same true minus sign as the history list.
      return display.replace(/^(\u2066?)-\s*/, "$1\u2212");
    },
    runnerActive: function () {
      return this.invoiceWorkerRunning;
    },
    isSmallScreen() {
      return this.$q.screen.lt.sm;
    },
    invoiceMethod(): PaymentMethod {
      const method =
        (this.invoiceData as any).method ||
        (this.invoiceData as any).paymentType ||
        (this.invoiceData as any).protocol ||
        this.invoiceData.type;
      return Object.values(PaymentMethod).includes(method)
        ? method
        : PaymentMethod.Bolt11;
    },
    copyButtonLabel: function () {
      if (this.copyButtonCopied) {
        return this.$t("common.copied");
      }
      return this.$t("InvoiceDetailDialog.invoice.actions.copy.label");
    },
    isBolt12(): boolean {
      return (
        this.invoiceData.type === PaymentMethod.Bolt12 ||
        this.invoiceData.type === PaymentMethod.Bolt12Subpayment ||
        (this.invoiceData as any).method === PaymentMethod.Bolt12 ||
        (this.invoiceData as any).method === PaymentMethod.Bolt12Subpayment
      );
    },
    isOnchain(): boolean {
      return (
        this.invoiceData.type === PaymentMethod.Onchain ||
        this.invoiceData.type === PaymentMethod.OnchainSubpayment
      );
    },
    qrValue(): string {
      return this.isOnchain
        ? onchainDepositQrValue(
            this.invoiceData.request,
            this.invoiceData.requestedAmount,
            this.invoiceData.unit
          )
        : "lightning:" + this.invoiceData.request.toUpperCase();
    },
    qrLink(): string | undefined {
      return this.isOnchain
        ? undefined
        : "lightning:" + this.invoiceData.request;
    },
  },
  watch: {
    showInvoiceDetails(val: boolean) {
      if (val) {
        this.metadataRefreshTrigger += 1;
      }
    },
  },
  methods: {
    onCopyBolt11: async function () {
      const request = this.invoiceData?.request;
      if (request) {
        try {
          await copyToClipboard(request);
          this.copyButtonCopied = true;
          // Clear any existing timeout
          if (this.copyButtonTimeout) {
            clearTimeout(this.copyButtonTimeout);
          }
          // Reset button label after 3 seconds
          this.copyButtonTimeout = setTimeout(() => {
            this.copyButtonCopied = false;
          }, 3000);
        } catch (error) {
          console.error("Failed to copy to clipboard:", error);
        }
      }
    },
  },
  beforeUnmount() {
    if (this.copyButtonTimeout) {
      clearTimeout(this.copyButtonTimeout);
    }
  },
});
</script>

<style scoped>
/* QR Code with checkmark overlay */
.qr-container {
  position: relative;
  border-radius: var(--app-radius-md);
  overflow: hidden;
}

.paid-status {
  padding-top: 24px;
}
.paid-status__label {
  font-size: 17px;
  font-weight: 600;
}
</style>
