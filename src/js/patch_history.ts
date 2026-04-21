import { useCocoStore } from "../stores/coco";

export async function fetchCocoHistory() {
  const cocoStore = useCocoStore();
  if (!cocoStore.manager) return [];
  
  const history = await cocoStore.manager.history.getPaginatedHistory(undefined, 100);
  
  return history.map((entry: any) => {
    let mintQuote;
    let meltQuote;

    if (entry.type === "mint") {
      mintQuote = {
        quote: (entry as any).quoteId || entry.id,
        request: (entry as any).request || "",
        state: entry.state.toUpperCase(),
      };
    } else if (entry.type === "melt") {
      meltQuote = {
        quote: (entry as any).quoteId || entry.id,
        amount: entry.amount,
        fee_reserve: (entry as any).feeReserve || 0,
        fee_paid: (entry as any).feePaid || 0,
        state: entry.state.toUpperCase(),
        paid: entry.state === 'finalized',
      };
    }

    return {
      type: entry.type === 'send' || entry.type === 'receive' ? 'ecash' : 'lightning',
      id: entry.id,
      amount: entry.amount,
      status: entry.state === 'finalized' || entry.state === 'paid' ? 'paid' : (entry.state === 'pending' || entry.state === 'unpaid' ? 'pending' : 'failed'),
      date: new Date(entry.createdAt).toISOString(),
      mint: entry.mintUrl,
      // Provide backwards compatible mapping
      token: (entry as any).token || "",
      bolt11: (entry as any).request || "",
      quote: (entry as any).quoteId || entry.id,
      label: "",
      mintQuote,
      meltQuote,
    }
  });
}
