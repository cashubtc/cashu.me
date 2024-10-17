import { defineStore } from "pinia";
import { useWalletStore } from "./wallet";
import { decodePaymentRequest, PaymentRequest } from "@cashu/cashu-ts";
import { useMintsStore } from "./mints";
import { useSendTokensStore } from "./sendTokensStore";

export const usePRStore = defineStore("payment-request", {
  state: () => ({
    showPRDialog: false,
    showPRKData: "" as string,
  }),
  getters: {
  },
  actions: {
    newPaymentRequest(amount?: number, memo?: string) {
      const walletStore = useWalletStore();
      this.showPRKData = walletStore.createPaymentRequest(amount, memo);
    },
    parsePaymentRequest(pr: string) {
      console.log("parsePaymentRequest", pr);
      const request: PaymentRequest = decodePaymentRequest(pr)
      console.log("parsePaymentRequest", request);
      // activate the mint in the payment request
      if (request.mints && request.mints.length > 0) {
        const walletStore = useWalletStore();
        const mintsStore = useMintsStore();
        for (const mint of request.mints) {
          if (mintsStore.mints.find((m) => m.url == mint)) {
            mintsStore.activateMintUrl(mint);
          }
        }
      }

      const sendTokenStore = useSendTokensStore();
      sendTokenStore.showSendTokens = true;

      // if the payment request has an amount, set it
      if (request.amount) {
        sendTokenStore.sendData.amount = request.amount;
      }

      sendTokenStore.sendData.paymentRequest = request;
    },
  },
});
