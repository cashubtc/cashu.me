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
  }),
  actions: {
    fetchBitcoinPriceUSD: async function () {
      if (!useSettingsStore().getBitcoinPrice) {
        this.bitcoinPrice = 0;
        this.bitcoinPriceLastUpdated = 0;
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
      var { data } = await axios.get(
        "https://api.coinbase.com/v2/exchange-rates?currency=BTC"
      );
      this.bitcoinPrice = data.data.rates.USD;
      this.bitcoinPriceLastUpdated = Date.now();
    },
  },
  getters: {},
});
