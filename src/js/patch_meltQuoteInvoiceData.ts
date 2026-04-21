import { useWalletStore } from "../stores/wallet";
import { useCocoStore } from "../stores/coco";
import { useMintsStore } from "../stores/mints";

export async function newMeltQuoteInvoiceData() {
  const walletStore = useWalletStore();
  const cocoStore = useCocoStore();
  const mintStore = useMintsStore();
  
  if (walletStore.payInvoiceData.blocking) {
    return;
  }
  
  try {
    walletStore.payInvoiceData.blocking = true;
    walletStore.payInvoiceData.meltQuote.error = "";
    
    if (walletStore.payInvoiceData.input.request == "") {
      throw new Error("No invoice provided.");
    }

    const mintUrl = mintStore.activeMintUrl;
    
    const preparedMelt = await cocoStore.manager.ops.melt.prepare({
      mintUrl: mintUrl,
      method: "bolt11",
      methodData: { invoice: walletStore.payInvoiceData.input.request }
    });
    
    walletStore.payInvoiceData.preparedMeltId = preparedMelt.id;
    
    walletStore.payInvoiceData.meltQuote.response = {
      amount: preparedMelt.quote.amount,
      fee_reserve: preparedMelt.quote.feeReserve,
      quote: preparedMelt.quoteId,
    };
    
  } catch (error: any) {
    console.error("Error creating melt quote", error);
    walletStore.payInvoiceData.meltQuote.error = error.message || error;
  } finally {
    walletStore.payInvoiceData.blocking = false;
  }
}
