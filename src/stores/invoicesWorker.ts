import { defineStore } from "pinia";
import { useWalletStore } from "./wallet";
import { useLocalStorage } from "@vueuse/core";
import { useSettingsStore } from "./settings";
import { PaymentMethod } from "src/stores/walletTypes";
import { useTokensStore } from "./tokens";
interface InvoiceQuote {
  quote: string;
  addedAt: number;
  lastChecked: number;
  checkCount: number;
}

interface ReusableMintCooldown {
  failedAt: number;
  failureCount: number;
  nextRetryAt: number;
  lastError?: string;
}

interface OutgoingPaymentCheck {
  id: string;
  type: "invoice" | "token";
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
      reusableMintCooldownBaseInterval: 1000 * 60,
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
      onchainQuotes: useLocalStorage<InvoiceQuote[]>(
        "cashu.worker.invoices.onchainQuotesQueue",
        []
      ),
      reusableMintCooldowns: useLocalStorage<
        Record<string, ReusableMintCooldown>
      >("cashu.worker.invoices.reusableMintCooldowns", {}),
      outgoingPayments: useLocalStorage<OutgoingPaymentCheck[]>(
        "cashu.worker.outgoing.queue",
        []
      ),
      lastInvoiceCheckTime: 0,
      lastOutgoingCheckTime: 0,
      maxQuotesToCheckOnStartup: 10,
      lastPendingInvoiceCheck: useLocalStorage<number>(
        "cashu.worker.invoices.lastPendingInvoiceCheck",
        0
      ),
      checkPendingInvoicesInterval: 1000 * 10, // delay between bulk invoice checks
    };
  },
  actions: {
    startInvoiceCheckerWorker(force = false) {
      if (!force && !useSettingsStore().periodicallyCheckIncomingInvoices)
        return;
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
        this.startInvoiceCheckerWorker();
        return;
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
    addOnchainQuoteToChecker(quote: string, forceStart = false) {
      const existingIndex = this.onchainQuotes.findIndex(
        (q) => q.quote === quote
      );
      if (existingIndex !== -1) {
        this.startInvoiceCheckerWorker(forceStart);
        return;
      }

      if (this.onchainQuotes.length >= this.maxLength) {
        this.onchainQuotes.shift();
      }
      this.onchainQuotes.push({
        quote,
        addedAt: Date.now(),
        lastChecked: 0,
        checkCount: 0,
      });
      this.startInvoiceCheckerWorker(forceStart);
    },
    removeOnchainQuoteFromChecker(quote: string) {
      const index = this.onchainQuotes.findIndex((q) => q.quote === quote);
      if (index !== -1) {
        this.onchainQuotes.splice(index, 1);
      }
    },
    addOutgoingInvoiceToChecker(quote: string, forceStart = false) {
      this.addOutgoingPaymentToChecker("invoice", quote, forceStart);
    },
    removeOutgoingInvoiceFromChecker(quote: string) {
      this.removeOutgoingPaymentFromChecker("invoice", quote);
    },
    addOutgoingTokenToChecker(token: string, forceStart = false) {
      this.addOutgoingPaymentToChecker("token", token, forceStart);
    },
    removeOutgoingTokenFromChecker(token: string) {
      this.removeOutgoingPaymentFromChecker("token", token);
    },
    addOutgoingPaymentToChecker(
      type: "invoice" | "token",
      id: string,
      forceStart = false
    ) {
      if (!id) return;
      const existingIndex = this.outgoingPayments.findIndex(
        (q) => q.type === type && q.id === id
      );
      if (existingIndex !== -1) {
        this.outgoingPayments.splice(existingIndex, 1);
      }

      if (this.outgoingPayments.length >= this.maxLength) {
        this.outgoingPayments.shift();
      }
      this.outgoingPayments.push({
        id,
        type,
        addedAt: Date.now(),
        lastChecked: 0,
        checkCount: 0,
      });
      this.startInvoiceCheckerWorker(forceStart);
    },
    removeOutgoingPaymentFromChecker(type: "invoice" | "token", id: string) {
      const index = this.outgoingPayments.findIndex(
        (q) => q.type === type && q.id === id
      );
      if (index !== -1) {
        this.outgoingPayments.splice(index, 1);
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
    reusableMintInCooldown(mintUrl: string, now: number) {
      const cooldown = this.reusableMintCooldowns[mintUrl];
      return Boolean(cooldown && cooldown.nextRetryAt > now);
    },
    clearReusableMintCooldown(mintUrl: string) {
      if (this.reusableMintCooldowns[mintUrl]) {
        delete this.reusableMintCooldowns[mintUrl];
      }
    },
    recordReusableMintFailure(mintUrl: string, error: any, now: number) {
      if (!this.isNetworkFailure(error)) {
        return;
      }
      const previous = this.reusableMintCooldowns[mintUrl];
      const failureCount = (previous?.failureCount ?? 0) + 1;
      const retryDelay = Math.min(
        this.reusableMintCooldownBaseInterval *
          Math.pow(2, Math.max(0, failureCount - 1)),
        this.oneHour
      );
      this.reusableMintCooldowns[mintUrl] = {
        failedAt: now,
        failureCount,
        nextRetryAt: now + retryDelay,
        lastError: this.errorMessage(error),
      };
    },
    errorMessage(error: any) {
      return String(
        error?.message || error?.cause?.message || error?.name || error || ""
      );
    },
    isNetworkFailure(error: any) {
      const message = `${this.errorMessage(error)} ${
        error?.cause ? this.errorMessage(error.cause) : ""
      }`.toLowerCase();
      return (
        message.includes("failed to fetch") ||
        message.includes("network") ||
        message.includes("connection") ||
        message.includes("websocket") ||
        message.includes("timeout") ||
        message.includes("econn") ||
        message.includes("err_connection") ||
        message.includes(" 500") ||
        message.includes(" 502") ||
        message.includes(" 503") ||
        message.includes(" 504")
      );
    },
    shouldCheckInvoice(invoice: any) {
      if (!invoice) return false;
      const now = Date.now();
      // Bolt12
      if (invoice.type === PaymentMethod.Bolt12) {
        const isOlderThanMaxAge = now - Date.parse(invoice.date) > this.maxAge;
        if (isOlderThanMaxAge) return false;

        // If fixed amount offer and fully issued, stop checking
        const quote = invoice.mintQuote as any;
        if (
          quote?.amount &&
          quote.amount > 0 &&
          quote.amount_issued >= quote.amount
        ) {
          return false;
        }
        return true;
      }
      if (invoice.type === PaymentMethod.Onchain) {
        const isOlderThanMaxAge = now - Date.parse(invoice.date) > this.maxAge;
        if (isOlderThanMaxAge) return false;
        return invoice.amount >= 0;
      }
      if (invoice.type === PaymentMethod.OnchainSubpayment) {
        return false;
      }
      // Bolt11
      return (
        invoice.status === "pending" &&
        invoice.amount > 0 &&
        now - Date.parse(invoice.date) < this.oneDay
      );
    },
    shouldCheckOutgoingInvoice(invoice: any) {
      if (!invoice) return false;
      return (
        invoice.status === "pending" &&
        invoice.amount < 0 &&
        Date.now() - Date.parse(invoice.date) < this.maxAge
      );
    },
    shouldCheckOutgoingToken(historyToken: any) {
      if (!historyToken) return false;
      return (
        historyToken.status === "pending" &&
        historyToken.amount < 0 &&
        Date.now() - Date.parse(historyToken.date) < this.maxAge
      );
    },
    async processQuotes() {
      const now = Date.now();
      const walletStore = useWalletStore();
      await this.processIncomingQueues(now, walletStore);
      await this.processOutgoingQueue(now, walletStore);
    },
    async processIncomingQueues(now: number, walletStore: any) {
      this.quotes = this.quotes.filter((q) => now - q.addedAt < this.maxAge);
      this.bolt12Quotes = this.bolt12Quotes.filter(
        (q) => now - q.addedAt < this.maxAge
      );
      this.onchainQuotes = this.onchainQuotes.filter(
        (q) => now - q.addedAt < this.maxAge
      );

      if (
        this.quotes.length === 0 &&
        this.bolt12Quotes.length === 0 &&
        this.onchainQuotes.length === 0
      )
        return;

      // Global rate limit
      if (now - this.lastInvoiceCheckTime < this.checkInterval) {
        return;
      }

      // First process one bolt11 quote if any
      for (let i = this.quotes.length - 1; i >= 0; i--) {
        const q = this.quotes[i];
        // Check if invoice is still valid/needed
        const invoice = walletStore.invoiceHistory.find(
          (inv) => inv.quote === q.quote
        );
        if (!this.shouldCheckInvoice(invoice)) {
          this.quotes.splice(i, 1);
          continue;
        }

        const dueTime = this.dueTime(q);
        if (now > dueTime) {
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
        // Check if offer is still valid/needed
        const invoice = walletStore.invoiceHistory.find(
          (inv) => inv.quote === q.quote
        );
        if (!this.shouldCheckInvoice(invoice)) {
          this.bolt12Quotes.splice(i, 1);
          continue;
        }
        if (this.reusableMintInCooldown(invoice.mint, now)) {
          continue;
        }

        const dueTime = this.dueTime(q);
        if (now > dueTime) {
          try {
            await walletStore.checkOfferAndMintBolt12(q.quote, false);
            // Keep in queue for future payments as offers are reusable, but back off checks
            q.lastChecked = now;
            q.checkCount = 0;
            this.clearReusableMintCooldown(invoice.mint);
          } catch (error) {
            q.lastChecked = now;
            q.checkCount += 1;
            this.recordReusableMintFailure(invoice.mint, error, now);
          }
          this.lastInvoiceCheckTime = now;
          break;
        }
      }

      // Then process one on-chain address if any
      for (let i = this.onchainQuotes.length - 1; i >= 0; i--) {
        const q = this.onchainQuotes[i];
        const invoice = walletStore.invoiceHistory.find(
          (inv) => inv.quote === q.quote
        );
        if (!this.shouldCheckInvoice(invoice)) {
          this.onchainQuotes.splice(i, 1);
          continue;
        }
        if (this.reusableMintInCooldown(invoice.mint, now)) {
          continue;
        }

        const dueTime = this.dueTime(q);
        if (now > dueTime) {
          try {
            await walletStore.checkOnchainAndMint(q.quote, false);
            q.lastChecked = now;
            q.checkCount = 0;
            this.clearReusableMintCooldown(invoice.mint);
          } catch (error) {
            q.lastChecked = now;
            q.checkCount += 1;
            this.recordReusableMintFailure(invoice.mint, error, now);
          }
          this.lastInvoiceCheckTime = now;
          break;
        }
      }
    },
    async processOutgoingQueue(now: number, walletStore: any) {
      if (!useSettingsStore().checkSentTokens) return;
      this.outgoingPayments = this.outgoingPayments.filter(
        (q) => now - q.addedAt < this.maxAge
      );
      if (this.outgoingPayments.length === 0) return;
      if (now - this.lastOutgoingCheckTime < this.checkInterval) return;

      const tokenStore = useTokensStore();
      for (let i = this.outgoingPayments.length - 1; i >= 0; i--) {
        const q = this.outgoingPayments[i];
        const dueTime = this.dueTime(q);
        if (now <= dueTime) continue;

        try {
          if (q.type === "invoice") {
            const invoice = walletStore.invoiceHistory.find(
              (inv: any) => inv.quote === q.id
            );
            if (!this.shouldCheckOutgoingInvoice(invoice)) {
              this.outgoingPayments.splice(i, 1);
              continue;
            }
            await walletStore.checkOutgoingInvoice(q.id, false);
            this.outgoingPayments.splice(i, 1);
          } else {
            const historyToken = tokenStore.historyTokens.find(
              (t) => t.token === q.id
            );
            if (!this.shouldCheckOutgoingToken(historyToken)) {
              this.outgoingPayments.splice(i, 1);
              continue;
            }
            const paid = await walletStore.checkTokenSpendable(
              historyToken,
              false
            );
            if (paid) {
              this.outgoingPayments.splice(i, 1);
            } else {
              q.lastChecked = now;
              q.checkCount += 1;
            }
          }
        } catch (error) {
          q.lastChecked = now;
          q.checkCount += 1;
        }
        this.lastOutgoingCheckTime = now;
        break;
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
      this.queuePendingIncomingPayments(walletStore);
      this.queuePendingOutgoingPayments(walletStore);
    },
    queuePendingIncomingPayments(walletStore: any) {
      const quotesToCheck = walletStore.invoiceHistory.filter((q: any) =>
        this.shouldCheckInvoice(q)
      );
      if (quotesToCheck.length > this.maxQuotesToCheckOnStartup) {
        quotesToCheck.splice(this.maxQuotesToCheckOnStartup);
      }
      const now = Date.now();
      this.lastPendingInvoiceCheck = now;
      for (const q of quotesToCheck) {
        try {
          if (q.type === PaymentMethod.Bolt12) {
            if (this.reusableMintInCooldown(q.mint, now)) continue;
            this.addBolt12OfferToChecker(q.quote);
          } else if (q.type === PaymentMethod.Onchain) {
            if (this.reusableMintInCooldown(q.mint, now)) continue;
            this.addOnchainQuoteToChecker(q.quote, true);
            walletStore.mintOnPaidOnchain(q.quote, false, false).catch(() => {
              // Background websocket setup is best-effort; long-polling handles retries.
            });
          } else {
            walletStore.mintOnPaidBolt11(q.quote, false, false).catch(() => {
              // Background websocket setup is best-effort; long-polling handles retries.
            });
          }
        } catch (error) {
          // Background invoice checks stay silent; manual checks surface errors.
        }
      }
    },
    queuePendingOutgoingPayments(walletStore: any) {
      if (!useSettingsStore().checkSentTokens) return;
      const tokenStore = useTokensStore();
      const outgoingInvoices = walletStore.invoiceHistory.filter((q: any) =>
        this.shouldCheckOutgoingInvoice(q)
      );
      const outgoingTokens = tokenStore.historyTokens.filter((t) =>
        this.shouldCheckOutgoingToken(t)
      );
      const maxInvoices = this.maxQuotesToCheckOnStartup;
      outgoingInvoices.slice(0, maxInvoices).forEach((q: any) => {
        this.addOutgoingInvoiceToChecker(q.quote, true);
      });
      const remaining = Math.max(
        0,
        this.maxQuotesToCheckOnStartup - maxInvoices
      );
      outgoingTokens
        .slice(0, remaining || this.maxQuotesToCheckOnStartup)
        .forEach((t) => {
          this.addOutgoingTokenToChecker(t.token, true);
        });
    },
  },
});
