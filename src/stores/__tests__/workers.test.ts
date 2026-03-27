import { createPinia, setActivePinia } from "pinia";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useWorkersStore } from "../workers";
import { useInvoicesWorkerStore } from "../invoicesWorker";
import { useWalletStore } from "../wallet";
import { useSettingsStore } from "../settings";

// Mock dependencies
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
  createI18n: () => ({
    global: {
      t: (key: string) => key,
    },
  }),
}));

vi.mock("src/js/notify", () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
}));

describe("Workers Stores", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    window.localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe("useWorkersStore", () => {
    it("invoiceCheckWorker should stop after 12 intervals if not paid", async () => {
      const store = useWorkersStore();
      const walletStore = useWalletStore();
      walletStore.checkInvoice = vi
        .fn()
        .mockRejectedValue(new Error("Pending"));

      await store.invoiceCheckWorker("quote1");

      // Advance to first tick
      await vi.advanceTimersByTimeAsync(5100);
      expect(store.invoiceWorkerRunning).toBe(true);

      // Fast forward 11 more intervals (total 12)
      for (let i = 0; i < 11; i++) {
        await vi.advanceTimersByTimeAsync(5000);
      }

      expect(walletStore.checkInvoice).toHaveBeenCalledTimes(12);
      expect(store.invoiceWorkerRunning).toBe(true);

      // 13th interval - should stop
      await vi.advanceTimersByTimeAsync(5000);
      expect(store.invoiceWorkerRunning).toBe(false);
    });

    it("invoiceCheckWorker should stop if paid", async () => {
      const store = useWorkersStore();
      const walletStore = useWalletStore();
      walletStore.checkInvoice = vi.fn().mockResolvedValue(true);

      await store.invoiceCheckWorker("quote1");

      await vi.advanceTimersByTimeAsync(5000);

      expect(walletStore.checkInvoice).toHaveBeenCalled();
      expect(store.invoiceWorkerRunning).toBe(false);
    });
  });

  describe("useInvoicesWorkerStore", () => {
    it("processQuotes should respect dueTime (backoff)", async () => {
      const store = useInvoicesWorkerStore();
      const walletStore = useWalletStore();
      const settingsStore = useSettingsStore();

      settingsStore.periodicallyCheckIncomingInvoices = true;
      walletStore.checkInvoice = vi
        .fn()
        .mockRejectedValue(new Error("Pending"));

      // Add a quote
      store.addInvoiceToChecker("quote1");
      expect(store.quotes.length).toBe(1);

      // Simulate failure (increment checkCount)
      await store.processQuotes(); // First check (immediate?) No, lastChecked is 0
      // wait for interval
      await vi.advanceTimersByTimeAsync(5000);

      // We need to trigger the interval callback, but we are testing processQuotes logic directly mostly
      // Let's call processQuotes manually to test the logic

      // Reset mocks
      walletStore.checkInvoice = vi
        .fn()
        .mockRejectedValue(new Error("Pending"));

      // Manually set state to simulate failed checks
      store.quotes[0].checkCount = 6; // Trigger backoff
      store.quotes[0].lastChecked = Date.now();

      // Should NOT run yet
      await store.processQuotes();
      expect(walletStore.checkInvoice).not.toHaveBeenCalled();

      // Advance time by normal interval (should still be waiting due to backoff)
      // Backoff for count 6: 5000 * 2^(6-5) = 10000
      await vi.advanceTimersByTimeAsync(6000);
      await store.processQuotes();
      expect(walletStore.checkInvoice).not.toHaveBeenCalled();

      // Advance more
      await vi.advanceTimersByTimeAsync(5000);
      await store.processQuotes();
      expect(walletStore.checkInvoice).toHaveBeenCalled();
    });
  });
});
