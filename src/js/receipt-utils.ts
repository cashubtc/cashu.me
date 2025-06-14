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
  return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${(
    "0" + d.getDate()
  ).slice(-2)} ${("0" + d.getHours()).slice(-2)}:${("0" + d.getMinutes()).slice(
    -2
  )}`;
}

export function receiptToDmText(
  receipt: Receipt,
  supporterName?: string
): string {
  const payload = {
    token: receipt.token,
    amount: receipt.amount,
    unlockTime: receipt.locktime ?? null,
    bucketId: receipt.bucketId,
    referenceId: receipt.id,
  };
  return JSON.stringify(payload);
}

export function receiptsToDmText(
  receipts: Array<Receipt>,
  supporterName?: string
): string {
  return receipts.map((r) => receiptToDmText(r, supporterName)).join("\n");
}
