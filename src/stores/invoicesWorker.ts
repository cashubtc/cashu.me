import { defineStore } from "pinia";
import { useWalletStore } from "./wallet";
import { useLocalStorage } from "@vueuse/core";
import { useSettingsStore } from "./settings";
interface InvoiceQuote {
  quote: string;
  addedAt: number;
  lastChecked: number;
  checkCount: number;
}

export const useInvoicesWorkerStore = defineStore("invoicesWorker", {
  state: () => {
    return {
      checkInterval: 3000,
      maxLength: 50,
      // Two weeks
      maxAge: 1000 * 60 * 60 * 24 * 14,
      oneDay: 1000 * 60 * 60 * 24,
      oneHour: 1000 * 60 * 60,
      // Once per day
      maxInterval: 1000 * 60 * 60 * 24,
      keepIntervalConstantForNChecks: 5,
      invoiceCheckListener: null as NodeJS.Timeout | null,
      invoiceWorkerRunning: false,
      quotes: useLocalStorage<InvoiceQuote[]>("cashu.worker.invoices.quotesQueue", []),
      lastInvoiceCheckTime: 0,
    };
  },
  actions: {
    startInvoiceCheckerWorker() {
      if (!useSettingsStore().periodicallyCheckIncomingInvoices) return;
      if (this.invoiceCheckListener) return;
      this.invoiceWorkerRunning = true;
      this.invoiceCheckListener = setInterval(() => {
        this.processQuotes();
      }, this.checkInterval);
    },
    stopInvoiceCheckerWorker() {
      if (this.invoiceCheckListener) {
        clearInterval(this.invoiceCheckListener);
        this.invoiceCheckListener = null;
        this.invoiceWorkerRunning = false;
      }
    },
    addInvoiceToChecker(quote: string) {
      const existingIndex = this.quotes.findIndex((q) => q.quote === quote);
      if (existingIndex !== -1) {
        this.quotes.splice(existingIndex, 1);
      }

      if (this.quotes.length >= this.maxLength) {
        this.quotes.shift();
      }

      this.quotes.push({
        quote,
        addedAt: Date.now(),
        lastChecked: 0,
        checkCount: 0,
      });
      this.startInvoiceCheckerWorker();
    },
    removeInvoiceFromChecker(quote: string) {
      const index = this.quotes.findIndex((q) => q.quote === quote);
      if (index !== -1) {
        this.quotes.splice(index, 1);
      }
    },
    dueTime(q: InvoiceQuote) {
      if (q.checkCount > this.keepIntervalConstantForNChecks) {
        return q.lastChecked + Math.min(this.checkInterval * (1 + q.checkCount - this.keepIntervalConstantForNChecks), this.maxInterval);
      } else {
        return q.lastChecked + this.checkInterval;
      }
    },
    async processQuotes() {
      const now = Date.now();
      this.quotes = this.quotes.filter((q) => now - q.addedAt < this.maxAge);

      if (this.quotes.length === 0) return;

      // Global rate limit
      if (now - this.lastInvoiceCheckTime < this.checkInterval) {
        return;
      }

      for (let i = this.quotes.length - 1; i >= 0; i--) {
        const q = this.quotes[i];
        const dueTime = this.dueTime(q);
        if (now > dueTime) {
          const walletStore = useWalletStore();
          try {
            await walletStore.checkInvoice(q.quote, false);
            this.quotes.splice(i, 1);
          } catch (error) {
            q.lastChecked = now;
            q.checkCount += 1;
          }
          this.lastInvoiceCheckTime = now;
          break;
        }
      }
    },
    async reconnectWebsockets() {
      if (!useSettingsStore().useWebsockets) return;
      const walletStore = useWalletStore();
      // for each quote that is less than one hour old, call walletStore.mintOnPaid(quote)
      const now = Date.now();
      for (const q of this.quotes) {
        if (now - q.addedAt < this.oneHour) {
          walletStore.mintOnPaid(q.quote, false, false);
          console.log(`Connected Websocket for quote ${q.quote}`);
        }
      }
    },
  },
});
