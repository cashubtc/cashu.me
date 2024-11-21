import { defineStore } from "pinia";
import { useMintsStore } from "./mints";
import { useUiStore } from "./ui";
import { useP2PKStore } from "./p2pk";
import { useWalletStore } from "./wallet";
import token from "src/js/token";

export const useReceiveTokensStore = defineStore("receiveTokensStore", {
  state: () => ({
    showReceiveTokens: false,
    receiveData: {
      tokensBase64: "",
      p2pkPrivateKey: "",
    },
  }),
  actions: {
    decodeToken: function (encoded_token) {
      let decodedToken = undefined;
      try {
        decodedToken = token.decode(encoded_token);
      } catch (error) {}
      return decodedToken;
    },
    knowThisMintOfTokenJson: function (tokenJson) {
      const mintStore = useMintsStore();
      return mintStore.mints
        .map((m) => m.url)
        .includes(token.getMint(tokenJson));
    },
    receiveToken: async function (encodedToken) {
      const mintStore = useMintsStore();
      const walletStore = useWalletStore();
      const receiveStore = useReceiveTokensStore();
      const uIStore = useUiStore();
      receiveStore.showReceiveTokens = false;
      console.log("### receive tokens", receiveStore.receiveData.tokensBase64);

      if (receiveStore.receiveData.tokensBase64.length == 0) {
        throw new Error("no tokens provided.");
      }

      // get the private key for the token we want to receive if it is locked with P2PK
      receiveStore.receiveData.p2pkPrivateKey =
        useP2PKStore().getPrivateKeyForP2PKEncodedToken(
          receiveStore.receiveData.tokensBase64
        );

      const tokenJson = token.decode(receiveStore.receiveData.tokensBase64);
      if (tokenJson == undefined) {
        throw new Error("no tokens provided.");
      }
      // check if we have all mints
      if (!this.knowThisMintOfTokenJson(tokenJson)) {
        // add the mint
        await mintStore.addMint({ url: token.getMint(tokenJson) });
      }
      // redeem the token
      await walletStore.redeem(receiveStore.receiveData.tokensBase64);
    },
    receiveIfDecodes: function () {
      try {
        const decodedToken = this.decodeToken(this.receiveData.tokensBase64);
        if (decodedToken) {
          this.receiveToken(this.receiveData.tokensBase64);
          return true
        }
      } catch (error) {
        console.error(error);
        return false
      }
    },
  },
});
