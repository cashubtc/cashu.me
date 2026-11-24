import { defineStore } from "pinia";
import { liveQuery } from "dexie";
import { MeltQuoteState, MintQuoteState } from "@cashu/cashu-ts";
import { cashuDb } from "./dexie";
import { PaymentMethod } from "src/stores/walletTypes";
import { currentDateStr } from "src/js/utils";
import {
  cashuAmountOrZero,
  normalizeCashuQuoteAmounts,
} from "src/js/cashu-amount";

export type PaymentDirection = "mint" | "melt";
export type PaymentStatus = "pending" | "paid";
export type QuoteMethod =
  | PaymentMethod.Bolt11
  | PaymentMethod.Bolt12
  | PaymentMethod.Onchain;

export type MintQuoteRow = {
  quote: string;
  method: QuoteMethod;
  request: string;
  unit: string;
  pubkey?: string;
  amount?: number | null;
  state?: string;
  expiry?: number | null;
  amount_paid?: number;
  amount_issued?: number;
  [key: string]: any;
};

export type MeltQuoteRow = {
  quote: string;
  method: QuoteMethod;
  request?: string;
  unit?: string;
  amount?: number;
  state?: string;
  expiry?: number;
  change?: any[];
  fee_reserve?: number;
  payment_preimage?: string | null;
  fee_options?: Array<{
    fee_index: number;
    fee_reserve: number;
    estimated_blocks: number;
  }>;
  selected_fee_index?: number | null;
  outpoint?: string | null;
  fee_paid?: number;
  [key: string]: any;
};

export type PaymentHistoryRow = {
  id: string;
  direction: PaymentDirection;
  quote: string;
  parentQuote?: string;
  method: QuoteMethod;
  paymentType?: PaymentMethod;
  amount: number;
  request: string;
  memo: string;
  date: string;
  status: PaymentStatus;
  mint: string;
  unit: string;
  label?: string;
  privKey?: string;
  paidDate?: string;
  meltChangeOutputData?: any[];
  meltOutputData?: any[];
  network?: string;
  requestedAmount?: number;
  [key: string]: any;
};

export type LegacyInvoiceHistory = {
  amount: number;
  request: string;
  quote: string;
  memo: string;
  date: string;
  status: PaymentStatus;
  mint: string;
  unit: string;
  type?: PaymentMethod;
  method?: PaymentMethod;
  direction?: PaymentDirection;
  mintQuote?: any;
  meltQuote?: any;
  label?: string;
  privKey?: string;
  paidDate?: string;
  meltChangeOutputData?: any[];
  meltOutputData?: any[];
  network?: string;
  requestedAmount?: number;
  parentQuote?: string;
  id?: string;
  [key: string]: any;
};

type BuiltRows = {
  payment: PaymentHistoryRow;
  mintQuote?: MintQuoteRow;
  meltQuote?: MeltQuoteRow;
};

function normalizeMethod(method?: string | PaymentMethod): QuoteMethod {
  if (
    method === PaymentMethod.Onchain ||
    method === PaymentMethod.OnchainSubpayment
  ) {
    return PaymentMethod.Onchain;
  }
  if (
    method === PaymentMethod.Bolt12 ||
    method === PaymentMethod.Bolt12Subpayment
  ) {
    return PaymentMethod.Bolt12;
  }
  return PaymentMethod.Bolt11;
}

function inferMethod(
  invoice: LegacyInvoiceHistory,
  direction: PaymentDirection
) {
  const existing = invoice.method || invoice.type || invoice.protocol;
  if (existing) return normalizeMethod(existing);
  const quote = direction === "mint" ? invoice.mintQuote : invoice.meltQuote;
  if (quote?.fee_options || invoice.network) return PaymentMethod.Onchain;
  if (
    quote &&
    ("amount_paid" in quote || "amount_issued" in quote) &&
    String(quote.request || invoice.request || "").startsWith("bc")
  ) {
    return PaymentMethod.Onchain;
  }
  if (
    quote &&
    ("amount_paid" in quote || "amount_issued" in quote) &&
    !("state" in quote)
  ) {
    return PaymentMethod.Bolt12;
  }
  if (String(invoice.request || quote?.request || "").startsWith("lno")) {
    return PaymentMethod.Bolt12;
  }
  return PaymentMethod.Bolt11;
}

