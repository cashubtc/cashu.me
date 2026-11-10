import { defineStore } from "pinia";
import {
  DEFAULT_HISTORY_FILTERS,
  type HistoryFilters,
} from "src/js/history-filters";
import { useMintsStore } from "./mints";
import { useLocalStorage } from "@vueuse/core";
import { Clipboard } from "@capacitor/clipboard";
import { Haptics } from "@capacitor/haptics";
import { formatUnitAmount } from "src/js/format-currency";

import { useSettingsStore } from "./settings";

export type MutexPriority = "foreground" | "normal" | "background";

type MutexWaiter = {
  priority: MutexPriority;
  resolve: () => void;
};

// This is intentionally module-local: waiting promises are ephemeral and must
// never be persisted with UI state.
const mutexWaiters: MutexWaiter[] = [];

const mutexPriorityRank: Record<MutexPriority, number> = {
  foreground: 2,
  normal: 1,
  background: 0,
};

function nextEligibleMutexWaiterIndex(foregroundPaymentRequests: number) {
  let nextIndex = -1;

  for (let index = 0; index < mutexWaiters.length; index++) {
    const waiter = mutexWaiters[index];
    if (waiter.priority === "background" && foregroundPaymentRequests > 0) {
      continue;
    }
    if (
      nextIndex === -1 ||
      mutexPriorityRank[waiter.priority] >
        mutexPriorityRank[mutexWaiters[nextIndex].priority]
    ) {
      nextIndex = index;
    }
  }

  return nextIndex;
}

const unitTickerShortMap = {
  sat: "sats",
  usd: "USD",
  eur: "EUR",
  msat: "msats",
};

export const useUiStore = defineStore("ui", {
  state: () => ({
    hideBalance: useLocalStorage<boolean>("cashu.ui.hideBalance", false),
    // The history list's filters: kept while the app runs (switching to Mints and back keeps
    // them), never across launches, so the list always opens unfiltered.
    historyFilters: { ...DEFAULT_HISTORY_FILTERS } as HistoryFilters,
    showInvoiceDetails: false,
    showCreateInvoiceDialog: false,
    showSendDialog: false,
    showReceiveDialog: false,
    showReceiveEcashDrawer: false,
    showNumericKeyboard: false,
    tab: useLocalStorage("cashu.ui.tab", "history" as string),
    expandHistory: useLocalStorage("cashu.ui.expandHistory", true as boolean),
    globalMutexLock: false,
    foregroundPaymentRequests: 0,
    // Number of open BottomSheet instances (they register themselves), used
    // by the back-button handler to know whether a sheet is open.
    openLocalSheets: 0,
    // Bump (Date.now()) to signal all open BottomSheets to close.
    closeLocalSheetsSignal: 0,
    showDebugConsole: useLocalStorage("cashu.ui.showDebugConsole", false),
    lastBalanceCached: useLocalStorage("cashu.ui.lastBalanceCached", 0),
    multinutExperimentalWarningDismissed: useLocalStorage(
      "cashu.ui.multinutExperimentalWarningDismissed",
      false
    ),
  }),
  actions: {
    // Used by the back-button handler (called as a method on purpose).
    hasOpenDialogs() {
      return Boolean(
        this.showInvoiceDetails ||
          this.showCreateInvoiceDialog ||
          this.showSendDialog ||
          this.showReceiveDialog ||
          this.showReceiveEcashDrawer ||
          this.openLocalSheets > 0
      );
    },
    closeDialogs() {
      this.showInvoiceDetails = false;
      this.showCreateInvoiceDialog = false;
      this.showSendDialog = false;
      this.showReceiveDialog = false;
      this.showReceiveEcashDrawer = false;
      this.closeLocalSheetsSignal = Date.now();
    },
    async lockMutex(priority: MutexPriority = "normal") {
      await new Promise<void>((resolve) => {
        mutexWaiters.push({ priority, resolve });
        this.dispatchMutexWaiters();
      });
    },
    unlockMutex() {
      this.globalMutexLock = false;
      this.dispatchMutexWaiters();
    },
    dispatchMutexWaiters() {
      if (this.globalMutexLock) return;

      const nextIndex = nextEligibleMutexWaiterIndex(
        this.foregroundPaymentRequests
      );
      if (nextIndex === -1) return;

      const [next] = mutexWaiters.splice(nextIndex, 1);
      this.globalMutexLock = true;
      next.resolve();
    },
    beginForegroundPayment() {
      this.foregroundPaymentRequests += 1;
    },
    endForegroundPayment() {
      this.foregroundPaymentRequests = Math.max(
        0,
        this.foregroundPaymentRequests - 1
      );
      this.dispatchMutexWaiters();
    },
    setTab(tab: string) {
      this.tab = tab;
    },
    formatCurrency: function (
      value: number | bigint,
      currency: string,
      showBalance = false
    ) {
      if (this.hideBalance && !showBalance) {
        return "****";
      }
      return formatUnitAmount(
        value,
        currency,
        useSettingsStore().bip177BitcoinSymbol
      );
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
      const script = document.createElement("script");
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
