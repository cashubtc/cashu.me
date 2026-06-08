import {
  Amount,
  type CompleteMeltOptions,
  MeltQuoteBolt11Response,
  MeltQuoteBolt12Response,
  MeltQuoteOnchainResponse,
  MeltQuoteState,
  OutputData,
  type ProofLike,
  Wallet,
  type AmountLike,
} from "@cashu/cashu-ts";
import {
  notify,
  notifyApiError,
  notifySuccess,
  notifyWarning,
} from "src/js/notify";
import { useInvoicesWorkerStore } from "src/stores/invoicesWorker";
import { PaymentMethod } from "src/stores/walletTypes";
import { useMintsStore, WalletProof } from "./mints";
import { useProofsStore } from "./proofs";
import { useUiStore } from "src/stores/ui";

let isUnloading = false;
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    isUnloading = true;
  });
}

type AppOnchainFeeOption = {
  fee_index: number;
  fee_reserve: number;
  estimated_blocks: number;
};

export type AppMeltQuote = {
  quote: string;
  amount: number;
  fee_reserve: number;
  unit?: string;
  state?: MeltQuoteState;
  expiry?: number;
  request?: string;
  payment_preimage?: string | null;
  fee_paid?: number;
  fee_options?: AppOnchainFeeOption[];
  selected_fee_index?: number | null;
  outpoint?: string | null;
  change?: any[];
};

type CheckMeltQuoteFn = (quoteId: string) => Promise<
  {
    state: MeltQuoteState;
  } & (
    | MeltQuoteBolt11Response
    | MeltQuoteBolt12Response
    | MeltQuoteOnchainResponse
  )
>;

export type CheckOutgoingMeltQuoteFn = (
  wallet: Wallet,
  quoteId: string
) => Promise<
  MeltQuoteBolt11Response | MeltQuoteBolt12Response | MeltQuoteOnchainResponse
>;

const proofsStore = useProofsStore();

function amountToNumber(value: AmountLike | undefined): number {
  if (value === undefined) return 0;
  return Amount.from(value).toNumber();
}

export function normalizeMeltQuote(
  quote:
    | MeltQuoteBolt11Response
    | MeltQuoteBolt12Response
    | MeltQuoteOnchainResponse
): AppMeltQuote {
  const { change, ...rest } = quote as any;
  const normalized: AppMeltQuote = {
    ...(rest as any),
    amount: amountToNumber(quote.amount),
    fee_reserve:
      "fee_reserve" in quote
        ? amountToNumber(quote.fee_reserve)
        : amountToNumber(
            quote.fee_options.find(
              (option) => option.fee_index === quote.selected_fee_index
            )?.fee_reserve ?? quote.fee_options[0]?.fee_reserve
          ),
    payment_preimage:
      "payment_preimage" in quote ? quote.payment_preimage : null,
  };
  if (change) normalized.change = change;
  if ("fee_options" in quote) {
    normalized.fee_options = quote.fee_options.map((option) => ({
      ...option,
      fee_reserve: amountToNumber(option.fee_reserve),
    }));
    normalized.selected_fee_index = quote.selected_fee_index;
    normalized.outpoint = quote.outpoint;
  }
  return normalized;
}

function toMeltQuote(
  quote: AppMeltQuote
):
  | MeltQuoteBolt11Response
  | MeltQuoteBolt12Response
  | MeltQuoteOnchainResponse {
  const normalized = {
    ...quote,
    amount: Amount.from(quote.amount),
  } as any;
  if (quote.fee_options) {
    delete normalized.fee_reserve;
    delete normalized.payment_preimage;
    normalized.fee_options = quote.fee_options.map((option) => ({
      ...option,
      fee_reserve: Amount.from(option.fee_reserve),
    }));
    return normalized;
  }
  return {
    ...normalized,
    fee_reserve: Amount.from(quote.fee_reserve),
  };
}

