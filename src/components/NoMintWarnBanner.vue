<template>
  <q-card class="q-pa-lg q-ma-xl">
    <q-card-section>
      <div class="row items-center justify-center">
        <q-icon class="q-pb-md" name="account_balance" size="50px" />
      </div>
      <div class="row items-center justify-center">
        <div class="text-h6">Connect to a mint</div>
      </div>
      <div class="row items-center justify-center">
        <div class="text-subtitle2">
          You're not connected to any Cashu mint yet. Add a mint in the settings
          to get started.
        </div>
      </div>
      <div class="row items-center justify-center q-pt-xl">
        <q-btn
          outline
          dense
          class="q-px-sm"
          label="Add mint"
          @click="focusOnMint"
        />
        <q-btn
          class="q-mx-sm q-px-sm"
          dense
          outline
          label="Receive Ecash"
          @click="showReceiveTokensDialog"
        />
      </div>
    </q-card-section>
  </q-card>
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
    ...mapWritableState(useUiStore, ["tab"]),
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
    focusOnMint: function () {
      this.tab = "settings";
    },
  },
});
</script>
