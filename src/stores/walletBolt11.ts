import { currentDateStr } from "src/js/utils";
import { useMintsStore, WalletProof } from "./mints";
import { useProofsStore } from "./proofs";
import { useUiStore } from "src/stores/ui";
import { useSettingsStore } from "src/stores/settings";
import { useWorkersStore } from "./workers";
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
import * as bolt11Decoder from "light-bolt11-decoder";
import * as _ from "underscore";
import { date } from "quasar";
import { notifyWarning } from "src/js/notify";


let isUnloading = false;
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    isUnloading = true;
  });
}

// These actions are implemented as regular functions that rely on dynamic `this`
// when attached to the Pinia store (wallet.ts assigns them to actions).
// Do not convert to arrow functions or `this` will be lost.

export async function requestMintBolt11(
  this: any,
  amount: number,
  mintWallet: CashuWallet
): Promise<MintQuoteResponse> {
  try {
    const { supported: nut20supported } = (
      await mintWallet.lazyGetMintInfo()
    ).isSupported(20);
    const privkey = nut20supported
      ? bytesToHex(nobleSecp256k1.utils.randomPrivateKey())
      : undefined;
    const pubkey = nut20supported
      ? bytesToHex(nobleSecp256k1.getPublicKey(privkey!!, true))
      : undefined;
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
    notifyApiError(
      error,
      this.t("wallet.notifications.could_not_request_mint")
    );
    throw error;
  } finally {
  }
}

export async function mintBolt11(
  this: any,
  invoice: InvoiceHistory,
  verbose: boolean = true
) {
  const proofsStore = useProofsStore();
  const mintStore = useMintsStore();
  const uIStore = useUiStore();
  const keysetId = this.getKeyset(invoice.mint, invoice.unit);
  const mintWallet = await this.mintWallet(invoice.mint, invoice.unit, true);
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
    const proofs = await mintWallet.mintProofs(
      invoice.amount,
      invoice.mintQuote!!,
      {
        keysetId,
        counter,
        proofsWeHave: mintStore.mintUnitProofs(mint, invoice.unit),
        privateKey: invoice.privKey as string,
      }
    );
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

export async function meltQuoteBolt11(
  this: any,
  wallet: CashuWallet,
  request: string,
  mpp_amount: number | undefined = undefined
): Promise<MeltQuoteResponse> {
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
  if (
    this.invoiceHistory.find(
      (i: InvoiceHistory) =>
        i.bolt11 === request && i.amount < 0 && i.status === "paid"
    )
  ) {
    notifyError("Invoice already paid.");
    throw new Error("invoice already paid.");
  }

  const mintStore = useMintsStore();
  const mintWallet = this.mintWallet(
    mintStore.activeMintUrl,
    mintStore.activeUnit
  );
  return await this.meltBolt11(mintStore.activeProofs, quote, mintWallet);
}

export async function meltBolt11(
  this: any,
  proofs: WalletProof[],
  quote: MeltQuoteResponse,
  mintWallet: CashuWallet,
  silent?: boolean
) {
  const uIStore = useUiStore();
  // Ensure UI shows paying state for the whole payment lifecycle
  this.payInvoiceData.paying = true;

  const proofsStore = useProofsStore();
  console.log("#### meltBolt11()");
  const amount = quote.amount + quote.fee_reserve;
  let countChangeOutputs = 0;
  const keysetId = this.getKeyset(mintWallet.mint.mintUrl, mintWallet.unit);
  let keysetCounterIncrease = 0;

  // start melt
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
    await this.addOutgoingPendingInvoiceToHistoryBolt11(
      quote,
      mintWallet.mint.mintUrl,
      mintWallet.unit
    );
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
      data = await mintWallet.meltProofs(quote, sendProofs, {
        keysetId,
        counter,
      });
      // store melt quote in invoice history
      this.updateOutgoingInvoiceInHistoryBolt11(data.quote as MeltQuoteResponse);
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

    this.updateOutgoingInvoiceInHistoryBolt11(quote, {
      status: "paid",
      amount: -amount_paid,
    });

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
    const meltQuote = await mintWallet.mint.checkMeltQuote(quote.quote);
    // store melt quote in invoice history
    this.updateOutgoingInvoiceInHistoryBolt11(meltQuote as MeltQuoteResponse);

    if (
      meltQuote.state == MeltQuoteState.PAID ||
      meltQuote.state == MeltQuoteState.PENDING
    ) {
      console.log(
        "### meltBolt11: error, but quote is paid or pending. not rolling back."
      );
      this.payInvoiceData.show = false;
      notify(this.t("wallet.notifications.payment_pending_refresh"));
      throw error;
    }
    // roll back proof management and keyset counter
    await proofsStore.setReserved(sendProofs, false);
    this.increaseKeysetCounter(keysetId, -keysetCounterIncrease);
    this.removeOutgoingInvoiceFromHistoryBolt11(quote.quote);

    console.error(error);
    this.handleOutputsHaveAlreadyBeenSignedError(keysetId, error);
    if (!silent) notifyApiError(error, "Payment failed");
    throw error;
  } finally {
    // Always clear paying and unlock the mutex at the end
    this.payInvoiceData.paying = false;
    uIStore.unlockMutex();
  }
}

