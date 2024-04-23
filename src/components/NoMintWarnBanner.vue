<template>
  <q-card class="q-pa-lg q-ma-xl">
    <q-card-section>
      <div class="row items-center justify-center">
        <q-icon class="q-pb-md" name="account_balance" size="50px" />
      </div>
      <div class="row items-center justify-center">
        <div class="text-h6">Select an ecash mint</div>
      </div>
      <div class="row items-center justify-center">
        <div class="text-subtitle2">
          You're not connected to any ecash mint yet. Please add a mint in the
          settings to get started.
        </div>
      </div>
      <div class="row items-center justify-center q-pt-xl">
        <q-btn outline label="Add mint" @click="this.tab = 'settings'" />
      </div>
    </q-card-section>
  </q-card>
</template>
<script>
import { defineComponent, ref } from "vue";
import { getShortUrl } from "src/js/wallet-helpers";
import { useUiStore } from "src/stores/ui";
import { mapWritableState } from "pinia";
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
    balance: function () {
      return this.activeProofs
        .map((t) => t)
        .flat()
        .reduce((sum, el) => (sum += el.amount), 0);
    },
    getTotalBalance: function () {
      return this.proofs
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
  methods: {},
});
</script>
