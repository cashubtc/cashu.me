import { currentDateStr } from "src/js/utils";
import { useMintsStore, WalletProof } from "./mints";
import { useProofsStore } from "./proofs";
import { useUiStore } from "src/stores/ui";
import {
  Amount,
  Wallet,
  MeltQuoteOnchainResponse,
  MintQuoteOnchainResponse,
  MeltQuoteState,
  OutputData,
} from "@cashu/cashu-ts";
import * as nobleSecp256k1 from "@noble/secp256k1";
import { bytesToHex } from "@noble/hashes/utils";
import { notifyApiError, notify, notifySuccess } from "src/js/notify";
import type { InvoiceHistory } from "./wallet";
import { LightningMethod } from "src/stores/walletTypes";
import { mintOnPaidGeneric } from "./walletWebsocket";
import { useInvoicesWorkerStore } from "./invoicesWorker";
import { onchainNetwork } from "src/js/onchain";

type AppMintQuote = Omit<
  MintQuoteOnchainResponse,
  "amount_paid" | "amount_issued"
> & {
  amount: null;
  amount_paid: number;
  amount_issued: number;
};

type AppOnchainFeeOption = Omit<
  MeltQuoteOnchainResponse["fee_options"][number],
  "fee_reserve"
> & {
  fee_reserve: number;
};

type AppMeltQuote = Omit<
  MeltQuoteOnchainResponse,
  "amount" | "change" | "fee_options"
> & {
  amount: number;
  fee_reserve: number;
  fee_paid?: number;
  fee_options: AppOnchainFeeOption[];
  payment_preimage: null;
  change?: any[];
};

function amountToNumber(value: any): number {
  return Amount.from(value).toNumber();
}

function normalizeMintQuote(quote: MintQuoteOnchainResponse): AppMintQuote {
  const { amount_paid, amount_issued, ...rest } = quote;
  return {
    ...rest,
    amount: null,
    amount_paid: amountToNumber(amount_paid),
    amount_issued: amountToNumber(amount_issued),
  };
}

function normalizeMeltQuote(quote: MeltQuoteOnchainResponse): AppMeltQuote {
  const { change, ...rest } = quote;
  const feeOptions = quote.fee_options.map((option) => ({
    ...option,
    fee_reserve: amountToNumber(option.fee_reserve),
  }));
  const selectedFeeOption =
    feeOptions.find(
      (option) => option.fee_index === quote.selected_fee_index
    ) || feeOptions[0];
  const normalized: AppMeltQuote = {
    ...rest,
    amount: amountToNumber(quote.amount),
    fee_reserve: selectedFeeOption?.fee_reserve || 0,
    fee_options: feeOptions,
    payment_preimage: null,
  };
  if (change) normalized.change = change;
  return normalized;
}

function toMeltQuote(quote: AppMeltQuote): MeltQuoteOnchainResponse {
  const { fee_reserve, payment_preimage, ...rest } = quote;
  void fee_reserve;
  void payment_preimage;
  return {
    ...rest,
    amount: Amount.from(quote.amount),
    fee_options: quote.fee_options.map((option) => ({
      ...option,
      fee_reserve: Amount.from(option.fee_reserve),
    })),
  };
}

export async function requestMintOnchain(this: any, mintWallet: Wallet) {
  try {
    const privkey = bytesToHex(nobleSecp256k1.utils.randomPrivateKey());
    const pubkey = bytesToHex(nobleSecp256k1.getPublicKey(privkey, true));
    const data = await mintWallet.createMintQuoteOnchain(pubkey);

    this.invoiceData.amount = 0;
    this.invoiceData.request = data.request;
    this.invoiceData.quote = data.quote;
    this.invoiceData.date = currentDateStr();
    this.invoiceData.status = "pending";
    this.invoiceData.mint = mintWallet.mint.mintUrl;
    this.invoiceData.unit = mintWallet.unit;
    this.invoiceData.mintQuote = normalizeMintQuote(data);
    this.invoiceData.privKey = privkey;
    this.invoiceData.type = LightningMethod.Onchain;
    this.invoiceData.network = onchainNetwork(data.request);

    this.invoiceHistory.push({
      ...this.invoiceData,
      label: "On-chain",
      type: LightningMethod.Onchain,
      network: onchainNetwork(data.request),
    });

    return data;
  } catch (error: any) {
    if (error?.message !== "Address not paid") {
      console.error(error);
    }
    notifyApiError(
      error,
      this.t("wallet.notifications.could_not_request_mint")
    );
    throw error;
  }
}

