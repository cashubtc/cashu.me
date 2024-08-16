import { defineStore } from "pinia";

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
    } as {
      amount: number | null;
      memo: string;
      tokens: string;
      tokensBase64: string;
      p2pkPubkey: string;
    },
  }),
  actions: {},
});
