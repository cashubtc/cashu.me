import { useCocoStore } from "../stores/coco";
import { notifyError } from "./notify";
import { i18n } from "../boot/i18n";

type SwapAmountDataLocal = {
  fromUrl: string | undefined;
  toUrl: string | undefined;
  amount: number;
};

export async function executeMintAmountSwap(swapAmountData: SwapAmountDataLocal) {
  const cocoStore = useCocoStore();
  
  if (!swapAmountData.fromUrl || !swapAmountData.toUrl) {
    throw new Error(i18n.global.t("swap.invalid_swap_data_error_text"));
  }
  
  if (!cocoStore.manager) throw new Error("Coco not initialized");

  try {
    // 1. Prepare mint on target
    const preparedMint = await cocoStore.manager.ops.mint.prepare({
      mintUrl: swapAmountData.toUrl,
      amount: swapAmountData.amount,
      method: "bolt11",
      methodData: {}
    });
    
    // 2. Prepare melt on source to pay the mint invoice
    const preparedMelt = await cocoStore.manager.ops.melt.prepare({
      mintUrl: swapAmountData.fromUrl,
      method: "bolt11",
      request: preparedMint.request,
    });
    
    // 3. Execute melt (pays the invoice)
    await cocoStore.manager.ops.melt.execute(preparedMelt.id);
    
    // 4. Wait for mint quote to be paid and execute mint
    await cocoStore.manager.subscription.awaitMintQuotePaid(swapAmountData.toUrl, preparedMint.quoteId);
    await cocoStore.manager.ops.mint.execute(preparedMint.id);
    
  } catch (error) {
    console.error("Error swapping", error);
    throw error;
  }
}

export async function executeMeltProofsToMint(tokenStr: string, toMintUrl: string) {
  const cocoStore = useCocoStore();
  if (!cocoStore.manager) throw new Error("Coco not initialized");

  try {
    // 1. Receive the token first (since the UI expects us to spend "these" proofs,
    // Coco just receives them to balance, then we swap out via balance)
    const receiveOp = await cocoStore.manager.ops.receive.prepare({ token: tokenStr });
    await cocoStore.manager.ops.receive.execute(receiveOp.id);
    const fromMintUrl = receiveOp.mintUrl;
    
    // We want to move all of it minus fees.
    const tokenAmount = receiveOp.amount;
    
    // Calculate fee to melt out of fromMintUrl. We can't know exactly without a quote.
    // So we'll try an iterative approach or use a safe margin.
    const safeMargin = Math.max(2, Math.ceil(tokenAmount * 0.02));
    const swapAmount = tokenAmount - safeMargin;
    
    // 2. Prepare mint on target
    const preparedMint = await cocoStore.manager.ops.mint.prepare({
      mintUrl: toMintUrl,
      amount: swapAmount,
      method: "bolt11",
      methodData: {}
    });
    
    // 3. Prepare melt on source
    const preparedMelt = await cocoStore.manager.ops.melt.prepare({
      mintUrl: fromMintUrl,
      method: "bolt11",
      request: preparedMint.request,
    });
    
    // Execute melt
    await cocoStore.manager.ops.melt.execute(preparedMelt.id);
    
    // Wait and execute mint
    await cocoStore.manager.subscription.awaitMintQuotePaid(toMintUrl, preparedMint.quoteId);
    await cocoStore.manager.ops.mint.execute(preparedMint.id);
    
  } catch (error) {
    console.error("Error melting proofs to mint", error);
    throw error;
  }
}