function inferPaymentType(
  invoice: LegacyInvoiceHistory,
  method: QuoteMethod
): PaymentMethod {
  return (invoice.type || invoice.method || method) as PaymentMethod;
}

function inferDirection(invoice: LegacyInvoiceHistory): PaymentDirection {
  if (invoice.direction === "mint" || invoice.direction === "melt") {
    return invoice.direction;
  }
  return invoice.amount < 0 || Boolean(invoice.meltQuote) ? "melt" : "mint";
}

function quoteIdForInvoice(
  invoice: LegacyInvoiceHistory,
  direction: PaymentDirection
): string {
  if (
    (invoice.quote?.startsWith("subpayment:") ||
      invoice.type === PaymentMethod.Bolt12Subpayment ||
      invoice.type === PaymentMethod.OnchainSubpayment) &&
    invoice.parentQuote
  ) {
    return invoice.parentQuote;
  }
  const embeddedQuote =
    direction === "mint" ? invoice.mintQuote?.quote : invoice.meltQuote?.quote;
  if (embeddedQuote) return embeddedQuote;
  return invoice.parentQuote || invoice.quote;
}

function paymentIdForInvoice(
  invoice: LegacyInvoiceHistory,
  direction: PaymentDirection,
  quoteId: string
): string {
  if (invoice.id) return invoice.id;
  if (invoice.quote?.startsWith("subpayment:")) return invoice.quote;
  return `${direction}:${quoteId}`;
}

function compactRecord<T extends Record<string, any>>(record: T): T {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(record)) {
    if (value !== undefined) result[key] = value;
  }
  return result as T;
}

export function buildPaymentRowsFromLegacyInvoice(
  invoice: LegacyInvoiceHistory
): BuiltRows {
  const direction = inferDirection(invoice);
  const method = inferMethod(invoice, direction);
  const quoteId = quoteIdForInvoice(invoice, direction);
  const paymentType = inferPaymentType(invoice, method);
  const isSubpayment =
    invoice.quote?.startsWith("subpayment:") ||
    paymentType === PaymentMethod.Bolt12Subpayment ||
    paymentType === PaymentMethod.OnchainSubpayment;
  const payment: PaymentHistoryRow = compactRecord({
    id: paymentIdForInvoice(invoice, direction, quoteId),
    direction,
    quote: quoteId,
    parentQuote: isSubpayment ? invoice.parentQuote || quoteId : undefined,
    method,
    paymentType,
    amount: Number(invoice.amount || 0),
    request:
      invoice.request ||
      invoice.mintQuote?.request ||
      invoice.meltQuote?.request ||
      "",
    memo: invoice.memo || "",
    date: invoice.date,
    status: invoice.status || "pending",
    mint: invoice.mint,
    unit: invoice.unit,
    label: invoice.label,
    privKey: invoice.privKey,
    paidDate: invoice.paidDate,
    meltChangeOutputData: invoice.meltChangeOutputData,
    meltOutputData: invoice.meltOutputData,
    network: invoice.network,
    requestedAmount: invoice.requestedAmount,
  });

  if (direction === "mint" && invoice.mintQuote) {
    const mintQuote = normalizeMintQuote(invoice.mintQuote, method);
    return { payment, mintQuote };
  }
  if (direction === "melt" && invoice.meltQuote) {
    const meltQuote = normalizeMeltQuote(invoice.meltQuote, method);
    return { payment, meltQuote };
  }
  return { payment };
}

export function normalizeMintQuote(
  quote: Record<string, any>,
  method: QuoteMethod
): MintQuoteRow {
  return compactRecord({
    ...normalizeCashuQuoteAmounts(quote),
    quote: quote.quote,
    method,
  }) as MintQuoteRow;
}

