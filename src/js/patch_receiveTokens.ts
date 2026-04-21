import { useCocoStore } from "../stores/coco";
import { notifyError, notifySuccess } from "./notify";
import { i18n } from "../boot/i18n";
import { useReceiveTokensStore } from "../stores/receiveTokensStore";
import { useUiStore } from "../stores/ui";

export async function executeReceiveToken(encodedToken: string) {
  const cocoStore = useCocoStore();
  const receiveStore = useReceiveTokensStore();
  const uiStore = useUiStore();
  
  if (!cocoStore.manager) {
    throw new Error("Coco not initialized");
  }

  await uiStore.lockMutex();
  try {
    const preparedReceive = await cocoStore.manager.ops.receive.prepare({
      token: encodedToken,
    });
    
    await cocoStore.manager.ops.receive.execute(preparedReceive.id);
    
    receiveStore.receiveData.tokensBase64 = "";
    notifySuccess(i18n.global.t("wallet.notifications.receive_successful"));
    
    return true;
  } catch (error) {
    notifyError("Failed to receive token", error as string);
    throw error;
  } finally {
    uiStore.unlockMutex();
  }
}
