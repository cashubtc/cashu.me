import { beforeEach, describe, expect, it, vi } from "vitest";
import { useInvoicesWorkerStore } from "src/stores/invoicesWorker";
import { useMintsStore } from "src/stores/mints";
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
    worker.bolt11BatchCooldowns = {};
    worker.lastInvoiceCheckTime = 0;
    worker.lastOutgoingCheckTime = 0;
    useMintsStore().mints = [];
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

  it("can force-start incoming check queues when a dialog is opened", () => {
    const worker = useInvoicesWorkerStore();
    const startSpy = vi
      .spyOn(worker, "startInvoiceCheckerWorker")
      .mockImplementation(() => {});

    worker.addInvoiceToChecker("bolt11-q", true);
    worker.addBolt12OfferToChecker("bolt12-q", true);

    expect(startSpy).toHaveBeenCalledWith(true);
    expect(worker.quotes.map((q) => q.quote)).toContain("bolt11-q");
    expect(worker.bolt12Quotes.map((q) => q.quote)).toContain("bolt12-q");
  });

  it("detects advertised NUT-29 Bolt11 batch support", () => {
    const worker = useInvoicesWorkerStore();

    expect(
      worker.mintSupportsNut29Bolt11Batch({
        url: "https://mint.example",
        info: { nuts: { 29: {} } },
      })
    ).toBe(true);
    expect(
      worker.mintSupportsNut29Bolt11Batch({
        url: "https://mint.example",
        info: { nuts: { 29: { methods: ["bolt11"] } } },
      })
    ).toBe(true);
    expect(
      worker.mintSupportsNut29Bolt11Batch({
        url: "https://mint.example",
        info: { nuts: { 29: { methods: [{ method: "bolt11" }] } } },
      })
    ).toBe(true);
    expect(
      worker.mintSupportsNut29Bolt11Batch({
        url: "https://mint.example",
        info: { nuts: { 29: { methods: ["bolt12"] } } },
      })
    ).toBe(false);
    expect(
      worker.mintSupportsNut29Bolt11Batch({
        url: "https://mint.example",
        info: { nuts: {} },
      })
    ).toBe(false);
  });

  it("scopes Bolt11 batch cooldowns by mint, unit, and method", () => {
    const worker = useInvoicesWorkerStore();
    const now = Date.now();

    worker.recordBolt11BatchFailure(
      "https://mint.example",
      "sat",
      new Error("batch unavailable"),
      now
    );

    expect(
      worker.bolt11BatchInCooldown("https://mint.example", "sat", now + 1)
    ).toBe(true);
    expect(
      worker.bolt11BatchInCooldown("https://mint.example", "usd", now + 1)
    ).toBe(false);
    expect(
      worker.bolt11BatchCooldowns[
        worker.bolt11BatchCooldownKey("https://mint.example", "sat", "bolt11")
      ]
    ).toEqual(
      expect.objectContaining({
        failedAt: now,
        failureCount: 1,
        lastError: "batch unavailable",
      })
    );
  });

  it("uses the existing single Bolt11 checker when NUT-29 Bolt11 is not advertised", async () => {
    const worker = useInvoicesWorkerStore();
    const mintStore = useMintsStore();
    const now = Date.now();
    worker.lastInvoiceCheckTime = 0;
    worker.quotes = [
      {
        quote: "bolt11-q",
        addedAt: now - 1_000,
        lastChecked: 0,
        checkCount: 0,
      },
    ];
    mintStore.mints = [
      {
        url: "https://mint.example",
        info: { nuts: { 29: { methods: ["bolt12"] } } },
        keysets: [],
        keys: [],
      },
    ];

    const walletStore = {
      invoiceHistory: [
        {
          quote: "bolt11-q",
          amount: 21,
          date: new Date(now).toISOString(),
          status: "pending",
          mint: "https://mint.example",
          unit: "sat",
          type: PaymentMethod.Bolt11,
        },
      ],
      checkInvoiceBolt11: vi.fn(),
    };

    await worker.processIncomingQueues(now, walletStore);

    expect(
      worker.canUseBolt11BatchPath(walletStore.invoiceHistory[0], now)
    ).toBe(false);
    expect(walletStore.checkInvoiceBolt11).toHaveBeenCalledWith(
      "bolt11-q",
      false
    );
    expect(worker.quotes).toEqual([]);
  });

  it("uses the existing single Bolt11 checker while the mint/unit/method batch path is in cooldown", async () => {
    const worker = useInvoicesWorkerStore();
    const mintStore = useMintsStore();
    const now = Date.now();
    worker.lastInvoiceCheckTime = 0;
    worker.quotes = [
      {
        quote: "bolt11-q",
        addedAt: now - 1_000,
        lastChecked: 0,
        checkCount: 0,
      },
    ];
    mintStore.mints = [
      {
        url: "https://mint.example",
        info: { nuts: { 29: {} } },
        keysets: [],
        keys: [],
      },
    ];
    worker.bolt11BatchCooldowns = {
      [worker.bolt11BatchCooldownKey("https://mint.example", "sat")]: {
        failedAt: now - 1_000,
        failureCount: 1,
        nextRetryAt: now + 60_000,
      },
    };

    const walletStore = {
      invoiceHistory: [
        {
          quote: "bolt11-q",
          amount: 21,
          date: new Date(now).toISOString(),
          status: "pending",
          mint: "https://mint.example",
          unit: "sat",
          type: PaymentMethod.Bolt11,
        },
      ],
      checkInvoiceBolt11: vi.fn(),
    };

    await worker.processIncomingQueues(now, walletStore);

    expect(
      worker.canUseBolt11BatchPath(walletStore.invoiceHistory[0], now)
    ).toBe(false);
    expect(walletStore.checkInvoiceBolt11).toHaveBeenCalledWith(
      "bolt11-q",
      false
    );
    expect(worker.quotes).toEqual([]);
  });

  it("preserves existing single Bolt11 checker backoff when a due invoice remains pending", async () => {
    const worker = useInvoicesWorkerStore();
    const now = Date.now();
    worker.lastInvoiceCheckTime = 0;
    worker.quotes = [
      {
        quote: "bolt11-q",
        addedAt: now - 1_000,
        lastChecked: 0,
        checkCount: 0,
      },
    ];

    const walletStore = {
      invoiceHistory: [
        {
          quote: "bolt11-q",
          amount: 21,
          date: new Date(now).toISOString(),
          status: "pending",
          mint: "https://mint.example",
          unit: "sat",
          type: PaymentMethod.Bolt11,
        },
      ],
      checkInvoiceBolt11: vi.fn(async () => {
        throw new Error("invoice state not paid: UNPAID");
      }),
    };

    await worker.processIncomingQueues(now, walletStore);

    expect(walletStore.checkInvoiceBolt11).toHaveBeenCalledWith(
      "bolt11-q",
      false
    );
    expect(worker.quotes).toEqual([
      {
        quote: "bolt11-q",
        addedAt: now - 1_000,
        lastChecked: now,
        checkCount: 1,
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

  it("starts websocket listeners for pending Bolt12 offers on startup", () => {
    const worker = useInvoicesWorkerStore();
    const walletStore = {
      invoiceHistory: [
        {
          quote: "bolt12-q",
          amount: 0,
          date: new Date().toISOString(),
          status: "paid",
          mint: "https://mint.example",
          unit: "sat",
          type: PaymentMethod.Bolt12,
        },
      ],
      mintOnPaidBolt12: vi.fn(async () => {}),
    };

    worker.queuePendingIncomingPayments(walletStore);

    expect(worker.bolt12Quotes.map((q) => q.quote)).toContain("bolt12-q");
    expect(walletStore.mintOnPaidBolt12).toHaveBeenCalledWith(
      "bolt12-q",
      false,
      false
    );
  });
});
