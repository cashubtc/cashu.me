import { defineStore } from "pinia";
import { useMintsStore } from "./mints";
import { useUiStore } from "./ui";
import { useP2PKStore } from "./p2pk";
import { useWalletStore } from "./wallet";
import token from "src/js/token";
import { useTokensStore } from "./tokens";
import {
  notifyError,
  notifySuccess,
  notify,
  notifyWarning,
} from "../js/notify";

interface ReceiveData {
  tokensBase64: string;
  p2pkPrivateKey: string;
}

export const useReceiveTokensStore = defineStore("receiveTokensStore", {
  state: () => ({
    showReceiveTokens: false as boolean,
    watchClipboardPaste: false as boolean,
    receiveData: {
      tokensBase64: "",
      p2pkPrivateKey: "",
    } as ReceiveData,
    scanningCard: false as boolean,
  }),
  actions: {
    decodeToken(encodedToken: string): unknown {
      let decodedToken: unknown = undefined;
      try {
        decodedToken = token.decode(encodedToken);
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
      return decodedToken;
    },
    knowThisMintOfTokenJson(tokenJson: unknown): boolean {
      const mintStore = useMintsStore();
      return mintStore.mints
        .map((m) => m.url)
        .includes(token.getMint(tokenJson));
    },
    async receiveToken(encodedToken: string): Promise<void> {
      const mintStore = useMintsStore();
      const walletStore = useWalletStore();
      const receiveStore = useReceiveTokensStore();
      const uiStore = useUiStore();
      console.log("### receive tokens", receiveStore.receiveData.tokensBase64);

      if (receiveStore.receiveData.tokensBase64.length === 0) {
        throw new Error("No tokens provided.");
      }

      receiveStore.receiveData.p2pkPrivateKey = useP2PKStore().getPrivateKeyForP2PKEncodedToken(
        receiveStore.receiveData.tokensBase64
      );

      const tokenJson = token.decode(receiveStore.receiveData.tokensBase64);
      if (tokenJson === undefined) {
        throw new Error("Invalid token.");
      }

      if (!this.knowThisMintOfTokenJson(tokenJson)) {
        await mintStore.addMint({ url: token.getMint(tokenJson) });
      }

      await walletStore.redeem(receiveStore.receiveData.tokensBase64);
      receiveStore.showReceiveTokens = false;
      uiStore.closeDialogs();
    },
    async receiveIfDecodes(): Promise<boolean> {
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
      return false;
    },
    pasteToParseDialog(verbose = false): Promise<boolean> {
      return navigator.clipboard.readText().then((text) => {
        if (this.decodeToken(text)) {
          const tokensStore = useTokensStore();
          const historyToken = tokensStore.tokenAlreadyInHistory(text);
          if (
            historyToken &&
            (historyToken.amuont > 0 || historyToken.status === "paid")
          ) {
            if (verbose) {
              notify("Token already in history.");
            }
            return false;
          }
          this.receiveData.tokensBase64 = text;
          return true;
        } else {
          return false;
        }
      });
    },
    toggleScanner(): void {
      const receiveStore = useReceiveTokensStore();
      const tokenStore = useTokensStore();
      const uiStore = useUiStore();

      if (!this.scanningCard) {
        try {
          this.ndef = new (window as any).NDEFReader();
          this.controller = new AbortController();
          const signal = this.controller.signal;

          this.ndef.scan({ signal })
            .then(() => {
              console.log("> Scan started");

              this.ndef.addEventListener("readingerror", () => {
                console.error("Cannot read data from the NFC tag.");
                notifyError("Cannot read data from the NFC tag.");
                this.controller.abort();
                this.scanningCard = false;
              });

              this.ndef.addEventListener("reading", ({ message, serialNumber }) => {
                try {
                  const record = message.records[0];
                  const recordType = record.recordType;
                  let tokenStr = "";
                  switch (recordType) {
                    case "text":
                      const text = new TextDecoder().decode(record.data);
                      if (!text.startsWith("cashu")) {
                        throw new Error("Text does not contain a cashu token.");
                      }
                      tokenStr = text;
                      break;
                    case "url":
                      const url = new TextDecoder().decode(record.data);
                      const i = url.indexOf("#token=cashu");
                      if (i === -1) {
                        throw new Error("URL does not contain a cashu token.");
                      }
                      tokenStr = url.substring(i + 7);
                      break;
                    case "mime":
                      if (record.mediaType !== "application/octet-stream") {
                        throw new Error("Binary data expected.");
                      }
                      const data = new Uint8Array(record.data.buffer);
                      const prefix = String.fromCharCode(...data.slice(0, 4));
                      if (prefix !== "craw") {
                        throw new Error(
                          "Binary data does not contain a cashu token."
                        );
                      }
                      throw new Error(
                        "Binary token parsing not implemented yet."
                      );
                    default:
                      throw new Error(`Unsupported recordType: ${recordType}`);
                  }

                  const historyToken = tokenStore.tokenAlreadyInHistory(tokenStr);
                  if (!historyToken || historyToken.status === "pending") {
                    receiveStore.receiveData.tokensBase64 = tokenStr;
                    receiveStore.showReceiveTokens = true;
                    uiStore.closeDialogs();
                  } else {
                    notify("Token already in history.");
                  }
                } catch (err) {
                  console.error(`Something went wrong! ${err}`);
                  notifyError(`Something went wrong! ${err}`);
                }
                this.controller.abort();
                this.scanningCard = false;
              });
              this.scanningCard = true;
            })
            .catch((error) => {
              console.error(`Scan error: ${error.message}`);
              notifyError(`Scan error: ${error.message}`);
            });
        } catch (error) {
          console.error(`NFC error: ${error.message}`);
          notifyError(`NFC error: ${error.message}`);
        }
      } else {
        this.controller.abort();
        this.scanningCard = false;
      }
    },
  },
});
