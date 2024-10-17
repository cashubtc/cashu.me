import { defineStore } from "pinia";
import { decodePaymentRequest, PaymentRequest } from "@cashu/cashu-ts";

export const useSendTokensStore = defineStore("sendTokensStore", {
  state: () => ({
    showSendTokens: false,
    showLockInput: false,
    sendData: {
      amount: null,
      memo: "",
      tokens: "",
      tokensBase64: "",
      p2pkPubkey: "",
      paymentRequest: {} as PaymentRequest,
    } as {
      amount: number | null;
      memo: string;
      tokens: string;
      tokensBase64: string;
      p2pkPubkey: string;
      paymentRequest: PaymentRequest;
    },
  }),
  actions: {},
});
