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
      <q-chip
        v-if="isPureP2PK(proofsToShow)"
        outline
        icon="lock"
        class="q-pa-md"
      >
        P2PK
        <q-icon
          v-if="showP2PKCheck || isLockedToUs(proofsToShow)"
          :name="isLockedToUs(proofsToShow) ? 'check' : 'close'"
          size="sm"
          :color="isLockedToUs(proofsToShow) ? 'green' : 'red'"
          class="q-ml-xs"
        />
      </q-chip>
      <q-chip v-if="isHTLC(proofsToShow)" outline icon="link" class="q-pa-md">
        HTLC
      </q-chip>
      <div v-if="displayMemo" class="q-my-md">
        <q-icon name="chat" size="xs" color="grey" class="q-mr-sm" />
        <span>{{ displayMemo }}</span>
      </div>
      <div v-if="tokenPubkey" class="q-my-sm text-caption">
        <q-icon name="vpn_key" size="xs" color="grey" class="q-mr-sm" />
        Locked to: {{ shortenString(formatPubkey(tokenPubkey), 15, 6) }}
      </div>
      <div v-if="tokenLocktimeISO" class="q-my-sm text-caption">
        <q-icon name="schedule" size="xs" color="grey" class="q-mr-sm" />
        Locked until: {{ tokenLocktimeISO }}
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { getShortUrl } from "src/js/wallet-helpers";
import { mapActions, mapState } from "pinia";
import { useMintsStore } from "stores/mints";
import { useP2PKStore } from "src/stores/p2pk";
import { ensureCompressed } from "src/utils/ecash";
import { shortenString } from "src/js/string-utils";
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
    tokenPubkey: function () {
      return this.getTokenPubkey(this.encodedToken);
    },
    tokenLocktime: function () {
      return this.getTokenLocktime(this.encodedToken);
    },
    tokenLocktimeISO: function () {
      return this.tokenLocktime
        ? new Date(this.tokenLocktime * 1000).toISOString()
        : "";
    },
  },
  methods: {
    ...mapActions(useP2PKStore, [
      "isPureP2PK",
      "isLockedToUs",
      "getTokenPubkey",
      "getTokenLocktime",
      "isHTLC",
    ]),
    formatPubkey(hex) {
      try {
        if (!hex) return "";
        return ensureCompressed(hex);
      } catch (e) {
        return hex;
      }
    },
    shortenString,
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
