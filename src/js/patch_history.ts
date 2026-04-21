import { useCocoStore } from "../stores/coco";

export async function fetchCocoHistory() {
  const cocoStore = useCocoStore();
  if (!cocoStore.manager) return [];
  
  const history = await cocoStore.manager.history.getPaginatedHistory(undefined, 100);
  
  return history.map((entry) => {
    return {
      type: entry.type === 'send' || entry.type === 'receive' ? 'ecash' : 'lightning',
      id: entry.id,
      amount: entry.amount,
      status: entry.state === 'finalized' || entry.state === 'paid' ? 'paid' : (entry.state === 'pending' || entry.state === 'unpaid' ? 'pending' : 'failed'),
      date: new Date(entry.createdAt).toISOString(),
      mint: entry.mintUrl,
      // Provide some backwards compatible mapping
      token: (entry as any).token || "",
      bolt11: (entry as any).request || "",
      quote: (entry as any).quoteId || entry.id,
      label: "", 
    }
  });
}
