import { currentDateStr } from "src/js/utils";
import { useMintsStore, WalletProof } from "./mints";
import { useProofsStore } from "./proofs";
import { type MutexPriority, useUiStore } from "src/stores/ui";
import { Amount, Wallet } from "@cashu/cashu-ts";
import * as nobleSecp256k1 from "@noble/secp256k1";
import { bytesToHex } from "@noble/hashes/utils";
import { notifyApiError, notify, notifySuccess } from "src/js/notify";
import type { InvoiceHistory } from "./wallet";
import { useTransactionWorkerStore } from "./transactionWorker";
import {
  basePaymentMethod,
  isCustomPaymentMethod,
  subpaymentMethod,
} from "src/stores/walletTypes";
import { paymentMethodDisplayName } from "src/js/mint-payment-methods";
import { mintOnPaidGeneric } from "./walletWebsocket";
import { type AppMeltQuote, normalizeMeltQuote } from "./walletMelt";
import { createSubpaymentHistoryQuote } from "src/js/invoice-history";
import { usePaymentHistoryStore } from "./paymentHistory";

// Custom (generic) payment methods: any NUT-04/05 method a mint advertises
// beyond the first-class bolt11/bolt12/onchain ones. Quotes are driven
// through cashu-ts' generic /v1/{mint,melt}/quote/{method} endpoints and
// follow the amount_paid/amount_issued accounting model (like bolt12).
//
// These actions are implemented as regular functions that rely on dynamic
// `this` when attached to the Pinia store (wallet.ts assigns them to
// actions). Do not convert to arrow functions or `this` will be lost.

function amountToNumber(value: any): number {
  if (value === undefined || value === null) return 0;
  return Amount.from(value).toNumber();
}

type AppMintQuote = Record<string, any>;

function normalizeMintQuote(quote: Record<string, any>): AppMintQuote {
  const normalized: AppMintQuote = { ...quote };
  if (quote.amount !== undefined && quote.amount !== null) {
    normalized.amount = amountToNumber(quote.amount);
  }
  if (quote.amount_paid !== undefined) {
    normalized.amount_paid = amountToNumber(quote.amount_paid);
  }
  if (quote.amount_issued !== undefined) {
    normalized.amount_issued = amountToNumber(quote.amount_issued);
  }
  return normalized;
}

function customMethodOfInvoice(invoice: InvoiceHistory): string {
  const method = basePaymentMethod(
    String(invoice.type || (invoice as any).method || "")
  );
  if (!isCustomPaymentMethod(method)) {
    throw new Error(`not a custom payment method: ${method}`);
  }
  return method;
}

// How much of a quote is currently mintable. Prefers the NUT-04 accounting
// fields; falls back to the state field for mints that predate them.
function mintableDelta(quote: AppMintQuote): number {
  if (quote.amount_paid !== undefined || quote.amount_issued !== undefined) {
    return (
      amountToNumber(quote.amount_paid) - amountToNumber(quote.amount_issued)
    );
  }
  if (String(quote.state).toUpperCase() === "PAID") {
    return amountToNumber(quote.amount);
  }
  return 0;
}

export async function requestMintCustom(
  this: any,
  method: string,
  amount: number,
  mintWallet: Wallet
) {
  try {
    if (!isCustomPaymentMethod(method)) {
      throw new Error(`not a custom payment method: ${method}`);
    }
    await mintWallet.loadMint();
    const { supported: nut20supported } = mintWallet
      .getMintInfo()
      .isSupported(20);
    // Lock the quote to a fresh key whenever the mint supports NUT-20.
    // Some generic payment processors only accept locked quotes.
    const privkey = nut20supported
      ? bytesToHex(nobleSecp256k1.utils.randomPrivateKey())
      : undefined;
    const pubkey = nut20supported
      ? bytesToHex(nobleSecp256k1.getPublicKey(privkey!!, true))
      : undefined;
    const payload: Record<string, unknown> = {
      amount,
      unit: mintWallet.unit,
      ...(pubkey ? { pubkey } : {}),
    };
    const data = await mintWallet.createMintQuote(method, payload);

    const storedMint = useMintsStore().mints.find(
      (m: any) => m.url === mintWallet.mint.mintUrl
    );
    this.invoiceData.amount = amount;
    this.invoiceData.request = data.request || "";
    this.invoiceData.quote = data.quote;
    this.invoiceData.date = currentDateStr();
    this.invoiceData.status = "pending";
    this.invoiceData.mint = mintWallet.mint.mintUrl;
    this.invoiceData.unit = mintWallet.unit;
    this.invoiceData.mintQuote = normalizeMintQuote(data);
    this.invoiceData.privKey = privkey;
    this.invoiceData.type = method;

    await this.addPaymentHistory({
      ...this.invoiceData,
      label: paymentMethodDisplayName(
        storedMint,
        method,
        "mint",
        mintWallet.unit
      ),
      type: method,
    });

    return data;
  } catch (error: any) {
    console.error(error);
    notifyApiError(
      error,
      this.t("wallet.notifications.could_not_request_mint")
    );
    throw error;
  }
}

