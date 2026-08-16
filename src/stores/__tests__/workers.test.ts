import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  walletStore: {
    checkInvoiceBolt11: vi.fn(),
  },
}));

vi.mock("src/stores/wallet", () => ({
  useWalletStore: () => mocks.walletStore,
}));

import { useWorkersStore } from "src/stores/workers";

function flushPromises() {
  return Promise.resolve().then(() => Promise.resolve());
}

describe("legacy workers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    useWorkersStore().clearAllWorkers();
    vi.useRealTimers();
  });

  it("does not overlap invoice checks", async () => {
    const worker = useWorkersStore();
    worker.checkInterval = 100;
    let rejectFirstCheck!: (error: Error) => void;
    mocks.walletStore.checkInvoiceBolt11
      .mockImplementationOnce(
        () =>
          new Promise((_resolve, reject) => {
            rejectFirstCheck = reject;
          })
      )
      .mockRejectedValue(new Error("pending"));

    await worker.invoiceCheckWorker("quote-id");
    vi.advanceTimersByTime(100);
    await flushPromises();
    vi.advanceTimersByTime(100);
    await flushPromises();

    expect(mocks.walletStore.checkInvoiceBolt11).toHaveBeenCalledOnce();

    rejectFirstCheck(new Error("pending"));
    await flushPromises();
    vi.advanceTimersByTime(100);
    await flushPromises();

    expect(mocks.walletStore.checkInvoiceBolt11).toHaveBeenCalledTimes(2);
  });
});
