import { useCocoStore } from "../stores/coco";

export async function executeCheckInvoice(quoteOrId: string) {
  const cocoStore = useCocoStore();
  if (!cocoStore.manager) return;
  
  // Just refresh everything to be safe since we don't know if it's mint or melt easily
  try {
    await cocoStore.manager.ops.mint.refresh();
  } catch (e) {
    console.error("Mint refresh error", e);
  }
  
  try {
    await cocoStore.manager.ops.melt.refresh();
  } catch (e) {
    console.error("Melt refresh error", e);
  }
}
