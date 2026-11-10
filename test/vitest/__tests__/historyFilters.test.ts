import { describe, expect, it } from "vitest";
import {
  activeFilterGroups,
  DEFAULT_HISTORY_FILTERS,
  matchesHistoryFilters,
  type HistoryFilters,
} from "src/js/history-filters";

const history = [
  {
    id: "a",
    status: "pending",
    amount: -500,
    type: "ecash",
    mint: "m1",
    unit: "sat",
  },
  {
    id: "b",
    status: "paid",
    amount: 2100,
    type: "lightning",
    mint: "m1",
    unit: "sat",
  },
  {
    id: "c",
    status: "paid",
    amount: -40,
    type: "onchain",
    mint: "m2",
    unit: "sat",
  },
  {
    id: "d",
    status: "pending",
    amount: 300,
    type: "ecash",
    mint: "m2",
    unit: "usd",
  },
  { id: "e", status: "paid", amount: 10, type: "ecash", mint: "m1" },
];

const pick = (filters: Partial<HistoryFilters>) =>
  history
    .filter((t) =>
      matchesHistoryFilters(t, { ...DEFAULT_HISTORY_FILTERS, ...filters })
    )
    .map((t) => t.id);

describe("history filters", () => {
  it("shows everything by default", () => {
    expect(pick({})).toEqual(["a", "b", "c", "d", "e"]);
    expect(activeFilterGroups({ ...DEFAULT_HISTORY_FILTERS })).toEqual([]);
  });

  it("combines groups: what used to be 'pending, ecash only' is two choices", () => {
    expect(pick({ status: "pending", type: "ecash" })).toEqual(["a", "d"]);
  });

  it("splits direction by the amount's sign", () => {
    expect(pick({ direction: "in" })).toEqual(["b", "d", "e"]);
    expect(pick({ direction: "out" })).toEqual(["a", "c"]);
  });

  it("filters by mint and unit, an entry without a unit counting as sat", () => {
    expect(pick({ mint: "m2" })).toEqual(["c", "d"]);
    expect(pick({ unit: "sat" })).toEqual(["a", "b", "c", "e"]);
  });

  it("lists the groups away from their default, in display order", () => {
    expect(
      activeFilterGroups({
        ...DEFAULT_HISTORY_FILTERS,
        unit: "usd",
        status: "paid",
      })
    ).toEqual(["status", "unit"]);
  });
});
