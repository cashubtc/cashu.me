<template>
  <div style="max-width: 800px; margin: 0 auto">
    <!-- Mints Selection -->
    <q-expansion-item class="q-pt-lg" dense dense-toggle>
      <template v-slot:header>
        <div class="q-px-xs text-left" on-left>
          <q-list padding>
            <q-item>
              <q-item-section>
                <q-item-label overline class="text-weight-bold">
                  {{ $t("MultinutPicker.payment") }}
                </q-item-label>
                <q-item-label caption>
                  {{ $t("MultinutPicker.selectMints") }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </template>

      <!-- List of mints with checkboxes -->
      <div
        style="max-height: 200px; overflow-y: auto"
        class="q-pb-md q-px-xs text-left"
        on-left
      >
        <q-list padding>
          <div v-for="mint in multiMints" :key="mint.url">
            <q-item clickable class="q-pb-xs">
              <q-item-section avatar>
                <q-checkbox
                  v-model="selectedMints"
                  :val="mint"
                  :color="selectedMints.includes(mint) ? 'primary' : 'grey'"
                  class="cursor-pointer"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label
                  lines="1"
                  class="cursor-pointer"
                  style="word-break: break-word"
                >
                  {{ mint.nickname || mint.url }}
                </q-item-label>
                <q-item-label>
                  <q-badge
                    v-for="unit in mintClass(mint).units"
                    :key="unit"
                    :color="
                      selectedMints.includes(mint.url) ? 'primary' : 'grey'
                    "
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
                {{ $t("MultinutPicker.totalSelectedBalance") }}
              </q-item-label>
              <q-item-label caption>
                {{ formatCurrency(totalSelectedBalance, activeUnit) }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <!-- button to quote all selected mints -->
        <q-btn
          unelevated
          rounded
          color="primary"
          :disabled="totalSelectedBalance < payInvoiceData.invoice.sat"
          @click="multiMeltSelectedMints"
          :label="$t('MultinutPicker.multiMintPay')"
          :loading="multiMeltButtonLoading"
          class="q-px-lg"
        >
          <template v-slot:loading>
            <q-spinner-hourglass />
          </template>
        </q-btn>
      </div>
    </q-expansion-item>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useMintsStore, MintClass } from "src/stores/mints";
import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";
import { notifyError, notifySuccess } from "src/js/notify";

export default defineComponent({
  name: "MultinutView",
  mixins: [windowMixin],
  data() {
    return {
      multiMeltButtonLoading: false,
      selectedMints: useMintsStore().multiMints,
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
  },
  methods: {
    ...mapActions(useWalletStore, ["meltQuote", "melt"]),
    ...mapActions(useMintsStore, ["activateMintUrl", "proofsForMintAndUnit"]),
    mintClass(mint) {
      return new MintClass(mint);
    },
    multiMintBalance: function (selectedMints, unit) {
      // returns:
      // * the overall balance of all mints supporting NUT-15 for a particular method and unit
      // * array of weights (share of how much each mint influences the overall balance)
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
    multiMeltSelectedMints: async function () {
      const uiStore = useUiStore();
      const totalQuoteAmount = this.payInvoiceData.invoice.sat;
      const activeUnit = useMintsStore().activeUnit;
      const { overallBalance, weights } = this.multiMintBalance(
        this.selectedMints,
        activeUnit
      );
      if (totalQuoteAmount >= overallBalance) {
        console.error("multi-mint balance not enough to satisfy this invoice");
        notifyError(this.$i18n.t("MultinutPicker.balanceNotEnough"));
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
        console.log(
          `mintAndQuotesArray: ${JSON.stringify(mintAndQuotesArray)}`
        );
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
        notifyError(this.$i18n.t("MultinutPicker.failed", { error: error }));
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
        this.$i18n.t("MultinutPicker.paid", {
          amount: uiStore.formatCurrency(amountPaid, activeUnit),
        })
      );
    },
  },
});
</script>
