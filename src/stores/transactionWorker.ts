import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { Amount, MintInfo, MintQuoteState } from "@cashu/cashu-ts";
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
import { currentDateStr } from "src/js/utils";
import { createSubpaymentHistoryQuote } from "src/js/invoice-history";

type IncomingPaymentMethod =
  | PaymentMethod.Bolt11
  | PaymentMethod.Bolt12
  | PaymentMethod.Onchain;

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

interface DueMintQuote {
  queueEntry: InvoiceQuote;
  invoice: any;
}

interface MintableQuote extends DueMintQuote {
  mintQuote: Record<string, any>;
  mintAmount: number;
}

type MintJob =
  | {
      kind: "incoming-batch";
      mintUrl: string;
      unit: string;
      method: IncomingPaymentMethod;
      entries: DueMintQuote[];
    }
  | {
      kind: "incoming-single";
      mintUrl: string;
      method: IncomingPaymentMethod;
      entry: DueMintQuote;
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

const mintQuoteClaimWaiters = new Map<string, Set<() => void>>();

function queueAge(entry: { lastChecked: number; addedAt: number }) {
  return entry.lastChecked || entry.addedAt;
}

// New payments get one prompt check. Retried payments then return to the
// least-recently-checked order so a stream of new payments cannot starve them.
function queueOrder(entry: InvoiceQuote) {
  return entry.checkCount === 0 ? -entry.addedAt : queueAge(entry);
}

function compareQueueEntries(left: InvoiceQuote, right: InvoiceQuote) {
  return queueOrder(left) - queueOrder(right);
}

function amountToNumber(value: any) {
  if (value === undefined || value === null) return 0;
  return Amount.from(value).toNumber();
}

export const useTransactionWorkerStore = defineStore("transactionWorker", {
  state: () => ({
    // Requests are rate-limited independently for every mint URL.
    checkInterval: 5_000,
    workerTickInterval: 1_000,
    offlineRetryBaseInterval: 60_000,
    maxInterval: 24 * 60 * 60 * 1_000,
    keepIntervalConstantForNChecks: 5,
    maxLength: 50,
    maxAge: 14 * 24 * 60 * 60 * 1_000,
    oneHour: 60 * 60 * 1_000,

    transactionCheckListener: null as NodeJS.Timeout | null,
    transactionWorkerRunning: false,

    // Lane state is ephemeral so a restart immediately retries pending work.
    mintLaneInFlight: {} as Record<string, boolean>,
    mintLastRequestAt: {} as Record<string, number>,
    mintQuoteClaims: {} as Record<string, boolean>,

    // These keys intentionally retain their old names so existing queues
    // survive the store rename.
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
    batchPathCooldowns: useLocalStorage<Record<string, MintCooldown>>(
      "cashu.worker.invoices.batchPathCooldowns",
      {}
    ),

    maxSingleBolt11QuotesToCheckOnStartup: 10,
    maxOutgoingPaymentsToCheckOnStartup: 10,
  }),

  actions: {
    startTransactionWorker(force = false) {
      const settingsStore = useSettingsStore();
      if (
        !force &&
        !settingsStore.periodicallyCheckIncomingInvoices &&
        !settingsStore.checkSentTokens
      ) {
        return;
      }
      if (this.transactionCheckListener) return;

      this.transactionWorkerRunning = true;
      this.transactionCheckListener = setInterval(() => {
        void this.processTransactions().catch((error) => {
          console.error("Transaction worker dispatch failed", error);
        });
      }, this.workerTickInterval);
    },

    stopTransactionWorker() {
      if (this.transactionCheckListener) {
        clearInterval(this.transactionCheckListener);
        this.transactionCheckListener = null;
      }
      this.transactionWorkerRunning = false;
    },

    addInvoiceToChecker(quote: string, forceStart = false) {
      this.addMintQuoteToChecker(
        PaymentMethod.Bolt11,
        quote,
        forceStart,
        false
      );
    },

    addBatchInvoiceToChecker(quote: string, forceStart = false) {
      this.addMintQuoteToChecker(PaymentMethod.Bolt11, quote, forceStart, true);
    },

    addMintQuoteToChecker(
      method: IncomingPaymentMethod,
      quote: string,
      forceStart: boolean,
      usesBatchPath: boolean
    ) {
      if (!quote) return;
      const queue = this.mintQuoteQueue(method);
      const existing = queue.find((entry) => entry.quote === quote);
      if (existing) {
        if (usesBatchPath) {
          existing.usesBatchPath = true;
          existing.addedAt = Date.now();
          existing.lastChecked = 0;
          existing.checkCount = 0;
        }
        this.startTransactionWorker(forceStart);
        return;
      }

      if (!usesBatchPath) {
        const singleEntries = queue.filter((entry) => !entry.usesBatchPath);
        if (singleEntries.length >= this.maxLength) {
          const oldest = singleEntries.reduce((left, right) =>
            left.addedAt <= right.addedAt ? left : right
          );
          this.removeMintQuoteFromChecker(method, oldest.quote);
        }
      }

      queue.push({
        quote,
        addedAt: Date.now(),
        lastChecked: 0,
        checkCount: 0,
        ...(usesBatchPath ? { usesBatchPath: true } : {}),
      });
      this.startTransactionWorker(forceStart);
    },

    removeInvoiceFromChecker(quote: string) {
      this.removeMintQuoteFromChecker(PaymentMethod.Bolt11, quote);
    },

    addBolt12OfferToChecker(quote: string, forceStart = false) {
      this.addMintQuoteToChecker(
        PaymentMethod.Bolt12,
        quote,
        forceStart,
        false
      );
    },

    removeBolt12OfferFromChecker(quote: string) {
      this.removeMintQuoteFromChecker(PaymentMethod.Bolt12, quote);
    },

    addOnchainQuoteToChecker(quote: string, forceStart = false) {
      this.addMintQuoteToChecker(
        PaymentMethod.Onchain,
        quote,
        forceStart,
        false
      );
    },

    removeOnchainQuoteFromChecker(quote: string) {
      this.removeMintQuoteFromChecker(PaymentMethod.Onchain, quote);
    },

    mintQuoteQueue(method: IncomingPaymentMethod): InvoiceQuote[] {
      if (method === PaymentMethod.Bolt12) return this.bolt12Quotes;
      if (method === PaymentMethod.Onchain) return this.onchainQuotes;
      return this.quotes;
    },

    removeMintQuoteFromChecker(method: IncomingPaymentMethod, quote: string) {
      const queue = this.mintQuoteQueue(method);
      const index = queue.findIndex((entry) => entry.quote === quote);
      if (index !== -1) queue.splice(index, 1);
    },

    addBatchMintQuoteToChecker(
      method: IncomingPaymentMethod,
      quote: string,
      forceStart = false
    ) {
      this.addMintQuoteToChecker(method, quote, forceStart, true);
    },

    addSingleMintQuoteToChecker(
      method: IncomingPaymentMethod,
      quote: string,
      forceStart = false
    ) {
      this.addMintQuoteToChecker(method, quote, forceStart, false);
    },

    mintSupportsBatch(
      mint: Pick<StoredMint, "info"> | undefined,
      method: IncomingPaymentMethod
    ) {
      const nut29 = mint?.info?.nuts?.[29];
      if (!nut29) return false;
      // Older NUT-29 advertisements predate the methods field and only cover
      // Bolt11. Newer methods must be advertised explicitly.
      if (!nut29.methods) return method === PaymentMethod.Bolt11;
      return nut29.methods.includes(method);
    },

    mintSupportsBolt11Batch(mint: Pick<StoredMint, "info"> | undefined) {
      return this.mintSupportsBatch(mint, PaymentMethod.Bolt11);
    },

    batchSizeLimit(mint: Pick<StoredMint, "info"> | undefined) {
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

    bolt11BatchSizeLimit(mint: Pick<StoredMint, "info"> | undefined) {
      return this.batchSizeLimit(mint);
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
      this.startTransactionWorker(forceStart);
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
      const cooldownUntil =
        this.reusableMintCooldowns[mintUrl]?.nextRetryAt ?? 0;
      if (now < cooldownUntil) return false;
      const lastRequestAt = this.mintLastRequestAt[mintUrl] ?? 0;
      return now >= lastRequestAt + this.checkInterval;
    },

    async processTransactions(walletStore?: any, prioritizeBatch = false) {
      const activeWalletStore = walletStore ?? useWalletStore();
      const settingsStore = useSettingsStore();
      const checkIncoming = settingsStore.periodicallyCheckIncomingInvoices;
      const checkOutgoing = settingsStore.checkSentTokens;
      if (!checkIncoming && !checkOutgoing) return;
      const scope: WorkScope = checkIncoming
        ? checkOutgoing
          ? "all"
          : "incoming"
        : "outgoing";
      return await this.dispatchMintLanes(
        activeWalletStore,
        scope,
        prioritizeBatch
      );
    },

    async processIncomingTransactionsNow(walletStore?: any) {
      return await this.dispatchMintLanes(
        walletStore ?? useWalletStore(),
        "incoming",
        true
      );
    },

    // Retained as callable helpers for diagnostics and tests.
    async processIncomingQueues(_now: number, walletStore: any) {
      return await this.dispatchMintLanes(walletStore, "incoming", false);
    },

    async processOutgoingQueue(_now: number, walletStore: any) {
      if (!useSettingsStore().checkSentTokens) return;
      return await this.dispatchMintLanes(walletStore, "outgoing", false);
    },

    async dispatchMintLanes(
      walletStore: any,
      scope: WorkScope,
      prioritizeBatch: boolean
    ) {
      const now = Date.now();
      this.pruneQueues(now, walletStore);
      const lanes = this.mintUrlsWithWork(walletStore, scope).map((mintUrl) =>
        this.processMintLane(mintUrl, walletStore, scope, prioritizeBatch)
      );
      await Promise.allSettled(lanes);
    },

    async processMintLane(
      mintUrl: string,
      walletStore: any,
      scope: WorkScope,
      prioritizeBatch: boolean
    ) {
      if (!this.mintLaneReady(mintUrl, Date.now())) return;
      this.mintLaneInFlight[mintUrl] = true;
      try {
        const now = Date.now();
        const job = this.nextMintJob(
          mintUrl,
          walletStore,
          now,
          scope,
          prioritizeBatch
        );
        if (!job) return;

        this.mintLastRequestAt[mintUrl] = now;
        try {
          await this.runMintJob(job, walletStore, now);
          this.clearMintCooldown(mintUrl);
          if (job.kind === "incoming-batch") {
            this.clearBatchPathCooldown(job.mintUrl, job.unit, job.method);
          }
        } catch (error) {
          this.markJobAttempt(job, now);
          if (job.kind === "incoming-batch") {
            if (this.isNetworkOrRateLimitFailure(error)) {
              this.recordMintFailure(mintUrl, error, Date.now());
            } else {
              this.clearMintCooldown(mintUrl);
              this.recordBatchPathFailure(
                job.mintUrl,
                job.unit,
                job.method,
                error,
                Date.now()
              );
            }
          } else if (this.isNetworkOrRateLimitFailure(error)) {
            this.recordMintFailure(mintUrl, error, Date.now());
          } else {
            this.clearMintCooldown(mintUrl);
          }
        }
      } finally {
        delete this.mintLaneInFlight[mintUrl];
      }
    },

    incomingQueueGroups() {
      return [
        { method: PaymentMethod.Bolt11, queue: this.quotes },
        { method: PaymentMethod.Bolt12, queue: this.bolt12Quotes },
        { method: PaymentMethod.Onchain, queue: this.onchainQuotes },
      ] as Array<{
        method: IncomingPaymentMethod;
        queue: InvoiceQuote[];
      }>;
    },

    nextMintJob(
      mintUrl: string,
      walletStore: any,
      now: number,
      scope: WorkScope,
      prioritizeBatch: boolean
    ): MintJob | undefined {
      const candidates: Array<{
        order: number;
        batchPriority: number;
        job: MintJob;
      }> = [];
      const invoices = walletStore.invoiceHistory;

      if (scope !== "outgoing") {
        const mint = useMintsStore().mints.find(
          (storedMint) => storedMint.url === mintUrl
        );

        for (const { method, queue } of this.incomingQueueGroups()) {
          const dueEntries = queue
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
            ) as DueMintQuote[];

          const groups = new Map<string, DueMintQuote[]>();
          for (const entry of dueEntries) {
            const group = groups.get(entry.invoice.unit) ?? [];
            group.push(entry);
            groups.set(entry.invoice.unit, group);
          }

          for (const [unit, entries] of groups) {
            entries.sort((left, right) =>
              compareQueueEntries(left.queueEntry, right.queueEntry)
            );
            const canBatch =
              this.mintSupportsBatch(mint, method) &&
              !this.batchPathInCooldown(mintUrl, unit, method, now);
            const job: MintJob = canBatch
              ? {
                  kind: "incoming-batch",
                  mintUrl,
                  unit,
                  method,
                  entries: entries.slice(
                    0,
                    this.batchSizeLimit(mint) ?? entries.length
                  ),
                }
              : {
                  kind: "incoming-single",
                  mintUrl,
                  method,
                  entry: entries[0],
                };
            candidates.push({
              order: queueOrder(entries[0].queueEntry),
              batchPriority:
                prioritizeBatch && job.kind === "incoming-batch" ? 0 : 1,
              job,
            });
          }
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
              order: queueAge(entry),
              batchPriority: 1,
              job: { kind: "outgoing-invoice", mintUrl, entry, invoice },
            });
          } else {
            const historyToken = tokens.find((item) => item.token === entry.id);
            if (historyToken?.mint !== mintUrl) continue;
            candidates.push({
              order: queueAge(entry),
              batchPriority: 1,
              job: { kind: "outgoing-token", mintUrl, entry, historyToken },
            });
          }
        }
      }

      candidates.sort(
        (left, right) =>
          left.batchPriority - right.batchPriority || left.order - right.order
      );
      return candidates[0]?.job;
    },

    async runMintJob(job: MintJob, walletStore: any, now: number) {
      switch (job.kind) {
        case "incoming-batch":
          await this.runMintBatch(job, walletStore, now);
          return;
        case "incoming-single":
          if (job.method === PaymentMethod.Bolt11) {
            await walletStore.checkInvoiceBolt11(
              job.entry.queueEntry.quote,
              false
            );
            this.removeInvoiceFromChecker(job.entry.queueEntry.quote);
          } else {
            await this.runReusableMintJob(job, walletStore, now);
          }
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
      job: Extract<MintJob, { kind: "incoming-single" }>,
      walletStore: any,
      now: number
    ) {
      // Probe outside the wallet mutex so an offline reusable mint cannot hold
      // up minting work for another mint.
      const mintWallet = await walletStore.mintWallet(
        job.entry.invoice.mint,
        job.entry.invoice.unit
      );
      const quote =
        job.method === PaymentMethod.Bolt12
          ? await mintWallet.checkMintQuoteBolt12(job.entry.queueEntry.quote)
          : await mintWallet.checkMintQuoteOnchain(job.entry.queueEntry.quote);
      const delta =
        amountToNumber(quote.amount_paid) - amountToNumber(quote.amount_issued);

      if (delta <= 0) {
        await this.persistCheckedMintQuote(
          job.entry,
          quote,
          job.method,
          walletStore
        );
        walletStore.syncPaymentHistoryCache?.();
        this.markEntryAttempt(job.entry.queueEntry, now);
        return;
      }

      if (job.method === PaymentMethod.Bolt12) {
        await walletStore.checkOfferAndMintBolt12(
          job.entry.queueEntry.quote,
          false
        );
      } else {
        await walletStore.checkOnchainAndMint(
          job.entry.queueEntry.quote,
          false
        );
      }
      job.entry.queueEntry.lastChecked = now;
      job.entry.queueEntry.checkCount = 0;
    },

    async checkMintQuoteBatch(
      mintWallet: any,
      method: IncomingPaymentMethod,
      quoteIds: string[]
    ) {
      if (method === PaymentMethod.Bolt11) {
        return await mintWallet.checkMintQuoteBatchBolt11(quoteIds);
      }
      if (method === PaymentMethod.Bolt12) {
        return await mintWallet.checkMintQuoteBatchBolt12(quoteIds);
      }
      return await mintWallet.checkMintQuoteBatch(method, quoteIds);
    },

    mintableAmount(method: IncomingPaymentMethod, quote: Record<string, any>) {
      if (method === PaymentMethod.Bolt11) {
        return quote.state === MintQuoteState.PAID
          ? amountToNumber(quote.amount)
          : 0;
      }
      return Math.max(
        0,
        amountToNumber(quote.amount_paid) - amountToNumber(quote.amount_issued)
      );
    },

    async persistCheckedMintQuote(
      entry: DueMintQuote,
      quote: Record<string, any>,
      method: IncomingPaymentMethod,
      walletStore: any
    ) {
      const normalizedQuote = normalizeMintQuote(quote, method);
      entry.invoice.mintQuote = normalizedQuote;
      await usePaymentHistoryStore().upsertMintQuote(normalizedQuote, method);
      if (walletStore.invoiceData?.quote === entry.invoice.quote) {
        walletStore.invoiceData.mintQuote = normalizedQuote;
      }
      return normalizedQuote;
    },

    async runMintBatch(
      job: Extract<MintJob, { kind: "incoming-batch" }>,
      walletStore: any,
      now: number
    ) {
      const mintWallet = await walletStore.mintWallet(job.mintUrl, job.unit);
      const requestedQuotes = job.entries.map(
        (entry) => entry.queueEntry.quote
      );
      const responses = await this.checkMintQuoteBatch(
        mintWallet,
        job.method,
        requestedQuotes
      );
      this.validateBatchQuoteResponses(requestedQuotes, responses);

      const paidEntries: MintableQuote[] = [];
      for (let index = 0; index < job.entries.length; index++) {
        const entry = job.entries[index];
        const response = await this.persistCheckedMintQuote(
          entry,
          responses[index],
          job.method,
          walletStore
        );

        if (
          job.method === PaymentMethod.Bolt11 &&
          response.state === MintQuoteState.ISSUED
        ) {
          await walletStore.setInvoicePaid(entry.queueEntry.quote, {
            mintQuote: response,
          });
          this.removeInvoiceFromChecker(entry.queueEntry.quote);
          continue;
        }

        const mintAmount = this.mintableAmount(job.method, response);
        if (mintAmount > 0) {
          paidEntries.push({ ...entry, mintQuote: response, mintAmount });
        } else {
          this.markEntryAttempt(entry.queueEntry, now);
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

      await this.mintPaidQuoteBatch(
        job.method,
        mintable,
        signingKeys,
        mintWallet,
        walletStore,
        now
      );
    },

    async mintPaidQuoteBatch(
      method: IncomingPaymentMethod,
      paidEntries: MintableQuote[],
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
      const entriesToMint: MintableQuote[] = [];
      const issuedEntries: MintableQuote[] = [];
      const notMintableEntries: MintableQuote[] = [];

      const quoteIds = paidEntries.map((entry) => entry.queueEntry.quote);
      await uiStore.lockMutex();
      try {
        if (!this.claimMintQuotes(mintUrl, quoteIds)) return;
      } finally {
        uiStore.unlockMutex();
      }

      try {
        // The claim makes WebSocket callbacks stand down while this status
        // recheck and mint request run without holding the global wallet mutex.
        const latestResponses = await this.checkMintQuoteBatch(
          mintWallet,
          method,
          quoteIds
        );
        this.validateBatchQuoteResponses(quoteIds, latestResponses);
        for (let index = 0; index < paidEntries.length; index++) {
          const entry = paidEntries[index];
          const quote = await this.persistCheckedMintQuote(
            entry,
            latestResponses[index],
            method,
            walletStore
          );
          entry.mintQuote = quote;
          entry.mintAmount = this.mintableAmount(method, quote);
          if (
            method === PaymentMethod.Bolt11 &&
            quote.state === MintQuoteState.ISSUED
          ) {
            issuedEntries.push(entry);
          } else if (entry.mintAmount > 0) {
            entriesToMint.push(entry);
          } else {
            notMintableEntries.push(entry);
          }
        }

        if (entriesToMint.length > 0) {
          proofs = await walletStore.retryOnceOnSignedOutputs(
            keysetId,
            async () => {
              let preview: any;
              await uiStore.lockMutex();
              try {
                preview = await mintWallet.prepareBatchMint(
                  method,
                  entriesToMint.map((entry) => ({
                    amount: entry.mintAmount,
                    quote: entry.mintQuote,
                  })),
                  {
                    keysetId,
                    proofsWeHave: mintStore.mintUnitProofs(mint, unit),
                    ...(signingKeys.length > 0 ? { privkey: signingKeys } : {}),
                  }
                );
              } finally {
                uiStore.unlockMutex();
              }
              return await mintWallet.completeBatchMint(preview);
            },
            false
          );
        }

        walletStore.syncPaymentHistoryCache?.();

        for (const entry of issuedEntries) {
          await walletStore.setInvoicePaid(entry.queueEntry.quote, {
            mintQuote: entry.mintQuote,
          });
          this.removeInvoiceFromChecker(entry.queueEntry.quote);
        }
        for (const entry of notMintableEntries) {
          this.markEntryAttempt(entry.queueEntry, now);
        }
        if (proofs.length > 0) {
          await useProofsStore().addProofs(proofs);
        }
        if (method === PaymentMethod.Bolt11) {
          for (const entry of entriesToMint) {
            await walletStore.setInvoicePaid(entry.queueEntry.quote, {
              mintQuote: entry.mintQuote,
            });
            this.removeInvoiceFromChecker(entry.queueEntry.quote);
          }
        } else if (entriesToMint.length > 0) {
          await this.finalizeReusableBatchMint(
            method,
            entriesToMint,
            mintWallet,
            walletStore,
            now
          );
        }
      } finally {
        this.releaseMintQuotes(mintUrl, quoteIds);
      }
    },

    async finalizeReusableBatchMint(
      method: PaymentMethod.Bolt12 | PaymentMethod.Onchain,
      entries: MintableQuote[],
      mintWallet: any,
      walletStore: any,
      now: number
    ) {
      const quoteIds = entries.map((entry) => entry.queueEntry.quote);
      let finalQuotes = entries.map((entry) => ({
        ...entry.mintQuote,
        // The batch minted the entire available delta. This fallback prevents
        // a failed post-mint status refresh from making that delta look
        // mintable again locally.
        amount_issued: entry.mintQuote.amount_paid,
      }));

      try {
        const responses = await this.checkMintQuoteBatch(
          mintWallet,
          method,
          quoteIds
        );
        this.validateBatchQuoteResponses(quoteIds, responses);
        finalQuotes = responses;
      } catch {
        // Proofs are already safely stored. Persist the conservative local
        // state above and let the regular worker refresh it on its next check.
      }

      for (let index = 0; index < entries.length; index++) {
        const entry = entries[index];
        const quote = await this.persistCheckedMintQuote(
          entry,
          finalQuotes[index],
          method,
          walletStore
        );
        const paidAt = currentDateStr();
        const subpaymentType =
          method === PaymentMethod.Bolt12
            ? PaymentMethod.Bolt12Subpayment
            : PaymentMethod.OnchainSubpayment;
        const label =
          method === PaymentMethod.Bolt12
            ? "Bolt12 Subpayment"
            : "On-chain Subpayment";

        if (entry.invoice.status === "paid") {
          await walletStore.addPaymentHistory({
            ...entry.invoice,
            id: createSubpaymentHistoryQuote(),
            amount: entry.mintAmount,
            quote: entry.invoice.quote,
            parentQuote: entry.invoice.quote,
            date: paidAt,
            paidDate: paidAt,
            status: "paid",
            mintQuote: quote,
            label,
            type: subpaymentType,
          });
        } else {
          await walletStore.setInvoicePaid(entry.invoice.quote, {
            amount: entry.mintAmount,
            mintQuote: quote,
          });
        }

        entry.queueEntry.lastChecked = now;
        entry.queueEntry.checkCount = 0;
      }
      walletStore.syncPaymentHistoryCache?.();
    },

    mintQuoteClaimKey(mintUrl: string, quote: string) {
      return `${mintUrl}|${quote}`;
    },

    claimMintQuotes(mintUrl: string, quotes: string[]) {
      const keys = quotes.map((quote) =>
        this.mintQuoteClaimKey(mintUrl, quote)
      );
      if (keys.some((key) => this.mintQuoteClaims[key])) return false;
      for (const key of keys) this.mintQuoteClaims[key] = true;
      return true;
    },

    releaseMintQuotes(mintUrl: string, quotes: string[]) {
      for (const quote of quotes) {
        const key = this.mintQuoteClaimKey(mintUrl, quote);
        delete this.mintQuoteClaims[key];
        const waiters = mintQuoteClaimWaiters.get(key);
        mintQuoteClaimWaiters.delete(key);
        waiters?.forEach((resolve) => resolve());
      }
    },

    mintQuoteIsClaimed(mintUrl: string, quote: string) {
      return Boolean(
        this.mintQuoteClaims[this.mintQuoteClaimKey(mintUrl, quote)]
      );
    },

    async waitForMintQuoteRelease(mintUrl: string, quote: string) {
      if (!this.mintQuoteIsClaimed(mintUrl, quote)) return;
      const key = this.mintQuoteClaimKey(mintUrl, quote);
      await new Promise<void>((resolve) => {
        const waiters = mintQuoteClaimWaiters.get(key) ?? new Set();
        waiters.add(resolve);
        mintQuoteClaimWaiters.set(key, waiters);
        if (!this.mintQuoteIsClaimed(mintUrl, quote)) {
          waiters.delete(resolve);
          if (waiters.size === 0) mintQuoteClaimWaiters.delete(key);
          resolve();
        }
      });
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

    partitionLockedPaidQuotes(paidEntries: MintableQuote[]) {
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

      const mintable: MintableQuote[] = [];
      const missingKey: MintableQuote[] = [];
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
      if (job.kind === "incoming-batch") {
        for (const { queueEntry } of job.entries) {
          if (this.mintQuoteQueue(job.method).includes(queueEntry)) {
            this.markEntryAttempt(queueEntry, now);
          }
        }
        return;
      }
      if (job.kind === "incoming-single") {
        if (this.mintQuoteQueue(job.method).includes(job.entry.queueEntry)) {
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

    batchPathKey(
      mintUrl: string,
      unit: string,
      method: IncomingPaymentMethod = PaymentMethod.Bolt11
    ) {
      return `${mintUrl}|${unit}|${method}`;
    },

    batchPathInCooldown(
      mintUrl: string,
      unit: string,
      method: IncomingPaymentMethod,
      now: number
    ) {
      const cooldown =
        this.batchPathCooldowns[this.batchPathKey(mintUrl, unit, method)];
      return Boolean(cooldown && now < cooldown.nextRetryAt);
    },

    clearBatchPathCooldown(
      mintUrl: string,
      unit: string,
      method: IncomingPaymentMethod = PaymentMethod.Bolt11
    ) {
      const key = this.batchPathKey(mintUrl, unit, method);
      if (this.batchPathCooldowns[key]) {
        delete this.batchPathCooldowns[key];
      }
    },

    recordBatchPathFailure(
      mintUrl: string,
      unit: string,
      method: IncomingPaymentMethod,
      error: any,
      now: number
    ) {
      const key = this.batchPathKey(mintUrl, unit, method);
      const previous = this.batchPathCooldowns[key];
      const failureCount = (previous?.failureCount ?? 0) + 1;
      const retryDelay = Math.min(
        this.offlineRetryBaseInterval * 2 ** Math.max(0, failureCount - 1),
        this.oneHour
      );
      this.batchPathCooldowns[key] = {
        failedAt: now,
        failureCount,
        nextRetryAt: now + retryDelay,
        lastError: this.errorMessage(error),
      };
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

    async checkPendingTransactions(walletStore?: any) {
      if (!useSettingsStore().checkInvoicesOnStartup) return;

      const activeWalletStore = walletStore ?? useWalletStore();
      this.queuePendingIncomingPayments(activeWalletStore);
      // Give every mint one immediate startup job. Remaining work stays queued
      // and is paced by the regular per-mint worker interval.
      await this.dispatchMintLanes(activeWalletStore, "incoming", true);

      this.queuePendingOutgoingPayments(activeWalletStore);
      if (useSettingsStore().checkSentTokens) {
        await this.dispatchMintLanes(activeWalletStore, "outgoing", false);
      }
    },

    invoicePaymentMethod(invoice: any): IncomingPaymentMethod {
      if (invoice.type === PaymentMethod.Bolt12) return PaymentMethod.Bolt12;
      if (invoice.type === PaymentMethod.Onchain) return PaymentMethod.Onchain;
      return PaymentMethod.Bolt11;
    },

    queueIncomingMintQuote(invoice: any, forceStart = false) {
      const method = this.invoicePaymentMethod(invoice);
      const mint = useMintsStore().mints.find(
        (item) => item.url === invoice.mint
      );
      const supportsBatch = this.mintSupportsBatch(mint, method);
      if (supportsBatch) {
        this.clearMintCooldown(invoice.mint);
        this.addBatchMintQuoteToChecker(method, invoice.quote, forceStart);
      } else {
        this.addSingleMintQuoteToChecker(method, invoice.quote, forceStart);
      }
      return { method, supportsBatch };
    },

    startMintQuoteWebsocket(
      walletStore: any,
      method: IncomingPaymentMethod,
      quote: string
    ) {
      if (method === PaymentMethod.Bolt12) {
        return walletStore.mintOnPaidBolt12(quote, false, false);
      }
      if (method === PaymentMethod.Onchain) {
        return walletStore.mintOnPaidOnchain(quote, false, false);
      }
      return walletStore.mintOnPaidBolt11(quote, false, false);
    },

    queuePendingIncomingPayments(walletStore: any) {
      const settingsStore = useSettingsStore();
      const periodicChecks = settingsStore.periodicallyCheckIncomingInvoices;
      const pending = walletStore.invoiceHistory.filter((invoice: any) =>
        this.shouldCheckInvoice(invoice)
      );
      let singleBolt11QuotesQueued = 0;
      for (const invoice of pending) {
        try {
          const method = this.invoicePaymentMethod(invoice);
          const mint = useMintsStore().mints.find(
            (item) => item.url === invoice.mint
          );
          const supportsBatch = this.mintSupportsBatch(mint, method);

          if (
            method === PaymentMethod.Bolt11 &&
            !supportsBatch &&
            singleBolt11QuotesQueued >=
              this.maxSingleBolt11QuotesToCheckOnStartup
          ) {
            continue;
          }
          if (method === PaymentMethod.Bolt11 && !supportsBatch) {
            singleBolt11QuotesQueued += 1;
          }

          this.queueIncomingMintQuote(invoice);

          if (!supportsBatch || !periodicChecks) {
            void this.startMintQuoteWebsocket(
              walletStore,
              method,
              invoice.quote
            ).catch(() => {});
          }
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
