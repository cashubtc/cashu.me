<template>
  <q-dialog
    v-model="showReceiveTokens"
    position="top"
    backdrop-filter="blur(2px) brightness(60%)"
    no-backdrop-dismiss
  >
    <q-card class="q-pa-lg q-pt-md qcard">
      <div>
        <div class="row items-center no-wrap q-mb-sm">
          <div class="col-10">
            <span class="text-h6">Receive Ecash</span>
          </div>
          <q-btn
            unelevated
            class="q-mx-none q-pl-md"
            v-if="!receiveData.tokensBase64.length"
            @click="handleLockBtn"
            dense
          >
            <q-icon name="lock_outline" class="q-pr-sm" />
          </q-btn>
        </div>
        <div>
          <P2PKDialog v-model="showP2PKDialog" />
        </div>
        <q-input
          round
          outlined
          v-model="receiveData.tokensBase64"
          label="Paste Cashu token"
          type="textarea"
          autofocus
          class="q-mb-lg"
          @keyup.enter="receiveIfDecodes"
        >
          <template v-if="receiveData.tokensBase64" v-slot:append>
            <q-icon
              name="close"
              class="cursor-pointer"
              @click="receiveData.tokensBase64 = ''"
            />
          </template>
        </q-input>
      </div>
      <div
        class="row"
        v-if="receiveData.tokensBase64.length && tokenDecodesCorrectly"
      >
        <div class="col-12">
          <TokenInformation
            :encodedToken="receiveData.tokensBase64"
            :showAmount="true"
            :showMintCheck="true"
            :showP2PKCheck="true"
          />
        </div>
      </div>
      <div class="row q-mt-lg q-pl-xs">
        <!-- if !tokenDecodesCorrectly, display error -->
        <q-btn
          v-if="receiveData.tokensBase64.length && !tokenDecodesCorrectly"
          disabled="true"
          color="negative"
          rounded
          outlined
          class="q-mr-sm"
          label="Invalid token"
        ></q-btn>

        <q-btn
          @click="receiveIfDecodes"
          color="primary"
          rounded
          class="q-mr-sm"
          v-if="tokenDecodesCorrectly"
          :disabled="addMintBlocking"
          :label="
            knowThisMint
              ? addMintBlocking
                ? 'Adding mint ...'
                : 'Receive'
              : 'Receive'
          "
        >
        </q-btn>
        <q-btn
          @click="addPendingTokenToHistory(receiveData.tokensBase64)"
          color="primary"
          rounded
          flat
          class="q-mr-sm"
          v-if="tokenDecodesCorrectly"
          >Later
          <q-tooltip>Add to history to receive later</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          v-if="canPasteFromClipboard && !receiveData.tokensBase64.length"
          @click="pasteToParseDialog"
          class="q-ml-none q-pl-none"
        >
          <q-icon name="content_paste" class="q-pr-sm" />Paste</q-btn
        >
        <q-btn
          unelevated
          class="q-mx-none"
          v-if="hasCamera && !receiveData.tokensBase64.length"
          @click="showCamera"
        >
          <q-icon name="qr_code_scanner" class="q-pr-sm" />
          Scan</q-btn
        >

        <q-btn v-close-popup rounded flat color="grey" class="q-ml-auto"
          >Close</q-btn
        >
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
import { useTokensStore } from "src/stores/tokens";
import { useCameraStore } from "src/stores/camera";
import { useP2PKStore } from "src/stores/p2pk";
import token from "src/js/token";
import P2PKDialog from "./P2PKDialog.vue";

import { mapActions, mapState, mapWritableState } from "pinia";
// import ChooseMint from "components/ChooseMint.vue";
import TokenInformation from "components/TokenInformation.vue";

