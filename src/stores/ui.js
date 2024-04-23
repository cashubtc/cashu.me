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
