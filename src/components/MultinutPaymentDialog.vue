<template>
  <q-dialog
    v-model="showMultinutPaymentDialog"
    position="top"
    :maximized="$q.screen.lt.sm"
    backdrop-filter="blur(2px) brightness(60%)"
    transition-show="fade"
    transition-hide="fade"
    no-backdrop-dismiss
    full-height
  >
    <q-card class="q-pa-lg q-pt-xl qcard">
      <div class="row items-center no-wrap q-mb-lg">
        <div class="col-10">
          <h5 class="q-my-none">Multinut Payment</h5>
          <p class="q-my-xs text-grey-6">
            Pay
            {{
              formatCurrency(
                payInvoiceData.meltQuote.response.amount,
                activeUnit
              )
            }}
            using multiple mints
          </p>
        </div>
        <div class="col-2 text-right">
          <q-btn
            v-close-popup
            flat
            round
            dense
            icon="close"
            color="grey"
            @click="closeMultinutDialog"
          />
        </div>
      </div>

      <!-- Minimalist Mint Selection List -->
      <div class="q-mb-lg">
        <q-list padding>
          <q-item>
            <q-item-section>
              <q-item-label overline class="text-weight-bold">
                Select Mints
              </q-item-label>
              <q-item-label caption>
                Choose one or multiple mints to execute the payment.
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-list padding>
          <div
            v-for="mint in multiMints"
            :key="mint.url"
            v-show="!isPaymentInProgress || isSelected(mint)"
          >
            <q-item
              clickable
              class="q-pb-xs"
              @click="!isPaymentInProgress && toggleMint(mint)"
              :class="{ 'cursor-not-allowed': isPaymentInProgress }"
            >
              <q-item-section avatar>
                <!-- Show state indicator during payment, checkbox otherwise -->
                <div
                  v-if="isPaymentInProgress && isSelected(mint)"
                  class="state-indicator"
                >
                  <q-spinner
                    v-if="
                      mintStates[mint.url] === 'requesting' ||
                      mintStates[mint.url] === 'paying'
                    "
                    color="primary"
                    size="24px"
                  />
                  <q-icon
                    v-else-if="mintStates[mint.url] === 'success'"
                    name="check_circle"
                    color="positive"
                    size="24px"
                  />
                  <q-icon
                    v-else-if="mintStates[mint.url] === 'error'"
                    name="error"
                    color="negative"
                    size="24px"
                  />
                </div>
                <q-checkbox
                  v-else
                  :model-value="isSelected(mint)"
                  @update:model-value="toggleMint(mint)"
                  :color="isSelected(mint) ? 'primary' : 'grey'"
                  class="cursor-pointer"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label
                  lines="1"
                  class="cursor-pointer"
                  style="word-break: break-word"
                  :class="{ 'cursor-not-allowed': isPaymentInProgress }"
                >
                  {{ mint.nickname || getShortUrl(mint.url) }}
                  <!-- State text during payment -->
                  <span
                    v-if="
                      isPaymentInProgress &&
                      isSelected(mint) &&
                      mintStates[mint.url]
                    "
                    class="text-caption text-grey-6 q-ml-sm"
                  >
                    ({{ getStateText(mintStates[mint.url]) }})
                  </span>
                </q-item-label>
                <q-item-label>
                  <q-badge
                    v-for="unit in mintClass(mint).units"
                    :key="unit"
                    :color="isSelected(mint) ? 'primary' : 'grey'"
                    :label="
                      formatCurrency(mintClass(mint).unitBalance(unit), unit)
                    "
                    class="q-mx-xs q-mb-xs"
                  />
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-separator spaced />
          </div>
          <!-- Total Selected Balance -->
          <q-item>
            <q-item-section>
              <q-item-label overline class="text-weight-bold">
                Total Selected Balance
              </q-item-label>
              <q-item-label caption>
                {{ formatCurrency(totalSelectedBalance, activeUnit) }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- Action Buttons - aligned like PayInvoiceDialog -->
      <div class="row q-mt-lg">
        <q-btn
          unelevated
          rounded
          color="primary"
          :disabled="!canExecutePayment"
          @click="executeMultinutPayment"
          :loading="multiMeltButtonLoading"
          label="Pay Multinut"
          class="q-px-lg"
        >
          <template v-slot:loading>
            <q-spinner-hourglass />
          </template>
        </q-btn>
        <q-btn flat color="grey" class="q-ml-auto" @click="closeMultinutDialog">
          Cancel
        </q-btn>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useMintsStore, MintClass } from "src/stores/mints";
