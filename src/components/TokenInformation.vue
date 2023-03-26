<template>
  <div class="row text-left q-py-none q-my-none">
    <div class="col-6 q-px-sm">
      <q-icon name="toll" size="xs" color="grey" class="q-mr-xs" />
      <span>
        <strong>{{ formatSat(sumProofs) }} {{ tickerShort }}</strong></span
      >
    </div>

    <div class="col-6">
      <q-icon name="account_balance" size="xs" color="grey" class="q-mr-xs" />
      <span> Mint: {{ getProofsMint(proofsToShow) }} </span>
    </div>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { getShortUrl } from "src/js/wallet-helpers";

export default defineComponent({
  name: "TokenInformation",
  mixins: [windowMixin],
  props: {
    proofs: Array,
    activeProofs: Array,
    mints: Array,
    tickerShort: String,
    activeMintUrl: String,
    proofsToShow: Array,
  },
  data: function () {
    return {};
  },
  watch: {},
  computed: {
    sumProofs: function () {
      return this.proofsToShow
        .flat()
        .reduce((sum, el) => (sum += el.amount), 0);
    },
  },
  methods: {
    getProofsMint: function (proofs) {
      // unique keyset IDs of proofs
      let uniqueIds = [...new Set(proofs.map((p) => p.id))];
      // mints that have any of the keyset IDs
      let mints_keysets = this.mints.filter((m) =>
        m.keysets.some((r) => uniqueIds.indexOf(r) >= 0)
      );
      // what we put into the JSON
      let mints = mints_keysets.map((m) => [{ url: m.url, ids: m.keysets }][0]);
      return getShortUrl(mints[0].url);
    },
  },
});
</script>
