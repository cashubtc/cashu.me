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
      oneDay: 1000 * 60 * 60 * 24,
      oneHour: 1000 * 60 * 60,
      // Once per day
      maxInterval: 1000 * 60 * 60 * 24,
      keepIntervalConstantForNChecks: 5,
      invoiceCheckListener: null as NodeJS.Timeout | null,
      invoiceWorkerRunning: false,
      quotes: useLocalStorage<InvoiceQuote[]>(
        "cashu.worker.invoices.quotesQueue",
        []
      ),
      // BOLT12 offers queue
      bolt12Quotes: useLocalStorage<InvoiceQuote[]>(
        "cashu.worker.invoices.bolt12QuotesQueue",
        []
      ),
      lastInvoiceCheckTime: 0,
      maxQuotesToCheckOnStartup: 10,
      lastPendingInvoiceCheck: useLocalStorage<number>(
        "cashu.worker.invoices.lastPendingInvoiceCheck",
        0
      ),
      checkPendingInvoicesInterval: 1000 * 10, // delay between bulk invoice checks
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
    addBolt12OfferToChecker(quote: string) {
      const existingIndex = this.bolt12Quotes.findIndex(
        (q) => q.quote === quote
      );
      if (existingIndex !== -1) {
        this.bolt12Quotes.splice(existingIndex, 1);
      }

      if (this.bolt12Quotes.length >= this.maxLength) {
        this.bolt12Quotes.shift();
      }
      this.bolt12Quotes.push({
        quote,
        addedAt: Date.now(),
        lastChecked: 0,
        checkCount: 0,
      });
      this.startInvoiceCheckerWorker();
    },
    removeBolt12OfferFromChecker(quote: string) {
      const index = this.bolt12Quotes.findIndex((q) => q.quote === quote);
      if (index !== -1) {
        this.bolt12Quotes.splice(index, 1);
      }
    },
    dueTime(q: InvoiceQuote) {
      if (q.checkCount > this.keepIntervalConstantForNChecks) {
        return (
          q.lastChecked +
          Math.min(
            this.checkInterval *
              Math.pow(2, q.checkCount - this.keepIntervalConstantForNChecks),
            this.maxInterval
          )
        );
      } else {
        return q.lastChecked + this.checkInterval;
      }
    },
    async processQuotes() {
      const now = Date.now();
      this.quotes = this.quotes.filter((q) => now - q.addedAt < this.maxAge);
      this.bolt12Quotes = this.bolt12Quotes.filter(
        (q) => now - q.addedAt < this.maxAge
      );

      if (this.quotes.length === 0 && this.bolt12Quotes.length === 0) return;

      // Global rate limit
      if (now - this.lastInvoiceCheckTime < this.checkInterval) {
        return;
      }

      // First process one bolt11 quote if any
      for (let i = this.quotes.length - 1; i >= 0; i--) {
        const q = this.quotes[i];
        const dueTime = this.dueTime(q);
        if (now > dueTime) {
          const walletStore = useWalletStore();
          try {
            await walletStore.checkInvoiceBolt11(q.quote, false);
            this.quotes.splice(i, 1);
          } catch (error) {
            q.lastChecked = now;
            q.checkCount += 1;
          }
          this.lastInvoiceCheckTime = now;
          break;
        }
      }

      // Then process one bolt12 offer if any
      for (let i = this.bolt12Quotes.length - 1; i >= 0; i--) {
        const q = this.bolt12Quotes[i];
        const dueTime = this.dueTime(q);
        if (now > dueTime) {
          const walletStore = useWalletStore();
          try {
            await walletStore.checkOfferAndMintBolt12(q.quote, false);
            // Keep in queue for future payments as offers are reusable, but back off checks
            q.lastChecked = now;
            q.checkCount += 1;
          } catch (error) {
            q.lastChecked = now;
            q.checkCount += 1;
          }
          this.lastInvoiceCheckTime = now;
          break;
        }
      }
    },
    async checkPendingInvoices() {
      if (!useSettingsStore().checkInvoicesOnStartup) return;
      if (
        Date.now() <
        this.lastPendingInvoiceCheck + this.checkPendingInvoicesInterval
      )
        return;
      const walletStore = useWalletStore();
      const quotesToCheck = walletStore.invoiceHistory.filter(
        (q) =>
          q.status === "pending" &&
          q.amount > 0 &&
          Date.now() - Date.parse(q.date) < this.oneDay
      );
      if (quotesToCheck.length > this.maxQuotesToCheckOnStartup) {
        quotesToCheck.splice(this.maxQuotesToCheckOnStartup);
      }
      this.lastPendingInvoiceCheck = Date.now();
      console.log(`Checking ${quotesToCheck.length} quotes`);
      for (const q of quotesToCheck) {
        try {
          console.log(`Checking quote ${q.quote}`);
          if (q.type === "bolt12") {
            this.addBolt12OfferToChecker(q.quote);
          } else {
            walletStore.mintOnPaidBolt11(q.quote, false, false);
          }
        } catch (error) {
          console.error(error);
        }
      }
    },
  },
});
