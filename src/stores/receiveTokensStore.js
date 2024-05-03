import { defineStore } from "pinia";

export const useReceiveTokensStore = defineStore("receiveTokensStore", {
  state: () => ({
    showReceiveTokens: false,
    receiveData: {
      tokensBase64: "",
      p2pkPrivateKey: "",
    },
  }),
  actions: {},
});
