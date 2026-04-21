import { useCocoStore } from "../stores/coco";

export async function executeCheckTokenSpendable(historyTokenId: string) {
  const cocoStore = useCocoStore();
  if (!cocoStore.manager) return;
  
  try {
    await cocoStore.manager.ops.send.refresh();
  } catch (e) {
    console.error("Send refresh error", e);
  }
}
