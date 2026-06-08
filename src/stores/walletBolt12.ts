import { currentDateStr } from "src/js/utils";
import { useMintsStore, WalletProof } from "./mints";
import { useProofsStore } from "./proofs";
import { useUiStore } from "src/stores/ui";
import { Amount, Wallet, MintQuoteBolt12Response } from "@cashu/cashu-ts";
import * as nobleSecp256k1 from "@noble/secp256k1";
import { bytesToHex } from "@noble/hashes/utils";
import { notifyApiError, notify, notifySuccess } from "src/js/notify";
import type { InvoiceHistory } from "./wallet";
import { useInvoicesWorkerStore } from "./invoicesWorker";
import { mintOnPaidGeneric } from "./walletWebsocket";
import { PaymentMethod } from "src/stores/walletTypes";
import { usePriceStore } from "./price";
import { type AppMeltQuote, normalizeMeltQuote } from "./walletMelt";
import { createSubpaymentHistoryQuote } from "src/js/invoice-history";

// BOLT12: reusable offers

type AppMintQuote = Omit<
  MintQuoteBolt12Response,
  "amount" | "amount_paid" | "amount_issued"
> & {
  amount: number | null;
  amount_paid: number;
  amount_issued: number;
};

function amountToNumber(value: any): number {
  return Amount.from(value).toNumber();
}

function normalizeMintQuote(quote: MintQuoteBolt12Response): AppMintQuote {
  const { amount, amount_paid, amount_issued, ...rest } = quote;
  return {
    ...rest,
    amount: amount === null ? null : amountToNumber(amount),
    amount_paid: amountToNumber(amount_paid),
    amount_issued: amountToNumber(amount_issued),
  };
}

