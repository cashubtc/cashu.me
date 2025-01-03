<template>
  <div style="max-width: 800px; margin: 0 auto">
    <!-- Mints Selection -->
    <div class="q-px-xs text-left" on-left>
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label overline class="text-weight-bold">
              Multinut payment
            </q-item-label>
            <q-item-label caption>
              Select one or multiple mints to execute a payment from.
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- List of mints with checkboxes -->
    <div class="q-pb-md q-px-xs text-left" on-left>
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
                  :color="selectedMints.includes(mint.url) ? 'primary' : 'grey'"
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
      <!-- button to quote all selected mints -->
      <q-btn
        unelevated
        rounded
        color="primary"
        :disabled="selectedMints.length === 0"
        @click="quoteSelectedMints"
        label="Multi-Mint Pay"
        :loading="quoteButtonLoading"
        class="q-px-lg"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useMintsStore, MintClass } from "src/stores/mints";
import { useWalletStore } from "src/stores/wallet";
import { notifyError } from "src/js/notify";

export default defineComponent({
  name: "MultinutView",
  mixins: [windowMixin],
  data() {
    return {
      selectedMints: [],
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
    quoteSelectedMints: async function () {
      const totalQuoteAmount = this.payInvoiceData.invoice.sat;
      const activeUnit = useMintsStore().activeUnit;
      const { overallBalance, weights } = this.multiMintBalance(
        this.selectedMints,
        activeUnit
      );
      if (totalQuoteAmount >= overallBalance) {
        console.error("multi-mint balance not enough to satisfy this invoice");
        notifyError("multi-mint balance not enough to satisfy this invoice");
        return;
      }
      let mintAndQuotesArray = [];
      let carry = 0.0;
      this.selectedMints.forEach(async (mint, i) => {
        console.log(`Quoting mint: ${mint.url}`);
        const mintWallet = useWalletStore().mintWallet(
          mint.url,
          useMintsStore().activeUnit
        );
        // await this.activateMintUrl(mintUrl);
        const partialAmountFloat = totalQuoteAmount * weights[i] + carry;
        const partialAmount = Math.round(partialAmountFloat);
        carry = partialAmountFloat - partialAmount;
        if (partialAmount > 0) {
          const quote = await this.meltQuote(
            mintWallet,
            this.payInvoiceData.input.request,
            partialAmount
          );
          console.log(quote);
          mintAndQuotesArray.push([mint.url, quote]);
        }
      });
      try {
        await Promise.all(
          mintAndQuotesArray.map(([mint, quote]) => {
            console.log("ciao");
            const mintWallet = useWalletStore().mintWallet(
              mint.url,
              activeUnit
            );

            const proofs = this.proofsForMintAndUnit(activeUnit, mint);
            return this.melt(proofs, quote, mintWallet);
          })
        );
      } catch (error) {
        notifyError(`${error}`);
        console.error(`${error}`);
      }
    },
  },
});
</script>
