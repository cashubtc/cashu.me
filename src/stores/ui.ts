import { defineStore } from "pinia";
import { useMintsStore } from "./mints";
import { useLocalStorage } from "@vueuse/core";

const unitTickerShortMap = {
  sat: "sats",
  usd: "USD",
};

export const useUiStore = defineStore("ui", {
  state: () => ({
    tickerLong: "Satoshis",
    showInvoiceDetails: false,
    showSendDialog: false,
    showReceiveDialog: false,
    tab: useLocalStorage("cashu.ui.tab", "history" as string),
    expandHistory:
      useLocalStorage("cashu.ui.expandHistory", true as boolean),
  }),
  actions: {
    setTab(tab: string) {
      this.tab = tab;
    },
    formatCurrency: function (value: number, currency: string) {
      if (currency == undefined) {
        currency = "sat";
      }
      if (currency == "sat") return this.formatSat(value);
      if (currency == "usd") value = value / 100;
      return new Intl.NumberFormat(navigator.language, {
        style: "currency",
        currency: currency,
      }).format(value);
      // + " " +
      // currency.toUpperCase()
    },
    formatSat: function (value: number) {
      return new Intl.NumberFormat(navigator.language).format(value) + " sat";
    },
  },
  getters: {
    tickerShort() {
      const unit = useMintsStore().activeUnit;
      return unitTickerShortMap[unit as keyof typeof unitTickerShortMap];
    },
    canPasteFromClipboard() {
      return (
        window.isSecureContext &&
        navigator.clipboard &&
        navigator.clipboard.readText
      );
    },
  },
});
