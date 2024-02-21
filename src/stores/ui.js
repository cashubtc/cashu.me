import { defineStore } from "pinia";

export const useUiStore = defineStore("ui", {
  state: () => ({
    tickerShort: "sats",
    tickerLong: "Satoshis",
    tickerDollar: "USD",
    showInvoiceDetails: false,
  }),
});
