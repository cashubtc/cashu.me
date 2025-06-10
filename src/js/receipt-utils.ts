export type Receipt = {
  id: string;
  amount: number;
  token: string;
  pubkey: string;
  locktime?: number;
  refundPubkey?: string;
  bucketId: string;
  date: string;
};

export function formatTimestamp(ts: number): string {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${("0" + d.getDate()).slice(-2)} ${("0" + d.getHours()).slice(-2)}:${("0" + d.getMinutes()).slice(-2)}`;
}

export function receiptToDmText(receipt: Receipt, supporterName?: string): string {
  const date = receipt.locktime
    ? formatTimestamp(receipt.locktime)
    : new Date(receipt.date).toISOString();
  const name = supporterName ? `from ${supporterName} ` : "";
  return `${receipt.amount} sats ${name}on ${date} (ref ${receipt.id})\n${receipt.token}`;
}

export function receiptsToDmText(receipts: Array<Receipt>, supporterName?: string): string {
  return receipts.map((r) => receiptToDmText(r, supporterName)).join("\n");
}
