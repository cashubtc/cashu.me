// In-memory sample props for the dev-only design system board. These fixtures do not
// access storage; the board also renders live components that read wallet stores.

import { UnifiedTransactionType } from "src/stores/walletTypes";

const MINT = "https://mint.example.com";

/** An ISO date `minutes` before the board was opened, so relative dates read naturally. */
function ago(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

/** One entry of HistoryTable's unified list (ecash and invoices together). */
export type DsHistoryTransaction = {
  id: string;
  type: UnifiedTransactionType;
  amount: number;
  unit: string;
  mint: string;
  date: string;
  status: "pending" | "paid";
  label?: string;
};

const rows: Array<
  [UnifiedTransactionType, number, number, DsHistoryTransaction["status"]]
> = [
  [UnifiedTransactionType.Lightning, 5000, 4, "paid"],
  [UnifiedTransactionType.Ecash, -210, 26, "pending"],
  [UnifiedTransactionType.Lightning, 21, 50, "pending"],
  [UnifiedTransactionType.Lightning, -101, 60 * 20, "paid"],
  [UnifiedTransactionType.Ecash, 500, 60 * 26, "paid"],
  [UnifiedTransactionType.Onchain, 25000, 60 * 24 * 3, "paid"],
  [UnifiedTransactionType.Lightning, 2289, 60 * 24 * 17, "paid"],
  [UnifiedTransactionType.Ecash, -42, 60 * 24 * 19, "paid"],
  [UnifiedTransactionType.Lightning, 1000, 60 * 24 * 30, "paid"],
  [UnifiedTransactionType.Ecash, 64, 60 * 24 * 40, "paid"],
  [UnifiedTransactionType.Onchain, -12000, 60 * 24 * 52, "paid"],
  [UnifiedTransactionType.Lightning, 8, 60 * 24 * 70, "paid"],
];

/** Twelve payments (three pages of five), two of them pending with a Check status action. */
export function dsHistoryTransactions(): DsHistoryTransaction[] {
  return rows.map(([type, amount, minutes, status], n) => ({
    id: `ds-history-${n}`,
    type,
    amount,
    unit: "sat",
    mint: MINT,
    date: ago(minutes),
    status,
  }));
}
