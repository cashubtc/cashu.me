import { CashuWallet, MeltQuotePayload, MeltQuoteResponse, MintQuotePayload, MintQuoteResponse, MintQuoteState } from '@cashu/cashu-ts';
import { useMintsStore, WalletProof } from '../mints';
import { useProofsStore } from '../proofs';
import { useUiStore } from '../ui';
import { useTokensStore } from '../tokens';
import { DEFAULT_BUCKET_ID } from '../buckets';
import { currentDateStr } from 'src/js/utils';
import { notifyApiError, notify, notifySuccess } from 'src/js/ui-utils';
import { useInvoicesWorkerStore } from '../invoicesWorker';
import { HistoryToken } from '../tokens';

export type InvoiceHistory = {
  amount: number;
  bolt11: string;
  quote: string;
  memo: string;
  date: string;
  status: 'pending' | 'paid';
  mint: string;
  unit: string;
  mintQuote?: MintQuoteResponse;
  meltQuote?: MeltQuoteResponse;
};

/**
 * Invoice related actions like requesting and minting.
 */
export const invoiceActions = {
  async requestMint(this: any, amount: number, mintWallet: CashuWallet): Promise<MintQuoteResponse> {
    try {
      const payload: MintQuotePayload = {
        amount: amount,
        unit: mintWallet.unit,
      };
      const data = await mintWallet.mint.createMintQuote(payload);
      this.invoiceData.amount = amount;
      this.invoiceData.bolt11 = data.request;
      this.invoiceData.quote = data.quote;
      this.invoiceData.date = currentDateStr();
      this.invoiceData.status = 'pending';
      this.invoiceData.mint = mintWallet.mint.mintUrl;
      this.invoiceData.unit = mintWallet.unit;
      this.invoiceData.mintQuote = data;
      this.invoiceHistory.push({
        ...this.invoiceData,
      });
      return data;
    } catch (error: any) {
      console.error(error);
      notifyApiError(error, this.t('wallet.notifications.could_not_request_mint'));
      throw error;
    }
  },

  async mint(this: any, invoice: InvoiceHistory, verbose: boolean = true, bucketId: string = DEFAULT_BUCKET_ID) {
    const proofsStore = useProofsStore();
    const mintStore = useMintsStore();
    const tokenStore = useTokensStore();
    const uIStore = useUiStore();
    const keysetId = this.getKeyset(invoice.mint, invoice.unit);
    const mintWallet = this.mintWallet(invoice.mint, invoice.unit);
    const mint = mintStore.mints.find((m) => m.url === invoice.mint);
    if (!mint) {
      throw new Error('mint not found');
    }

    await uIStore.lockMutex();
    try {
      const mintQuote = await mintWallet.checkMintQuote(invoice.quote);
      invoice.mintQuote = mintQuote;
      switch (mintQuote.state) {
        case MintQuoteState.PAID:
          break;
        case MintQuoteState.UNPAID:
          if (verbose) {
            notify(this.t('wallet.notifications.invoice_still_pending'));
          }
          throw new Error('invoice pending.');
        case MintQuoteState.ISSUED:
          throw new Error('invoice already issued.');
        default:
          throw new Error('unknown state.');
      }
      const counter = this.keysetCounter(keysetId);
      const proofs = await mintWallet.mintProofs(invoice.amount, invoice.quote, {
        keysetId,
        counter,
        proofsWeHave: mintStore.mintUnitProofs(mint, invoice.unit),
      });
      this.increaseKeysetCounter(keysetId, proofs.length);
      await proofsStore.addProofs(proofs, undefined, bucketId, '');

      await this.setInvoicePaid(invoice.quote);
      const serializedProofs = proofsStore.serializeProofs(proofs);
      tokenStore.addPaidToken({
        amount: invoice.amount,
        token: serializedProofs,
        unit: invoice.unit,
        mint: invoice.mint,
        label: '',
        bucketId,
      });
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
  },
};
