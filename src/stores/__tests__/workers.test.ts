import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  walletStore: {
    checkInvoiceBolt11: vi.fn(),
    checkTokenSpendable: vi.fn(),
  },
  settingsStore: {
    checkSentTokens: true,
  },
  sendTokensStore: {
    showSendTokens: true,
  },
  tokensStore: {},
}));

vi.mock("src/stores/wallet", () => ({
  useWalletStore: () => mocks.walletStore,
}));
vi.mock("src/stores/settings", () => ({
  useSettingsStore: () => mocks.settingsStore,
}));
vi.mock("src/stores/sendTokensStore", () => ({
  useSendTokensStore: () => mocks.sendTokensStore,
}));
vi.mock("src/stores/tokens", () => ({
  useTokensStore: () => mocks.tokensStore,
}));

import { useWorkersStore } from "src/stores/workers";

function flushPromises() {
  return Promise.resolve().then(() => Promise.resolve());
}

describe("legacy workers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mocks.settingsStore.checkSentTokens = true;
    mocks.sendTokensStore.showSendTokens = true;
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

  it("does not overlap sent-token checks", async () => {
    const worker = useWorkersStore();
    worker.checkInterval = 100;
    let resolveFirstCheck!: (paid: boolean) => void;
    mocks.walletStore.checkTokenSpendable
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirstCheck = resolve;
          })
      )
      .mockResolvedValue(false);

    await worker.checkTokenSpendableWorker({ token: "token-id" } as any);
    vi.advanceTimersByTime(100);
    await flushPromises();
    vi.advanceTimersByTime(100);
    await flushPromises();

    expect(mocks.walletStore.checkTokenSpendable).toHaveBeenCalledOnce();

    resolveFirstCheck(false);
    await flushPromises();
    vi.advanceTimersByTime(100);
    await flushPromises();

    expect(mocks.walletStore.checkTokenSpendable).toHaveBeenCalledTimes(2);
  });
});
