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
import { Clipboard } from "@capacitor/clipboard";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

import ts from "typescript";
import { useSettingsStore } from "./settings";

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
    showCreateInvoiceDialog: false,
    showSendDialog: false,
    showReceiveDialog: false,
    showReceiveEcashDrawer: false,
    showNumericKeyboard: false,
    activityOrb: false,
    tab: useLocalStorage("cashu.ui.tab", "history" as string),
    expandHistory: useLocalStorage("cashu.ui.expandHistory", true as boolean),
    globalMutexLock: false,
    showDebugConsole: useLocalStorage("cashu.ui.showDebugConsole", false),
    lastBalanceCached: useLocalStorage("cashu.ui.lastBalanceCached", 0),
    multinutExperimentalWarningDismissed: useLocalStorage(
      "cashu.ui.multinutExperimentalWarningDismissed",
      false
    ),
  }),
  actions: {
    closeDialogs() {
      this.showInvoiceDetails = false;
      this.showCreateInvoiceDialog = false;
      this.showSendDialog = false;
      this.showReceiveDialog = false;
      this.showReceiveEcashDrawer = false;
    },
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
    triggerActivityOrb() {
      this.activityOrb = true;
    },
    setTab(tab: string) {
      this.tab = tab;
    },
    formatSat: function (value: number) {
      // convert value to integer
      if (useSettingsStore().bip177BitcoinSymbol) {
        if (value >= 0) {
          return "₿" + new Intl.NumberFormat(navigator.language).format(value);
        } else {
          return (
            "-₿" +
            new Intl.NumberFormat(navigator.language).format(Math.abs(value))
          );
        }
      }
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
    toggleDebugConsole() {
      this.showDebugConsole = !this.showDebugConsole;
      if (this.showDebugConsole) {
        this.enableDebugConsole();
      } else {
        this.disableDebugConsole();
      }
    },
    enableDebugConsole() {
      if (!this.showDebugConsole) {
        return;
      }
      // enable debug terminal
      var script = document.createElement("script");
      script.src = "//cdn.jsdelivr.net/npm/eruda";
      document.body.appendChild(script);
      script.onload = function () {
        // @ts-ignore
        eruda.init();
      };
    },
    disableDebugConsole() {
      // @ts-ignore
      document.querySelector("#eruda").remove();
    },
    pasteFromClipboard: async function () {
      let text = "";
      // @ts-ignore
      if (window?.Capacitor) {
        const { value } = await Clipboard.read();
        text = value;
      } else {
        text = await navigator.clipboard.readText();
      }
      return text;
    },
    vibrate: async function () {
      // @ts-ignore
      if (window.Capacitor) {
        // Haptics.impact({ style: ImpactStyle.Light });
        Haptics.vibrate({ duration: 200 });
      } else {
        navigator.vibrate(200);
      }
    },
  },
  getters: {
    tickerShort() {
      const unit = useMintsStore().activeUnit;
      if (unit == "sat" && useSettingsStore().bip177BitcoinSymbol) {
        return "₿";
      } else {
        return unitTickerShortMap[unit as keyof typeof unitTickerShortMap];
      }
    },
    ndefSupported(): boolean {
      //console.log(`window.Capacitor.getPlatform() = ${window.Capacitor.getPlatform()}`)
      // @ts-ignore
      if (window.Capacitor.getPlatform() !== "web") {
        return false;
      }
      return "NDEFReader" in globalThis;
    },
    canPasteFromClipboard() {
      return (
        window.isSecureContext &&
        navigator.clipboard &&
        navigator.clipboard.readText
      );
    },
    webShareSupported(): boolean {
      return "share" in navigator;
    },
  },
});
