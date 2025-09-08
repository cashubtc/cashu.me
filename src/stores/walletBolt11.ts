import { currentDateStr } from "src/js/utils";
import { useMintsStore, WalletProof } from "./mints";
import { useProofsStore } from "./proofs";
import { useUiStore } from "src/stores/ui";
import {
  CashuWallet,
  MintQuotePayload,
  MeltQuotePayload,
  MeltQuoteResponse,
  MintQuoteResponse,
  MeltQuoteState,
  MintQuoteState,
  Proof,
} from "@cashu/cashu-ts";
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

let isUnloading = false;
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    isUnloading = true;
  });
}

// These actions are implemented as regular functions that rely on dynamic `this`
// when attached to the Pinia store (wallet.ts assigns them to actions).
// Do not convert to arrow functions or `this` will be lost.

export async function requestMintBolt11(this: any, amount: number, mintWallet: CashuWallet): Promise<MintQuoteResponse> {
  try {
    const { supported: nut20supported } = (await mintWallet.lazyGetMintInfo()).isSupported(20);
    const privkey = nut20supported ? bytesToHex(nobleSecp256k1.utils.randomPrivateKey()) : undefined;
    const pubkey = nut20supported ? bytesToHex(nobleSecp256k1.getPublicKey(privkey!!, true)) : undefined;
    const payload: MintQuotePayload = {
      amount: amount,
      unit: mintWallet.unit,
      pubkey: pubkey,
    };
    const data = await mintWallet.mint.createMintQuote(payload);
    this.invoiceData.amount = amount;
    this.invoiceData.bolt11 = data.request;
    this.invoiceData.quote = data.quote;
    this.invoiceData.date = currentDateStr();
    this.invoiceData.status = "pending";
    this.invoiceData.mint = mintWallet.mint.mintUrl;
    this.invoiceData.unit = mintWallet.unit;
    this.invoiceData.mintQuote = data as MintQuoteResponse;
    this.invoiceData.privKey = privkey;
    this.invoiceHistory.push({
      ...this.invoiceData,
    });
    return data as MintQuoteResponse;
  } catch (error: any) {
    console.error(error);
    notifyApiError(error, this.t("wallet.notifications.could_not_request_mint"));
    throw error;
  } finally {
  }
}

export async function mintBolt11(this: any, invoice: InvoiceHistory, verbose: boolean = true) {
  const proofsStore = useProofsStore();
  const mintStore = useMintsStore();
  const uIStore = useUiStore();
  const keysetId = this.getKeyset(invoice.mint, invoice.unit);
  const mintWallet = this.mintWallet(invoice.mint, invoice.unit);
  const mint = mintStore.mints.find((m: any) => m.url === invoice.mint);
  if (!mint) {
    throw new Error("mint not found");
  }

  await uIStore.lockMutex();
  try {
    // first we check if the mint quote is paid
    const mintQuote = await mintWallet.checkMintQuote(invoice.quote);
    invoice.mintQuote = mintQuote as MintQuoteResponse;
    console.log("### mintBolt11(): mintQuote", mintQuote);
    switch (mintQuote.state) {
      case MintQuoteState.PAID:
        break;
      case MintQuoteState.UNPAID:
        if (verbose) {
          notify(this.t("wallet.notifications.invoice_still_pending"));
        }
        throw new Error("invoice pending.");
      case MintQuoteState.ISSUED:
        throw new Error("invoice already issued.");
      default:
        throw new Error("unknown state.");
    }
    // MintQuoteState must be PAID
    const counter = this.keysetCounter(keysetId);
    const proofs = await mintWallet.mintProofs(invoice.amount, invoice.mintQuote!!, {
      keysetId,
      counter,
      proofsWeHave: mintStore.mintUnitProofs(mint, invoice.unit),
      privateKey: invoice.privKey,
    });
    this.increaseKeysetCounter(keysetId, proofs.length);
    await proofsStore.addProofs(proofs);

    // update UI
    this.setInvoicePaid(invoice.quote);
    useInvoicesWorkerStore().removeInvoiceFromChecker(invoice.quote);

    return proofs;
  } catch (error: any) {
    console.error(error);
    if (verbose) {
      notifyApiError(error);
    }
    this.handleOutputsHaveAlreadyBeenSignedError(keysetId, error);
    throw error;
  } finally {
    uIStore.unlockMutex();
  }
}

export async function meltQuoteInvoiceDataBolt11(this: any) {
  // choose active wallet with active mint and unit
  const mintWallet: CashuWallet = this.wallet;
  // throw an error if this.payInvoiceData.blocking is true
  if (this.payInvoiceData.blocking) {
    throw new Error("already processing an melt quote.");
  }
  this.payInvoiceData.blocking = true;
  this.payInvoiceData.meltQuote.error = "";
  try {
    const mintStore = useMintsStore();
    if (this.payInvoiceData.input.request == "") {
      throw new Error("no invoice provided.");
    }
    const payload: MeltQuotePayload = {
      unit: mintStore.activeUnit,
      request: this.payInvoiceData.input.request,
    };
    this.payInvoiceData.meltQuote.payload = payload;
    const data = await this.meltQuoteBolt11(mintWallet, payload.request);
    mintStore.assertMintError(data);
    this.payInvoiceData.meltQuote.response = data;
    return data;
  } catch (error: any) {
    this.payInvoiceData.meltQuote.error = error;
    console.error(error);
    notifyApiError(error);
    throw error;
  } finally {
    this.payInvoiceData.blocking = false;
  }
}