export function normalizeMeltQuote(
  quote: Record<string, any>,
  method: QuoteMethod
): MeltQuoteRow {
  return compactRecord({
    ...normalizeCashuQuoteAmounts(quote),
    quote: quote.quote,
    method,
  }) as MeltQuoteRow;
}

// Bolt11 mint quotes are done once issued, or once the wallet marked their
// payment paid (it does not always persist the ISSUED state). Reusable
// bolt12/onchain quotes carry no state; they are done when nothing paid is
// left to claim. Anything else, or a malformed amount, is kept.
function isFinalMintQuote(quote: MintQuoteRow, settled: boolean): boolean {
  if (quote.method === PaymentMethod.Bolt11) {
    return settled || quote.state === MintQuoteState.ISSUED;
  }
  if (
    quote.method !== PaymentMethod.Bolt12 &&
    quote.method !== PaymentMethod.Onchain
  ) {
    return false;
  }
  try {
    return (
      cashuAmountOrZero(quote.amount_issued) >=
      cashuAmountOrZero(quote.amount_paid)
    );
  } catch {
    return false;
  }
}

function sortPayments(payments: PaymentHistoryRow[]) {
  return payments.slice().sort((a, b) => {
    const aTime = new Date(a.date).getTime();
    const bTime = new Date(b.date).getTime();
    if (aTime !== bTime) return aTime - bTime;
    return a.id.localeCompare(b.id);
  });
}

function buildLegacyInvoice(
  payment: PaymentHistoryRow,
  quote?: MintQuoteRow | MeltQuoteRow
): LegacyInvoiceHistory {
  const legacy: LegacyInvoiceHistory = compactRecord({
    ...payment,
    quote: payment.quote,
    request: payment.request || quote?.request || "",
    unit: payment.unit || quote?.unit || "",
    type: payment.paymentType || payment.method,
    parentQuote: payment.parentQuote,
  });
  delete (legacy as any).direction;
  delete (legacy as any).method;
  delete (legacy as any).paymentType;
  if (payment.direction === "mint" && quote) {
    legacy.mintQuote = quote;
  }
  if (payment.direction === "melt" && quote) {
    legacy.meltQuote = quote;
  }
  return legacy;
}

