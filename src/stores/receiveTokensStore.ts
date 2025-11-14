import { defineStore } from "pinia";
import { Mint, useMintsStore } from "./mints";
import { useUiStore } from "./ui";
import { useP2PKStore } from "./p2pk";
import { useWalletStore } from "./wallet";
import token from "src/js/token";
import { useTokensStore } from "./tokens";
import { notify } from "../js/notify";
import { Token } from "@cashu/cashu-ts";
import { useSwapStore } from "./swap";
import { useWebNfcStore } from "./webNfcStore";

export const useReceiveTokensStore = defineStore("receiveTokensStore", {
  state: () => ({
    showReceiveTokens: false,
    watchClipboardPaste: false,
    receiveData: {
      tokensBase64: "",
      p2pkPrivateKey: "",
    },
  }),
  actions: {
    decodeToken: function (encodedToken: string) {
      let decodedToken = undefined;
      try {
        decodedToken = token.decode(encodedToken);
      } catch (error) {}
      return decodedToken;
    },
    knowThisMintOfTokenJson: function (tokenJson: Token) {
      const mintStore = useMintsStore();
      let uniqueIds = [...new Set(token.getProofs(tokenJson).map((p) => p.id))];
      return mintStore.mints
        .map((m) => m.url)
        .includes(token.getMint(tokenJson));
    },
    receiveToken: async function (encodedToken: string) {
      const mintStore = useMintsStore();
      const walletStore = useWalletStore();
      const receiveStore = useReceiveTokensStore();
      const uiStore = useUiStore();
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
      await walletStore.redeem();
      receiveStore.showReceiveTokens = false;
      uiStore.closeDialogs();
    },
    receiveIfDecodes: async function () {
      try {
        const decodedToken = this.decodeToken(this.receiveData.tokensBase64);
        if (decodedToken) {
          await this.receiveToken(this.receiveData.tokensBase64);
          return true;
        }
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    meltTokenToMint: async function (encodedToken: string, mint: Mint) {
      const receiveStore = useReceiveTokensStore();
      const mintStore = useMintsStore();
      const uiStore = useUiStore();
      const tokenJson = token.decode(encodedToken);
      if (tokenJson == undefined) {
        throw new Error("no tokens provided.");
      }
      // check if we have all mints
      if (!this.knowThisMintOfTokenJson(tokenJson)) {
        // add the mint
        await mintStore.addMint({ url: token.getMint(tokenJson) });
      }
      await useSwapStore().meltProofsToMint(tokenJson, mint);
      receiveStore.showReceiveTokens = false;
      uiStore.closeDialogs();
    },
    pasteToParseDialog: async function (verbose = false) {
      const text = await useUiStore().pasteFromClipboard();
      if (this.decodeToken(text)) {
        const tokensStore = useTokensStore();
        const historyToken = tokensStore.tokenAlreadyInHistory(text);

        if (
          historyToken &&
          (historyToken.amount > 0 || historyToken.status === "paid")
        ) {
          if (verbose) notify("Token already in history.");
          return false;
        }
        this.receiveData.tokensBase64 = text;
        return true;
      } else {
        // notifyWarning("Invalid token");
        return false;
      }
    },
    toggleScanner: function () {
      // Use the centralized WebNfcStore to handle NFC scanning
      const webNfcStore = useWebNfcStore();
      webNfcStore.toggleScanner("token");
    },
  },
});
