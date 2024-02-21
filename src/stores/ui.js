import { defineStore } from "pinia";

export const useUiStore = defineStore("ui", {
  state: () => ({
    tickerShort: "sats",
    ticketLong: "Satoshis",
    showInvoiceDetails: false,
  }),
});
