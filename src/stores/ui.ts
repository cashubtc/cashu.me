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
    tab: "history",
    expandHistory:
      useLocalStorage("cashu.settings.expandHistory", true as boolean),
  }),
  actions: {
    setTab(tab: string) {
      this.tab = tab;
    },
  },
  getters: {
    tickerShort() {
      const unit = useMintsStore().activeUnit;
      return unitTickerShortMap[unit as keyof typeof unitTickerShortMap];
    },
  },
});
