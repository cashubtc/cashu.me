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
      checkInterval: 5000,
      maxLength: 50,
      // Two weeks
      maxAge: 1000 * 60 * 60 * 24 * 14,
      // Once per day
      maxInterval: 1000 * 60 * 60 * 24,
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
        const dueTime = q.lastChecked + Math.min(this.checkInterval * (1 + q.checkCount), this.maxInterval);
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
  },
});