import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";
import { notifyError, notifySuccess } from "src/js/notify";
import { getShortUrl } from "src/js/wallet-helpers";

export default defineComponent({
  name: "MultinutPaymentDialog",
  mixins: [windowMixin],
  components: {},
  data() {
    return {
      multiMeltButtonLoading: false,
      selectedMints: [],
      showMultinutPaymentDialog: false,
      // State tracking for each mint during payment
      mintStates: {}, // { mintUrl: 'requesting' | 'paying' | 'success' | 'error' }
      isPaymentInProgress: false,
    };
  },
  computed: {
    ...mapWritableState(useWalletStore, ["payInvoiceData"]),
    ...mapState(useMintsStore, ["mints", "activeUnit", "multiMints"]),
    totalSelectedBalance() {
      return this.selectedMints.reduce((total, mint) => {
        const mintInstance = this.mintClass(mint);
        return total + mintInstance.unitBalance(this.activeUnit);
      }, 0);
    },
    canExecutePayment() {
      return (
        this.selectedMints.length > 0 &&
        this.totalSelectedBalance >=
          this.payInvoiceData.meltQuote.response.amount &&
        !this.multiMeltButtonLoading
      );
    },
  },
  methods: {
    ...mapActions(useWalletStore, ["meltQuote", "melt"]),
    ...mapActions(useMintsStore, ["activateMintUrl"]),
    mintClass(mint) {
      return new MintClass(mint);
    },
    getShortUrl(url) {
      return getShortUrl(url);
    },
    isSelected(mint) {
      return this.selectedMints.some((selected) => selected.url === mint.url);
    },
    toggleMint(mint) {
      const index = this.selectedMints.findIndex(
        (selected) => selected.url === mint.url
      );
      if (index >= 0) {
        this.selectedMints.splice(index, 1);
      } else {
        this.selectedMints.push(mint);
      }
    },
    getStateText(state) {
      switch (state) {
        case "requesting":
          return "Requesting...";
        case "paying":
          return "Paying...";
        case "success":
          return "Success";
        case "error":
          return "Failed";
        default:
          return "";
      }
    },
    setMintState(mintUrl, state) {
      // Use Vue 3 compatible reactivity
      this.mintStates = { ...this.mintStates, [mintUrl]: state };
    },
    clearMintStates() {
      this.mintStates = {};
      this.isPaymentInProgress = false;
    },
    openMultinutDialog() {
      this.selectedMints = [...useMintsStore().multiMints];
      this.showMultinutPaymentDialog = true;
      this.clearMintStates(); // Clear any previous states
    },
    closeMultinutDialog() {
      this.showMultinutPaymentDialog = false;
      this.clearMintStates(); // Clear states when dialog closes
      // Re-open the PayInvoiceDialog
      this.$emit("return-to-pay-dialog");
    },
    multiMintBalance: function (selectedMints, unit) {
      const multiMints = selectedMints;
      const mintBalances = [];
      const overallBalance = multiMints.reduce((sum, m) => {
        const mint = new MintClass(m);
        const mintBalance = mint.unitBalance(unit);
        mintBalances.push(mintBalance);
        return sum + mintBalance;
      }, 0);
      const weights = mintBalances.map((b) => b / overallBalance);
      return { overallBalance: overallBalance, weights: weights };
    },
    executeMultinutPayment: async function () {
      const uiStore = useUiStore();
      const totalQuoteAmount = this.payInvoiceData.meltQuote.response.amount;
      const activeUnit = useMintsStore().activeUnit;
      const { overallBalance, weights } = this.multiMintBalance(
        this.selectedMints,
        activeUnit
      );

      if (totalQuoteAmount > overallBalance) {
        console.error("multi-mint balance not enough to satisfy this invoice");
        notifyError("Multi-mint balance not enough to satisfy this invoice");
        return;
      }

      // Clear previous states
      this.clearMintStates();

      // Start payment process
      this.isPaymentInProgress = true;
      this.multiMeltButtonLoading = true;

      let mintAndQuotesArray = [];
      let remainder = 0.0;
      let i = 0;
      let data;

      try {
        // Phase 1: Request quotes from all selected mints
        mintAndQuotesArray = await Promise.all(
          this.selectedMints.map(async (mint, i) => {
            this.setMintState(mint.url, "requesting");

            console.log(`Quoting mint: ${mint.url}`);
            const mintWallet = useWalletStore().mintWallet(
              mint.url,
              useMintsStore().activeUnit
            );

            const partialAmountFloat =
              totalQuoteAmount * weights[i] + remainder;
            const partialAmount = Math.round(partialAmountFloat);
            console.log(`partialAmount for mint ${mint.url}: ${partialAmount}`);
            remainder = partialAmountFloat - partialAmount;

            if (partialAmount > 0) {
              try {
                const quote = await this.meltQuote(
                  mintWallet,
                  this.payInvoiceData.input.request,
                  partialAmount
                );
                console.log(quote);
                return [mint, quote];
              } catch (error) {
                console.error(`Quote failed for mint ${mint.url}:`, error);
                this.setMintState(mint.url, "error");
                throw error;
              }
            }
            return null;
          })
        );

        // Filter out null values (for mints with partialAmount <= 0)
        mintAndQuotesArray = mintAndQuotesArray.filter((item) => item !== null);

        // Phase 2: Execute payments
        data = await Promise.all(
          mintAndQuotesArray.map(async ([mint, quote]) => {
            try {
              // Move to paying state
              this.setMintState(mint.url, "paying");
              const mintWallet = useWalletStore().mintWallet(
                mint.url,
                activeUnit
              );
              const mintClass = new MintClass(mint);
              const proofs = mintClass.unitProofs(activeUnit);
              const result = await this.melt(proofs, quote, mintWallet, true);

              // Mark as success
              this.setMintState(mint.url, "success");
              return result;
            } catch (error) {
              console.error(`Payment failed for mint ${mint.url}:`, error);
              this.setMintState(mint.url, "error");
              throw error;
            }
          })
        );
      } catch (error) {
        notifyError(`Multi-nut payment failed: ${error}`);
        console.error(`${error}`);

        // Reset states on error so user can try again
        setTimeout(() => {
          this.clearMintStates();
        }, 3000); // Show error states for 3 seconds before clearing

        throw error;
      } finally {
        this.multiMeltButtonLoading = false;
      }

      uiStore.vibrate();
      const amountPaid =
        mintAndQuotesArray.reduce(
          (acc, q) => acc + q[1].amount + q[1].fee_reserve,
          0
        ) -
        data.reduce(
          (acc, d) => acc + d.change.reduce((acc1, p) => acc1 + p.amount, 0),
          0
        );

      notifySuccess(
        "Paid " +
          uiStore.formatCurrency(amountPaid, activeUnit) +
          " via Lightning"
      );

      // add invoice to history
      useInvoiceStore().addInvoice(this.payInvoiceData);

      // Close the dialog after successful payment
      setTimeout(() => {
        this.showMultinutPaymentDialog = false;
        this.payInvoiceData.show = false;
        this.clearMintStates();
      }, 2000); // Show success states for 2 seconds before closing
    },
  },
});
</script>

<style lang="scss" scoped>
.qcard {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.state-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.cursor-not-allowed {
  cursor: not-allowed !important;
  opacity: 0.7;
}
</style>
