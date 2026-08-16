import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import {
  Amount,
  MintInfo,
  MintQuoteState,
  setGlobalRequestOptions,
} from "@cashu/cashu-ts";
import * as nobleSecp256k1 from "@noble/secp256k1";
import { bytesToHex } from "@noble/hashes/utils";
import { useWalletStore } from "src/stores/wallet";
import { useSettingsStore } from "src/stores/settings";
import { PaymentMethod } from "src/stores/walletTypes";
import { useTokensStore } from "src/stores/tokens";
import { useMintsStore, type StoredMint } from "src/stores/mints";
import {
  normalizeMintQuote,
  usePaymentHistoryStore,
} from "src/stores/paymentHistory";
import { useProofsStore } from "src/stores/proofs";
import { useUiStore } from "src/stores/ui";

const MINT_REQUEST_TIMEOUT = 20_000;

// Every lane must eventually settle. This aborts the underlying fetch instead
// of merely abandoning a promise that could complete later.
setGlobalRequestOptions({ requestTimeout: MINT_REQUEST_TIMEOUT });

interface InvoiceQuote {
  quote: string;
  addedAt: number;
  lastChecked: number;
  checkCount: number;
  usesBatchPath?: boolean;
}

interface MintCooldown {
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

interface DueBolt11Quote {
  queueEntry: InvoiceQuote;
  invoice: any;
}

interface PaidBolt11Quote extends DueBolt11Quote {
  mintQuote: Record<string, any>;
}

type MintJob =
  | {
      kind: "bolt11-batch";
      mintUrl: string;
      unit: string;
      entries: DueBolt11Quote[];
    }
  | {
      kind: "bolt11-single";
      mintUrl: string;
      entry: DueBolt11Quote;
    }
  | {
      kind: "bolt12" | "onchain";
      mintUrl: string;
      entry: InvoiceQuote;
      invoice: any;
    }
  | {
      kind: "outgoing-invoice";
      mintUrl: string;
      entry: OutgoingPaymentCheck;
      invoice: any;
    }
  | {
      kind: "outgoing-token";
      mintUrl: string;
      entry: OutgoingPaymentCheck;
      historyToken: any;
    };

type WorkScope = "all" | "incoming" | "outgoing";

class MalformedBatchQuoteResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MalformedBatchQuoteResponseError";
  }
}

function queueAge(entry: { lastChecked: number; addedAt: number }) {
  return entry.lastChecked || entry.addedAt;
}

function amountToNumber(value: any) {
  if (value === undefined || value === null) return 0;
  return Amount.from(value).toNumber();
}