export async function checkInvoiceBolt11(
  this: any,
  quote: string,
  verbose = true,
  hideInvoiceDetailsOnMint = true
) {
  const uIStore = useUiStore();
  uIStore.triggerActivityOrb();
  const mintStore = useMintsStore();
  const invoice = this.invoiceHistory.find(
    (i: InvoiceHistory) => i.quote === quote
  );
  if (!invoice) {
    throw new Error("invoice not found");
  }
  const mintWallet = this.mintWallet(invoice.mint, invoice.unit);
  const mint = mintStore.mints.find((m: any) => m.url === invoice.mint);
  if (!mint) {
    throw new Error("mint not found");
  }
  try {
    // check the state first
    const state = (await mintWallet.checkMintQuote(quote)).state;
    if (state == MintQuoteState.ISSUED) {
      this.setInvoicePaid(quote);
      return;
    }
    if (state != MintQuoteState.PAID) {
      console.log("### mintQuote not paid yet");
      if (verbose) {
        notify(this.t("wallet.notifications.invoice_still_pending"));
      }
      throw new Error(`invoice state not paid: ${state}`);
    }
    const proofs = await this.mintBolt11(invoice, verbose);
    if (hideInvoiceDetailsOnMint) {
      uIStore.showInvoiceDetails = false;
    }
    useUiStore().vibrate();
    notifySuccess(
      this.t("wallet.notifications.received_lightning", {
        amount: uIStore.formatCurrency(invoice.amount, invoice.unit),
      })
    );
    return proofs;
  } catch (error) {
    console.log("Invoice still pending", invoice.quote);
    throw error;
  }
}

export async function checkOutgoingInvoiceBolt11(
  this: any,
  quote: string,
  verbose = true
) {
  const uIStore = useUiStore();
  const mintStore = useMintsStore();
  const invoice = this.invoiceHistory.find(
    (i: InvoiceHistory) => i.quote === quote
  );
  if (!invoice) {
    throw new Error("invoice not found");
  }
  const mintWallet = this.mintWallet(invoice.mint, invoice.unit);
  const mint = mintStore.mints.find((m: any) => m.url === invoice.mint);
  if (!mint) {
    throw new Error("mint not found");
  }
  const proofs: Proof[] = await useProofsStore().getProofsForQuote(quote);
  try {
    // this is an outgoing invoice, we first do a getMintQuote to check if the invoice is paid
    const meltQuote = await mintWallet.mint.checkMeltQuote(quote);
    this.updateOutgoingInvoiceInHistoryBolt11(meltQuote as MeltQuoteResponse);
    if (meltQuote.state == MeltQuoteState.PENDING) {
      console.log("### mintQuote not paid yet");
      if (verbose) {
        notify(this.t("wallet.notifications.invoice_still_pending"));
      }
      throw new Error("invoice not paid yet.");
    } else if (meltQuote.state == MeltQuoteState.UNPAID) {
      // we assume that the payment failed and we unset the proofs as reserved
      await useProofsStore().setReserved(proofs, false);
      this.removeOutgoingInvoiceFromHistoryBolt11(quote);
      notifyWarning(this.t("wallet.notifications.lightning_payment_failed"));
    } else if (meltQuote.state == MeltQuoteState.PAID) {
      // if the invoice is paid, we check if all proofs are spent and if so, we invalidate them and set the invoice state in the history to "paid"
      const spentProofs = await this.checkProofsSpendable(
        proofs,
        mintWallet,
        true
      );
      if (spentProofs != undefined && spentProofs.length == proofs.length) {
        useUiStore().vibrate();
        notifySuccess(
          this.t("wallet.notifications.sent", {
            amount: uIStore.formatCurrency(
              useProofsStore().sumProofs(proofs),
              invoice.unit
            ),
          })
        );
      }
      // set invoice in history to paid
      this.setInvoicePaid(quote);
    }
  } catch (error: any) {
    if (verbose) {
      notifyApiError(error);
    }
    console.log("Could not check quote", invoice.quote, error);
    throw error;
  }
}

