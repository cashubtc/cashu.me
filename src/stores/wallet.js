import { defineStore } from "pinia";
import { useMintsStore } from "./mints";
import { useLocalStorage } from "@vueuse/core";

export const useWalletStore = defineStore("wallet", {
  state: () => {
    return {
      invoiceHistory: useLocalStorage("cashu.invoiceHistory", []),
      invoiceData: {
        amount: 0,
        memo: "",
        bolt11: "",
        hash: "",
      },
      payInvoiceData: {
        blocking: false,
        bolt11: "",
        show: false,
        invoice: null,
        lnurlpay: null,
        lnurlauth: null,
        data: {
          request: "",
          amount: 0,
          comment: "",
        },
      },
    };
  },
  getters: {
    wallet() {
      const mints = useMintsStore();
      const wallet = new CashuWallet(mints.keys, mints.activeMint);
      return wallet;
    },
  },
});
