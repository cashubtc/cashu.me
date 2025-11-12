import { defineStore } from "pinia";
import { useTokensStore } from "./tokens";
import { useReceiveTokensStore } from "./receiveTokensStore";
import { usePRStore } from "./payment-request";
import { useUiStore } from "./ui";
import { useSendTokensStore } from "./sendTokensStore";
import { getDecodedTokenBinary, getEncodedToken } from "@cashu/cashu-ts";
import { notifyError, notify } from "../js/notify";

/**
 * WebNfcStore: Centralizes all NFC tag reading/writing functionality
 */
export const useWebNfcStore = defineStore("webNfcStore", {
  state: () => ({
    scanningCard: false,
    ndef: null as any,
    controller: null as AbortController | null,
    nfcMode: "token" as "token" | "payment-request", // Default to token mode
    isScanningPaymentRequest: false, // Flag for UI to show payment request scanner
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
                    notifyError(`Something went wrong! ${err}`);
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
              notifyError(`Scan error: ${error.message}`);
            });
        } catch (error) {
          console.error(`NFC error: ${error.message}`);
          notifyError(`NFC error: ${error.message}`);
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
     * @param maxAttempts - Maximum number of attempts to try writing (default: 3)
     */
    async writeTokenToTag(tokenData: string, encoding: string, maxAttempts: number = 3) {
      if (!tokenData) {
        notifyError("No token data to write");
        return false;
      }

      let attemptCount = 0;
      let lastError = null;

      while (attemptCount < maxAttempts) {
        attemptCount++;
        try {
          this.ndef = new window.NDEFReader();
          
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
            // Implementation for binary format would go here
            notifyError("Binary encoding not implemented yet");
            return false;
          } else {
            notifyError("Unknown encoding type");
            return false;
          }

          // If we reach here, writing was successful
          if (attemptCount > 1) {
            // If we succeeded after retries, notify the user
            notify(`Successfully wrote to NFC tag after ${attemptCount} attempts`);
          }
          return true;
        } catch (error) {
          lastError = error;
          console.error(`Error writing to NFC tag (attempt ${attemptCount}/${maxAttempts}):`, error);
          
          if (attemptCount < maxAttempts) {
            // Only show intermediate errors as notifications if we're not on the last attempt
            notify(`Attempt ${attemptCount}/${maxAttempts} failed. Please keep your device near the tag...`);
            
            // Wait a short time before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      // If we get here, all attempts failed
      notifyError(`Failed to write to NFC tag after ${maxAttempts} attempts: ${lastError?.message}`);
      return false;
    },

    /**
     * Write a payment request to an NFC tag with retry mechanism
     * @param prData - The payment request data to write
     * @param maxAttempts - Maximum number of attempts to try writing (default: 3)
     */
    async writePaymentRequestToTag(prData: string, maxAttempts: number = 3) {
      if (!prData) {
        notifyError("No payment request data to write");
        return false;
      }

      if (!prData.startsWith("creq")) {
        notifyError("Invalid payment request format");
        return false;
      }

      let attemptCount = 0;
      let lastError = null;

      while (attemptCount < maxAttempts) {
        attemptCount++;
        try {
          this.ndef = new window.NDEFReader();
          await this.ndef.write({
            records: [{ recordType: "text", data: prData }],
          });

          // If we reach here, writing was successful
          if (attemptCount > 1) {
            // If we succeeded after retries, notify the user
            notify(`Successfully wrote payment request to NFC tag after ${attemptCount} attempts`);
          }
          return true;
        } catch (error) {
          lastError = error;
          console.error(`Error writing payment request to NFC tag (attempt ${attemptCount}/${maxAttempts}):`, error);
          
          if (attemptCount < maxAttempts) {
            // Only show intermediate errors as notifications if we're not on the last attempt
            notify(`Attempt ${attemptCount}/${maxAttempts} failed. Please keep your device near the tag...`);
            
            // Wait a short time before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      // If we get here, all attempts failed
      notifyError(`Failed to write payment request to NFC tag after ${maxAttempts} attempts: ${lastError?.message}`);
      return false;
    },
  },
});