export async function requestMintBolt12(
  this: any,
  amount: number | undefined,
  mintWallet: Wallet,
  description?: string
) {
  try {
    // Generate new keypair (required for Bolt12 quotes in cashu-ts)
    const privkey = bytesToHex(nobleSecp256k1.utils.randomPrivateKey());
    const pubkey = bytesToHex(nobleSecp256k1.getPublicKey(privkey, true));

    const data = await mintWallet.createMintQuoteBolt12(pubkey, {
      amount: amount || undefined,
      description,
    });

    // Store minimal invoice-like record for history and dialog usage
    this.invoiceData.amount = amount || 0;
    this.invoiceData.request = data.request;
    this.invoiceData.quote = data.quote;
    this.invoiceData.date = currentDateStr();
    this.invoiceData.status = "pending";
    this.invoiceData.mint = mintWallet.mint.mintUrl;
    this.invoiceData.unit = mintWallet.unit;
    this.invoiceData.mintQuote = normalizeMintQuote(data);
    this.invoiceData.privKey = privkey;

    this.invoiceHistory.push({
      ...this.invoiceData,
      label: "Lightning Bolt12",
      type: PaymentMethod.Bolt12,
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

export async function mintOnPaidBolt12(
  this: any,
  quote: string,
  verbose = true,
  kickOffInvoiceChecker = true,
  hideInvoiceDetailsOnMint = true
) {
  return await mintOnPaidGeneric.call(this, quote, {
    type: PaymentMethod.Bolt12,
    verbose,
    kickOffInvoiceChecker,
    hideInvoiceDetailsOnMint,
  });
}

export async function checkOfferAndMintBolt12(
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
  if (!invoice) throw new Error("offer not found");

  const mintWallet = await this.mintWallet(invoice.mint, invoice.unit);
  const keysetId = this.getKeyset(invoice.mint, invoice.unit);
  const mint = mintStore.mints.find((m: any) => m.url === invoice.mint);
  if (!mint) throw new Error("mint not found");

  await uIStore.lockMutex();
  try {
    uIStore.triggerActivityOrb();
    const updated = await mintWallet.checkMintQuoteBolt12(quoteId);

    const paid = amountToNumber(updated.amount_paid);
    const issued = amountToNumber(updated.amount_issued);
    const delta = paid - issued;
    // Nothing new to mint
    if (delta <= 0) {
      if (verbose) notify(this.t("wallet.notifications.invoice_still_pending"));
      throw new Error("no new funds to mint");
    }

    const proofs = await this.retryOnceOnSignedOutputs(keysetId, async () =>
      mintWallet.ops
        .mintBolt12(delta, updated)
        .keyset(keysetId)
        .asDeterministic()
        .proofsWeHave(mintStore.mintUnitProofs(mint, invoice.unit))
        .privkey(invoice.privKey)
        .run()
    );
    await proofsStore.addProofs(proofs);

    // Get the melt quote again with the mint so we can persist the updated state
    const meltQuoteAfterMint = await mintWallet.checkMintQuoteBolt12(quoteId);
    const normalizedMintQuote = normalizeMintQuote(meltQuoteAfterMint);
    invoice.mintQuote = normalizedMintQuote;

    if (invoice.status === "paid") {
      // If already paid, this is a reusable offer sub-payment.
      // Create a NEW history entry for this specific payment event.
      this.invoiceHistory.push({
        ...invoice,
        amount: delta,
        quote: createSubpaymentHistoryQuote(),
        parentQuote: invoice.quote,
        date: currentDateStr(),
        status: "paid",
        mintQuote: normalizedMintQuote,
        label: "Bolt12 Subpayment",
        type: PaymentMethod.Bolt12Subpayment,
      });
    } else {
      // First payment: update the original offer entry
      this.setInvoicePaid(invoice.quote, {
        amount: delta,
        mintQuote: normalizedMintQuote,
      });
    }

    if (hideInvoiceDetailsOnMint) {
      uIStore.showInvoiceDetails = false;
    }

    useUiStore().vibrate();
    notifySuccess(
      this.t("wallet.notifications.received_lightning", {
        amount: uIStore.formatCurrency(delta, invoice.unit),
      })
    );
    return proofs;
  } catch (error: any) {
    console.error(error);
    if (verbose) notifyApiError(error);
    this.handleOutputsHaveAlreadyBeenSignedError(keysetId, error);
    throw error;
  } finally {
    uIStore.unlockMutex();
  }
}

export async function meltQuoteInvoiceDataBolt12(this: any) {
  // choose active wallet with active mint and unit
  const mintWallet: Wallet = await this.activeWallet();
  if (this.payInvoiceData.blocking)
    throw new Error("already processing an melt quote.");
  this.payInvoiceData.blocking = true;
  this.payInvoiceData.meltQuote.error = "";
  this.payInvoiceData.meltQuote.response = {
    quote: "",
    amount: 0,
    fee_reserve: 0,
  };
  try {
    const mintStore = useMintsStore();
    const offer = this.payInvoiceData.invoice?.bolt12;
    if (!offer) throw new Error("no offer provided.");

    let amountMsat: number | undefined;
    if (this.payInvoiceData.invoice?.msat > 0) {
      // Fixed-amount offer: let mint read amount from offer (same as Bolt11).
      amountMsat = undefined;
    } else {
      const inputAmount = this.payInvoiceData.input.amount;
      if (!inputAmount || inputAmount <= 0) {
        throw new Error("no amount provided");
      }
      const unit = mintStore.activeUnit;
      if (unit === "msat") {
        amountMsat = inputAmount;
      } else if (unit === "sat") {
        amountMsat = inputAmount * 1000;
      } else {
        const price =
          usePriceStore().bitcoinPrices[unit] ?? usePriceStore().bitcoinPrice;
        if (!price) {
          throw new Error("no price data");
        }
        const satPrice = 1 / (price / 1e8);
        amountMsat = Math.floor(inputAmount * satPrice) * 1000;
      }
    }

    const data = await mintWallet.createMeltQuoteBolt12(offer, amountMsat);
    mintStore.assertMintError(data);
    const quote = normalizeMeltQuote(data);
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

export async function meltInvoiceDataBolt12(this: any) {
  if (!this.payInvoiceData.invoice) throw new Error("no invoice provided.");
  const quote: AppMeltQuote = this.payInvoiceData.meltQuote.response;
  if (!quote) throw new Error("no quote found.");
  const mintStore = useMintsStore();
  const mintWallet = await this.mintWallet(
    mintStore.activeMintUrl,
    mintStore.activeUnit,
    true
  );
  return await this.meltBolt12(mintStore.activeProofs, quote, mintWallet);
}

export async function meltBolt12(
  this: any,
  proofs: WalletProof[],
  quote: AppMeltQuote,
  mintWallet: Wallet,
  silent?: boolean
) {
  return this.meltGeneric(
    proofs,
    quote,
    mintWallet,
    silent,
    (id: string) => mintWallet.mint.checkMeltQuoteBolt12(id),
    PaymentMethod.Bolt12
  );
}

export async function checkOutgoingInvoiceBolt12(
  this: any,
  quote: string,
  verbose = true
) {
  return this.checkOutgoingInvoiceGeneric(
    quote,
    verbose,
    (wallet: Wallet, quoteId: string) =>
      wallet.mint.checkMeltQuoteBolt12(quoteId)
  );
}