export async function mintOnPaidCustom(
  this: any,
  quote: string,
  verbose = true,
  kickOffInvoiceChecker = true,
  hideInvoiceDetailsOnMint = true
) {
  const invoice = this.invoiceHistory.find(
    (i: InvoiceHistory) => i.quote === quote
  );
  if (!invoice) {
    throw new Error("invoice not found");
  }
  const method = customMethodOfInvoice(invoice);
  return await mintOnPaidGeneric.call(this, quote, {
    type: method,
    verbose,
    kickOffInvoiceChecker,
    hideInvoiceDetailsOnMint,
  });
}

export async function checkCustomAndMint(
  this: any,
  quoteId: string,
  verbose = true,
  hideInvoiceDetailsOnMint = true
) {
  const uIStore = useUiStore();
  const proofsStore = useProofsStore();
  const mintStore = useMintsStore();
  const invoice = this.invoiceHistory.find(
    (i: InvoiceHistory) => i.quote === quoteId
  );
  if (!invoice) throw new Error("quote not found");
  const method = customMethodOfInvoice(invoice);

  const mintWallet = await this.mintWallet(invoice.mint, invoice.unit);
  const mint = mintStore.mints.find((m: any) => m.url === invoice.mint);
  if (!mint) throw new Error("mint not found");

  const transactionWorkerStore = useTransactionWorkerStore();
  while (true) {
    await transactionWorkerStore.waitForMintQuoteRelease(
      invoice.mint,
      invoice.quote
    );
    await uIStore.lockMutex("background");
    if (
      !transactionWorkerStore.mintQuoteIsClaimed(invoice.mint, invoice.quote)
    ) {
      break;
    }
    uIStore.unlockMutex();
  }
  try {
    const updated = normalizeMintQuote(
      await mintWallet.checkMintQuote(method, quoteId)
    );

    invoice.mintQuote = updated;
    const paymentHistoryStore = usePaymentHistoryStore();
    await paymentHistoryStore.upsertMintQuote(updated, method);
    if (
      paymentHistoryStore.paymentHistory.some((p) => p.quote === invoice.quote)
    ) {
      this.syncPaymentHistoryCache?.();
    }
    if (this.invoiceData.quote === invoice.quote) {
      this.invoiceData.mintQuote = updated;
    }

    if (String(updated.state).toUpperCase() === "ISSUED") {
      await this.setInvoicePaid(invoice.quote, { mintQuote: updated });
      transactionWorkerStore.removeCustomQuoteFromChecker?.(method, quoteId);
      return;
    }

    const delta = mintableDelta(updated);
    if (delta <= 0) {
      if (verbose) notify(this.t("wallet.notifications.invoice_still_pending"));
      throw new Error("no new funds to mint");
    }

    const proofs = await this.retryOnceOnRecoverableError(
      mintWallet.keysetId,
      async () =>
        mintWallet.mintProofs(method, delta, updated as any, {
          keysetId: mintWallet.keysetId,
          proofsWeHave: mintStore.mintUnitProofs(mint, invoice.unit),
          ...(invoice.privKey ? { privkey: invoice.privKey } : {}),
        }),
      verbose
    );
    await proofsStore.addProofs(proofs);

    // Refresh the quote so we can persist the post-mint state
    let normalizedMintQuote = {
      ...updated,
      amount_issued: updated.amount_paid,
    };
    try {
      normalizedMintQuote = normalizeMintQuote(
        await mintWallet.checkMintQuote(method, quoteId)
      );
    } catch {
      // Proofs are stored; keep the conservative local state.
    }
    invoice.mintQuote = normalizedMintQuote;
    await paymentHistoryStore.upsertMintQuote(normalizedMintQuote, method);
    if (
      paymentHistoryStore.paymentHistory.some((p) => p.quote === invoice.quote)
    ) {
      this.syncPaymentHistoryCache?.();
    }

    if (invoice.status === "paid") {
      // Additional payment on an already-settled quote: record it as a
      // separate subpayment history entry (mirrors bolt12/onchain).
      await this.addPaymentHistory({
        ...invoice,
        id: createSubpaymentHistoryQuote(),
        amount: delta,
        quote: invoice.quote,
        parentQuote: invoice.quote,
        date: currentDateStr(),
        paidDate: currentDateStr(),
        status: "paid",
        mintQuote: normalizedMintQuote,
        label: `${paymentMethodDisplayName(
          mint,
          method,
          "mint",
          invoice.unit
        )} Subpayment`,
        type: subpaymentMethod(method),
      });
    } else {
      await this.setInvoicePaid(invoice.quote, {
        amount: delta,
        mintQuote: normalizedMintQuote,
      });
    }

    if (hideInvoiceDetailsOnMint) {
      this.hideInvoiceDetailsAfterReceiveSuccess(invoice.quote);
    }

    useUiStore().vibrate();
    if (verbose) {
      notifySuccess(
        this.t("wallet.notifications.received", {
          amount: uIStore.formatCurrency(delta, invoice.unit),
        })
      );
    }
    return proofs;
  } catch (error: any) {
    if (verbose) {
      console.error(error);
      if (error?.message !== "no new funds to mint") {
        notifyApiError(error);
      }
    }
    throw error;
  } finally {
    uIStore.unlockMutex();
  }
}

