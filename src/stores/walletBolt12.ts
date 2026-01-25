import { currentDateStr } from "src/js/utils";
import { useMintsStore, WalletProof } from "./mints";
import { useProofsStore } from "./proofs";
import { useUiStore } from "src/stores/ui";
import { useWorkersStore } from "./workers";
import { CashuWallet, Proof, MeltQuoteResponse } from "@cashu/cashu-ts";
import * as nobleSecp256k1 from "@noble/secp256k1";
import { bytesToHex } from "@noble/hashes/utils";
import {
  notifyApiError,
  notify,
  notifySuccess,
  notifyError,
} from "src/js/notify";
import type { InvoiceHistory } from "./wallet";
import { useInvoicesWorkerStore } from "./invoicesWorker";

// BOLT12: reusable offers

export async function requestMintBolt12(
  this: any,
  amount: number | undefined,
  mintWallet: CashuWallet,
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
    // Store the offer string in bolt11 field for backward-compatible rendering where needed
    this.invoiceData.bolt11 = data.request;
    this.invoiceData.quote = data.quote;
    this.invoiceData.date = currentDateStr();
    this.invoiceData.status = "pending";
    this.invoiceData.mint = mintWallet.mint.mintUrl;
    this.invoiceData.unit = mintWallet.unit;
    // Keep the raw response and privkey on the history entry
    this.invoiceData.mintQuote = data as any;
    this.invoiceData.privKey = privkey;

    this.invoiceHistory.push({
      ...this.invoiceData,
      label: "Lightning Bolt12",
      type: "bolt12",
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

  try {
    uIStore.triggerActivityOrb();
    const updated = await mintWallet.checkMintQuoteBolt12(quoteId);

    const paid = updated.amount_paid || 0;
    const issued = updated.amount_issued || 0;
    const delta = paid - issued;
    // Nothing new to mint
    if (delta <= 0) {
      if (verbose) notify(this.t("wallet.notifications.invoice_still_pending"));
      throw new Error("no new funds to mint");
    }

    const keysetId = this.getKeyset(invoice.mint, invoice.unit);
    const counter = this.keysetCounter(keysetId);
    const mint = mintStore.mints.find((m: any) => m.url === invoice.mint);
    if (!mint) throw new Error("mint not found");
    const proofs = await mintWallet.mintProofsBolt12(
      delta,
      updated,
      invoice.privKey,
      {
        keysetId,
        counter,
        proofsWeHave: mintStore.mintUnitProofs(mint, invoice.unit),
      }
    );
    this.increaseKeysetCounter(keysetId, proofs.length);
    await proofsStore.addProofs(proofs);

    if (invoice.status === "paid") {
      // If already paid, this is a reusable offer sub-payment.
      // Create a NEW history entry for this specific payment event.
      this.invoiceHistory.push({
        ...invoice,
        amount: delta,
        quote: `${invoice.quote}_${Date.now()}`, // Unique ID for this event
        date: currentDateStr(),
        status: "paid",
        mintQuote: updated,
        label: "Bolt12 Subpayment",
        type: "bolt12-subpayment",
      });
      // Update the original offer with the latest mint state so next check uses correct baseline
      invoice.mintQuote = updated;
    } else {
      // First payment: update the original offer entry
      this.setInvoicePaid(invoice.quote, { amount: delta, mintQuote: updated });
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
    throw error;
  }
}

export async function meltQuoteInvoiceDataBolt12(this: any) {
  // choose active wallet with active mint and unit
  const mintWallet: CashuWallet = this.wallet;
  if (this.payInvoiceData.blocking)
    throw new Error("already processing an melt quote.");
  this.payInvoiceData.blocking = true;
  this.payInvoiceData.meltQuote.error = "";
  try {
    const mintStore = useMintsStore();
    const offer = this.payInvoiceData.invoice?.bolt12;
    if (!offer) throw new Error("no offer provided.");

    // amount msat for BOLT12
    const amountSat: number | undefined =
      this.payInvoiceData.invoice?.sat || this.payInvoiceData.input.amount;
    if (!amountSat || amountSat <= 0) {
      throw new Error("no amount provided");
    }
    const msat = amountSat * 1000;

    const data = await mintWallet.createMeltQuoteBolt12(offer, msat);
    mintStore.assertMintError(data);
    this.payInvoiceData.meltQuote.response = data as MeltQuoteResponse;
    return data as MeltQuoteResponse;
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
  const quote: MeltQuoteResponse = this.payInvoiceData.meltQuote.response;
  if (!quote) throw new Error("no quote found.");
  return await this.meltBolt12(
    useMintsStore().activeProofs,
    quote,
    this.wallet
  );
}

export async function meltBolt12(
  this: any,
  proofs: WalletProof[],
  quote: MeltQuoteResponse,
  mintWallet: CashuWallet,
  silent?: boolean
) {
  const uIStore = useUiStore();
  this.payInvoiceData.paying = true;
  const proofsStore = useProofsStore();
  const amount = quote.amount + quote.fee_reserve;
  let countChangeOutputs = 0;
  const keysetId = this.getKeyset(mintWallet.mint.mintUrl, mintWallet.unit);
  let keysetCounterIncrease = 0;

  let sendProofs: Proof[] = [];
  try {
    const { keepProofs: keepProofs, sendProofs: _sendProofs } = await this.send(
      proofs,
      mintWallet,
      amount,
      false,
      true
    );
    sendProofs = _sendProofs;
    if (sendProofs.length == 0) throw new Error("could not split proofs.");
  } catch (error: any) {
    console.error(error);
    if (!silent) notifyApiError(error, "Payment failed");
    throw error;
  }

  await uIStore.lockMutex();
  try {
    await this.addOutgoingPendingInvoiceToHistory(
      quote,
      mintWallet.mint.mintUrl,
      mintWallet.unit
    );
    await proofsStore.setReserved(sendProofs, true, quote.quote);

    const counter = this.keysetCounter(keysetId);
    this.increaseKeysetCounter(keysetId, sendProofs.length);
    if (quote.fee_reserve > 0) {
      countChangeOutputs = Math.ceil(Math.log2(quote.fee_reserve)) || 1;
      this.increaseKeysetCounter(keysetId, countChangeOutputs);
      keysetCounterIncrease += countChangeOutputs;
    }

    uIStore.triggerActivityOrb();

    uIStore.unlockMutex();
    let data;
    try {
      data = await mintWallet.meltProofsBolt12(quote as any, sendProofs, {
        keysetId,
        counter,
      });
    } catch (error) {
      throw error;
    } finally {
      await uIStore.lockMutex();
    }

    if (data.quote.state != ("PAID" as any)) {
      throw new Error("Invoice not paid.");
    }

    if (data.change != null) {
      const changeProofs = data.change;
      await proofsStore.addProofs(changeProofs);
    }

    await proofsStore.removeProofs(sendProofs);

    const amount_paid = amount - proofsStore.sumProofs(data.change);
    useUiStore().vibrate();
    if (!silent) {
      notifySuccess(
        this.t("wallet.notifications.paid_lightning", {
          amount: uIStore.formatCurrency(amount_paid, mintWallet.unit),
        })
      );
    }

    this.updateOutgoingInvoiceInHistory(quote, {
      status: "paid",
      amount: -amount_paid,
    });

    this.payInvoiceData.invoice = { sat: 0, memo: "", bolt11: "" };
    this.payInvoiceData.show = false;
    return data;
  } catch (error: any) {
    // rollback on failure if not paid/pending
    const mintQuote = await mintWallet.mint.checkMeltQuote(quote.quote);
    if (
      (mintQuote.state as any) === "PAID" ||
      (mintQuote.state as any) === "PENDING"
    ) {
      notify(this.t("wallet.notifications.payment_pending_refresh"));
      this.payInvoiceData.show = false;
      throw error;
    }
    await proofsStore.setReserved(sendProofs, false);
    this.increaseKeysetCounter(keysetId, -keysetCounterIncrease);
    this.removeOutgoingInvoiceFromHistory(quote.quote);
    console.error(error);
    this.handleOutputsHaveAlreadyBeenSignedError(keysetId, error);
    if (!silent) notifyApiError(error, "Payment failed");
    throw error;
  } finally {
    this.payInvoiceData.paying = false;
    uIStore.unlockMutex();
  }
}
