import { useCocoStore } from "../stores/coco";
import { useWalletStore } from "../stores/wallet";
import { useSendTokensStore } from "../stores/sendTokensStore";

export async function executeSendToken(mintUrl: string, amount: number, memo: string, p2pkPubkey?: string) {
  const cocoStore = useCocoStore();
  const sendTokensStore = useSendTokensStore();
  
  try {
    const options: any = {
      mintUrl: mintUrl,
      amount: amount,
    };
    
    if (p2pkPubkey) {
      options.target = { type: 'p2pk', pubkey: p2pkPubkey };
    }
    
    const preparedSend = await cocoStore.manager!.ops.send.prepare(options);
    const result = await cocoStore.manager!.ops.send.execute(preparedSend.id);
    
    sendTokensStore.sendData.tokens = "";
    sendTokensStore.sendData.tokensBase64 = result.token;
    sendTokensStore.sendData.historyAmount = -amount;
    
    return { serialized: result.token, historyToken: { status: "pending", amount: -amount, mint: mintUrl, date: new Date().toISOString() } };
  } catch (error) {
    throw error;
  }
}
