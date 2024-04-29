<template>
  <q-dialog
    v-model="showReceiveTokens"
    position="top"
    backdrop-filter="blur(2px) brightness(60%)"
  >
    <q-card class="q-pa-lg q-pt-md qcard">
      <div>
        <div class="row items-center no-wrap q-mb-sm">
          <div class="col-12">
            <span class="text-subtitle1">Receive Ecash</span>
          </div>
        </div>
        <q-input
          round
          outlined
          v-model="receiveData.tokensBase64"
          label="Paste Cashu token"
          type="textarea"
          autofocus
          class="q-mb-lg"
          @keyup.enter="receveIfDecodes"
        ></q-input>
      </div>
      <div
        class="row"
        v-if="
          receiveData.tokensBase64.length &&
          decodeToken(receiveData.tokensBase64) != ''
        "
      >
        <div class="col-12">
          <TokenInformation :encodedToken="receiveData.tokensBase64" />
        </div>
      </div>
      <div class="row q-mt-lg">
        <q-btn
          @click="receveIfDecodes"
          color="primary"
          :disabled="!decodeToken(receiveData.tokensBase64)"
          >Receive</q-btn
        >
        <q-btn
          unelevated
          icon="photo_camera"
          class="q-mx-0"
          v-if="hasCamera"
          @click="showCamera"
        ></q-btn>
        <q-btn v-close-popup flat color="grey" class="q-ml-auto">Close</q-btn>
      </div>
    </q-card>
  </q-dialog>
</template>
<script>
import { defineComponent } from "vue";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";
import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";
// import { useProofsStore } from "src/stores/proofs";
import { useMintsStore } from "src/stores/mints";
// import { useTokensStore } from "src/stores/tokens";
import { useCameraStore } from "src/stores/camera";

import token from "src/js/token";

import { mapActions, mapState, mapWritableState } from "pinia";
// import ChooseMint from "components/ChooseMint.vue";
import TokenInformation from "components/TokenInformation.vue";

export default defineComponent({
  name: "ReceiveTokenDialog",
  mixins: [windowMixin],
  components: {
    TokenInformation,
  },
  props: {},
  data: function () {
    return {};
  },
  computed: {
    ...mapWritableState(useReceiveTokensStore, [
      "showReceiveTokens",
      "receiveData",
    ]),
    ...mapState(useUiStore, ["tickerShort"]),
    ...mapState(useMintsStore, ["activeProofs", "activeUnit"]),
  },
  methods: {
    ...mapActions(useWalletStore, ["redeem"]),
    ...mapActions(useCameraStore, ["closeCamera", "showCamera", "hasCamera"]),

    // ...mapActions(useWalletStore, ["splitToSend"]),
    // ...mapActions(useProofsStore, [
    //   "serializeProofs",
    //   "getProofsMint",
    //   "serializeProofsV2",
    // ]),
    // ...mapActions(useTokensStore, [
    //   "addPaidToken",
    //   "addPendingToken",
    //   "setTokenPaid",
    // ]),
    knowThisMintOfTokenJson: function (tokenJson) {
      const mintStore = useMintsStore();
      // check if we have all mints
      for (var i = 0; i < tokenJson.token.length; i++) {
        if (
          !mintStore.mints.map((m) => m.url).includes(token.getMint(tokenJson))
        ) {
          return false;
        }
      }
      return true;
    },
    receiveToken: async function (encodedToken) {
      const mintStore = useMintsStore();
      const receiveStore = useReceiveTokensStore();
      const uIStore = useUiStore();
      receiveStore.showReceiveTokens = false;
      console.log("### receive tokens", receiveStore.receiveData.tokensBase64);

      if (receiveStore.receiveData.tokensBase64.length == 0) {
        throw new Error("no tokens provided.");
      }
      const tokenJson = token.decode(receiveStore.receiveData.tokensBase64);
      if (tokenJson == undefined) {
        throw new Error("no tokens provided.");
      }
      // check if we have all mints
      if (!this.knowThisMintOfTokenJson(tokenJson)) {
        // pop up add mint dialog warning
        // hack! The "add mint" component is in SettingsView which may now
        // have been loaded yet. We switch the tab to settings to make sure
        // that it loads. Remove this code when the TrustMintComnent is refactored!
        uIStore.setTab("settings");
        // hide the receive dialog
        receiveStore.showReceiveTokens = false;
        // set the mint to add
        mintStore.setMintToAdd(tokenJson.token[0].mint);
        // show the add mint dialog
        mintStore.showAddMintDialog = true;
        // show the token receive dialog again for the next attempt
        receiveStore.showReceiveTokens = true;
        return;
      }
      // redeem the token
      await this.redeem(receiveStore.receiveData.tokensBase64);
    },
    // TOKEN METHODS
    decodeToken: function (encoded_token) {
      return token.decode(encoded_token);
    },
    getProofs: function (decoded_token) {
      return token.getProofs(decoded_token);
    },
    getMint: function (decoded_token) {
      return token.getMint(decoded_token);
    },
    receveIfDecodes: function () {
      try {
        const decodedToken = this.decodeToken(this.receiveData.tokensBase64);
        if (decodedToken) {
          this.receiveToken(this.receiveData.tokensBase64);
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
  created: function () {},
});
</script>
