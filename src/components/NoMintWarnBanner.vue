<template>
  <q-card>
    <q-card-section>
      <div class="text-overline">
        <q-badge color="warning" text-color="black" label="No mint added" />
      </div>
      <q-separator class="q-mb-sm" />
      <div class="text-h6">You're not connected to any mint yet</div>
      <div class="text-subtitle2">
        Go to the Settings tab to add a mint before using this wallet
      </div>
    </q-card-section>
  </q-card>
</template>
<script>
import { defineComponent, ref } from "vue";
import { getShortUrl } from "js/wallet-helpers";
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