export const usePaymentHistoryStore = defineStore("paymentHistory", {
  state: () => ({
    paymentHistory: [] as PaymentHistoryRow[],
    mintQuotes: [] as MintQuoteRow[],
    meltQuotes: [] as MeltQuoteRow[],
    invoiceHistory: [] as LegacyInvoiceHistory[],
    subscription: null as any,
  }),
  actions: {
    async init() {
      if (!this.subscription) {
        this.subscription = liveQuery(async () => {
          const [payments, mintQuotes, meltQuotes] = await Promise.all([
            cashuDb.paymentHistory.toArray(),
            cashuDb.mintQuotes.toArray(),
            cashuDb.meltQuotes.toArray(),
          ]);
          return { payments, mintQuotes, meltQuotes };
        }).subscribe({
          next: ({ payments, mintQuotes, meltQuotes }) => {
            this.setCache(payments, mintQuotes, meltQuotes);
          },
          error: (error) => console.error(error),
        });
      }
      await this.refreshFromDexie();
    },
    setCache(
      payments: PaymentHistoryRow[],
      mintQuotes: MintQuoteRow[],
      meltQuotes: MeltQuoteRow[]
    ) {
      this.paymentHistory = sortPayments(payments);
      this.mintQuotes = mintQuotes;
      this.meltQuotes = meltQuotes;
      this.rebuildInvoiceHistory();
    },
    rebuildInvoiceHistory() {
      const mintQuotesById = new Map(this.mintQuotes.map((q) => [q.quote, q]));
      const meltQuotesById = new Map(this.meltQuotes.map((q) => [q.quote, q]));
      this.invoiceHistory = this.paymentHistory.map((payment) =>
        buildLegacyInvoice(
          payment,
          payment.direction === "mint"
            ? mintQuotesById.get(payment.quote)
            : meltQuotesById.get(payment.quote)
        )
      );
    },
    async refreshFromDexie() {
      const [payments, mintQuotes, meltQuotes] = await Promise.all([
        cashuDb.paymentHistory.toArray(),
        cashuDb.mintQuotes.toArray(),
        cashuDb.meltQuotes.toArray(),
      ]);
      this.setCache(payments, mintQuotes, meltQuotes);
    },
    setInvoiceHistoryForTests(invoices: LegacyInvoiceHistory[]) {
      const rows = invoices.map((invoice) =>
        buildPaymentRowsFromLegacyInvoice(invoice)
      );
      this.setCache(
        rows.map((row) => row.payment),
        rows.flatMap((row) => (row.mintQuote ? [row.mintQuote] : [])),
        rows.flatMap((row) => (row.meltQuote ? [row.meltQuote] : []))
      );
    },
    async addPayment(invoice: LegacyInvoiceHistory) {
      const { payment, mintQuote, meltQuote } =
        buildPaymentRowsFromLegacyInvoice(invoice);
      await cashuDb.transaction(
        "rw",
        cashuDb.paymentHistory,
        cashuDb.mintQuotes,
        cashuDb.meltQuotes,
        async () => {
          if (mintQuote) await cashuDb.mintQuotes.put(mintQuote);
          if (meltQuote) await cashuDb.meltQuotes.put(meltQuote);
          await cashuDb.paymentHistory.put(payment);
        }
      );
      await this.refreshFromDexie();
      return payment;
    },
    async updatePayment(
      quote: string,
      updates: Partial<PaymentHistoryRow> & {
        mintQuote?: Record<string, any>;
        meltQuote?: Record<string, any>;
      }
    ) {
      const payments = await cashuDb.paymentHistory
        .where("quote")
        .equals(quote)
        .toArray();
      if (payments.length === 0) {
        return false;
      }
      await cashuDb.transaction(
        "rw",
        cashuDb.paymentHistory,
        cashuDb.mintQuotes,
        cashuDb.meltQuotes,
        async () => {
          for (const payment of payments) {
            const { mintQuote, meltQuote, ...paymentUpdates } = updates;
            await cashuDb.paymentHistory.update(payment.id, paymentUpdates);
            if (mintQuote) {
              await cashuDb.mintQuotes.put(
                normalizeMintQuote(mintQuote, payment.method)
              );
            }
            if (meltQuote) {
              await cashuDb.meltQuotes.put(
                normalizeMeltQuote(meltQuote, payment.method)
              );
            }
          }
        }
      );
      await this.refreshFromDexie();
      return true;
    },
    async removePaymentByQuote(quote: string) {
      const rows = await cashuDb.paymentHistory
        .where("quote")
        .equals(quote)
        .toArray();
      if (rows.length === 0) {
        return false;
      }
      await cashuDb.transaction("rw", cashuDb.paymentHistory, async () => {
        for (const row of rows) {
          await cashuDb.paymentHistory.delete(row.id);
        }
      });
      await this.refreshFromDexie();
      return true;
    },
    async setPaymentPaid(
      quote: string,
      updates?: { amount?: number; mintQuote?: any; meltQuote?: any }
    ) {
      const rows = await cashuDb.paymentHistory
        .where("quote")
        .equals(quote)
        .toArray();
      const row = rows.find((payment) => !payment.parentQuote) || rows[0];
      if (!row) return;
      const paidDate = currentDateStr();
      await cashuDb.transaction(
        "rw",
        cashuDb.paymentHistory,
        cashuDb.mintQuotes,
        cashuDb.meltQuotes,
        async () => {
          await cashuDb.paymentHistory.update(
            row.id,
            compactRecord({
              status: "paid",
              paidDate,
              amount: updates?.amount,
            })
          );
          if (updates?.mintQuote) {
            await cashuDb.mintQuotes.put(
              normalizeMintQuote(updates.mintQuote, row.method)
            );
          }
          if (updates?.meltQuote) {
            await cashuDb.meltQuotes.put(
              normalizeMeltQuote(updates.meltQuote, row.method)
            );
          }
        }
      );
      await this.refreshFromDexie();
      return paidDate;
    },
    async upsertMintQuote(quote: Record<string, any>, method: QuoteMethod) {
      await cashuDb.mintQuotes.put(normalizeMintQuote(quote, method));
      await this.refreshFromDexie();
    },
    async upsertMeltQuote(quote: Record<string, any>, method: QuoteMethod) {
      await cashuDb.meltQuotes.put(normalizeMeltQuote(quote, method));
      await this.refreshFromDexie();
    },
    findPaymentByQuote(quote: string) {
      return this.invoiceHistory.find((payment) => payment.quote === quote);
    },
    /**
     * Delete the oldest paid payments beyond `maxHistory`, then delete quote
     * rows that no payment or proof references any more. A quote row is kept
     * while it is in `keepQuotes` (e.g. still queued in the transaction
     * worker) or not yet in a final state. A quote whose payments were all
     * pruned as paid counts as settled.
     */
    async deleteOldPaidPayments(
      maxHistory = 200,
      keepQuotes: Iterable<string> = []
    ) {
      const keep = new Set(keepQuotes);
      await cashuDb.transaction(
        "rw",
        [
          cashuDb.paymentHistory,
          cashuDb.mintQuotes,
          cashuDb.meltQuotes,
          cashuDb.proofs,
        ],
        async () => {
          const payments = await cashuDb.paymentHistory.toArray();
          const paid = sortPayments(
            payments.filter((payment) => payment.status === "paid")
          );
          const deleteRows = paid.slice(
            0,
            Math.max(0, paid.length - maxHistory)
          );
          const deleteIds = new Set(deleteRows.map((row) => row.id));
          await cashuDb.paymentHistory.bulkDelete([...deleteIds]);
          const settled = new Set<string>();
          for (const payment of payments) {
            const target = deleteIds.has(payment.id) ? settled : keep;
            target.add(payment.quote);
            if (payment.parentQuote) target.add(payment.parentQuote);
          }
          const isOrphan = (quote: MintQuoteRow | MeltQuoteRow) =>
            !keep.has(quote.quote);
          const mintQuotes = (await cashuDb.mintQuotes.toArray()).filter(
            (quote) =>
              isOrphan(quote) &&
              isFinalMintQuote(quote, settled.has(quote.quote))
          );
          const meltQuotes = (await cashuDb.meltQuotes.toArray()).filter(
            (quote) =>
              isOrphan(quote) &&
              (settled.has(quote.quote) || quote.state === MeltQuoteState.PAID)
          );
          const candidates = [...mintQuotes, ...meltQuotes].map(
            (quote) => quote.quote
          );
          if (candidates.length === 0) return;
          const reservedFor = new Set(
            (
              await cashuDb.proofs.where("quote").anyOf(candidates).toArray()
            ).map((proof) => proof.quote)
          );
          await cashuDb.mintQuotes.bulkDelete(
            mintQuotes
              .map((quote) => quote.quote)
              .filter((id) => !reservedFor.has(id))
          );
          await cashuDb.meltQuotes.bulkDelete(
            meltQuotes
              .map((quote) => quote.quote)
              .filter((id) => !reservedFor.has(id))
          );
        }
      );
      await this.refreshFromDexie();
    },
    async migrateLegacyInvoiceHistoryFromLocalStorage() {
      const raw = localStorage.getItem("cashu.invoiceHistory");
      if (!raw) {
        await this.refreshFromDexie();
        return;
      }
      const invoices = JSON.parse(raw) as LegacyInvoiceHistory[];
      const builtRows = invoices.map((invoice) =>
        buildPaymentRowsFromLegacyInvoice(invoice)
      );

      await cashuDb.transaction(
        "rw",
        cashuDb.paymentHistory,
        cashuDb.mintQuotes,
        cashuDb.meltQuotes,
        async () => {
          for (const row of builtRows) {
            if (row.mintQuote) await cashuDb.mintQuotes.put(row.mintQuote);
            if (row.meltQuote) await cashuDb.meltQuotes.put(row.meltQuote);
            await cashuDb.paymentHistory.put(row.payment);
          }
        }
      );
      localStorage.removeItem("cashu.invoiceHistory");
      await this.refreshFromDexie();
    },
  },
});