export async function meltGeneric(
  this: any,
  proofs: WalletProof[],
  quote: AppMeltQuote,
  mintWallet: Wallet,
  silent: boolean | undefined,
  checkQuote: CheckMeltQuoteFn,
  method: PaymentMethod = PaymentMethod.Bolt11,
  completeMeltOptions?: CompleteMeltOptions
) {
  const uIStore = useUiStore();
  this.payInvoiceData.paying = true;
  const amount = quote.amount + quote.fee_reserve;
  const keysetId = this.getKeyset(mintWallet.mint.mintUrl, mintWallet.unit);

  let sendProofs: ProofLike[] = [];
  try {
    const { sendProofs: _sendProofs } = await this.send(
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
    await this.addOutgoingPendingInvoiceToHistory(
      quote,
      mintWallet.mint.mintUrl,
      mintWallet.unit,
      method
    );
    await proofsStore.setReserved(sendProofs, true, quote.quote);

    uIStore.triggerActivityOrb();

    uIStore.unlockMutex();
    let data;
    try {
      data = await this.retryOnceOnSignedOutputs(keysetId, async () => {
        const preparedQuote = toMeltQuote(quote);
        const preview = await mintWallet.prepareMelt(
          method,
          preparedQuote,
          sendProofs,
          { keysetId }
        );
        this.setMeltChangeOutputData(quote.quote, preview.outputData);
        return await mintWallet.completeMelt(
          preview,
          undefined,
          completeMeltOptions
        );
      });
      this.updateOutgoingInvoiceInHistory(normalizeMeltQuote(data.quote));
      if (data.outputData?.length) {
        this.setMeltChangeOutputData(quote.quote, data.outputData);
      }
    } catch (error) {
      throw error;
    } finally {
      await uIStore.lockMutex();
    }

    if (data.quote.state != MeltQuoteState.PAID) {
      throw new Error("Invoice not paid.");
    }

    if (data.change != null) {
      await proofsStore.addMissingProofs(data.change);
    }

    await proofsStore.removeProofs(sendProofs);

    const amount_paid = amount - proofsStore.sumProofs(data.change ?? []);
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
    this.clearMeltChangeOutputData(quote.quote);

    this.payInvoiceData.invoice = { sat: 0, memo: "", request: "" };
    this.payInvoiceData.show = false;
    return data;
  } catch (error: any) {
    if (isUnloading) {
      throw error;
    }
    const meltQuote = normalizeMeltQuote(await checkQuote(quote.quote));
    this.updateOutgoingInvoiceInHistory(meltQuote);

    if (
      meltQuote.state == MeltQuoteState.PAID ||
      meltQuote.state == MeltQuoteState.PENDING
    ) {
      if (meltQuote.state == MeltQuoteState.PENDING) {
        this.payInvoiceData.meltQuote.error = this.t(
          "wallet.notifications.payment_pending_refresh"
        );
      }
      this.payInvoiceData.show = false;
      notify(this.t("wallet.notifications.payment_pending_refresh"));
      throw error;
    }
    await proofsStore.setReserved(sendProofs, false);
    this.removeOutgoingInvoiceFromHistory(quote.quote);
    console.error(error);
    if (!silent) notifyApiError(error, "Payment failed");
    throw error;
  } finally {
    this.payInvoiceData.paying = false;
    uIStore.unlockMutex();
  }
}

export async function checkOutgoingInvoiceGeneric(
  this: any,
  quote: string,
  verbose = true,
  checkQuote: CheckOutgoingMeltQuoteFn
) {
  const uIStore = useUiStore();
  const mintStore = useMintsStore();
  const invoice = this.invoiceHistory.find((i: any) => i.quote === quote);
  if (!invoice) {
    throw new Error("invoice not found");
  }
  const mintWallet = await this.mintWallet(invoice.mint, invoice.unit);
  const mint = mintStore.mints.find((m: any) => m.url === invoice.mint);
  if (!mint) {
    throw new Error("mint not found");
  }
  const proofs = await proofsStore.getProofsForQuote(quote);
  try {
    const meltQuote = normalizeMeltQuote(await checkQuote(mintWallet, quote));
    this.updateOutgoingInvoiceInHistory(meltQuote);
    if (meltQuote.state == MeltQuoteState.PENDING) {
      console.log("### mintQuote not paid yet");
      if (verbose) {
        notify(this.t("wallet.notifications.invoice_still_pending"));
      }
      throw new Error("invoice not paid yet.");
    } else if (meltQuote.state == MeltQuoteState.UNPAID) {
      await useProofsStore().setReserved(proofs, false);
      this.removeOutgoingInvoiceFromHistory(quote);
      useInvoicesWorkerStore().removeOutgoingInvoiceFromChecker?.(quote);
      notifyWarning(this.t("wallet.notifications.lightning_payment_failed"));
    } else if (meltQuote.state == MeltQuoteState.PAID) {
      const finalizeData = await this.finalizePaidMeltInvoice(
        quote,
        mintWallet,
        meltQuote,
        proofs,
        true
      );
      if (finalizeData.spentProofs?.length == proofs.length) {
        useUiStore().vibrate();
        notifySuccess(
          this.t("wallet.notifications.sent", {
            amount: uIStore.formatCurrency(
              finalizeData.amountPaid,
              invoice.unit
            ),
          })
        );
      }
      useInvoicesWorkerStore().removeOutgoingInvoiceFromChecker?.(quote);
    }
  } catch (error: any) {
    if (verbose) {
      notifyApiError(error);
    }
    console.log("Could not check quote", invoice.quote, error);
    throw error;
  }
}

export async function finalizePaidMeltInvoice(
  this: any,
  quote: string,
  mintWallet: Wallet,
  meltQuote: AppMeltQuote,
  proofs: WalletProof[],
  checkSpentProofs = true
) {
  const invoice = this.invoiceHistory.find((i: any) => i.quote === quote);
  if (!invoice) throw new Error("invoice not found");

  let returnedChange = 0;
  if (meltQuote.change?.length) {
    const outputDataRecords =
      invoice.meltChangeOutputData ?? invoice.meltOutputData;
    if (!outputDataRecords?.length) {
      throw new Error("missing melt change recovery data");
    }
    const outputData = outputDataRecords.map((output: any) =>
      OutputData.deserialize(output)
    );
    const changeProofs = mintWallet.createMeltChangeProofs(
      outputData,
      meltQuote.change
    );
    if (changeProofs.length) {
      await proofsStore.addMissingProofs(changeProofs);
      returnedChange = proofsStore.sumProofs(changeProofs);
    }
  }

  let spentProofs;
  if (checkSpentProofs) {
    spentProofs = await this.checkProofsSpendable(proofs, mintWallet, true);
  } else {
    await proofsStore.removeProofs(proofs);
    spentProofs = proofs;
  }

  const actualFee = Math.max(0, meltQuote.fee_reserve - returnedChange);
  meltQuote.fee_paid = actualFee;
  const amountPaid = meltQuote.amount + actualFee;
  this.updateOutgoingInvoiceInHistory(meltQuote, {
    status: "paid",
    amount: -amountPaid,
  });
  this.clearMeltChangeOutputData(quote);
  return { amountPaid, returnedChange, spentProofs };
}

export function setMeltChangeOutputData(
  this: any,
  quote: string,
  outputData: any[]
) {
  const serialized = outputData.map((output) => OutputData.serialize(output));
  this.invoiceHistory
    .filter((i: any) => i.quote === quote)
    .forEach((i: any) => {
      i.meltChangeOutputData = serialized;
      i.meltOutputData = [];
    });
}

export function clearMeltChangeOutputData(this: any, quote: string) {
  this.invoiceHistory
    .filter((i: any) => i.quote === quote)
    .forEach((i: any) => {
      i.meltChangeOutputData = [];
      i.meltOutputData = [];
    });
}
