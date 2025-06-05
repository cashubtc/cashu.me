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
          <div v-for="mint in multiMints" :key="mint.url">
            <q-item clickable class="q-pb-xs" @click="toggleMint(mint)">
              <q-item-section avatar>
                <q-checkbox
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
                >
                  {{ mint.nickname || getShortUrl(mint.url) }}
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
          label="Multi-Mint Pay"
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
    openMultinutDialog() {
      this.selectedMints = [...useMintsStore().multiMints];
      this.showMultinutPaymentDialog = true;
    },
    closeMultinutDialog() {
      this.showMultinutPaymentDialog = false;
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

      let mintAndQuotesArray = [];
      let remainder = 0.0;
      let i = 0;
      this.multiMeltButtonLoading = true;
      let data;

      try {
        for (const mint of this.selectedMints) {
          console.log(`Quoting mint: ${mint.url}`);
          const mintWallet = useWalletStore().mintWallet(
            mint.url,
            useMintsStore().activeUnit
          );

          const partialAmountFloat = totalQuoteAmount * weights[i] + remainder;
          const partialAmount = Math.round(partialAmountFloat);
          console.log(`partialAmount for mint ${mint.url}: ${partialAmount}`);
          remainder = partialAmountFloat - partialAmount;

          if (partialAmount > 0) {
            const quote = await this.meltQuote(
              mintWallet,
              this.payInvoiceData.input.request,
              partialAmount
            );
            console.log(quote);
            mintAndQuotesArray.push([mint, quote]);
          }
          i++;
        }

        data = await Promise.all(
          mintAndQuotesArray.map(([mint, quote]) => {
            const mintWallet = useWalletStore().mintWallet(
              mint.url,
              activeUnit
            );
            const mintClass = new MintClass(mint);
            const proofs = mintClass.unitProofs(activeUnit);
            return this.melt(proofs, quote, mintWallet, true);
          })
        );
      } catch (error) {
        notifyError(`Multi-nut payment failed: ${error}`);
        console.error(`${error}`);
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

      // Close the dialog after successful payment
      this.showMultinutPaymentDialog = false;
      this.payInvoiceData.show = false;
    },
  },
});
</script>

<style lang="scss" scoped>
.qcard {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}
</style>