export default defineComponent({
  name: "ReceiveTokenDialog",
  mixins: [windowMixin],
  components: {
    TokenInformation,
    P2PKDialog,
  },
  props: {},
  data: function () {
    return {
      showP2PKDialog: false,
    };
  },
  computed: {
    ...mapWritableState(useReceiveTokensStore, [
      "showReceiveTokens",
      "receiveData",
    ]),
    ...mapState(useUiStore, ["tickerShort"]),
    ...mapState(useMintsStore, [
      "activeProofs",
      "activeUnit",
      "addMintBlocking",
    ]),
    ...mapWritableState(useMintsStore, ["addMintData", "showAddMintDialog"]),
    ...mapState(useCameraStore, ["hasCamera"]),
    ...mapState(useP2PKStore, ["p2pkKeys"]),
    canPasteFromClipboard: function () {
      return (
        window.isSecureContext &&
        navigator.clipboard &&
        navigator.clipboard.readText
      );
    },
    tokenDecodesCorrectly: function () {
      return this.decodeToken(this.receiveData.tokensBase64) !== undefined;
    },
    knowThisMint: function () {
      const tokenJson = this.decodeToken(this.receiveData.tokensBase64);
      if (tokenJson == undefined) {
        return false;
      }
      return this.knowThisMintOfTokenJson(tokenJson);
    },
  },
  methods: {
    ...mapActions(useWalletStore, ["redeem"]),
    ...mapActions(useCameraStore, ["closeCamera", "showCamera"]),
    ...mapActions(useTokensStore, ["addPendingToken"]),
    ...mapActions(useP2PKStore, [
      "getPrivateKeyForP2PKEncodedToken",
      "generateKeypair",
      "showLastKey",
    ]),
    ...mapActions(useMintsStore, ["addMint"]),
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

      // get the private key for the token we want to receive if it is locked with P2PK
      receiveStore.receiveData.p2pkPrivateKey =
        this.getPrivateKeyForP2PKEncodedToken(
          receiveStore.receiveData.tokensBase64
        );

      const tokenJson = token.decode(receiveStore.receiveData.tokensBase64);
      if (tokenJson == undefined) {
        throw new Error("no tokens provided.");
      }
      // check if we have all mints
      if (!this.knowThisMintOfTokenJson(tokenJson)) {
        // // pop up add mint dialog warning
        // // hack! The "add mint" component is in SettingsView which may now
        // // have been loaded yet. We switch the tab to settings to make sure
        // // that it loads. Remove this code when the TrustMintComnent is refactored!
        // uIStore.setTab("mints");
        // // hide the receive dialog
        // receiveStore.showReceiveTokens = false;
        // // set the mint to add
        // this.addMintData = { url: token.getMint(tokenJson) };
        // // show the add mint dialog
        // this.showAddMintDialog = true;
        // // show the token receive dialog again for the next attempt
        // receiveStore.showReceiveTokens = true;
        // return;

        // add the mint
        await this.addMint({ url: token.getMint(tokenJson) });
      }
      // redeem the token
      await this.redeem(receiveStore.receiveData.tokensBase64);
    },
    // TOKEN METHODS
    decodeToken: function (encoded_token) {
      let decodedToken = undefined;
      try {
        decodedToken = token.decode(encoded_token);
      } catch (error) {}
      return decodedToken;
    },
    getProofs: function (decoded_token) {
      return token.getProofs(decoded_token);
    },
    getMint: function (decoded_token) {
      return token.getMint(decoded_token);
    },
    handleLockBtn: function () {
      this.showP2PKDialog = !this.showP2PKDialog;
      if (!this.p2pkKeys.length || !this.showP2PKDialog) {
        this.generateKeypair();
      }
      this.showLastKey();
    },
    receiveIfDecodes: function () {
      try {
        const decodedToken = this.decodeToken(this.receiveData.tokensBase64);
        if (decodedToken) {
          this.receiveToken(this.receiveData.tokensBase64);
        }
      } catch (error) {
        console.error(error);
      }
    },
    tokenAlreadyInHistory: function (token) {
      const tokensStore = useTokensStore();
      return (
        tokensStore.historyTokens.find((t) => t.token === token) !== undefined
      );
    },
    addPendingTokenToHistory: function (token) {
      if (this.tokenAlreadyInHistory(token)) {
        this.notifySuccess("Ecash already in history");
        this.showReceiveTokens = false;
        return;
      }
      const tokensStore = useTokensStore();
      const decodedToken = this.decodeToken(token);
      // get amount from decodedToken.token.proofs[..].amount
      const amount = this.getProofs(decodedToken).reduce(
        (sum, el) => (sum += el.amount),
        0
      );

      tokensStore.addPendingToken({
        amount: amount,
        serializedProofs: token,
      });
      this.showReceiveTokens = false;
      // show success notification
      this.notifySuccess("Ecash added to history.");
    },
    pasteToParseDialog: function () {
      console.log("pasteToParseDialog");
      navigator.clipboard.readText().then((text) => {
        this.receiveData.tokensBase64 = text;
      });
    },
  },
  created: function () {},
});
</script>
