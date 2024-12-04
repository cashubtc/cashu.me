import { defineStore } from "pinia";
import { useMintsStore } from "./mints";
import { useLocalStorage } from "@vueuse/core";
import {
  notifyApiError,
  notifyError,
  notifySuccess,
  notifyWarning,
  notify,
} from "../js/notify";

const unitTickerShortMap = {
  sat: "sats",
  usd: "USD",
  eur: "EUR",
  msat: "msats",
};

export const useUiStore = defineStore("ui", {
  state: () => ({
    hideBalance: useLocalStorage<boolean>("cashu.ui.hideBalance", false),
    tickerLong: "Satoshis",
    showInvoiceDetails: false,
    showSendDialog: false,
    showReceiveDialog: false,
    tab: useLocalStorage("cashu.ui.tab", "history" as string),
    expandHistory: useLocalStorage("cashu.ui.expandHistory", true as boolean),
    globalMutexLock: false,
  }),
  actions: {
    async lockMutex() {
      const nRetries = 10;
      const retryInterval = 500;
      let retries = 0;

      while (this.globalMutexLock) {
        if (retries >= nRetries) {
          notify("Please try again.");
          throw new Error("Failed to acquire global mutex lock");
        }
        retries++;
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      }

      this.globalMutexLock = true;
    },
    unlockMutex() {
      this.globalMutexLock = false;
    },
    setTab(tab: string) {
      this.tab = tab;
    },
    formatSat: function (value: number) {
      // convert value to integer
      return new Intl.NumberFormat(navigator.language).format(value) + " sat";
    },
    fromMsat: function (value: number) {
      return new Intl.NumberFormat(navigator.language).format(value) + " msat";
    },
    formatCurrency: function (
      value: number,
      currency: string,
      showBalance = false
    ) {
      if (currency == undefined) {
        currency = "sat";
      }
      if (useUiStore().hideBalance && !showBalance) {
        return "****";
      }
      if (currency == "sat") return this.formatSat(value);
      if (currency == "msat") return this.fromMsat(value);
      if (currency == "usd") value = value / 100;
      if (currency == "eur") value = value / 100;
      return new Intl.NumberFormat(navigator.language, {
        style: "currency",
        currency: currency,
      }).format(value);
      // + " " +
      // currency.toUpperCase()
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
