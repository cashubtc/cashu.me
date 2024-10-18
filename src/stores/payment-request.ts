import { defineStore } from "pinia";
import { useWalletStore } from "./wallet";
import { decodePaymentRequest, PaymentRequest, PaymentRequestPayload, PaymentRequestTransport, PaymentRequestTransportType } from "@cashu/cashu-ts";
import { useMintsStore } from "./mints";
import { useSendTokensStore } from "./sendTokensStore";
import { useNostrStore } from "./nostr";
import { useTokensStore } from "./tokens";
import token from "src/js/token";
import { notify, notifyError, notifySuccess } from "src/js/notify";
import { useLocalStorage } from "@vueuse/core";


export const usePRStore = defineStore("payment-request", {
  state: () => ({
    showPRDialog: false,
    showPRKData: "" as string,
    enablePaymentRequest: useLocalStorage<boolean>("cashu.pr.enable", false),
  }),
  getters: {
  },
  actions: {
    newPaymentRequest(amount?: number, memo?: string) {
      const walletStore = useWalletStore();
      this.showPRKData = walletStore.createPaymentRequest(amount, memo);
    },
    decodePaymentRequest(pr: string) {
      console.log("decodePaymentRequest", pr);
      const request: PaymentRequest = decodePaymentRequest(pr)
      console.log("decodePaymentRequest", request);
      // activate the mint in the payment request
      if (request.mints && request.mints.length > 0) {
        const walletStore = useWalletStore();
        const mintsStore = useMintsStore();
        let foundMint = false;
        for (const mint of request.mints) {
          if (mintsStore.mints.find((m) => m.url == mint)) {
            mintsStore.activateMintUrl(mint);
            foundMint = true;
            break;
          }
        }
        if (!foundMint) {
          notifyError("We do not know the mint in the payment request");
          throw new Error(`We do not know the mint in the payment request: ${request.mints}`);
        }
      }

      const sendTokenStore = useSendTokensStore();
      sendTokenStore.clearSendData();
      // if the payment request has an amount, set it
      if (request.amount) {
        sendTokenStore.sendData.amount = request.amount;
      }
      sendTokenStore.sendData.paymentRequest = request;
      sendTokenStore.showSendTokens = true;
    },
    parseAndPayPaymentRequest(request: PaymentRequest, tokenStr: string) {
      const transports: PaymentRequestTransport[] = request.transport;
      for (const transport of transports) {
        if (transport.type == PaymentRequestTransportType.NOSTR) {
          this.payNostrPaymentRequest(request, transport, tokenStr);
          return;
        }
        if (transport.type == PaymentRequestTransportType.POST) {
          this.payPostPaymentRequest(request, transport, tokenStr);
          return;
        }
      }
    },
    async payNostrPaymentRequest(request: PaymentRequest, transport: PaymentRequestTransport, tokenStr: string) {
      console.log("payNostrPaymentRequest", request, tokenStr);
      console.log("transport", transport);
      const nostrStore = useNostrStore();
      const decodedToken = token.decode(tokenStr);
      if (!decodedToken) {
        console.error("could not decode token");
        return;
      }
      const proofs = token.getProofs(decodedToken);
      const mint = token.getMint(decodedToken);
      const paymentPayload: PaymentRequestPayload = {
        id: request.id,
        mint: mint,
        unit: request.unit || "",
        proofs: proofs,
      };
      const paymentPayloadString = JSON.stringify(paymentPayload);
      try {
        await nostrStore.sendNip17DirectMessageToNprofile(transport.target, paymentPayloadString);
      } catch (error) {
        console.error("Error paying payment request:", error);
        notifyError("Could not pay request");
      }
      notifySuccess("Payment sent");
    },
    async payPostPaymentRequest(request: PaymentRequest, transport: PaymentRequestTransport, tokenStr: string) {
      console.log("payPostPaymentRequest", request, tokenStr);
      // get the endpoint from the transport target and make an HTTP POST request with the paymentPayload as the body
      const decodedToken = token.decode(tokenStr);
      if (!decodedToken) {
        console.error("could not decode token");
        return;
      }
      const proofs = token.getProofs(decodedToken);
      const paymentPayload: PaymentRequestPayload = {
        id: request.id,
        mint: request.mints ? request.mints[0] : "",
        unit: request.unit || "",
        proofs: proofs,
      };
      const paymentPayloadString = JSON.stringify(paymentPayload);
      try {
        const response = await fetch(transport.target, {
          headers: {
            'Content-Type': 'application/json',
          },
          method: "POST",
          body: paymentPayloadString,
        });
        notifySuccess("Payment sent");

      } catch (error) {
        console.error("Error paying payment request:", error);
        notifyError("Could not pay request");
      }

    },
  },
});
