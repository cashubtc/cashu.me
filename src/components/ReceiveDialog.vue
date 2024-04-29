<template>
  <q-dialog
    v-model="showReceiveDialog"
    position="bottom"
    backdrop-filter="blur(2px) brightness(60%)"
  >
    <!-- two buttons in two lines with the labels "Ecash" and "Lightning" -->
    <q-card class="q-pb-lg q-pt-sm" style="width: 100%">
      <q-card-section class="">
        <div class="row items-center no-wrap q-mb-sm">
          <div class="col-12 text-center">
            <q-icon name="south_west" size="1.3rem" class="q-mb-sm q-pr-sm" />
            <span class="text-h5">Receive</span>
          </div>
        </div>
      </q-card-section>
      <!-- <q-card-section class="">
        <q-list padding clickable>
          <q-item clickable @click="showReceiveTokensDialog">
            <q-item-section avatar> <q-icon name="toll" /></q-item-section>
            <q-item-section>
              <q-item-label overline>Ecash</q-item-label>
              <q-item-label caption>
                Paste or scan a Cashu token to receive Ecash.
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable @click="showInvoiceCreateDialog">
            <q-item-section avatar> <q-icon name="bolt" /></q-item-section>
            <q-item-section>
              <q-item-label overline>Lightning</q-item-label>
              <q-item-label caption
                >Create a Lightning invoice to receive payments.
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section> -->
      <div class="row items-center text-center no-wrap q-mb-md">
        <div class="col-12">
          <q-btn
            outline
            rounded
            class="q-py-md q-px-xl"
            style="width: 85%"
            @click="showReceiveTokensDialog"
            >Ecash</q-btn
          >
        </div>
      </div>
      <div class="row items-center text-center no-wrap q-mb-md">
        <div class="col-12">
          <q-btn
            outline
            rounded
            class="q-py-md q-px-xl"
            style="width: 85%"
            @click="showInvoiceCreateDialog"
            >Lightning</q-btn
          >
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>
<script>
import { defineComponent } from "vue";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useUiStore } from "src/stores/ui";
import { useWalletStore } from "src/stores/wallet";

export default defineComponent({
  name: "ReceiveDialog",
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
      "showReceiveDialog",
    ]),
    ...mapWritableState(useReceiveTokensStore, [
      "showReceiveTokens",
      "receiveData",
    ]),
    ...mapWritableState(useWalletStore, ["invoiceData"]),
  },
  methods: {
    showReceiveTokensDialog: function () {
      this.receiveData.tokensBase64 = "";
      this.showReceiveTokens = true;
      this.showReceiveDialog = false;
    },
    showInvoiceCreateDialog: async function () {
      console.log("##### showInvoiceCreateDialog");
      this.invoiceData.amount = "";
      this.invoiceData.bolt11 = "";
      this.invoiceData.hash = "";
      this.invoiceData.memo = "";
      this.showInvoiceDetails = true;
      this.showReceiveDialog = false;
    },
  },
  created: function () {},
});
</script>
