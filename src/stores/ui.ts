import { defineStore } from "pinia";
import { useMintsStore } from "./mints";
import { useLocalStorage } from "@vueuse/core";

const unitTickerShortMap = {
  sat: "sats",
  usd: "USD",
  eur: "EUR",
  msat: "msats"
};

export const useUiStore = defineStore("ui", {
  state: () => ({
    hideBalance: useLocalStorage<boolean>("cashu.ui.hideBalance", false),
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
