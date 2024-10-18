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
      paymentRequest: undefined,
    } as {
      amount: number | null;
      memo: string;
      tokens: string;
      tokensBase64: string;
      p2pkPubkey: string;
      paymentRequest?: PaymentRequest;
    },
  }),
  actions: {
    clearSendData() {
      this.sendData.amount = null;
      this.sendData.memo = "";
      this.sendData.tokens = "";
      this.sendData.tokensBase64 = "";
      this.sendData.p2pkPubkey = "";
      this.sendData.paymentRequest = undefined;
    }
  },
});
