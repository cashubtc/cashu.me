<template>
  <div class="row text-left q-py-none q-my-none">
    <div class="col-12 q-px-none">
      <q-chip
        v-if="showAmount"
        outline
        class="q-pa-md"
        style="border-width: 2px"
      >
        <q-icon name="toll" size="xs" class="q-mr-sm" />
        <strong>{{ displayUnit }} </strong>
      </q-chip>
      <q-chip
        outline
        class="q-pa-md"
        style="height: 36px; font-family: monospace"
      >
        <q-icon name="account_balance" size="xs" class="q-mr-xs" />
        {{ tokenMintUrl }}
        <q-spinner-hourglass v-if="addMintBlocking" size="sm" class="q-ml-sm" />
        <q-icon
          v-if="
            showMintCheck && mintKnownToUs(proofsToShow) && !addMintBlocking
          "
          name="check"
          size="sm"
          color="green"
          class="q-ml-xs"
        />
      </q-chip>
      <q-chip v-if="isLocked(proofsToShow)" outline icon="lock" class="q-pa-md">
        P2PK
        <q-icon
          v-if="showP2PKCheck || isLockedToUs(proofsToShow)"
          :name="isLockedToUs(proofsToShow) ? 'check' : 'close'"
          size="sm"
          :color="isLockedToUs(proofsToShow) ? 'green' : 'red'"
          class="q-ml-xs"
        />
      </q-chip>
      <div v-if="displayMemo" class="q-my-md">
        <q-icon name="chat" size="xs" color="grey" class="q-mr-sm" />
        <span>{{ displayMemo }}</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { getShortUrl } from "src/js/wallet-helpers";
import { mapActions, mapState } from "pinia";
import { useMintsStore } from "stores/mints";
import { useP2PKStore } from "src/stores/p2pk";
import token from "src/js/token";

export default defineComponent({
  name: "TokenInformation",
  mixins: [windowMixin],
  props: {
    encodedToken: String,
    showAmount: Boolean,
    showMintCheck: Boolean,
    showP2PKCheck: Boolean,
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
      "activeUnit",
      "addMintBlocking",
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
    ...mapActions(useP2PKStore, ["isLocked", "isLockedToUs"]),
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
          m.keysets.some((r) => uniqueIds.indexOf(r.id) >= 0)
        ).length > 0
      );
    },
  },
});
</script>
