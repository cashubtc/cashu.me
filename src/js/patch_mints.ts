import { useCocoStore } from "../stores/coco";

export async function executeAddMint(url: string) {
  const cocoStore = useCocoStore();
  if (!cocoStore.manager) return;
  try {
    await cocoStore.manager.mint.addMint(url, { trusted: true });
  } catch (e) {
    console.error("Coco addMint failed:", e);
  }
}

export async function executeRemoveMint(url: string) {
  const cocoStore = useCocoStore();
  if (!cocoStore.manager) return;
  try {
    // There is no explicit removeMint in api? Wait, what's in api? Let's check api.
    await cocoStore.manager.mint.untrustMint(url);
  } catch (e) {
    console.error("Coco removeMint failed:", e);
  }
}