export async function mintOnPaidOnchain(
  this: any,
  quote: string,
  verbose = true,
  kickOffInvoiceChecker = true,
  hideInvoiceDetailsOnMint = true
) {
  return await mintOnPaidGeneric.call(this, quote, {
    type: LightningMethod.Onchain,
    verbose,
    kickOffInvoiceChecker,
    hideInvoiceDetailsOnMint,
  });
}

export async function checkOnchainAndMint(
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
  if (!invoice) throw new Error("on-chain quote not found");

  const mintWallet = await this.mintWallet(invoice.mint, invoice.unit);
  const keysetId = this.getKeyset(invoice.mint, invoice.unit);
  const mint = mintStore.mints.find((m: any) => m.url === invoice.mint);
  if (!mint) throw new Error("mint not found");
  if (!invoice.network) {
    invoice.network = onchainNetwork(invoice.request);
  }

  await uIStore.lockMutex();
  try {
    uIStore.triggerActivityOrb();
    const updated = await mintWallet.checkMintQuoteOnchain(quoteId);
    const paid = amountToNumber(updated.amount_paid);
    const issued = amountToNumber(updated.amount_issued);
    const delta = paid - issued;

    invoice.mintQuote = normalizeMintQuote(updated);
    if (this.invoiceData.quote === invoice.quote) {
      this.invoiceData.mintQuote = invoice.mintQuote;
    }

    if (delta <= 0) {
      throw new Error("Address not paid");
    }

    const proofs = await this.retryOnceOnSignedOutputs(keysetId, async () =>
      mintWallet.ops
        .mintOnchain(delta, updated)
        .keyset(keysetId)
        .asDeterministic()
        .proofsWeHave(mintStore.mintUnitProofs(mint, invoice.unit))
        .privkey(invoice.privKey)
        .run()
    );
    await proofsStore.addProofs(proofs);

    const mintQuoteAfterMint = await mintWallet.checkMintQuoteOnchain(quoteId);
    const normalizedMintQuote = normalizeMintQuote(mintQuoteAfterMint);
    this.setInvoicePaid(invoice.quote, {
      amount: delta,
      mintQuote: normalizedMintQuote,
    });
    useInvoicesWorkerStore().removeOnchainQuoteFromChecker(invoice.quote);

    if (hideInvoiceDetailsOnMint) {
      uIStore.showInvoiceDetails = false;
    }

    useUiStore().vibrate();
    notifySuccess(
      this.t("wallet.notifications.received", {
        amount: uIStore.formatCurrency(delta, invoice.unit),
      })
    );
    return proofs;
  } catch (error: any) {
    console.error(error);
    if (verbose) {
      if (error?.message === "Address not paid") {
        notify("Address not paid");
      } else {
        notifyApiError(error);
      }
    }
    this.handleOutputsHaveAlreadyBeenSignedError(keysetId, error);
    throw error;
  } finally {
    uIStore.unlockMutex();
  }
}

