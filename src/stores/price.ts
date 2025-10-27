import { defineStore } from "pinia";
import { useSettingsStore } from "./settings";
import { useLocalStorage } from "@vueuse/core";
import {
  notifyApiError,
  notifyError,
  notifySuccess,
  notifyWarning,
  notify,
} from "../js/notify";
import axios from "axios";

export const usePriceStore = defineStore("price", {
  state: () => ({
    bitcoinPrice: useLocalStorage("cashu.price.bitcoinPrice", 0 as number),
    bitcoinPriceLastUpdated: useLocalStorage(
      "cashu.price.bitcoinPriceLastUpdated",
      0 as number
    ),
    bitcoinPriceMinRefreshInterval: 60_000,
    bitcoinPrices: useLocalStorage(
      "cashu.price.bitcoinPrices",
      {} as Record<string, number>
    ),
  }),
  actions: {
    fetchBitcoinPrice: async function () {
      const settingsStore = useSettingsStore();
      if (!settingsStore.getBitcoinPrice) {
        this.bitcoinPrice = 0;
        this.bitcoinPriceLastUpdated = 0;
        this.bitcoinPrices = {};
        console.log("Not fetching bitcoin price, disabled in settings");
        return;
      }
      if (
        Date.now() - this.bitcoinPriceLastUpdated <
        this.bitcoinPriceMinRefreshInterval
      ) {
        console.log(
          `Not fetching bitcoin price, last updated ${
            Date.now() - this.bitcoinPriceLastUpdated
          }ms ago: ${this.bitcoinPrice}`
        );
        return;
      }
      try {
        var { data } = await axios.get(
          "https://api.coinbase.com/v2/exchange-rates?currency=BTC"
        );
        this.bitcoinPrices = data.data.rates;
        // Update the main bitcoinPrice to current selected currency for backward compatibility
        this.bitcoinPrice =
          data.data.rates[settingsStore.bitcoinPriceCurrency] ||
          data.data.rates.USD;
        this.bitcoinPriceLastUpdated = Date.now();
      } catch (error) {
        console.error("Failed to fetch bitcoin price:", error);
        notifyError("Failed to fetch bitcoin price");
      }
    },
    updateBitcoinPriceForCurrentCurrency: function () {
      const settingsStore = useSettingsStore();
      // Update the main bitcoinPrice to reflect the current selected currency
      this.bitcoinPrice =
        this.bitcoinPrices[settingsStore.bitcoinPriceCurrency] ||
        this.bitcoinPrice;
    },
  },
  getters: {
    currentCurrencyPrice(): number {
      const settingsStore = useSettingsStore();
      return (
        this.bitcoinPrices[settingsStore.bitcoinPriceCurrency] ||
        this.bitcoinPrice
      );
    },
  },
});
