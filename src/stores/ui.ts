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
    globalMutexLock: false,
  }),
  actions: {
    lockMutex() {
      const nRetries = 10;
      const retryInterval = 100;
      if (this.globalMutexLock) {
        // retry, and wait for the lock to be released
        // if the lock isn't released, throw an error
        let retries = 0;
        const interval = setInterval(() => {
          if (!this.globalMutexLock) {
            clearInterval(interval);
          }
          retries++;
          if (retries > nRetries) {
            clearInterval(interval);
            throw new Error("Failed to acquire global mutex lock");
          }
        }, retryInterval);
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
    formatCurrency: function (value: number, currency: string, showBalance = false) {
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
