import { useLocalStorage } from "@vueuse/core";
import { date } from "quasar";
import { defineStore } from "pinia";
import { PaymentRequest, Proof, Token } from "@cashu/cashu-ts";
import { useMintsStore } from "./mints";
import { useWalletStore } from "./wallet";
import { notifyError, notifyWarning } from "../js/notify";

/**
 * The tokens store handles everything related to tokens and proofs
 */

const walletStore = useWalletStore();
const mintStore = useMintsStore();

type SwapAmountData = {
  fromUrl: string | undefined;
  toUrl: string | undefined;
  amount: number;
};

export type HistoryToken = {
  status: "paid" | "pending";
  amount: number;
  date: string;
  token?: string;
  mint: string;
  unit: string;
  paymentRequest?: PaymentRequest;
  fee?: number;
};

export const useSwapStore = defineStore("swap", {
  state: () => ({
    swapAmountData: {} as SwapAmountData,
    swapBlocking: false,
  }),
  actions: {
    //
    mintAmountSwap: async function (swapAmountData: SwapAmountData) {
      if (this.swapBlocking) {
        notifyWarning("Swap in progress");
        return;
      }
      if (!swapAmountData.fromUrl || !swapAmountData.toUrl) {
        notifyError("Invalid swap data");
        return;
      }
      this.swapBlocking = true;
      try {
        // get invoice
        // await mintStore.activateMintUrl(swapAmountData.toUrl);
        const toWallet = walletStore.mintWallet(swapAmountData.toUrl, mintStore.activeUnit);
        let mintQuote = await walletStore.requestMint(swapAmountData.amount, toWallet);

        // pay invoice
        const fromWallet = walletStore.mintWallet(swapAmountData.fromUrl, mintStore.activeUnit);
        const meltQuote = await walletStore.meltQuote(fromWallet, mintQuote.request);
        const mint = mintStore.mints.find((m) => m.url === swapAmountData.fromUrl);
        if (!mint) {
          throw new Error("mint not found");
        }
        const mintProofs = mintStore.mintUnitProofs(mint, fromWallet.unit);
        await walletStore.melt(mintProofs, meltQuote, fromWallet);

        // settle invoice on other side
        await walletStore.checkInvoice(mintQuote.quote);
      } catch (e) {
        console.error("Error swapping", e);
        notifyError("Error swapping");
      } finally {
        this.swapBlocking = false;
      }
    },
  },
});

