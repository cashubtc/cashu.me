<template>
  <div class="row text-left q-py-none q-my-none">
    <div class="col-12 q-px-none"></div>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { getShortUrl } from "src/js/wallet-helpers";
import { mapActions, mapState } from "pinia";
import { useMintsStore } from "stores/mints";
import { useWalletStore } from "src/stores/wallet";
import { useP2PKStore } from "src/stores/p2pk";
import token from "src/js/token";

export default defineComponent({
  name: "ReceiveToken",
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
    // getSecretP2PKPubkey: function (secret) {
    //   try {
    //     let secretObject = JSON.parse(secret);
    //     if (secretObject[0] == "P2PK" && secretObject[1]["data"] != undefined) {
    //       return secretObject[1]["data"];
    //     }
    //   } catch {}
    //   return "";
    // },
    // isLocked: function (proofs) {
    //   const secrets = proofs.map((p) => p.secret);
    //   for (const secret of secrets) {
    //     try {
    //       if (this.getSecretP2PKPubkey(secret)) {
    //         return true;
    //       }
    //     } catch {}
    //   }
    //   return false;
    // },
    // isLockedToUs: function (proofs) {
    //   const secrets = proofs.map((p) => p.secret);
    //   for (const secret of secrets) {
    //     const pubkey = this.getSecretP2PKPubkey(secret);
    //     if (pubkey) {
    //       return this.haveThisKey(pubkey);
    //     }
    //   }
    // },
  },
});
</script>
