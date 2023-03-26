<template>
  <div class="row text-left q-py-none q-my-none">
    <div class="col-12 q-px-sm">
      <q-icon name="toll" size="xs" color="grey" class="q-mr-xs" />
      <span class="q-mr-md">
        <strong>{{ formatSat(sumProofs) }} {{ tickerShort }}</strong></span
      >
      <q-icon name="account_balance" size="xs" color="grey" class="q-mr-xs" />
      <span>Mint: </span>
      <span v-if="mintKnownToUs(proofsToShow)">
        {{ getProofsMint(proofsToShow) }}
      </span>
      <span v-else>
        {{ tokenMintUrl }}
      </span>
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
    tokenMintUrl: String,
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
      if (mints.length == 0) {
        return "";
      } else {
        return getShortUrl(mints[0].url);
      }
    },
    mintKnownToUs: function (proofs) {
      // unique keyset IDs of proofs
      let uniqueIds = [...new Set(proofs.map((p) => p.id))];
      // mints that have any of the keyset IDs
      return (
        this.mints.filter((m) =>
          m.keysets.some((r) => uniqueIds.indexOf(r) >= 0)
        ).length > 0
      );
    },
  },
});
</script>
