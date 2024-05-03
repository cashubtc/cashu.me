import { defineStore } from "pinia";

export const useSendTokensStore = defineStore("sendTokensStore", {
  state: () => ({
    showSendTokens: false,
    showLockInput: false,
    sendData: {
      amount: 0,
      memo: "",
      tokens: "",
      tokensBase64: "",
      p2pkPubkey: "",
    },
  }),
  actions: {},
});
