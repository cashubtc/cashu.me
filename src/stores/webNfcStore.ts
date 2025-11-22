import { defineStore } from "pinia";
import { useTokensStore } from "./tokens";
import { useReceiveTokensStore } from "./receiveTokensStore";
import { usePRStore } from "./payment-request";
import { useUiStore } from "./ui";
import { useSendTokensStore } from "./sendTokensStore";
import {
  getDecodedTokenBinary,
  getEncodedToken,
  getEncodedTokenBinary,
} from "@cashu/cashu-ts";
import { notifyError, notify, notifySuccess } from "../js/notify";

/**
 * WebNfcStore: Centralizes all NFC tag reading/writing functionality
 */
export const useWebNfcStore = defineStore("webNfcStore", {
  state: () => ({
    scanningCard: false,
    ndef: null as any,
    controller: null as AbortController | null,
    writeController: null as AbortController | null, // Controller for write operations
    nfcMode: "token" as "token" | "payment-request", // Default to token mode
    isScanningPaymentRequest: false, // Flag for UI to show payment request scanner
    isWritingToken: false, // Flag for UI to show token writing scanner
  }),
  actions: {
    /**
     * Toggle NFC scanner on/off
     * @param mode - The type of data to scan for ("token" or "payment-request")
     */
    toggleScanner(mode: "token" | "payment-request" = "token") {
      this.nfcMode = mode;

      console.log(
        "toggleScanner called, current state:",
        this.scanningCard,
        "requested mode:",
        mode
      );

      if (this.scanningCard === false) {
        try {
          this.ndef = new window.NDEFReader();
          this.controller = new AbortController();
          const signal = this.controller.signal;

          this.ndef
            .scan({ signal })
            .then(() => {
              console.log("> NFC Scan started in mode:", mode);

              this.ndef.addEventListener("readingerror", () => {
                console.error("Cannot read data from the NFC tag.");
                notifyError("Cannot read data from the NFC tag.");
                this.controller?.abort();
                this.scanningCard = false;
              });

              this.ndef.addEventListener(
                "reading",
                ({ message, serialNumber }) => {
                  try {
                    const record = message.records[0];
                    const recordType = record.recordType;
                    let dataStr = "";

                    switch (recordType) {
                      case "text":
                        const text = new TextDecoder().decode(record.data);
                        dataStr = text;
                        break;
                      case "url":
                        const url = new TextDecoder().decode(record.data);
                        dataStr = url;
                        break;
                      case "mime":
                        if (record.mediaType !== "application/octet-stream") {
                          throw new Error("binary data expected");
                        }
                        const data = new Uint8Array(record.data.buffer);
                        const prefix = String.fromCharCode(...data.slice(0, 4));
                        if (prefix === "craw") {
                          // Handle cashu token binary format
                          const token = getDecodedTokenBinary(data);
                          dataStr = getEncodedToken(token);
                        } else {
                          // Try to decode as UTF-8 text
                          dataStr = new TextDecoder().decode(data);
                        }
                        break;
                      default:
                        throw new Error(`unsupported recordType ${recordType}`);
                    }

                    // Process the scanned data based on mode
                    if (this.nfcMode === "token") {
                      this.processTokenData(dataStr);
                    } else if (this.nfcMode === "payment-request") {
                      this.processPaymentRequestData(dataStr);
                    }
                  } catch (err) {
                    console.error(`Something went wrong! ${err}`);
                    // notifyError(`Something went wrong! ${err}`);
                  } finally {
                    // Always abort the controller and reset scanning state after processing
                    this.controller?.abort();
                    this.scanningCard = false;
                  }
                }
              );
              this.scanningCard = true;
            })
            .catch((error) => {
              console.error(`Scan error: ${error.message}`);
              // notifyError(`Scan error: ${error.message}`);
            });
        } catch (error) {
          console.error(`NFC error: ${error.message}`);
          // notifyError(`NFC error: ${error.message}`);
        }
      } else {
        console.log("Turning OFF scanner, aborting controller");
        this.controller?.abort();
        this.scanningCard = false;
        console.log("Scanner state after abort:", this.scanningCard);
      }
    },

    /**
     * Process token data read from NFC tag
     * @param dataStr - The data string read from the tag
     */
    processTokenData(dataStr: string) {
      const tokenStore = useTokensStore();
      const receiveStore = useReceiveTokensStore();
      const uiStore = useUiStore();

      if (!dataStr.startsWith("cashu")) {
        notifyError("NFC tag does not contain a cashu token");
        return;
      }

      const historyToken = tokenStore.tokenAlreadyInHistory(dataStr);
      if (!historyToken || historyToken.status === "pending") {
        receiveStore.receiveData.tokensBase64 = dataStr;
        receiveStore.showReceiveTokens = true;
        uiStore.closeDialogs();
      } else {
        notify("Token already in history.");
      }
    },

    /**
     * Stop scanning
     */
    stopScanning() {
      if (this.scanningCard) {
        this.controller?.abort();
        this.scanningCard = false;
      }

      // Also reset the UI state flags
      if (this.nfcMode === "payment-request") {
        this.isScanningPaymentRequest = false;
      }
    },

    /**
     * Start scanning for payment requests
     */
    startPaymentRequestScanner() {
      // Set UI flag first
      this.isScanningPaymentRequest = true;

      // Then start the actual scanner
      this.toggleScanner("payment-request");
    },

    /**
     * Stop scanning for payment requests
     */
    stopPaymentRequestScanner() {
      // Stop the scanner
      this.stopScanning();

      // And reset the UI flag
      this.isScanningPaymentRequest = false;
    },

    /**
     * Stop writing tokens
     */
    stopWritingToken() {
      // Abort any ongoing write operation
      if (this.writeController) {
        this.writeController.abort();
        this.writeController = null;
      }
      this.isWritingToken = false;
    },

    /**
     * Process payment request data read from NFC tag
     * @param dataStr - The data string read from the tag
     * @returns {boolean} - Whether the processing was successful
     */
    processPaymentRequestData(dataStr: string): boolean {
      const prStore = usePRStore();
      const uiStore = useUiStore();
      const sendTokensStore = useSendTokensStore();

      if (!dataStr.startsWith("creq")) {
        notifyError("NFC tag does not contain a cashu payment request");
        return false;
      }

      try {
        // If we're in the send flow, set the payment request and show the send dialog
        if (!sendTokensStore.showSendTokens) {
          sendTokensStore.showSendTokens = true;
        }

        // Decode the payment request - this will update the send dialog
        prStore.decodePaymentRequest(dataStr);

        // Stop the scanner and update the UI flag
        this.stopPaymentRequestScanner();

        return true;
      } catch (error) {
        console.error("Failed to decode payment request:", error);
        notifyError(`Failed to decode payment request: ${error}`);
        return false;
      }
    },

    /**
     * Write token data to an NFC tag with retry mechanism
     * @param tokenData - The token data to write
     * @param encoding - The encoding to use ('text', 'url', or 'binary')
     */
    async writeTokenToTag(tokenData: string, encoding: string) {
      if (!tokenData) {
        notifyError("No token data to write");
        return false;
      }

      // Set writing flag to show scanner UI
      this.isWritingToken = true;
      this.writeController = new AbortController();
      const wasCancelled = () => this.writeController?.signal.aborted || !this.isWritingToken;

      let lastError = null;

      try {
        this.ndef = new window.NDEFReader();

        // Check if cancelled before starting write
        if (wasCancelled()) {
          this.isWritingToken = false;
          this.writeController = null;
          return false;
        }

        if (encoding === "text") {
          await this.ndef.write({
            records: [{ recordType: "text", data: tokenData }],
          });
        } else if (encoding === "weburl") {
          const tokenUrl = `https://wallet.cashu.me/#token=${tokenData}`;
          await this.ndef.write({
            records: [{ recordType: "url", data: tokenUrl }],
          });
        } else if (encoding === "binary") {
          const tokenBinary = getEncodedTokenBinary(tokenData);
          await this.ndef.write({
            records: [
              {
                recordType: "mime",
                mediaType: "application/octet-stream",
                data: tokenBinary,
              },
            ],
          });
        } else {
          notifyError("Unknown encoding type");
          this.isWritingToken = false;
          this.writeController = null;
          return false;
        }

        // Check if cancelled after write completes
        if (wasCancelled()) {
          console.log("NFC write operation was cancelled");
          this.isWritingToken = false;
          this.writeController = null;
          return false;
        }

        // If we reach here, writing was successful
        this.isWritingToken = false;
        this.writeController = null;
        return true;
      } catch (error: any) {
        // Check if error is due to cancellation
        if (wasCancelled()) {
          console.log("NFC write operation was cancelled");
          this.isWritingToken = false;
          this.writeController = null;
          return false;
        }
        lastError = error;
        console.error(`Error writing to NFC tag: `, error);
        this.isWritingToken = false;
        this.writeController = null;
      }

      // If we get here, all attempts failed
      return false;
    },

    /**
     * Write a payment request to an NFC tag
     * @param prData - The payment request data to write
     */
    async writePaymentRequestToTag(prData: string) {
      if (!prData) {
        notifyError("No payment request data to write");
        return false;
      }

      if (!prData.startsWith("creq")) {
        notifyError("Invalid payment request format");
        return false;
      }

      this.ndef = new window.NDEFReader();
      await this.ndef.write({
        records: [{ recordType: "text", data: prData }],
      });

      return true;
    },
  },
});
