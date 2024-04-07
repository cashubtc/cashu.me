import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { useMintsStore } from "./mints";

const unitTickerShortMap = {
  sat: "sats",
  usd: "USD",
};

export const useUiStore = defineStore("ui", {
  state: () => ({
    tickerLong: "Satoshis",
    tickerDollar: "USD",
    showInvoiceDetails: false,
    tab: "history",
  }),
  actions: {
    setTab(tab) {
      this.tab = tab;
    },
  },
  getters: {
    tickerShort() {
      const unit = useMintsStore().activeUnit;
      return unitTickerShortMap[unit];
    },
  },
});