export async function meltQuoteBolt11(this: any, wallet: CashuWallet, request: string, mpp_amount: number | undefined = undefined): Promise<MeltQuoteResponse> {
  const mintStore = useMintsStore();
  let data;
  if (mpp_amount) {
    data = await wallet.createMultiPathMeltQuote(request, mpp_amount * 1000);
  } else {
    data = await wallet.createMeltQuote(request);
  }

  mintStore.assertMintError(data);
  return data;
}

export async function meltInvoiceDataBolt11(this: any) {
  if (this.payInvoiceData.invoice == null) {
    throw new Error("no invoice provided.");
  }
  const quote: MeltQuoteResponse = this.payInvoiceData.meltQuote.response;
  if (quote == null) {
    throw new Error("no quote found.");
  }
  const request = this.payInvoiceData.invoice.bolt11;
  if (this.invoiceHistory.find((i: InvoiceHistory) => i.bolt11 === request && i.amount < 0 && i.status === "paid")) {
    notifyError("Invoice already paid.");
    throw new Error("invoice already paid.");
  }

  const mintStore = useMintsStore();
  const mintWallet = this.mintWallet(mintStore.activeMintUrl, mintStore.activeUnit);
  return await this.meltBolt11(mintStore.activeProofs, quote, mintWallet);
}

export async function meltBolt11(this: any, proofs: WalletProof[], quote: MeltQuoteResponse, mintWallet: CashuWallet, silent?: boolean) {
  const uIStore = useUiStore();
  const proofsStore = useProofsStore();

  console.log("#### meltBolt11()");
  const amount = quote.amount + quote.fee_reserve;
  let countChangeOutputs = 0;
  const keysetId = this.getKeyset(mintWallet.mint.mintUrl, mintWallet.unit);
  let keysetCounterIncrease = 0;

  // start melt
  let sendProofs: Proof[] = [];
  try {
    const { keepProofs: keepProofs, sendProofs: _sendProofs } = await this.send(proofs, mintWallet, amount, false, true);
    sendProofs = _sendProofs;
    if (sendProofs.length == 0) {
      throw new Error("could not split proofs.");
    }
  } catch (error: any) {
    console.error(error);
    if (!silent) notifyApiError(error, "Payment failed");
    throw error;
  }

  await uIStore.lockMutex();
  try {
    await this.addOutgoingPendingInvoiceToHistory(quote, mintWallet.mint.mintUrl, mintWallet.unit);
    await proofsStore.setReserved(sendProofs, true, quote.quote);

    // NUT-08 blank outputs for change
    const counter = this.keysetCounter(keysetId);

    // QUIRK: we increase the keyset counter by sendProofs and the maximum number of possible change outputs
    // this way, in case the user exits the app before meltProofs is completed, the returned change outputs won't cause a "outputs already signed" error
    // if the payment fails, we decrease the counter again
    this.increaseKeysetCounter(keysetId, sendProofs.length);
    if (quote.fee_reserve > 0) {
      countChangeOutputs = Math.ceil(Math.log2(quote.fee_reserve)) || 1;
      this.increaseKeysetCounter(keysetId, countChangeOutputs);
      keysetCounterIncrease += countChangeOutputs;
    }

    uIStore.triggerActivityOrb();

    // NOTE: if the user exits the app while we're in the API call, JS will emit an error that we would catch below!
    // We have to handle that case in the catch block below
    uIStore.unlockMutex(); // Momentarely release the mutex (needed for concurrent melts)
    let data;
    try {
      data = await mintWallet.meltProofs(quote, sendProofs, { keysetId, counter });
    } catch (error) {
      throw error;
    } finally {
      await uIStore.lockMutex();
    }

    if (data.quote.state != MeltQuoteState.PAID) {
      throw new Error("Invoice not paid.");
    }

    // NUT-08 get change
    if (data.change != null) {
      const changeProofs = data.change;
      console.log("## Received change: " + proofsStore.sumProofs(changeProofs));
      await proofsStore.addProofs(changeProofs);
    }

    // delete spent tokens from db
    await proofsStore.removeProofs(sendProofs);

    let amount_paid = amount - proofsStore.sumProofs(data.change);
    useUiStore().vibrate();
    if (!silent) {
      notifySuccess(
        this.t("wallet.notifications.paid_lightning", {
          amount: uIStore.formatCurrency(amount_paid, mintWallet.unit),
        })
      );
    }
    console.log(`#### pay lightning: ${amount_paid} ${mintWallet.unit} paid`);

    this.updateOutgoingInvoiceInHistory(quote, { status: "paid", amount: -amount_paid });

    this.payInvoiceData.invoice = { sat: 0, memo: "", bolt11: "" };
    this.payInvoiceData.show = false;
    return data;
  } catch (error: any) {
    if (isUnloading) {
      // NOTE: An error is thrown when the user exits the app while the payment is in progress.
      // do not handle the error if the user exits the app
      throw error;
    }
    // get quote and check state
    const mintQuote = await mintWallet.mint.checkMeltQuote(quote.quote);
    if (mintQuote.state == MeltQuoteState.PAID || mintQuote.state == MeltQuoteState.PENDING) {
      console.log("### meltBolt11: error, but quote is paid or pending. not rolling back.");
      this.payInvoiceData.show = false;
      notify(this.t("wallet.notifications.payment_pending_refresh"));
      throw error;
    }
    // roll back proof management and keyset counter
    await proofsStore.setReserved(sendProofs, false);
    this.increaseKeysetCounter(keysetId, -keysetCounterIncrease);
    this.removeOutgoingInvoiceFromHistory(quote.quote);

    console.error(error);
    this.handleOutputsHaveAlreadyBeenSignedError(keysetId, error);
    if (!silent) notifyApiError(error, "Payment failed");
    throw error;
  } finally {
    uIStore.unlockMutex();
  }
}