export async function mintOnPaidBolt11(
  this: any,
  quote: string,
  verbose = true,
  kickOffInvoiceChecker = true,
  hideInvoiceDetailsOnMint = true
) {
  const mintStore = useMintsStore();
  const settingsStore = useSettingsStore();
  if (!settingsStore.checkIncomingInvoices) {
    console.log(
      "settingsStore.checkIncomingInvoices is disabled, skipping invoice check"
    );
    return;
  }
  const invoice = this.invoiceHistory.find(
    (i: InvoiceHistory) => i.quote === quote
  );
  if (!invoice) {
    throw new Error("invoice not found");
  }
  const mintWallet = this.mintWallet(invoice.mint, invoice.unit);
  const mint = mintStore.mints.find((m: any) => m.url === invoice.mint);

  if (!mint) {
    throw new Error("mint not found");
  }
  // add to checker before we try a websocket
  if (kickOffInvoiceChecker) {
    if (useSettingsStore().periodicallyCheckIncomingInvoices) {
      console.log(`Adding quote ${quote} to long-polling checker.`);
      useInvoicesWorkerStore().addInvoiceToChecker(quote);
    } else if (useSettingsStore().checkIncomingInvoices) {
      console.log(`Adding quote ${quote} to old worker checker.`);
      useWorkersStore().invoiceCheckWorker(quote);
    }
  }

  if (
    !settingsStore.useWebsockets ||
    !mint.info?.nuts[17]?.supported ||
    !mint.info?.nuts[17]?.supported.find(
      (s: any) =>
        s.method == "bolt11" &&
        s.unit == invoice.unit &&
        s.commands.indexOf("bolt11_mint_quote") != -1
    )
  ) {
    console.log("Websockets not supported.");
    return;
  }
  const uIStore = useUiStore();
  try {
    this.activeWebsocketConnections++;
    uIStore.triggerActivityOrb();
    const unsub = await mintWallet.onMintQuotePaid(
      quote,
      async (mintQuoteResponse: MintQuoteResponse) => {
        console.log("Websocket: mint quote paid.");
        let proofs;
        try {
          proofs = await this.mintBolt11(invoice, false);
        } catch (error: any) {
          console.error(error);
          // notifyApiError(error);
          throw error;
        }

        if (hideInvoiceDetailsOnMint) {
          uIStore.showInvoiceDetails = false;
        }
        useUiStore().vibrate();
        notifySuccess(
          this.t("wallet.notifications.received_lightning", {
            amount: uIStore.formatCurrency(invoice.amount, invoice.unit),
          })
        );
        unsub();
        return proofs;
      },
      async (error: any) => {
        if (verbose) {
          notifyApiError(error);
        }
        console.log("Invoice still pending", invoice.quote);
        throw error;
      }
    );
  } catch (error) {
    console.log("Error in websocket subscription", error);
  } finally {
    this.activeWebsocketConnections--;
  }
}

export async function addOutgoingPendingInvoiceToHistoryBolt11(
  this: any,
  quote: MeltQuoteResponse,
  mint: string,
  unit: string
) {
  this.invoiceHistory.push({
    amount: -(quote.amount + quote.fee_reserve),
    bolt11: this.payInvoiceData.input.request,
    quote: quote.quote,
    memo: "Outgoing invoice",
    date: currentDateStr(),
    status: "pending",
    mint: mint,
    unit: unit,
    meltQuote: quote,
  });
}

export function removeOutgoingInvoiceFromHistoryBolt11(
  this: any,
  quote: string
) {
  const index = this.invoiceHistory.findIndex(
    (i: InvoiceHistory) => i.quote === quote
  );
  if (index >= 0) {
    this.invoiceHistory.splice(index, 1);
  }
}

export function updateOutgoingInvoiceInHistoryBolt11(
  this: any,
  quote: MeltQuoteResponse,
  options?: { status?: "pending" | "paid"; amount?: number }
) {
  this.invoiceHistory
    .filter((i: InvoiceHistory) => i.quote === quote.quote)
    .forEach((i: InvoiceHistory) => {
      if (options) {
        if (options.status) {
          i.status = options.status;
          if (options.status === "paid") {
            i.paidDate = currentDateStr();
          }
        }
        if (options.amount) {
          i.amount = options.amount;
        }
        i.meltQuote = quote;
      }
    });
}

export async function handleBolt11InvoiceBolt11(this: any) {
  this.payInvoiceData.show = true;
  let invoice;
  try {
    invoice = bolt11Decoder.decode(this.payInvoiceData.input.request);
  } catch (error) {
    notifyWarning(
      this.t("wallet.notifications.failed_to_decode_invoice"),
      undefined,
      3000
    );
    this.payInvoiceData.show = false;
    throw error;
  }
  let cleanInvoice = {
    bolt11: invoice.paymentRequest,
    memo: "",
    msat: 0,
    sat: 0,
    fsat: 0,
    hash: "",
    description: "",
    timestamp: 0,
    expireDate: "",
    expired: false,
  };
  _.each(invoice.sections, (tag: any) => {
    if (_.isObject(tag) && _.has(tag, "name")) {
      if (tag.name === "amount") {
        cleanInvoice.msat = parseInt(tag.value, 10);
        cleanInvoice.sat = parseInt(tag.value, 10) / 1000;
        cleanInvoice.fsat = cleanInvoice.sat;
      } else if (tag.name === "payment_hash") {
        cleanInvoice.hash = tag.value;
      } else if (tag.name === "description") {
        cleanInvoice.description = tag.value;
      } else if (tag.name === "timestamp") {
        cleanInvoice.timestamp = tag.value;
      } else if (tag.name === "expiry") {
        var expireDate = new Date((cleanInvoice.timestamp + tag.value) * 1000);
        cleanInvoice.expireDate = date.formatDate(
          expireDate,
          "YYYY-MM-DDTHH:mm:ss.SSSZ"
        );
        cleanInvoice.expired = false; // TODO
      }
    }
  });

  this.payInvoiceData.invoice = Object.freeze(cleanInvoice);
  // get quote for this request
  await this.meltQuoteInvoiceDataBolt11();
}
