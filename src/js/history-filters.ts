import { getShortUrl } from "src/js/wallet-helpers";

// History filters: one single choice per group, so no two choices can contradict each other
// (Incoming and Outgoing together used to mean nothing at all). "all" is every group's default.

export type HistoryStatusFilter = "all" | "pending" | "paid";
export type HistoryDirectionFilter = "all" | "in" | "out";
export type HistoryTypeFilter = "all" | "ecash" | "lightning" | "onchain";

export type HistoryFilters = {
  status: HistoryStatusFilter;
  direction: HistoryDirectionFilter;
  type: HistoryTypeFilter;
  /** A mint URL, or "all". */
  mint: string;
  /** A unit ("sat", "usd"), or "all". */
  unit: string;
};

/** The fields a history entry is filtered on (ecash and invoice entries both have them). */
export type FilterableTransaction = {
  status?: string;
  amount: number;
  type?: string;
  mint?: string;
  unit?: string;
};

export const DEFAULT_HISTORY_FILTERS: Readonly<HistoryFilters> = Object.freeze({
  status: "all",
  direction: "all",
  type: "all",
  mint: "all",
  unit: "all",
});

export type HistoryFilterGroup = keyof HistoryFilters;

/** The groups set away from their default, in display order. */
export function activeFilterGroups(
  filters: HistoryFilters
): HistoryFilterGroup[] {
  return (Object.keys(DEFAULT_HISTORY_FILTERS) as HistoryFilterGroup[]).filter(
    (group) => filters[group] !== DEFAULT_HISTORY_FILTERS[group]
  );
}

export function matchesHistoryFilters(
  transaction: FilterableTransaction,
  filters: HistoryFilters
): boolean {
  if (filters.status !== "all" && transaction.status !== filters.status) {
    return false;
  }
  if (filters.direction === "in" && transaction.amount < 0) return false;
  if (filters.direction === "out" && transaction.amount >= 0) return false;
  if (filters.type !== "all" && transaction.type !== filters.type) return false;
  if (filters.mint !== "all" && transaction.mint !== filters.mint) return false;
  if (filters.unit !== "all" && (transaction.unit || "sat") !== filters.unit) {
    return false;
  }
  return true;
}

/** The i18n key naming each fixed choice; "all" is no choice, and mint and unit name
 * themselves. */
export const HISTORY_FILTER_LABEL_KEYS = {
  status: {
    pending: "common.pending",
    paid: "HistoryTable.filters.completed",
  },
  direction: {
    in: "HistoryTable.filters.received",
    out: "HistoryTable.filters.sent",
  },
  type: {
    ecash: "HistoryTable.row.type_label",
    lightning: "InvoiceTable.row.type_label",
    onchain: "common.on_chain",
  },
} as const;

/** A mint's name for a filter: its nickname, its advertised name, else its short URL. */
export function historyMintLabel(
  url: string,
  mints: { url: string; nickname?: string; info?: { name?: string } }[]
): string {
  const mint = mints.find((m) => m.url === url);
  return mint?.nickname || mint?.info?.name || getShortUrl(url);
}
