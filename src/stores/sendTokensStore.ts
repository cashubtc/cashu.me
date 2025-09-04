import { defineStore } from "pinia";
import { decodePaymentRequest, PaymentRequest } from "@cashu/cashu-ts";
import { HistoryToken } from "./tokens";

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
      // cairo spending condition fields
      lockType: "none", // one of: none | p2pk | cairo
      cairoExecutable: "",
      cairoExpectedOutput: "",
      paymentRequest: undefined,
      historyToken: undefined,
    } as {
      amount: number | null;
      historyAmount: number | null;
      memo: string;
      tokens: string;
      tokensBase64: string;
      p2pkPubkey: string;
      lockType: "none" | "p2pk" | "cairo";
      cairoExecutable: string;
      cairoExpectedOutput: string;
      paymentRequest?: PaymentRequest;
      historyToken: HistoryToken | undefined;
    },
  }),
  actions: {
    clearSendData() {
      this.sendData.amount = null;
      this.sendData.historyAmount = null;
      this.sendData.memo = "";
      this.sendData.tokens = "";
      this.sendData.tokensBase64 = "";
      this.sendData.p2pkPubkey = "";
      this.sendData.lockType = "none";
      this.sendData.cairoExecutable = "";
      this.sendData.cairoExpectedOutput = "";
      this.sendData.paymentRequest = undefined;
      this.sendData.historyToken = undefined;
    },
  },
});
