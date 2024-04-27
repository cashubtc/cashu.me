<template>
  <div class="row text-left q-py-none q-my-none">
    <div class="col-12 q-px-sm">
      <q-icon name="toll" size="xs" color="grey" class="q-mr-xs" />
      <span class="q-mr-md">
        <strong>{{ displayUnit }} </strong></span
      >
      <q-icon name="account_balance" size="xs" color="grey" class="q-mr-xs" />
      <span>Mint: </span>
      <span v-if="mintKnownToUs(proofsToShow)">
        {{ getProofsMint(proofsToShow) }}
        <q-icon name="check" size="xs" color="green" class="q-mr-xs" />
      </span>
      <span v-else>
        {{ tokenMintUrl }}
      </span>
      <div v-if="displayMemo" class="q-my-md">
        <q-icon name="chat" size="xs" color="grey" class="q-mr-sm" />
        <span>{{ displayMemo }}</span>
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { getShortUrl } from "src/js/wallet-helpers";
import { mapState } from "pinia";
import { useMintsStore } from "stores/mints";
import token from "src/js/token";

export default defineComponent({
  name: "TokenInformation",
  mixins: [windowMixin],
  props: {
    encodedToken: String,
  },
  data: function () {
    return {};
  },
  watch: {},
  computed: {
    ...mapState(useMintsStore, [
      "activeMintUrl",
      "activeProofs",
      "mints",
      "proofs",
      "activeUnit",
    ]),
    proofsToShow: function () {
      return token.getProofs(token.decode(this.encodedToken));
    },
    sumProofs: function () {
      let proofs = token.getProofs(token.decode(this.encodedToken));
      return proofs.flat().reduce((sum, el) => (sum += el.amount), 0);
    },
    displayUnit: function () {
      let display = this.formatCurrency(this.sumProofs, this.tokenUnit);
      return display;
    },
    tokenUnit: function () {
      return token.getUnit(token.decode(this.encodedToken));
    },
    tokenMintUrl: function () {
      let mint = token.getMint(token.decode(this.encodedToken));
      return getShortUrl(mint);
    },
    displayMemo: function () {
      return token.getMemo(token.decode(this.encodedToken));
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
