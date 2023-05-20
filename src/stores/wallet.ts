import { defineStore } from "pinia";
import { currentDateStr } from "src/js/utils";
import { notifyApiError } from "src/js/notify";
import { useMintsStore } from "./mints";
import { useLocalStorage } from "@vueuse/core";
import { CashuMint, CashuWallet } from "@cashu/cashu-ts";

type Invoice = {
  amount: number;
  bolt11: string;
  hash: string;
  memo: string;
};

type InvoiceHistory = Invoice & {
  date: string;
  status: "pending" | "paid";
  mint?: string;
};

export const useWalletStore = defineStore("wallet", {
  state: () => {
    return {
      invoiceHistory: useLocalStorage(
        "cashu.invoiceHistory",
        [] as InvoiceHistory[]
      ),
      invoiceData: {
        amount: 0,
        memo: "",
        bolt11: "",
        hash: "",
      } as Invoice,
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
      const mint = new CashuMint(mints.activeMintUrl);
      const wallet = new CashuWallet(mint);
      return wallet;
    },
  },
  actions: {
    /**
     * Ask the mint to generate an invoice for the given amount
     * Upon paying the request, the mint will credit the wallet with
     * cashu tokens
     */
    requestMint: async function (amount?: number) {
      const mints = useMintsStore();
      if (amount) {
        this.invoiceData.amount = amount;
      }
      try {
        const data = await mints.activeMint.requestMint(
          this.invoiceData.amount
        );
        this.invoiceData.bolt11 = data.pr;
        this.invoiceData.hash = data.hash;
        this.invoiceHistory.push({
          ...this.invoiceData,
          date: currentDateStr(),
          status: "pending",
          mint: mints.activeMintUrl,
        });
        return data;
      } catch (error: any) {
        console.error(error);
        notifyApiError(error);
      }
    },
    setInvoicePaid(payment_hash: string) {
      const invoice = this.invoiceHistory.find((i) => i.hash === payment_hash);
      if (!invoice) return;
      invoice.status = "paid";
    },
  },
});
