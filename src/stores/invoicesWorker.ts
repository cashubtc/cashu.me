import { defineStore } from "pinia";
import { useWalletStore } from "./wallet";
import { useLocalStorage } from "@vueuse/core";
import { useSettingsStore } from "./settings";
import { PaymentMethod } from "src/stores/walletTypes";
import { useTokensStore } from "./tokens";
import { useMintsStore, type StoredMint } from "src/stores/mints";
import {
  normalizeMintQuote,
  usePaymentHistoryStore,
} from "src/stores/paymentHistory";
import { MintQuoteState } from "@cashu/cashu-ts";
import { useProofsStore } from "src/stores/proofs";
import { useUiStore } from "src/stores/ui";
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

interface BatchPathCooldown extends ReusableMintCooldown {}

interface OutgoingPaymentCheck {
  id: string;
  type: "invoice" | "token";
  addedAt: number;
  lastChecked: number;
  checkCount: number;
}

interface DueBolt11Quote {
  queueEntry: InvoiceQuote;
  invoice: any;
}

interface PaidBolt11Quote extends DueBolt11Quote {
  mintQuote: Record<string, any>;
}

class MalformedBatchQuoteResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MalformedBatchQuoteResponseError";
  }
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
      batchPathCooldowns: useLocalStorage<Record<string, BatchPathCooldown>>(
        "cashu.worker.invoices.batchPathCooldowns",
        {}
      ),
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
    addInvoiceToChecker(quote: string, forceStart = false) {
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
      this.startInvoiceCheckerWorker(forceStart);
    },
    removeInvoiceFromChecker(quote: string) {
      const index = this.quotes.findIndex((q) => q.quote === quote);
      if (index !== -1) {
        this.quotes.splice(index, 1);
      }
    },
    addBolt12OfferToChecker(quote: string, forceStart = false) {
      const existingIndex = this.bolt12Quotes.findIndex(
        (q) => q.quote === quote
      );
      if (existingIndex !== -1) {
        this.startInvoiceCheckerWorker(forceStart);
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
      this.startInvoiceCheckerWorker(forceStart);
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
    batchPathKey(mintUrl: string, unit: string, method: PaymentMethod) {
      return `${mintUrl}|${unit}|${method}`;
    },
    batchPathInCooldown(
      mintUrl: string,
      unit: string,
      method: PaymentMethod,
      now: number
    ) {
      const cooldown =
        this.batchPathCooldowns[this.batchPathKey(mintUrl, unit, method)];
      return Boolean(cooldown && cooldown.nextRetryAt > now);
    },
    mintSupportsBolt11Batch(mint: Pick<StoredMint, "info"> | undefined) {
      const nut29 = mint?.info?.nuts?.[29];
      if (!nut29) return false;
      return !nut29.methods || nut29.methods.includes(PaymentMethod.Bolt11);
    },
    bolt11BatchSizeLimit(mint: Pick<StoredMint, "info"> | undefined) {
      const maxBatchSize = mint?.info?.nuts?.[29]?.max_batch_size;
      if (
        typeof maxBatchSize !== "number" ||
        !Number.isFinite(maxBatchSize) ||
        maxBatchSize <= 0
      ) {
        return undefined;
      }
      return Math.floor(maxBatchSize);
    },
    validateBatchQuoteResponses(requestedQuotes: string[], responses: any[]) {
      if (
        !Array.isArray(responses) ||
        responses.length !== requestedQuotes.length
      ) {
        throw new MalformedBatchQuoteResponseError(
          `expected ${requestedQuotes.length} responses, received ${
            Array.isArray(responses) ? responses.length : "non-array"
          }`
        );
      }
      const seen = new Set<string>();
      responses.forEach((response, index) => {
        const quote = response?.quote;
        if (typeof quote !== "string" || quote.length === 0) {
          throw new MalformedBatchQuoteResponseError(
            `response at index ${index} is missing a quote ID`
          );
        }
        if (seen.has(quote)) {
          throw new MalformedBatchQuoteResponseError(
            `response contains duplicate quote ID ${quote}`
          );
        }
        seen.add(quote);
        if (quote !== requestedQuotes[index]) {
          throw new MalformedBatchQuoteResponseError(
            `response quote mismatch at index ${index}: expected ${requestedQuotes[index]}, received ${quote}`
          );
        }
      });
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

      // First process one Bolt11 quote or one compatible Bolt11 batch.
      await this.processBolt11Queue(now, walletStore);

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
    async processBolt11Queue(now: number, walletStore: any) {
      const dueEntries: DueBolt11Quote[] = [];
      for (let index = this.quotes.length - 1; index >= 0; index--) {
        const queueEntry = this.quotes[index];
        const invoice = walletStore.invoiceHistory.find(
          (item: any) => item.quote === queueEntry.quote
        );
        const isBolt11 =
          invoice?.type === undefined || invoice?.type === PaymentMethod.Bolt11;
        if (!isBolt11 || !this.shouldCheckInvoice(invoice)) {
          this.quotes.splice(index, 1);
          continue;
        }
        if (now > this.dueTime(queueEntry)) {
          dueEntries.push({ queueEntry, invoice });
        }
      }
      if (dueEntries.length === 0) return;

      const mintStore = useMintsStore();
      const groups = new Map<string, DueBolt11Quote[]>();
      for (const entry of dueEntries) {
        const key = `${entry.invoice.mint}|${entry.invoice.unit}`;
        const group = groups.get(key) || [];
        group.push(entry);
        groups.set(key, group);
      }

      const candidates = Array.from(groups.values()).map((entries) => {
        entries.sort(
          (left, right) =>
            (left.queueEntry.lastChecked || left.queueEntry.addedAt) -
            (right.queueEntry.lastChecked || right.queueEntry.addedAt)
        );
        const { mint: mintUrl, unit } = entries[0].invoice;
        const mint = mintStore.mints.find((item) => item.url === mintUrl);
        const canBatch =
          this.mintSupportsBolt11Batch(mint) &&
          !this.batchPathInCooldown(mintUrl, unit, PaymentMethod.Bolt11, now);
        const limit = this.bolt11BatchSizeLimit(mint);
        const attemptSize = canBatch
          ? Math.min(entries.length, limit ?? entries.length)
          : 1;
        return {
          entries,
          canBatch,
          attemptSize,
          oldest:
            entries[0].queueEntry.lastChecked || entries[0].queueEntry.addedAt,
        };
      });
      candidates.sort(
        (left, right) =>
          right.attemptSize - left.attemptSize || left.oldest - right.oldest
      );
      const selected = candidates[0];
      const attempted = selected.entries.slice(0, selected.attemptSize);

      if (!selected.canBatch) {
        await this.processSingleBolt11Entry(attempted[0], now, walletStore);
        return;
      }

      const { mint: mintUrl, unit } = attempted[0].invoice;
      console.log("Bolt11 batch quote check", {
        mint: mintUrl,
        unit,
        attempted: attempted.length,
      });
      try {
        const mintWallet = await walletStore.mintWallet(mintUrl, unit);
        const requestedQuotes = attempted.map(
          (entry) => entry.queueEntry.quote
        );
        const responses = await mintWallet.checkMintQuoteBatchBolt11(
          requestedQuotes
        );
        this.validateBatchQuoteResponses(requestedQuotes, responses);
        const paymentHistoryStore = usePaymentHistoryStore();
        const paidEntries: PaidBolt11Quote[] = [];
        for (let index = 0; index < attempted.length; index++) {
          const entry = attempted[index];
          const response = normalizeMintQuote(
            responses[index],
            PaymentMethod.Bolt11
          );
          entry.invoice.mintQuote = response;
          await paymentHistoryStore.upsertMintQuote(
            response,
            PaymentMethod.Bolt11
          );
          if (response.state === MintQuoteState.UNPAID) {
            entry.queueEntry.lastChecked = now;
            entry.queueEntry.checkCount += 1;
          } else if (response.state === MintQuoteState.ISSUED) {
            await walletStore.setInvoicePaid(entry.queueEntry.quote, {
              mintQuote: response,
            });
            this.removeInvoiceFromChecker(entry.queueEntry.quote);
          } else if (response.state === MintQuoteState.PAID) {
            paidEntries.push({ ...entry, mintQuote: response });
          }
        }
        walletStore.syncPaymentHistoryCache?.();
        if (paidEntries.length > 0) {
          await this.mintPaidBolt11Batch(paidEntries, mintWallet, walletStore);
        }
        console.log("Bolt11 batch quote check complete", {
          mint: mintUrl,
          attempted: attempted.length,
          paid: paidEntries.length,
          minted: paidEntries.length,
        });
      } catch (error) {
        for (const entry of attempted) {
          entry.queueEntry.lastChecked = now;
          entry.queueEntry.checkCount += 1;
        }
        console.warn("Bolt11 batch quote check failed", {
          mint: mintUrl,
          reason: this.errorMessage(error),
        });
      }
      this.lastInvoiceCheckTime = now;
    },
    async mintPaidBolt11Batch(
      paidEntries: PaidBolt11Quote[],
      mintWallet: any,
      walletStore: any
    ) {
      const { mint: mintUrl, unit } = paidEntries[0].invoice;
      const mintStore = useMintsStore();
      const mint = mintStore.mints.find((item) => item.url === mintUrl);
      if (!mint) throw new Error("mint not found");
      const keysetId = walletStore.getKeyset(mintUrl, unit);
      const uiStore = useUiStore();
      const proofsStore = useProofsStore();
      let proofs: any[];

      await uiStore.lockMutex();
      try {
        proofs = await walletStore.retryOnceOnSignedOutputs(
          keysetId,
          async () => {
            const preview = await mintWallet.prepareBatchMint(
              PaymentMethod.Bolt11,
              paidEntries.map((entry) => ({
                amount: entry.mintQuote.amount,
                quote: entry.mintQuote,
              })),
              {
                keysetId,
                proofsWeHave: mintStore.mintUnitProofs(mint, unit),
              }
            );
            return await mintWallet.completeBatchMint(preview);
          },
          false
        );
      } finally {
        uiStore.unlockMutex();
      }

      await proofsStore.addProofs(proofs);
      for (const entry of paidEntries) {
        await walletStore.setInvoicePaid(entry.queueEntry.quote, {
          mintQuote: entry.mintQuote,
        });
        this.removeInvoiceFromChecker(entry.queueEntry.quote);
      }
    },
    async processSingleBolt11Entry(
      entry: DueBolt11Quote,
      now: number,
      walletStore: any
    ) {
      try {
        await walletStore.checkInvoiceBolt11(entry.queueEntry.quote, false);
        this.removeInvoiceFromChecker(entry.queueEntry.quote);
      } catch (error) {
        entry.queueEntry.lastChecked = now;
        entry.queueEntry.checkCount += 1;
      }
      this.lastInvoiceCheckTime = now;
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
            walletStore.mintOnPaidBolt12(q.quote, false, false).catch(() => {
              // Background websocket setup is best-effort; long-polling handles retries.
            });
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
