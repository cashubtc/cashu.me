import { useWalletStore } from "../stores/wallet";
import { useCocoStore } from "../stores/coco";
import { useMintsStore } from "../stores/mints";
import { notifyError, notifySuccess } from "./notify";
import { i18n } from "../boot/i18n";

export async function newMeltInvoiceData(silent?: boolean) {
  const walletStore = useWalletStore();
  const cocoStore = useCocoStore();
  
  if (walletStore.payInvoiceData.invoice == null) {
    throw new Error("no invoice provided.");
  }
  
  const id = walletStore.payInvoiceData.preparedMeltId;
  if (!id) {
    throw new Error("No prepared melt quote found. Try again.");
  }
  
  try {
    const result = await cocoStore.manager.ops.melt.execute(id);
    
    // Add to history or let watcher handle it
    if (!silent) {
      notifySuccess(i18n.global.t("payment_successful"));
    }
    
    return { isPaid: true, preimage: result.finalizedData?.preimage };
  } catch (error) {
    if (!silent) {
      notifyError("Payment failed", error);
    }
    throw error;
  }
}
