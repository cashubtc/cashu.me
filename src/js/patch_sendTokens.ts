import { useCocoStore } from "../stores/coco";
import { useWalletStore } from "../stores/wallet";
import { useSendTokensStore } from "../stores/sendTokensStore";

export async function executeSendToken(mintUrl: string, amount: number, memo: string) {
  const cocoStore = useCocoStore();
  const sendTokensStore = useSendTokensStore();
  
  try {
    const preparedSend = await cocoStore.manager.ops.send.prepare({
      mintUrl: mintUrl,
      amount: amount,
    });
    
    const result = await cocoStore.manager.ops.send.execute(preparedSend.id);
    
    sendTokensStore.sendData.tokens = "";
    sendTokensStore.sendData.tokensBase64 = result.token;
    sendTokensStore.sendData.historyAmount = -amount;
    
    // Actually coco history will capture it, but let's mock it for legacy UI
    return { serialized: result.token, historyToken: { status: "pending", amount: -amount, mint: mintUrl, date: new Date().toISOString() } };
  } catch (error) {
    throw error;
  }
}
