import { createPinia, setActivePinia } from "pinia";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useSwapStore } from "../swap";
import { useWalletStore } from "../wallet";
import { useMintsStore } from "../mints";

// Mock i18n
vi.mock("src/boot/i18n", () => ({
  i18n: {
    global: {
      t: (key: string) => key,
    },
  },
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    d: (key: string) => key,
  }),
}));

vi.mock("src/js/notify", () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
  notifyWarning: vi.fn(),
}));

describe("useSwapStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should execute mintAmountSwap successfully", async () => {
    const store = useSwapStore();
    const walletStore = useWalletStore();
    const mintsStore = useMintsStore();

    // Setup mocks
    mintsStore.activeUnit = "sat";
    mintsStore.mints = [
      { url: "https://from.mint", keysets: [], keys: [] } as any,
      { url: "https://to.mint", keysets: [], keys: [] } as any,
    ];
    mintsStore.mintUnitProofs = vi
      .fn()
      .mockReturnValue([{ id: "p1", amount: 10 }]);

    const mockToWallet = { unit: "sat" };
    const mockFromWallet = { unit: "sat" };

    walletStore.mintWallet = vi
      .fn()
      .mockResolvedValueOnce(mockToWallet) // First call for toWallet
      .mockResolvedValueOnce(mockFromWallet); // Second call for fromWallet

    walletStore.requestMint = vi.fn().mockResolvedValue({
      request: "lnbc...",
      quote: "quote1",
    });

    walletStore.meltQuote = vi.fn().mockResolvedValue({
      quote: "meltQuote1",
      amount: 10,
      fee_reserve: 0,
    });

    walletStore.melt = vi.fn();
    walletStore.checkInvoice = vi.fn();

    // Execute
    await store.mintAmountSwap({
      fromUrl: "https://from.mint",
      toUrl: "https://to.mint",
      amount: 10,
    });

    // Verify
    expect(walletStore.requestMint).toHaveBeenCalledWith(10, mockToWallet);
    expect(walletStore.meltQuote).toHaveBeenCalledWith(
      mockFromWallet,
      "lnbc..."
    );
    expect(walletStore.melt).toHaveBeenCalled();
    expect(walletStore.checkInvoice).toHaveBeenCalledWith("quote1");
    expect(store.swapBlocking).toBe(false);
  });

  it("should handle error during swap", async () => {
    const store = useSwapStore();
    const walletStore = useWalletStore();
    const mintsStore = useMintsStore();

    mintsStore.activeUnit = "sat";
    walletStore.mintWallet = vi
      .fn()
      .mockRejectedValue(new Error("Network Error"));

    await store.mintAmountSwap({
      fromUrl: "https://from.mint",
      toUrl: "https://to.mint",
      amount: 10,
    });

    expect(store.swapBlocking).toBe(false);
    // Should notify error
    const { notifyError } = await import("src/js/notify");
    expect(notifyError).toHaveBeenCalledWith("swap.swap_error_text");
  });
});
