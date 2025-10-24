<template>
  <q-dialog
    v-model="showBolt12OfferDetails"
    position="top"
    :maximized="$q.screen.lt.sm"
    :full-width="$q.screen.lt.sm"
    :full-height="$q.screen.lt.sm"
    backdrop-filter="blur(2px) brightness(60%)"
    transition-show="fade"
    transition-hide="fade"
    no-backdrop-dismiss
  >
    <q-card class="q-pa-lg q-px-sm qcard q-card-top">
      <NumericKeyboard
        v-if="showNumericKeyboard && useNumericKeyboard"
        :model-value="invoiceData.amount"
        @update:modelValue="(val) => (invoiceData.amount = val)"
        @done="requestOfferButton"
      />

      <div v-if="!invoiceData.bolt11">
        <div class="row items-center no-wrap q-mb-sm q-pr-md q-py-lg">
          <div class="col-10">
            <span class="text-h6">BOLT12 Offer</span>
          </div>
        </div>
        <div class="row items-center no-wrap q-my-sm q-py-none">
          <div class="col-12">
            <ChooseMint />
          </div>
        </div>
        <q-input
          round
          outlined
          type="number"
          v-model.number="invoiceData.amount"
          :label="`Amount (${tickerShort}) – optional`"
          mask="#"
          fill-mask="0"
          reverse-fill-mask
          autofocus
          class="q-mb-lg"
          @keyup.enter="requestOfferButton"
        >
          <q-btn
            flat
            color="primary"
            @click="toggleUnit()"
            :label="activeUnitLabel"
          />
        </q-input>
        <div class="row items-center no-wrap q-my-sm q-py-none">
          <q-btn
            color="primary"
            rounded
            @click="requestOfferButton"
            :disable="createOfferButtonBlocked"
            :label="createOfferButtonBlocked ? 'Creating…' : 'Create Offer'"
            :loading="globalMutexLock"
          >
            <template v-slot:loading>
              <q-spinner-hourglass />
              Creating…
            </template>
          </q-btn>
          <q-btn v-close-popup rounded flat color="grey" class="q-ml-auto"
            >Close</q-btn
          >
        </div>
      </div>

      <div v-else class="text-center q-mt-none q-pt-none">
        <a class="text-secondary" :href="'lightning:' + invoiceData.bolt11">
          <q-responsive :ratio="1" class="q-ma-none q-ma-none">
            <vue-qrcode
              :value="'lightning:' + invoiceData.bolt11.toUpperCase()"
              :options="{ width: 340 }"
              class="rounded-borders"
            >
            </vue-qrcode>
          </q-responsive>
        </a>
        <div class="row justify-center">
          <q-card-section class="q-pa-sm">
            <div class="row justify-center q-py-md">
              <q-item-label style="font-size: 28px" class="text-weight-bold">
                <q-icon name="call_received" class="q-mr-sm" size="sm" />
                <strong>{{ displayUnit }}</strong>
              </q-item-label>
            </div>
          </q-card-section>
        </div>
        <div class="row q-mt-lg">
          <q-btn
            v-if="invoiceData.bolt11"
            class="q-mx-xs"
            size="md"
            flat
            @click="copyText(invoiceData.bolt11)"
            >Copy</q-btn
          >
          <q-btn v-close-popup flat color="grey" class="q-ml-auto">Close</q-btn>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>
<script>
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import VueQrcode from "@chenfengyuan/vue-qrcode";

import { useWalletStore } from "src/stores/wallet";
import ChooseMint from "src/components/ChooseMint.vue";
import { useUiStore } from "src/stores/ui";
import { useWorkersStore } from "src/stores/workers";
import { useMintsStore } from "src/stores/mints";
import { useInvoicesWorkerStore } from "src/stores/invoicesWorker";
import NumericKeyboard from "components/NumericKeyboard.vue";

export default defineComponent({
  name: "Bolt12OfferDetailsDialog",
  mixins: [windowMixin],
  components: {
    ChooseMint,
    VueQrcode,
    NumericKeyboard,
  },
  data() {
    return {
      createOfferButtonBlocked: false,
    };
  },
  watch: {
    showBolt12OfferDetails(val) {
      if (val) {
        this.$nextTick(() => {
          this.showNumericKeyboard = !this.invoiceData.amount;
        });
      }
    },
  },
  computed: {
    ...mapState(useWalletStore, ["invoiceData"]),
    ...mapState(useMintsStore, [
      "activeUnit",
      "activeUnitLabel",
      "activeUnitCurrencyMultiplyer",
    ]),
    ...mapWritableState(useUiStore, [
      "showBolt12OfferDetails",
      "tickerShort",
      "globalMutexLock",
      "showNumericKeyboard",
    ]),
    displayUnit() {
      return this.formatCurrency(
        this.invoiceData.amount || 0,
        this.invoiceData.unit,
        true
      );
    },
  },
  methods: {
    ...mapActions(useWalletStore, [
      "requestMintBolt12",
      "checkOfferAndMintBolt12",
    ]),
    ...mapActions(useMintsStore, ["toggleUnit"]),
    requestOfferButton: async function () {
      try {
        this.showNumericKeyboard = false;
        const mintStore = useMintsStore();
        const amount =
          (this.invoiceData.amount || 0) * this.activeUnitCurrencyMultiplyer ||
          undefined;
        this.createOfferButtonBlocked = true;
        const mintWallet = useWalletStore().mintWallet(
          mintStore.activeMintUrl,
          mintStore.activeUnit
        );
        const mintQuote = await this.requestMintBolt12(amount, mintWallet);
        // Start periodic checker for this offer
        useInvoicesWorkerStore().addBolt12OfferToChecker(mintQuote.quote);
      } catch (e) {
        console.error("requestOfferButton", e);
      } finally {
        this.createOfferButtonBlocked = false;
      }
    },
  },
});
</script>

<style scoped>
.qcard {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}
</style>
