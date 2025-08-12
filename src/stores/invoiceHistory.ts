import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { LOCAL_STORAGE_KEYS } from "src/constants/localStorageKeys";
import { InvoiceHistory } from "src/types/invoice";
import { MeltQuoteResponse } from "@cashu/cashu-ts";

export const useInvoiceHistoryStore = defineStore("invoiceHistory", {
  state: () => ({
    invoiceHistory: useLocalStorage<InvoiceHistory[]>(
      LOCAL_STORAGE_KEYS.CASHU_INVOICEHISTORY,
      []
    ),
  }),
  actions: {
    setInvoicePaid(quoteId: string) {
      const invoice = this.invoiceHistory.find((i) => i.quote === quoteId);
      if (invoice) invoice.status = "paid";
    },
    addOutgoingPendingInvoiceToHistory(quote: MeltQuoteResponse) {
      this.invoiceHistory.push({
        amount: -(quote.amount + quote.fee_reserve),
        bolt11: "",
        quote: quote.quote,
        memo: "Outgoing invoice",
        date: new Date().toISOString(),
        status: "pending",
        mint: "",
        unit: "",
        meltQuote: quote,
      });
    },
    removeOutgoingInvoiceFromHistory(quote: string) {
      const index = this.invoiceHistory.findIndex((i) => i.quote === quote);
      if (index >= 0) this.invoiceHistory.splice(index, 1);
    },
    updateOutgoingInvoiceInHistory(
      quote: MeltQuoteResponse,
      options?: { status?: "pending" | "paid"; amount?: number }
    ) {
      this.invoiceHistory
        .filter((i) => i.quote === quote.quote)
        .forEach((i) => {
          if (options) {
            if (options.status) i.status = options.status;
            if (options.amount) i.amount = options.amount;
            i.meltQuote = quote;
          }
        });
    },
  },
});
