<template>
  <q-card class="q-ma-lg bg-dark q-pa-md">
    <q-card-section>
      <div class="row items-center justify-center">
        <q-icon
          color="primary"
          class="q-pb-md"
          name="account_balance"
          size="50px"
        />
      </div>
      <div class="row items-center justify-center">
        <div class="text-h6">{{ $t("NoMintWarnBanner.title") }}</div>
      </div>
      <div class="row items-center justify-center">
        <div class="text-subtitle2">
          {{ $t("NoMintWarnBanner.subtitle") }}
        </div>
      </div>
      <div class="row items-center justify-center q-pt-lg">
        <q-btn
          rounded
          color="primary"
          class="q-px-md"
          :label="$t('NoMintWarnBanner.actions.add_mint.label')"
          @click="handleAddMintClick"
        />
      </div>
      <div class="row items-center justify-center q-pt-md">
        <q-btn
          outline
          rounded
          color="primary"
          class="q-px-md"
          :label="$t('NoMintWarnBanner.actions.receive.label')"
          @click="handleReceiveEcash"
        />
      </div>
    </q-card-section>
  </q-card>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import { getShortUrl } from "src/js/wallet-helpers";
import { useUiStore } from "src/stores/ui";
import { mapWritableState } from "pinia";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";
import { EventBus } from "../js/eventBus";

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
    ...mapWritableState(useUiStore, [
      "tab",
      "expandHistory",
      "showReceiveEcashDrawer",
    ]),
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
    // showReceiveTokensDialog: function () {
    //   this.receiveData.tokensBase64 = "";
    //   this.showReceiveTokens = true;
    // },
    handleReceiveEcash: function () {
      this.showReceiveEcashDrawer = true;
    },
    handleAddMintClick: function () {
      this.expandHistory = true;
      this.tab = "mints";
      EventBus.emit("scrollToAddMintDiv");
    },
  },
});
</script>
<style scoped>
.q-dialog__inner {
  height: 100%;
  width: 100%;
  margin: 0; /* Align dialog to cover the entire viewport */
}

.q-card {
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  border: 2px solid var(--q-primary);
}
</style>
