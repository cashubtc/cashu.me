import { beforeEach, describe, expect, it, vi } from "vitest";
import { useInvoicesWorkerStore } from "src/stores/invoicesWorker";
import { PaymentMethod } from "src/stores/walletTypes";

describe("invoices worker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const worker = useInvoicesWorkerStore();
    worker.quotes = [];
    worker.bolt12Quotes = [];
    worker.onchainQuotes = [];
    worker.outgoingPayments = [];
    worker.reusableMintCooldowns = {};
    worker.lastInvoiceCheckTime = 0;
    worker.lastOutgoingCheckTime = 0;
  });

  it("does not reset reusable quote backoff when re-queueing an existing quote", () => {
    const worker = useInvoicesWorkerStore();
    worker.onchainQuotes = [
      {
        quote: "onchain-q",
        addedAt: 100,
        lastChecked: 200,
        checkCount: 7,
      },
    ];

    worker.addOnchainQuoteToChecker("onchain-q", true);

    expect(worker.onchainQuotes).toEqual([
      {
        quote: "onchain-q",
        addedAt: 100,
        lastChecked: 200,
        checkCount: 7,
      },
    ]);
  });

  it("skips reusable quote checks while the quote mint is in cooldown", async () => {
    const worker = useInvoicesWorkerStore();
    const now = Date.now();
    worker.lastInvoiceCheckTime = 0;
    worker.bolt12Quotes = [
      {
        quote: "bolt12-q",
        addedAt: now - 1_000,
        lastChecked: 0,
        checkCount: 0,
      },
    ];
    worker.reusableMintCooldowns = {
      "https://offline.example": {
        failedAt: now - 1_000,
        failureCount: 1,
        nextRetryAt: now + 60_000,
      },
    };

    const walletStore = {
      invoiceHistory: [
        {
          quote: "bolt12-q",
          amount: 0,
          date: new Date(now).toISOString(),
          status: "paid",
          mint: "https://offline.example",
          unit: "sat",
          type: PaymentMethod.Bolt12,
        },
      ],
      checkOfferAndMintBolt12: vi.fn(),
    };

    await worker.processIncomingQueues(now, walletStore);

    expect(walletStore.checkOfferAndMintBolt12).not.toHaveBeenCalled();
    expect(worker.bolt12Quotes[0].checkCount).toBe(0);
  });

  it("puts reusable quote mints into cooldown only for network failures", async () => {
    const worker = useInvoicesWorkerStore();
    const now = Date.now();
    worker.lastInvoiceCheckTime = 0;
    worker.onchainQuotes = [
      {
        quote: "onchain-q",
        addedAt: now - 1_000,
        lastChecked: 0,
        checkCount: 0,
      },
    ];

    const walletStore = {
      invoiceHistory: [
        {
          quote: "onchain-q",
          amount: 0,
          date: new Date(now).toISOString(),
          status: "paid",
          mint: "https://offline.example",
          unit: "sat",
          type: PaymentMethod.Onchain,
        },
      ],
      checkOnchainAndMint: vi.fn(async () => {
        throw new Error("NetworkError: Failed to fetch");
      }),
    };

    await worker.processIncomingQueues(now, walletStore);

    expect(worker.onchainQuotes[0].checkCount).toBe(1);
    expect(worker.reusableMintCooldowns["https://offline.example"]).toEqual(
      expect.objectContaining({
        failedAt: now,
        failureCount: 1,
        lastError: "NetworkError: Failed to fetch",
      })
    );
    expect(
      worker.reusableMintCooldowns["https://offline.example"].nextRetryAt
    ).toBeGreaterThan(now);

    worker.addOnchainQuoteToChecker("onchain-q", true);
    expect(worker.onchainQuotes[0].checkCount).toBe(1);

    worker.reusableMintCooldowns = {};
    worker.lastInvoiceCheckTime = 0;
    worker.onchainQuotes[0].lastChecked = 0;
    worker.onchainQuotes[0].checkCount = 0;
    walletStore.checkOnchainAndMint.mockImplementationOnce(async () => {
      throw new Error("Address not paid");
    });

    await worker.processIncomingQueues(now + 1, walletStore);

    expect(worker.onchainQuotes[0].checkCount).toBe(1);
    expect(worker.reusableMintCooldowns).toEqual({});
  });
});
