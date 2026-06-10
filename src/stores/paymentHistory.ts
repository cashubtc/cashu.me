import { defineStore } from "pinia";
import { Amount } from "@cashu/cashu-ts";
import { liveQuery } from "dexie";
import { cashuDb } from "./dexie";
import { PaymentMethod } from "src/stores/walletTypes";
import { currentDateStr } from "src/js/utils";

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
  mintQuote?: any;
  meltQuote?: any;
  label?: string;
  privKey?: string;
  paidDate?: string;
  meltChangeOutputData?: any[];
  meltOutputData?: any[];
  network?: string;
  parentQuote?: string;
  id?: string;
  [key: string]: any;
};

type BuiltRows = {
  payment: PaymentHistoryRow;
  mintQuote?: MintQuoteRow;
  meltQuote?: MeltQuoteRow;
};

function amountToNumber(value: any): number | null | undefined {
  if (value === undefined || value === null) return value;
  if (typeof value === "number") return value;
  try {
    return Amount.from(value).toNumber();
  } catch {
    return Number(value);
  }
}

function normalizeAmountFields<T extends Record<string, any>>(quote: T): T {
  const normalized: Record<string, any> = { ...quote };
  for (const field of [
    "amount",
    "amount_paid",
    "amount_issued",
    "fee_reserve",
    "fee_paid",
  ]) {
    if (field in normalized && normalized[field] !== null) {
      normalized[field] = amountToNumber(normalized[field]);
    }
  }
  if (Array.isArray(normalized.fee_options)) {
    normalized.fee_options = normalized.fee_options.map((option: any) => ({
      ...option,
      fee_reserve: amountToNumber(option.fee_reserve),
    }));
  }
  return normalized as T;
}

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
    ...normalizeAmountFields(quote),
    quote: quote.quote,
    method,
  }) as MintQuoteRow;
}

export function normalizeMeltQuote(
  quote: Record<string, any>,
  method: QuoteMethod
): MeltQuoteRow {
  return compactRecord({
    ...normalizeAmountFields(quote),
    quote: quote.quote,
    method,
  }) as MeltQuoteRow;
}

function sortPayments(payments: PaymentHistoryRow[]) {
  return payments.slice().sort((a, b) => {
    const aTime = new Date(a.date).getTime();
    const bTime = new Date(b.date).getTime();
    if (aTime !== bTime) return aTime - bTime;
    return a.id.localeCompare(b.id);
  });
}

function hasIndexedDb() {
  return typeof indexedDB !== "undefined";
}

function upsertByKey<T extends Record<string, any>>(
  rows: T[],
  key: string,
  row: T
) {
  const index = rows.findIndex((existing) => existing[key] === row[key]);
  if (index >= 0) {
    rows.splice(index, 1, row);
  } else {
    rows.push(row);
  }
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
      if (!hasIndexedDb()) {
        this.rebuildInvoiceHistory();
        return;
      }
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
      if (!hasIndexedDb()) {
        this.rebuildInvoiceHistory();
        return;
      }
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
      if (!hasIndexedDb()) {
        if (mintQuote) upsertByKey(this.mintQuotes, "quote", mintQuote);
        if (meltQuote) upsertByKey(this.meltQuotes, "quote", meltQuote);
        upsertByKey(this.paymentHistory, "id", payment);
        this.paymentHistory = sortPayments(this.paymentHistory);
        this.rebuildInvoiceHistory();
        return payment;
      }
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
      if (!hasIndexedDb()) {
        const payments = this.paymentHistory.filter(
          (payment) => payment.quote === quote
        );
        if (payments.length === 0) return false;
        const { mintQuote, meltQuote, ...paymentUpdates } = updates;
        for (const payment of payments) {
          Object.assign(payment, compactRecord(paymentUpdates));
          if (mintQuote) {
            upsertByKey(
              this.mintQuotes,
              "quote",
              normalizeMintQuote(mintQuote, payment.method)
            );
          }
          if (meltQuote) {
            upsertByKey(
              this.meltQuotes,
              "quote",
              normalizeMeltQuote(meltQuote, payment.method)
            );
          }
        }
        this.rebuildInvoiceHistory();
        return true;
      }
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
      if (!hasIndexedDb()) {
        const before = this.paymentHistory.length;
        this.paymentHistory = this.paymentHistory.filter(
          (payment) => payment.quote !== quote
        );
        this.rebuildInvoiceHistory();
        return this.paymentHistory.length !== before;
      }
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
      if (!hasIndexedDb()) {
        const row =
          this.paymentHistory.find(
            (payment) => payment.quote === quote && !payment.parentQuote
          ) || this.paymentHistory.find((payment) => payment.quote === quote);
        if (!row) return;
        const paidDate = currentDateStr();
        row.status = "paid";
        row.paidDate = paidDate;
        if (updates?.amount !== undefined) row.amount = updates.amount;
        if (updates?.mintQuote) {
          upsertByKey(
            this.mintQuotes,
            "quote",
            normalizeMintQuote(updates.mintQuote, row.method)
          );
        }
        if (updates?.meltQuote) {
          upsertByKey(
            this.meltQuotes,
            "quote",
            normalizeMeltQuote(updates.meltQuote, row.method)
          );
        }
        this.rebuildInvoiceHistory();
        return paidDate;
      }
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
      if (!hasIndexedDb()) {
        upsertByKey(
          this.mintQuotes,
          "quote",
          normalizeMintQuote(quote, method)
        );
        this.rebuildInvoiceHistory();
        return;
      }
      await cashuDb.mintQuotes.put(normalizeMintQuote(quote, method));
      await this.refreshFromDexie();
    },
    async upsertMeltQuote(quote: Record<string, any>, method: QuoteMethod) {
      if (!hasIndexedDb()) {
        upsertByKey(
          this.meltQuotes,
          "quote",
          normalizeMeltQuote(quote, method)
        );
        this.rebuildInvoiceHistory();
        return;
      }
      await cashuDb.meltQuotes.put(normalizeMeltQuote(quote, method));
      await this.refreshFromDexie();
    },
    findPaymentByQuote(quote: string) {
      return this.invoiceHistory.find((payment) => payment.quote === quote);
    },
    async deleteOldPaidPayments(maxHistory = 200) {
      const paid = this.paymentHistory
        .filter((payment) => payment.status === "paid")
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      if (paid.length <= maxHistory) return;
      const deleteRows = paid.slice(0, paid.length - maxHistory);
      if (!hasIndexedDb()) {
        const deleteIds = new Set(deleteRows.map((row) => row.id));
        this.paymentHistory = this.paymentHistory.filter(
          (row) => !deleteIds.has(row.id)
        );
        this.rebuildInvoiceHistory();
        return;
      }
      await cashuDb.transaction("rw", cashuDb.paymentHistory, async () => {
        for (const row of deleteRows) {
          await cashuDb.paymentHistory.delete(row.id);
        }
      });
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

      if (!hasIndexedDb()) {
        for (const row of builtRows) {
          if (row.mintQuote)
            upsertByKey(this.mintQuotes, "quote", row.mintQuote);
          if (row.meltQuote)
            upsertByKey(this.meltQuotes, "quote", row.meltQuote);
          upsertByKey(this.paymentHistory, "id", row.payment);
        }
        this.paymentHistory = sortPayments(this.paymentHistory);
        this.rebuildInvoiceHistory();
        localStorage.removeItem("cashu.invoiceHistory");
        return;
      }
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
