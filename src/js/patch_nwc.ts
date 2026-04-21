import { useCocoStore } from "../stores/coco";
import { useWalletStore } from "../stores/wallet";
import { useMintsStore } from "../stores/mints";
import { useUiStore } from "../stores/ui";

export async function nwcPayInvoice(invoice: string, amountMsat?: number) {
  const cocoStore = useCocoStore();
  const mintStore = useMintsStore();
  
  if (!cocoStore.manager) throw new Error("Coco not initialized");
  
  const mintUrl = mintStore.activeMintUrl;
  
  // Create melt quote
  const preparedMelt = await cocoStore.manager.ops.melt.prepare({
    mintUrl: mintUrl,
    method: "bolt11",
    request: invoice,
  });
  
  // The original code checks balance vs quote
  const totalAmount = preparedMelt.quote.amount + preparedMelt.quote.feeReserve;
  
  // execute
  const result = await cocoStore.manager.ops.melt.execute(preparedMelt.id);
  
  return {
    preimage: result.finalizedData?.preimage || "unknown",
    fee: result.effectiveFee || 0
  };
}

export async function nwcMakeInvoice(amountSat: number) {
  const cocoStore = useCocoStore();
  const mintStore = useMintsStore();
  
  if (!cocoStore.manager) throw new Error("Coco not initialized");
  
  const mintUrl = mintStore.activeMintUrl;
  
  const preparedMint = await cocoStore.manager.ops.mint.prepare({
    mintUrl: mintUrl,
    amount: amountSat,
    method: "bolt11",
    methodData: {}
  });
  
  // Need to start watcher for this quote to auto-execute when paid
  // But nwc actually expects us to wait or at least return the quote.
  // We should wait asynchronously so that it executes eventually, but we return immediately.
  
  const watchPayment = async () => {
    try {
      await cocoStore.manager!.subscription.awaitMintQuotePaid(mintUrl, preparedMint.quoteId);
      await cocoStore.manager!.ops.mint.execute(preparedMint.id);
    } catch (e) {
      console.error("Error watching nwc mint", e);
    }
  };
  watchPayment();
  
  return {
    request: preparedMint.request,
    quote: preparedMint.quoteId
  };
}
