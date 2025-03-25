import { defineStore } from "pinia";
import { decodePaymentRequest, PaymentRequest } from "@cashu/cashu-ts";
import { HistoryToken } from "./tokens";
import { useUiStore } from "./ui";
import { useWalletStore } from "./wallet";
import { notifyError, notifySuccess } from "src/js/notify";
import { useSettingsStore } from "./settings";

export const useSendTokensStore = defineStore("sendTokensStore", {
  state: () => ({
    showSendTokens: false,
    showLockInput: false,
    sendData: {
      amount: null,
      historyAmount: null,
      memo: "",
      tokens: "",
      tokensBase64: "",
      p2pkPubkey: "",
      paymentRequest: undefined,
      historyToken: undefined,
    } as {
      amount: number | null;
      historyAmount: number | null;
      memo: string;
      tokens: string;
      tokensBase64: string;
      p2pkPubkey: string;
      paymentRequest?: PaymentRequest;
      historyToken: HistoryToken | undefined;
    },
    scanningCard: false,
  }),
  actions: {
    clearSendData() {
      this.sendData.amount = null;
      this.sendData.historyAmount = null;
      this.sendData.memo = "";
      this.sendData.tokens = "";
      this.sendData.tokensBase64 = "";
      this.sendData.p2pkPubkey = "";
      this.sendData.paymentRequest = undefined;
      this.sendData.historyToken = undefined;
    },
    toggleRequestScanner: function () {
      const uiStore = useUiStore();
      const walletStore = useWalletStore();
      if (this.scanningCard === false) {
        try {
          this.ndef = new window.NDEFReader();
          this.controller = new AbortController();
          const signal = this.controller.signal;
          this.ndef
            .scan({ signal })
            .then(() => {
              console.log("> Scan started");

              this.ndef.addEventListener("readingerror", () => {
                console.error("Cannot read data from the NFC tag.");
                notifyError("Cannot read data from the NFC tag.");
                this.controller.abort();
                this.scanningCard = false;
              });

              this.ndef.addEventListener(
                "reading",
                async ({ message, serialNumber }) => {
                  try {
                    const record = message.records[0];
                    const recordType = record.recordType;
                    let req = "";
                    switch (recordType) {
                      case "text":
                        const text = new TextDecoder().decode(record.data);
                        if (!text.startsWith("creq")) {
                          throw new Error(
                            "text does not contain a cashu token"
                          );
                        }
                        req = text;
                        break;
                      case "url":
                        const url = new TextDecoder().decode(record.data);
                        const i = url.indexOf("#token=creq");
                        if (i === -1) {
                          throw new Error("URL does not contain a cashu token");
                        }
                        req = url.substring(i + "#token=".length);
                        break;
                      default:
                        throw new Error(`unsupported recordType ${recordType}`);
                    }

                    await walletStore.handlePaymentRequest(req);
                  } catch (err) {
                    console.error(`Something went wrong! ${err}`);
                    notifyError(`Something went wrong! ${err}`);
                  }
                  this.controller.abort();
                  this.scanningCard = false;
                }
              );
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
    writeTokensToCard: function () {
      const settingsStore = useSettingsStore();
      if (this.scanningCard === false) {
        try {
          this.ndef = new NDEFReader();
          this.controller = new AbortController();
          const signal = this.controller.signal;
          this.ndef
            .scan({ signal })
            .then(() => {
              console.log("> Scan started");

              this.ndef.onreadingerror = (error) => {
                console.error(`Cannot read NDEF data! ${error}`);
                notifyError("Cannot read data from the NFC tag");
                this.controller.abort();
                this.scanningCard = false;
              };

              this.ndef.onreading = ({ message, serialNumber }) => {
                console.log(`Read card ${serialNumber}`);
                this.controller.abort();
                this.scanningCard = false;
                try {
                  let records = [];
                  switch (settingsStore.nfcEncoding) {
                    case "text":
                      records = [
                        {
                          recordType: "text",
                          data: `${this.sendData.tokensBase64}`,
                          lang: "en",
                        },
                      ];
                      break;
                    case "weburl":
                      records = [
                        {
                          recordType: "url",
                          data: `${window.location}#token=${this.sendData.tokensBase64}`,
                        },
                      ];
                      break;
                    case "binary":
                      throw new Error("Binary encoding not supported yet");
                    /*
                      const data = null;
                      records = [
                        {
                          recordType: "mime",
                          mediaType: "application/octet-stream",
                          data: data,
                        },
                      ];
                      break;
                      */
                    default:
                      throw new Error(
                        `Unknown NFC encoding: ${settingsStore.nfcEncoding}`
                      );
                  }
                  notifySuccess("Writing to NFC card...");
                  this.ndef
                    .write({ records: records }, { overwrite: true })
                    .then(() => {
                      console.log("Successfully flashed token to card!");
                      notifySuccess("Successfully flashed token to card!");
                    })
                    .catch((err) => {
                      console.error(
                        `NFC write failed: The card may not have enough capacity (needed ${records[0].data.length} bytes).`
                      );
                      notifyError(
                        `The card may not have enough capacity (needed ${records[0].data.length} bytes).`,
                        "NFC write failed"
                      );
                    });
                } catch (err) {
                  console.error(`NFC error: ${err.message}`);
                  notifyError(`${err.message}`, "NFC error");
                }
              };
              this.scanningCard = true;
            })
            .catch((error) => {
              console.error(`NFC error: ${error.message}`);
              notifyError(`${err.message}`, "NFC error");
              this.scanningCard = false;
            });
        } catch (error) {
          console.error(`NFC error: ${error.message}`);
          notifyError(`${err.message}`, "NFC error");
          this.scanningCard = false;
        }
      }
    },
    closeCardScanner: function () {
      this.controller.abort();
      this.scanningCard = false;
    },
  },
});
