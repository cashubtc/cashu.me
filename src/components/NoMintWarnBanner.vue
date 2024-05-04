<template>
  <div class="q-ma-lg q-pa-md" style="border: 2px solid; border-radius: 10px">
    <q-card-section>
      <div class="row items-center justify-center">
        <q-icon class="q-pb-md" name="account_balance" size="50px" />
      </div>
      <div class="row items-center justify-center">
        <div class="text-h6">Join a mint</div>
      </div>
      <div class="row items-center justify-center">
        <div class="text-subtitle2">
          You haven't joined any Cashu mint yet. Add a mint URL in the settings
          or receive ecash from a new mint to get started.
        </div>
      </div>
      <div class="row items-center justify-center q-pt-lg">
        <q-btn
          rounded
          color="primary"
          class="q-px-md"
          label="Add mint"
          @click="
            expandHistory = true;
            tab = 'mints';
          "
        />
      </div>
      <div class="row items-center justify-center q-pt-md">
        <q-btn
          outline
          rounded
          color="primary"
          class="q-px-md"
          label="Receive Ecash"
          @click="showReceiveTokensDialog"
        />
      </div>
    </q-card-section>
  </div>
</template>
<script>
import { defineComponent, ref } from "vue";
import { getShortUrl } from "src/js/wallet-helpers";
import { useUiStore } from "src/stores/ui";
import { mapWritableState } from "pinia";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";

export default defineComponent({
  name: "NoMintWarnBanner",
  mixins: [windowMixin],
  props: {
    proofs: Array,
    activeProofs: Array,
    mints: Array,
    tickerShort: String,
    activeMintUrl: String,
  },
  computed: {
    ...mapWritableState(useUiStore, ["tab", "expandHistory"]),
    ...mapWritableState(useReceiveTokensStore, [
      "showReceiveTokens",
      "receiveData",
    ]),
    balance: function () {
      return this.activeProofs
        .map((t) => t)
        .flat()
        .reduce((sum, el) => (sum += el.amount), 0);
    },
    getActiveMintUrlShort: function () {
      return getShortUrl(this.activeMintUrl);
    },
    getBalance: function () {
      var balance = this.activeProofs
        .map((t) => t)
        .flat()
        .reduce((sum, el) => (sum += el.amount), 0);
      return balance;
    },
  },
  methods: {
    showReceiveTokensDialog: function () {
      this.receiveData.tokensBase64 = "";
      this.showReceiveTokens = true;
    },
  },
});
</script>