export const useInvoicesWorkerStore = defineStore("invoicesWorker", {
  state: () => ({
    // Requests are rate-limited independently for every mint URL.
    checkInterval: 5_000,
    workerTickInterval: 1_000,
    mintRequestTimeout: MINT_REQUEST_TIMEOUT,
    offlineRetryBaseInterval: 60_000,
    maxInterval: 24 * 60 * 60 * 1_000,
    keepIntervalConstantForNChecks: 5,
    maxLength: 50,
    maxAge: 14 * 24 * 60 * 60 * 1_000,
    oneHour: 60 * 60 * 1_000,

    invoiceCheckListener: null as NodeJS.Timeout | null,
    invoiceWorkerRunning: false,

    // Lane state is ephemeral so a restart immediately retries pending work.
    mintLaneInFlight: {} as Record<string, boolean>,
    mintLastRequestAt: {} as Record<string, number>,

    quotes: useLocalStorage<InvoiceQuote[]>(
      "cashu.worker.invoices.quotesQueue",
      []
    ),
    bolt12Quotes: useLocalStorage<InvoiceQuote[]>(
      "cashu.worker.invoices.bolt12QuotesQueue",
      []
    ),
    onchainQuotes: useLocalStorage<InvoiceQuote[]>(
      "cashu.worker.invoices.onchainQuotesQueue",
      []
    ),
    outgoingPayments: useLocalStorage<OutgoingPaymentCheck[]>(
      "cashu.worker.outgoing.queue",
      []
    ),

    // Keep the existing key so offline-mint backoff survives upgrades.
    reusableMintCooldowns: useLocalStorage<Record<string, MintCooldown>>(
      "cashu.worker.invoices.reusableMintCooldowns",
      {}
    ),

    maxSingleBolt11QuotesToCheckOnStartup: 10,
    maxOutgoingPaymentsToCheckOnStartup: 10,
    lastPendingInvoiceCheck: useLocalStorage<number>(
      "cashu.worker.invoices.lastPendingInvoiceCheck",
      0
    ),
    checkPendingInvoicesInterval: 10_000,
  }),

  actions: {
    startInvoiceCheckerWorker(force = false) {
      if (!force && !useSettingsStore().periodicallyCheckIncomingInvoices) {
        return;
      }
      if (this.invoiceCheckListener) return;

      this.invoiceWorkerRunning = true;
      this.invoiceCheckListener = setInterval(() => {
        void this.processQuotes().catch((error) => {
          console.error("Invoice worker dispatch failed", error);
        });
      }, this.workerTickInterval);
    },

    stopInvoiceCheckerWorker() {
      if (this.invoiceCheckListener) {
        clearInterval(this.invoiceCheckListener);
        this.invoiceCheckListener = null;
      }
      this.invoiceWorkerRunning = false;
    },

    addInvoiceToChecker(quote: string, forceStart = false) {
      this.addBolt11QuoteToChecker(quote, forceStart, false);
    },

    addBatchInvoiceToChecker(quote: string, forceStart = false) {
      this.addBolt11QuoteToChecker(quote, forceStart, true);
    },

    addBolt11QuoteToChecker(
      quote: string,
      forceStart: boolean,
      usesBatchPath: boolean
    ) {
      if (!quote) return;
      const existing = this.quotes.find((entry) => entry.quote === quote);
      if (existing) {
        if (usesBatchPath) {
          existing.usesBatchPath = true;
          existing.addedAt = Date.now();
          existing.lastChecked = 0;
          existing.checkCount = 0;
        }
        this.startInvoiceCheckerWorker(forceStart);
        return;
      }

      if (!usesBatchPath) {
        const singleEntries = this.quotes.filter(
          (entry) => !entry.usesBatchPath
        );
        if (singleEntries.length >= this.maxLength) {
          const oldest = singleEntries.reduce((left, right) =>
            left.addedAt <= right.addedAt ? left : right
          );
          this.removeInvoiceFromChecker(oldest.quote);
        }
      }

      this.quotes.push({
        quote,
        addedAt: Date.now(),
        lastChecked: 0,
        checkCount: 0,
        ...(usesBatchPath ? { usesBatchPath: true } : {}),
      });
      this.startInvoiceCheckerWorker(forceStart);
    },

    removeInvoiceFromChecker(quote: string) {
      const index = this.quotes.findIndex((entry) => entry.quote === quote);
      if (index !== -1) this.quotes.splice(index, 1);
    },

    addBolt12OfferToChecker(quote: string, forceStart = false) {
      this.addReusableQuoteToChecker(this.bolt12Quotes, quote, forceStart);
    },

    removeBolt12OfferFromChecker(quote: string) {
      const index = this.bolt12Quotes.findIndex(
        (entry) => entry.quote === quote
      );
      if (index !== -1) this.bolt12Quotes.splice(index, 1);
    },

    addOnchainQuoteToChecker(quote: string, forceStart = false) {
      this.addReusableQuoteToChecker(this.onchainQuotes, quote, forceStart);
    },

    removeOnchainQuoteFromChecker(quote: string) {
      const index = this.onchainQuotes.findIndex(
        (entry) => entry.quote === quote
      );
      if (index !== -1) this.onchainQuotes.splice(index, 1);
    },

    addReusableQuoteToChecker(
      queue: InvoiceQuote[],
      quote: string,
      forceStart: boolean
    ) {
      if (!quote) return;
      if (!queue.some((entry) => entry.quote === quote)) {
        if (queue.length >= this.maxLength) queue.shift();
        queue.push({
          quote,
          addedAt: Date.now(),
          lastChecked: 0,
          checkCount: 0,
        });
      }
      this.startInvoiceCheckerWorker(forceStart);
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
      const exists = this.outgoingPayments.some(
        (entry) => entry.type === type && entry.id === id
      );
      if (!exists) {
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
      }
      this.startInvoiceCheckerWorker(forceStart);
    },

    removeOutgoingPaymentFromChecker(type: "invoice" | "token", id: string) {
      const index = this.outgoingPayments.findIndex(
        (entry) => entry.type === type && entry.id === id
      );
      if (index !== -1) this.outgoingPayments.splice(index, 1);
    },

    dueTime(entry: { lastChecked: number; checkCount: number }) {
      if (entry.checkCount <= this.keepIntervalConstantForNChecks) {
        return entry.lastChecked + this.checkInterval;
      }
      return (
        entry.lastChecked +
        Math.min(
          this.checkInterval *
            2 ** (entry.checkCount - this.keepIntervalConstantForNChecks),
          this.maxInterval
        )
      );
    },

    isDue(entry: { lastChecked: number; checkCount: number }, now: number) {
      return now >= this.dueTime(entry);
    },

    mintSupportsBolt11Batch(mint: Pick<StoredMint, "info"> | undefined) {
      const nut29 = mint?.info?.nuts?.[29];
      if (!nut29) return false;
      return !nut29.methods || nut29.methods.includes(PaymentMethod.Bolt11);
    },

    bolt11BatchSizeLimit(mint: Pick<StoredMint, "info"> | undefined) {
      if (!mint?.info) return undefined;
      try {
        const limit = new MintInfo(mint.info).isSupported(29).params
          ?.max_batch_size;
        return typeof limit === "number" && Number.isFinite(limit) && limit > 0
          ? Math.floor(limit)
          : undefined;
      } catch {
        return undefined;
      }
    },

    shouldCheckInvoice(invoice: any) {
      if (!invoice) return false;
      const age = Date.now() - Date.parse(invoice.date);
      if (invoice.type === PaymentMethod.Bolt12) {
        if (age > this.maxAge) return false;
        const quote = invoice.mintQuote as any;
        return !(quote?.amount > 0 && quote.amount_issued >= quote.amount);
      }
      if (invoice.type === PaymentMethod.Onchain) {
        return age <= this.maxAge && invoice.amount >= 0;
      }
      if (invoice.type === PaymentMethod.OnchainSubpayment) return false;
      return invoice.status === "pending" && invoice.amount > 0;
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

    pruneQueues(now: number, walletStore: any) {
      const invoices = walletStore.invoiceHistory;
      const tokens = useTokensStore().historyTokens;

      this.quotes = this.quotes.filter((entry) => {
        if (now - entry.addedAt >= this.maxAge) return false;
        const invoice = invoices.find(
          (item: any) => item.quote === entry.quote
        );
        const isBolt11 =
          invoice?.type === undefined || invoice?.type === PaymentMethod.Bolt11;
        return isBolt11 && this.shouldCheckInvoice(invoice);
      });
      this.bolt12Quotes = this.bolt12Quotes.filter((entry) => {
        if (now - entry.addedAt >= this.maxAge) return false;
        const invoice = invoices.find(
          (item: any) => item.quote === entry.quote
        );
        return (
          invoice?.type === PaymentMethod.Bolt12 &&
          this.shouldCheckInvoice(invoice)
        );
      });
      this.onchainQuotes = this.onchainQuotes.filter((entry) => {
        if (now - entry.addedAt >= this.maxAge) return false;
        const invoice = invoices.find(
          (item: any) => item.quote === entry.quote
        );
        return (
          invoice?.type === PaymentMethod.Onchain &&
          this.shouldCheckInvoice(invoice)
        );
      });
      this.outgoingPayments = this.outgoingPayments.filter((entry) => {
        if (now - entry.addedAt >= this.maxAge) return false;
        if (entry.type === "invoice") {
          return this.shouldCheckOutgoingInvoice(
            invoices.find((item: any) => item.quote === entry.id)
          );
        }
        return this.shouldCheckOutgoingToken(
          tokens.find((item) => item.token === entry.id)
        );
      });
    },

    mintUrlsWithWork(walletStore: any, scope: WorkScope) {
      const mintUrls = new Set<string>();
      const invoices = walletStore.invoiceHistory;

      if (scope !== "outgoing") {
        for (const entry of [
          ...this.quotes,
          ...this.bolt12Quotes,
          ...this.onchainQuotes,
        ]) {
          const mintUrl = invoices.find(
            (invoice: any) => invoice.quote === entry.quote
          )?.mint;
          if (mintUrl) mintUrls.add(mintUrl);
        }
      }

      if (scope !== "incoming") {
        const tokens = useTokensStore().historyTokens;
        for (const entry of this.outgoingPayments) {
          const mintUrl =
            entry.type === "invoice"
              ? invoices.find((invoice: any) => invoice.quote === entry.id)
                  ?.mint
              : tokens.find((token) => token.token === entry.id)?.mint;
          if (mintUrl) mintUrls.add(mintUrl);
        }
      }

      return Array.from(mintUrls);
    },

    mintLaneReady(mintUrl: string, now: number) {
      if (this.mintLaneInFlight[mintUrl]) return false;
      const lastRequestAt = this.mintLastRequestAt[mintUrl] ?? 0;
      const cooldownUntil =
        this.reusableMintCooldowns[mintUrl]?.nextRetryAt ?? 0;
      return now >= Math.max(lastRequestAt + this.checkInterval, cooldownUntil);
    },

    async processQuotes(walletStore?: any, prioritizeBolt11Batch = false) {
      const activeWalletStore = walletStore ?? useWalletStore();
      return await this.dispatchMintLanes(
        activeWalletStore,
        "all",
        prioritizeBolt11Batch
      );
    },

    // Retained as callable helpers for diagnostics and tests.
    async processIncomingQueues(_now: number, walletStore: any) {
      return await this.dispatchMintLanes(walletStore, "incoming", false);
    },

    async processOutgoingQueue(_now: number, walletStore: any) {
      return await this.dispatchMintLanes(walletStore, "outgoing", false);
    },

    async dispatchMintLanes(
      walletStore: any,
      scope: WorkScope,
      prioritizeBolt11Batch: boolean
    ) {
      const now = Date.now();
      this.pruneQueues(now, walletStore);
      const lanes = this.mintUrlsWithWork(walletStore, scope).map((mintUrl) =>
        this.processMintLane(mintUrl, walletStore, scope, prioritizeBolt11Batch)
      );
      await Promise.allSettled(lanes);
    },

    async processMintLane(
      mintUrl: string,
      walletStore: any,
      scope: WorkScope,
      prioritizeBolt11Batch: boolean
    ) {
      const now = Date.now();
      if (!this.mintLaneReady(mintUrl, now)) return;

      const job = this.nextMintJob(
        mintUrl,
        walletStore,
        now,
        scope,
        prioritizeBolt11Batch
      );
      if (!job) return;

      this.mintLaneInFlight[mintUrl] = true;
      this.mintLastRequestAt[mintUrl] = now;
      try {
        await this.runMintJob(job, walletStore, now);
        this.clearMintCooldown(mintUrl);
      } catch (error) {
        this.markJobAttempt(job, now);
        if (
          job.kind === "bolt11-batch" ||
          this.isNetworkOrRateLimitFailure(error)
        ) {
          this.recordMintFailure(mintUrl, error, Date.now());
        } else {
          this.clearMintCooldown(mintUrl);
        }
      } finally {
        delete this.mintLaneInFlight[mintUrl];
      }
    },

    nextMintJob(
      mintUrl: string,
      walletStore: any,
      now: number,
      scope: WorkScope,
      prioritizeBolt11Batch: boolean
    ): MintJob | undefined {
      const candidates: Array<{
        oldest: number;
        batchPriority: number;
        job: MintJob;
      }> = [];
      const invoices = walletStore.invoiceHistory;

      if (scope !== "outgoing") {
        const bolt11Entries = this.quotes
          .map((queueEntry) => ({
            queueEntry,
            invoice: invoices.find(
              (invoice: any) => invoice.quote === queueEntry.quote
            ),
          }))
          .filter(
            (entry) =>
              entry.invoice?.mint === mintUrl &&
              this.isDue(entry.queueEntry, now)
          ) as DueBolt11Quote[];

        const mint = useMintsStore().mints.find(
          (storedMint) => storedMint.url === mintUrl
        );
        const canBatch = this.mintSupportsBolt11Batch(mint);
        const groups = new Map<string, DueBolt11Quote[]>();
        for (const entry of bolt11Entries) {
          const group = groups.get(entry.invoice.unit) ?? [];
          group.push(entry);
          groups.set(entry.invoice.unit, group);
        }
        for (const [unit, entries] of groups) {
          entries.sort(
            (left, right) =>
              queueAge(left.queueEntry) - queueAge(right.queueEntry)
          );
          const job: MintJob = canBatch
            ? {
                kind: "bolt11-batch",
                mintUrl,
                unit,
                entries: entries.slice(
                  0,
                  this.bolt11BatchSizeLimit(mint) ?? entries.length
                ),
              }
            : { kind: "bolt11-single", mintUrl, entry: entries[0] };
          candidates.push({
            oldest: queueAge(entries[0].queueEntry),
            batchPriority:
              prioritizeBolt11Batch && job.kind === "bolt11-batch" ? 0 : 1,
            job,
          });
        }

        for (const entry of this.bolt12Quotes) {
          if (!this.isDue(entry, now)) continue;
          const invoice = invoices.find(
            (item: any) => item.quote === entry.quote
          );
          if (invoice?.mint !== mintUrl) continue;
          candidates.push({
            oldest: queueAge(entry),
            batchPriority: 1,
            job: { kind: "bolt12", mintUrl, entry, invoice },
          });
        }
        for (const entry of this.onchainQuotes) {
          if (!this.isDue(entry, now)) continue;
          const invoice = invoices.find(
            (item: any) => item.quote === entry.quote
          );
          if (invoice?.mint !== mintUrl) continue;
          candidates.push({
            oldest: queueAge(entry),
            batchPriority: 1,
            job: { kind: "onchain", mintUrl, entry, invoice },
          });
        }
      }

      if (scope !== "incoming") {
        const tokens = useTokensStore().historyTokens;
        for (const entry of this.outgoingPayments) {
          if (!this.isDue(entry, now)) continue;
          if (entry.type === "invoice") {
            const invoice = invoices.find(
              (item: any) => item.quote === entry.id
            );
            if (invoice?.mint !== mintUrl) continue;
            candidates.push({
              oldest: queueAge(entry),
              batchPriority: 1,
              job: { kind: "outgoing-invoice", mintUrl, entry, invoice },
            });
          } else {
            const historyToken = tokens.find((item) => item.token === entry.id);
            if (historyToken?.mint !== mintUrl) continue;
            candidates.push({
              oldest: queueAge(entry),
              batchPriority: 1,
              job: { kind: "outgoing-token", mintUrl, entry, historyToken },
            });
          }
        }
      }

      candidates.sort(
        (left, right) =>
          left.batchPriority - right.batchPriority || left.oldest - right.oldest
      );
      return candidates[0]?.job;
    },

    async runMintJob(job: MintJob, walletStore: any, now: number) {
      switch (job.kind) {
        case "bolt11-batch":
          await this.runBolt11Batch(job, walletStore, now);
          return;
        case "bolt11-single":
          await walletStore.checkInvoiceBolt11(
            job.entry.queueEntry.quote,
            false
          );
          this.removeInvoiceFromChecker(job.entry.queueEntry.quote);
          return;
        case "bolt12":
        case "onchain":
          await this.runReusableMintJob(job, walletStore, now);
          return;
        case "outgoing-invoice":
          await walletStore.checkOutgoingInvoice(job.entry.id, false);
          this.removeOutgoingInvoiceFromChecker(job.entry.id);
          return;
        case "outgoing-token": {
          const spent = await walletStore.checkTokenSpendable(
            job.historyToken,
            false
          );
          if (spent) {
            this.removeOutgoingTokenFromChecker(job.entry.id);
          } else {
            this.markEntryAttempt(job.entry, now);
          }
        }
      }
    },

    async runReusableMintJob(
      job: Extract<MintJob, { kind: "bolt12" | "onchain" }>,
      walletStore: any,
      now: number
    ) {
      // Probe outside the wallet mutex so an offline reusable mint cannot hold
      // up minting work for another mint.
      const mintWallet = await walletStore.mintWallet(
        job.invoice.mint,
        job.invoice.unit
      );
      const quote =
        job.kind === "bolt12"
          ? await mintWallet.checkMintQuoteBolt12(job.entry.quote)
          : await mintWallet.checkMintQuoteOnchain(job.entry.quote);
      const delta =
        amountToNumber(quote.amount_paid) - amountToNumber(quote.amount_issued);

      if (delta <= 0) {
        this.markEntryAttempt(job.entry, now);
        return;
      }

      if (job.kind === "bolt12") {
        await walletStore.checkOfferAndMintBolt12(job.entry.quote, false);
      } else {
        await walletStore.checkOnchainAndMint(job.entry.quote, false);
      }
      job.entry.lastChecked = now;
      job.entry.checkCount = 0;
    },

    async runBolt11Batch(
      job: Extract<MintJob, { kind: "bolt11-batch" }>,
      walletStore: any,
      now: number
    ) {
      const mintWallet = await walletStore.mintWallet(job.mintUrl, job.unit);
      const requestedQuotes = job.entries.map(
        (entry) => entry.queueEntry.quote
      );
      const responses = await mintWallet.checkMintQuoteBatchBolt11(
        requestedQuotes
      );
      this.validateBatchQuoteResponses(requestedQuotes, responses);

      const paymentHistoryStore = usePaymentHistoryStore();
      const paidEntries: PaidBolt11Quote[] = [];
      for (let index = 0; index < job.entries.length; index++) {
        const entry = job.entries[index];
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
          this.markEntryAttempt(entry.queueEntry, now);
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

      if (paidEntries.length === 0) return;
      const { mintable, missingKey, signingKeys } =
        this.partitionLockedPaidQuotes(paidEntries);
      for (const entry of missingKey) {
        this.markEntryAttempt(entry.queueEntry, now);
      }
      if (mintable.length === 0) return;

      await this.mintPaidBolt11Batch(
        mintable,
        signingKeys,
        mintWallet,
        walletStore,
        now
      );
    },

    async mintPaidBolt11Batch(
      paidEntries: PaidBolt11Quote[],
      signingKeys: string[],
      mintWallet: any,
      walletStore: any,
      now: number
    ) {
      const { mint: mintUrl, unit } = paidEntries[0].invoice;
      const mintStore = useMintsStore();
      const mint = mintStore.mints.find((item) => item.url === mintUrl);
      if (!mint) throw new Error("mint not found");

      const keysetId = walletStore.getKeyset(mintUrl, unit);
      const uiStore = useUiStore();
      let proofs: any[] = [];
      const entriesToMint: PaidBolt11Quote[] = [];
      const issuedEntries: PaidBolt11Quote[] = [];
      const unpaidEntries: PaidBolt11Quote[] = [];
      const latestQuotes: Array<{
        entry: PaidBolt11Quote;
        quote: Record<string, any>;
      }> = [];
      await uiStore.lockMutex();
      try {
        // A WebSocket callback may have minted after the first batch check.
        // Revalidate under the same mutex used by the single-quote mint path.
        const quoteIds = paidEntries.map((entry) => entry.queueEntry.quote);
        const latestResponses = await mintWallet.checkMintQuoteBatchBolt11(
          quoteIds
        );
        this.validateBatchQuoteResponses(quoteIds, latestResponses);
        for (let index = 0; index < paidEntries.length; index++) {
          const entry = paidEntries[index];
          const quote = normalizeMintQuote(
            latestResponses[index],
            PaymentMethod.Bolt11
          );
          latestQuotes.push({ entry, quote });
          entry.invoice.mintQuote = quote;
          entry.mintQuote = quote;
          if (quote.state === MintQuoteState.PAID) {
            entriesToMint.push(entry);
          } else if (quote.state === MintQuoteState.ISSUED) {
            issuedEntries.push(entry);
          } else {
            unpaidEntries.push(entry);
          }
        }

        if (entriesToMint.length > 0) {
          proofs = await walletStore.retryOnceOnSignedOutputs(
            keysetId,
            async () => {
              const preview = await mintWallet.prepareBatchMint(
                PaymentMethod.Bolt11,
                entriesToMint.map((entry) => ({
                  amount: entry.mintQuote.amount,
                  quote: entry.mintQuote,
                })),
                {
                  keysetId,
                  proofsWeHave: mintStore.mintUnitProofs(mint, unit),
                  ...(signingKeys.length > 0 ? { privkey: signingKeys } : {}),
                }
              );
              return await mintWallet.completeBatchMint(preview);
            },
            false
          );
        }
      } finally {
        uiStore.unlockMutex();
      }

      const paymentHistoryStore = usePaymentHistoryStore();
      for (const { quote } of latestQuotes) {
        await paymentHistoryStore.upsertMintQuote(quote, PaymentMethod.Bolt11);
      }
      walletStore.syncPaymentHistoryCache?.();

      for (const entry of issuedEntries) {
        await walletStore.setInvoicePaid(entry.queueEntry.quote, {
          mintQuote: entry.mintQuote,
        });
        this.removeInvoiceFromChecker(entry.queueEntry.quote);
      }
      for (const entry of unpaidEntries) {
        this.markEntryAttempt(entry.queueEntry, now);
      }
      if (proofs.length > 0) {
        await useProofsStore().addProofs(proofs);
      }
      for (const entry of entriesToMint) {
        await walletStore.setInvoicePaid(entry.queueEntry.quote, {
          mintQuote: entry.mintQuote,
        });
        this.removeInvoiceFromChecker(entry.queueEntry.quote);
      }
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

    partitionLockedPaidQuotes(paidEntries: PaidBolt11Quote[]) {
      const availableKeys = Array.from(
        new Set(
          paidEntries
            .map((entry) => entry.invoice.privKey)
            .filter((privKey): privKey is string => Boolean(privKey))
        )
      ).flatMap((privKey) => {
        try {
          return [
            {
              privKey,
              pubkey: bytesToHex(
                nobleSecp256k1.getPublicKey(privKey, true)
              ).toLowerCase(),
            },
          ];
        } catch {
          return [];
        }
      });

      const mintable: PaidBolt11Quote[] = [];
      const missingKey: PaidBolt11Quote[] = [];
      const signingKeys = new Set<string>();
      for (const entry of paidEntries) {
        const quotePubkey = entry.mintQuote.pubkey;
        if (!quotePubkey) {
          mintable.push(entry);
          continue;
        }
        const matchingKey = availableKeys.find(
          ({ pubkey }) => pubkey === String(quotePubkey).toLowerCase()
        );
        if (!matchingKey) {
          missingKey.push(entry);
          continue;
        }
        signingKeys.add(matchingKey.privKey);
        mintable.push(entry);
      }
      return { mintable, missingKey, signingKeys: Array.from(signingKeys) };
    },

    markEntryAttempt(
      entry: { lastChecked: number; checkCount: number },
      now: number
    ) {
      if (entry.lastChecked === now) return;
      entry.lastChecked = now;
      entry.checkCount += 1;
    },

    markJobAttempt(job: MintJob, now: number) {
      if (job.kind === "bolt11-batch") {
        for (const { queueEntry } of job.entries) {
          if (this.quotes.includes(queueEntry)) {
            this.markEntryAttempt(queueEntry, now);
          }
        }
        return;
      }
      if (job.kind === "bolt11-single") {
        if (this.quotes.includes(job.entry.queueEntry)) {
          this.markEntryAttempt(job.entry.queueEntry, now);
        }
        return;
      }
      this.markEntryAttempt(job.entry, now);
    },

    clearMintCooldown(mintUrl: string) {
      if (this.reusableMintCooldowns[mintUrl]) {
        delete this.reusableMintCooldowns[mintUrl];
      }
    },

    recordMintFailure(mintUrl: string, error: any, now: number) {
      const previous = this.reusableMintCooldowns[mintUrl];
      const failureCount = (previous?.failureCount ?? 0) + 1;
      const retryDelay = Math.min(
        this.offlineRetryBaseInterval * 2 ** Math.max(0, failureCount - 1),
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
        message.includes("timed out") ||
        message.includes("econn") ||
        message.includes("err_connection")
      );
    },

    isNetworkOrRateLimitFailure(error: any) {
      const status = Number(
        error?.status ??
          error?.statusCode ??
          error?.response?.status ??
          error?.cause?.status ??
          error?.cause?.response?.status
      );
      const message = `${this.errorMessage(error)} ${
        error?.cause ? this.errorMessage(error.cause) : ""
      }`.toLowerCase();
      return (
        this.isNetworkFailure(error) ||
        status === 429 ||
        status >= 500 ||
        message.includes("429") ||
        message.includes("rate limit") ||
        message.includes("too many requests")
      );
    },

    async checkPendingInvoices(walletStore?: any) {
      if (!useSettingsStore().checkInvoicesOnStartup) return;

      const activeWalletStore = walletStore ?? useWalletStore();
      this.queuePendingIncomingPayments(activeWalletStore);
      this.queuePendingOutgoingPayments(activeWalletStore);

      // Every mint gets an immediate startup lane. A slow lane cannot prevent
      // the other mint lanes from starting.
      await this.processQuotes(activeWalletStore, true);
    },

    queuePendingIncomingPayments(walletStore: any) {
      const settingsStore = useSettingsStore();
      const mintStore = useMintsStore();
      const periodicChecks = settingsStore.periodicallyCheckIncomingInvoices;
      const pending = walletStore.invoiceHistory.filter((invoice: any) =>
        this.shouldCheckInvoice(invoice)
      );
      let singleBolt11QuotesQueued = 0;
      this.lastPendingInvoiceCheck = Date.now();

      for (const invoice of pending) {
        try {
          if (invoice.type === PaymentMethod.Bolt12) {
            if (periodicChecks) {
              this.addBolt12OfferToChecker(invoice.quote);
            }
            void walletStore
              .mintOnPaidBolt12(invoice.quote, false, false)
              .catch(() => {});
            continue;
          }
          if (invoice.type === PaymentMethod.Onchain) {
            if (periodicChecks) {
              this.addOnchainQuoteToChecker(invoice.quote);
            }
            void walletStore
              .mintOnPaidOnchain(invoice.quote, false, false)
              .catch(() => {});
            continue;
          }

          const mint = mintStore.mints.find(
            (item) => item.url === invoice.mint
          );
          if (this.mintSupportsBolt11Batch(mint)) {
            this.clearMintCooldown(invoice.mint);
            this.addBatchInvoiceToChecker(invoice.quote);
            continue;
          }
          if (
            singleBolt11QuotesQueued >=
            this.maxSingleBolt11QuotesToCheckOnStartup
          ) {
            continue;
          }

          singleBolt11QuotesQueued += 1;
          if (periodicChecks) {
            this.addInvoiceToChecker(invoice.quote);
          }
          void walletStore
            .mintOnPaidBolt11(invoice.quote, false, false)
            .catch(() => {});
        } catch {
          // Startup reconciliation is best-effort and remains silent.
        }
      }
    },

    queuePendingOutgoingPayments(walletStore: any) {
      if (!useSettingsStore().checkSentTokens) return;
      const tokenStore = useTokensStore();
      const pending = [
        ...walletStore.invoiceHistory
          .filter((invoice: any) => this.shouldCheckOutgoingInvoice(invoice))
          .map((invoice: any) => ({
            type: "invoice" as const,
            id: invoice.quote,
          })),
        ...tokenStore.historyTokens
          .filter((historyToken) => this.shouldCheckOutgoingToken(historyToken))
          .map((historyToken) => ({
            type: "token" as const,
            id: historyToken.token,
          })),
      ].slice(0, this.maxOutgoingPaymentsToCheckOnStartup);

      for (const entry of pending) {
        this.addOutgoingPaymentToChecker(entry.type, entry.id, true);
      }
    },
  },
});
