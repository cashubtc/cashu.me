import { defineStore } from "pinia";
import { currentDateStr } from "src/js/utils";
import { notifyApiError } from "src/js/notify";
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
  actions: {
    requestMint: async function (amount = null) {
      const mints = useMintsStore();
      if (amount != null) {
        this.invoiceData.amount = amount;
      }
      try {
        const data = await mints.activeMint.requestMint(
          this.invoiceData.amount
        );
        this.invoiceData.bolt11 = data.pr;
        this.invoiceData.hash = data.hash;
        this.invoiceHistory.push(
          // extend dictionary
          Object.assign({}, this.invoiceData, {
            date: currentDateStr(),
            status: "pending",
            mint: this.activeMintUrl,
          })
        );
        return data;
      } catch (error) {
        console.error(error);
        notifyApiError(error);
      }
    },
  },
});
