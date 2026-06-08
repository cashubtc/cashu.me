import { currentDateStr } from "src/js/utils";
import { useMintsStore, WalletProof } from "./mints";
import { useProofsStore } from "./proofs";
import { useUiStore } from "src/stores/ui";
import {
  Amount,
  Wallet,
  MeltQuoteBolt11Request,
  MintQuoteBolt11Response,
  MintQuoteState,
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
import { PaymentMethod } from "src/stores/walletTypes";
import { ensurePaymentMethodMintActive } from "src/js/mint-payment-methods";
import { type AppMeltQuote, normalizeMeltQuote } from "./walletMelt";

// These actions are implemented as regular functions that rely on dynamic `this`
// when attached to the Pinia store (wallet.ts assigns them to actions).
// Do not convert to arrow functions or `this` will be lost.

import { mintOnPaidGeneric } from "./walletWebsocket";

type AppMintQuote = Omit<MintQuoteBolt11Response, "amount"> & {
  amount: number;
};

function amountToNumber(value: any): number {
  return Amount.from(value).toNumber();
}

function normalizeMintQuote(quote: MintQuoteBolt11Response): AppMintQuote {
  return { ...quote, amount: amountToNumber(quote.amount) };
}

export async function requestMintBolt11(
  this: any,
  amount: number,
  mintWallet: Wallet
): Promise<MintQuoteBolt11Response> {
  try {
    await mintWallet.loadMint();
    const { supported: nut20supported } = mintWallet
      .getMintInfo()
      .isSupported(20);
    const privkey = nut20supported
      ? bytesToHex(nobleSecp256k1.utils.randomPrivateKey())
      : undefined;
    const pubkey = nut20supported
      ? bytesToHex(nobleSecp256k1.getPublicKey(privkey!!, true))
      : undefined;
    const data = pubkey
      ? await mintWallet.createLockedMintQuote(amount, pubkey)
      : await mintWallet.createMintQuoteBolt11(amount);
    this.invoiceData.amount = amount;
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
    });
    return data;
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
    const mintQuote = await mintWallet.checkMintQuoteBolt11(invoice.quote);
    invoice.mintQuote = normalizeMintQuote(mintQuote);
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
    const proofs = await this.retryOnceOnSignedOutputs(keysetId, async () =>
      mintWallet.ops
        .mintBolt11(invoice.amount, invoice.quote)
        .keyset(keysetId)
        .asDeterministic()
        .proofsWeHave(mintStore.mintUnitProofs(mint, invoice.unit))
        .privkey(invoice.privKey as string)
        .run()
    );
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
    throw error;
  } finally {
    uIStore.unlockMutex();
  }
}

export async function meltQuoteInvoiceDataBolt11(this: any) {
  // choose active wallet with active mint and unit
  const mintWallet: Wallet = await this.activeWallet();
  // throw an error if this.payInvoiceData.blocking is true
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
    if (this.payInvoiceData.input.request == "") {
      throw new Error("no invoice provided.");
    }
    const payload: MeltQuoteBolt11Request = {
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
  wallet: Wallet,
  request: string,
  mpp_amount: number | undefined = undefined
): Promise<AppMeltQuote> {
  const mintStore = useMintsStore();
  let data;
  if (mpp_amount) {
    data = await wallet.createMultiPathMeltQuote(request, mpp_amount * 1000);
  } else {
    data = await wallet.createMeltQuoteBolt11(request);
  }

  mintStore.assertMintError(data);
  return normalizeMeltQuote(data);
}

export async function meltInvoiceDataBolt11(this: any) {
  if (this.payInvoiceData.invoice == null) {
    throw new Error("no invoice provided.");
  }
  const quote: AppMeltQuote = this.payInvoiceData.meltQuote.response;
  if (quote == null) {
    throw new Error("no quote found.");
  }
  const request = this.payInvoiceData.invoice.request;
  if (
    this.invoiceHistory.find(
      (i: InvoiceHistory) =>
        i.request === request && i.amount < 0 && i.status === "paid"
    )
  ) {
    notifyError("Invoice already paid.");
    throw new Error("invoice already paid.");
  }

  const mintStore = useMintsStore();
  const mintWallet = await this.mintWallet(
    mintStore.activeMintUrl,
    mintStore.activeUnit,
    true
  );
  return await this.meltBolt11(mintStore.activeProofs, quote, mintWallet);
}

export async function meltBolt11(
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
    (id: string) => mintWallet.mint.checkMeltQuoteBolt11(id),
    PaymentMethod.Bolt11
  );
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
  const mintWallet = await this.mintWallet(invoice.mint, invoice.unit);
  const mint = mintStore.mints.find((m: any) => m.url === invoice.mint);
  if (!mint) {
    throw new Error("mint not found");
  }
  try {
    // check the state first
    const state = (await mintWallet.checkMintQuoteBolt11(quote)).state;
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
  return this.checkOutgoingInvoiceGeneric(
    quote,
    verbose,
    (wallet: Wallet, quoteId: string) =>
      wallet.mint.checkMeltQuoteBolt11(quoteId)
  );
}

export async function mintOnPaidBolt11(
  this: any,
  quote: string,
  verbose = true,
  kickOffInvoiceChecker = true,
  hideInvoiceDetailsOnMint = true
) {
  return await mintOnPaidGeneric.call(this, quote, {
    type: PaymentMethod.Bolt11,
    verbose,
    kickOffInvoiceChecker,
    hideInvoiceDetailsOnMint,
  });
}

export async function handleBolt11InvoiceBolt11(this: any) {
  const mintStore = useMintsStore();
  this.payInvoiceData.show = true;
  this.payInvoiceData.meltQuote.error = "";
  this.payInvoiceData.meltQuote.response = {
    quote: "",
    amount: 0,
    fee_reserve: 0,
  };
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
  const cleanInvoice = {
    request: invoice.paymentRequest,
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
        const expireDate = new Date(
          (cleanInvoice.timestamp + tag.value) * 1000
        );
        cleanInvoice.expireDate = date.formatDate(
          expireDate,
          "YYYY-MM-DDTHH:mm:ss.SSSZ"
        );
        cleanInvoice.expired = false; // TODO
      }
    }
  });

  const mintResult = await ensurePaymentMethodMintActive(
    mintStore.mints,
    mintStore.activeMintUrl,
    mintStore.selectMintUrl.bind(mintStore),
    PaymentMethod.Bolt11,
    "mint",
    mintStore.activeUnit
  );
  if (!mintResult.ok) {
    this.payInvoiceData.meltQuote.error = this.t(mintResult.errorKey);
    this.payInvoiceData.invoice = Object.freeze(cleanInvoice);
    return;
  }

  this.payInvoiceData.invoice = Object.freeze(cleanInvoice);
  // get quote for this request
  await this.meltQuoteInvoiceDataBolt11();
}