export async function meltQuoteCustomData(this: any) {
  const mintWallet: Wallet = await this.activeWallet();
  if (this.payInvoiceData.blocking) {
    throw new Error("already processing an melt quote.");
  }
  this.payInvoiceData.blocking = true;
  this.payInvoiceData.meltQuote.error = "";
  this.payInvoiceData.meltQuote.response = {
    quote: "",
    amount: 0,
    fee_reserve: 0,
  };
  try {
    const mintStore = useMintsStore();
    const method = this.payInvoiceData.invoice?.custom;
    if (!method || !isCustomPaymentMethod(method)) {
      throw new Error("no payment method provided.");
    }
    const inputAmount = this.payInvoiceData.input.amount;
    if (!inputAmount || inputAmount <= 0) {
      throw new Error("no amount provided");
    }
    const amount = Math.floor(
      inputAmount * mintStore.activeUnitCurrencyMultiplyer
    );
    // Free-form memo travels in the `request` field of the melt quote.
    const memo = this.payInvoiceData.input.comment || "";
    // cdk's custom melt quote request (unlike its mint quote request)
    // requires the payment method repeated in the body, matching the URL.
    const data = await mintWallet.createMeltQuote(method, {
      method,
      unit: mintWallet.unit,
      amount,
      request: memo,
    });
    mintStore.assertMintError(data);
    const quote = normalizeMeltQuote(data as any);
    this.payInvoiceData.meltQuote.response = quote;
    return quote;
  } catch (error: any) {
    this.payInvoiceData.meltQuote.error = String(error?.message || error);
    console.error(error);
    notifyApiError(error);
    throw error;
  } finally {
    this.payInvoiceData.blocking = false;
  }
}

export async function meltInvoiceDataCustom(
  this: any,
  silent?: boolean,
  mutexPriority: MutexPriority = "normal"
) {
  if (!this.payInvoiceData.invoice) throw new Error("no payment provided.");
  const method = this.payInvoiceData.invoice.custom;
  if (!method) throw new Error("no payment method provided.");
  const quote: AppMeltQuote = this.payInvoiceData.meltQuote.response;
  if (!quote) throw new Error("no quote found.");
  const mintStore = useMintsStore();
  const mintWallet = await this.mintWallet(
    mintStore.activeMintUrl,
    mintStore.activeUnit,
    true
  );
  return await this.meltCustom(
    mintStore.activeProofs,
    quote,
    mintWallet,
    method,
    silent,
    mutexPriority
  );
}

export async function meltCustom(
  this: any,
  proofs: WalletProof[],
  quote: AppMeltQuote,
  mintWallet: Wallet,
  method: string,
  silent?: boolean,
  mutexPriority: MutexPriority = "normal"
) {
  return this.meltGeneric(
    proofs,
    quote,
    mintWallet,
    silent,
    (id: string) => mintWallet.mint.checkMeltQuote(method, id),
    method,
    undefined,
    false,
    mutexPriority
  );
}

export async function checkOutgoingCustom(
  this: any,
  quote: string,
  verbose = true
) {
  const invoice = this.invoiceHistory.find(
    (i: InvoiceHistory) => i.quote === quote
  );
  if (!invoice) {
    throw new Error("invoice not found");
  }
  const method = customMethodOfInvoice(invoice);
  return this.checkOutgoingInvoiceGeneric(
    quote,
    verbose,
    (wallet: Wallet, quoteId: string) =>
      wallet.mint.checkMeltQuote(method, quoteId)
  );
}
