import { vi, beforeEach, describe, expect, it } from "vitest";

vi.mock("../../../src/stores/settings", () => ({
  useSettingsStore: vi.fn(() => ({ getBitcoinPrice: true })),
}));

vi.mock("axios", () => ({
  default: {
    get: vi.fn(async () => ({ data: { data: { rates: { USD: 20 } } } })),
  },
}));

import { usePriceStore } from "../../../src/stores/price";
import { useSettingsStore } from "../../../src/stores/settings";

beforeEach(() => {
  localStorage.clear();
});

describe("Price store", () => {
  it("fetches bitcoin price", async () => {
    const store = usePriceStore();
    await store.fetchBitcoinPriceUSD();
    expect(store.bitcoinPrice).toBe(20);
    expect(store.bitcoinPriceLastUpdated).not.toBe(0);
  });

  it("respects disabled setting", async () => {
    vi.mocked(useSettingsStore).mockReturnValueOnce({
      getBitcoinPrice: false,
    } as any);
    const store = usePriceStore();
    await store.fetchBitcoinPriceUSD();
    expect(store.bitcoinPrice).toBe(0);
    expect(store.bitcoinPriceLastUpdated).toBe(0);
  });
});
