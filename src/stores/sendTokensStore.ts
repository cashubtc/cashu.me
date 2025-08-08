import { defineStore } from "pinia";
import { decodePaymentRequest, PaymentRequest } from "@cashu/cashu-ts";
import { HistoryToken } from "./tokens";
import { DEFAULT_BUCKET_ID } from "@/constants/buckets";

export const useSendTokensStore = defineStore("sendTokensStore", {
  state: () => ({
    showSendTokens: false,
    showLockInput: false,
    recipientPubkey: "",
    sendViaNostr: false,
    sendData: {
      amount: null,
      historyAmount: null,
      memo: "",
      tokens: "",
      tokensBase64: "",
      p2pkPubkey: "",
      locktime: null,
      paymentRequest: undefined,
      historyToken: undefined,
      bucketId: DEFAULT_BUCKET_ID,
    } as {
      amount: number | null;
      historyAmount: number | null;
      memo: string;
      tokens: string;
      tokensBase64: string;
      p2pkPubkey: string;
      locktime: number | null;
      paymentRequest?: PaymentRequest;
      historyToken: HistoryToken | undefined;
      bucketId?: string;
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
      this.sendData.locktime = null;
      this.sendData.paymentRequest = undefined;
      this.sendData.historyToken = undefined;
      this.sendData.bucketId = DEFAULT_BUCKET_ID;
      this.recipientPubkey = "";
      this.sendViaNostr = false;
    },
  },
});