export async function meltQuoteInvoiceDataOnchain(this: any) {
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
    const address = this.payInvoiceData.invoice?.onchain;
    if (!address) throw new Error("no on-chain address provided.");
    const inputAmount = this.payInvoiceData.input.amount;
    if (!inputAmount || inputAmount <= 0) {
      throw new Error("no amount provided");
    }
    const amount = Math.floor(
      inputAmount * mintStore.activeUnitCurrencyMultiplyer
    );
    const data = await mintWallet.createMeltQuoteOnchain(address, amount);
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

export async function meltInvoiceDataOnchain(this: any) {
  if (!this.payInvoiceData.invoice) throw new Error("no address provided.");
  const quote: AppMeltQuote = this.payInvoiceData.meltQuote.response;
  if (!quote) throw new Error("no quote found.");
  const mintStore = useMintsStore();
  const mintWallet = await this.mintWallet(
    mintStore.activeMintUrl,
    mintStore.activeUnit,
    true
  );
  return await this.meltOnchain(mintStore.activeProofs, quote, mintWallet);
}

export async function meltOnchain(
  this: any,
  proofs: WalletProof[],
  quote: AppMeltQuote,
  mintWallet: Wallet,
  silent?: boolean
) {
  const feeIndex = quote.selected_fee_index ?? quote.fee_options[0]?.fee_index;
  if (feeIndex == null) {
    throw new Error("no on-chain fee option found");
  }
  return this.meltGeneric(
    proofs,
    quote,
    mintWallet,
    silent,
    (q, sp, opts) =>
      mintWallet.ops
        .meltOnchain(toMeltQuote(q as AppMeltQuote), sp)
        .keyset(opts.keysetId)
        .feeIndex(feeIndex)
        .run(),
    (id) => mintWallet.mint.checkMeltQuoteOnchain(id),
    LightningMethod.Onchain
  );
}

export async function checkOutgoingOnchain(
  this: any,
  quote: string,
  verbose = true
) {
  const uIStore = useUiStore();
  const proofsStore = useProofsStore();
  const invoice = this.invoiceHistory.find(
    (i: InvoiceHistory) => i.quote === quote
  );
  if (!invoice) {
    throw new Error("invoice not found");
  }
  const mintWallet = await this.mintWallet(invoice.mint, invoice.unit);
  const proofs = await proofsStore.getProofsForQuote(quote);
  try {
    const meltQuote = normalizeMeltQuote(
      await mintWallet.mint.checkMeltQuoteOnchain(quote)
    );
    this.updateOutgoingInvoiceInHistory(meltQuote);

    if (meltQuote.state === MeltQuoteState.PENDING) {
      if (verbose) notify("Payment pending");
      throw new Error("Payment pending");
    }

    if (meltQuote.state === MeltQuoteState.UNPAID) {
      await proofsStore.setReserved(proofs, false);
      this.removeOutgoingInvoiceFromHistory(quote);
      useInvoicesWorkerStore().removeOutgoingInvoiceFromChecker?.(quote);
      throw new Error("on-chain payment was not broadcast.");
    }

    if (meltQuote.state === MeltQuoteState.PAID) {
      let returnedChange = 0;
      if (invoice.meltOutputData?.length && meltQuote.change?.length) {
        const outputData = invoice.meltOutputData.map((output: any) =>
          OutputData.deserialize(output)
        );
        const changeProofs = mintWallet.createMeltChangeProofs(
          outputData,
          meltQuote.change
        );
        if (changeProofs.length) {
          await proofsStore.addProofs(changeProofs);
          returnedChange = proofsStore.sumProofs(changeProofs);
        }
        invoice.meltOutputData = [];
      }

      await proofsStore.removeProofs(proofs);
      const actualFee = Math.max(0, meltQuote.fee_reserve - returnedChange);
      meltQuote.fee_paid = actualFee;
      this.updateOutgoingInvoiceInHistory(meltQuote, {
        status: "paid",
        amount: -(meltQuote.amount + actualFee),
      });
      useUiStore().vibrate();
      notifySuccess(
        this.t("wallet.notifications.sent", {
          amount: uIStore.formatCurrency(
            meltQuote.amount + actualFee,
            invoice.unit
          ),
        })
      );
      useInvoicesWorkerStore().removeOutgoingInvoiceFromChecker?.(quote);
    }
  } catch (error: any) {
    if (verbose && error?.message !== "Payment pending") {
      notifyApiError(error);
    }
    console.log("Could not check on-chain quote", invoice.quote, error);
    throw error;
  }
}
