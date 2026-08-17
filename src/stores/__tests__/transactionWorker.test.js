import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTransactionWorkerStore } from "src/stores/transactionWorker";
import { useMintsStore } from "src/stores/mints";
import { usePaymentHistoryStore } from "src/stores/paymentHistory";
import { useProofsStore } from "src/stores/proofs";
import { useSettingsStore } from "src/stores/settings";
import { useUiStore } from "src/stores/ui";
import { useTokensStore } from "src/stores/tokens";
import { cashuDb } from "src/stores/dexie";
import { PaymentMethod } from "src/stores/walletTypes";

function pendingInvoice(quote, overrides = {}) {
  return {
    quote,
    amount: 10,
    date: new Date().toISOString(),
    status: "pending",
    mint: "https://mint.example",
    unit: "sat",
    type: PaymentMethod.Bolt11,
    ...overrides,
  };
}

function queuedQuote(quote, addedAt, overrides = {}) {
  return {
    quote,
    addedAt,
    lastChecked: 0,
    checkCount: 0,
    ...overrides,
  };
}

function advertiseBatchMint(mintStore, url, params = {}) {
  mintStore.mints.push({
    url,
    keys: [],
    keysets: [],
    info: { nuts: { 29: params } },
  });
}

function unpaidResponse(quote) {
  return {
    quote,
    amount: 10,
    state: "UNPAID",
    request: `lnbc-${quote}`,
    unit: "sat",
  };
}

describe("transaction worker", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await cashuDb.paymentHistory.clear();
    await cashuDb.mintQuotes.clear();

    const worker = useTransactionWorkerStore();
    worker.stopTransactionWorker();
    worker.quotes = [];
    worker.bolt12Quotes = [];
    worker.onchainQuotes = [];
    worker.outgoingPayments = [];
    worker.reusableMintCooldowns = {};
    worker.batchPathCooldowns = {};
    worker.mintLaneInFlight = {};
    worker.mintLastRequestAt = {};
    worker.incomingMintLaneDrainRequested = {};
    worker.mintQuoteClaims = {};

    useMintsStore().mints = [];
    useTokensStore().historyTokens = [];
    const settings = useSettingsStore();
    settings.checkInvoicesOnStartup = true;
    settings.periodicallyCheckIncomingInvoices = true;
    settings.checkSentTokens = true;
  });

  afterEach(() => {
    useTransactionWorkerStore().stopTransactionWorker();
  });

  it.each([
    [{ nuts: { 29: {} } }, true],
    [{ nuts: { 29: { methods: ["bolt11"] } } }, true],
    [{ nuts: { 29: { methods: ["bolt12"] } } }, false],
    [{ nuts: {} }, false],
  ])("detects advertised Bolt11 batch support", (info, expected) => {
    expect(useTransactionWorkerStore().mintSupportsBolt11Batch({ info })).toBe(
      expected
    );
  });

  it.each([
    [PaymentMethod.Bolt12, [PaymentMethod.Bolt12], true],
    [PaymentMethod.Onchain, [PaymentMethod.Onchain], true],
    [PaymentMethod.Bolt12, [PaymentMethod.Bolt11], false],
    [PaymentMethod.Onchain, undefined, false],
  ])(
    "detects batch support per payment method",
    (method, methods, expected) => {
      expect(
        useTransactionWorkerStore().mintSupportsBatch(
          { info: { nuts: { 29: methods ? { methods } : {} } } },
          method
        )
      ).toBe(expected);
    }
  );

  it("uses the normalized batch cap", () => {
    const worker = useTransactionWorkerStore();

    expect(worker.bolt11BatchSizeLimit({ info: { nuts: { 29: {} } } })).toBe(
      100
    );
  });

  it("keeps old pending Bolt11 invoices eligible", () => {
    const oldInvoice = pendingInvoice("old-q", {
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1_000).toISOString(),
    });

    expect(useTransactionWorkerStore().shouldCheckInvoice(oldInvoice)).toBe(
      true
    );
  });

  it("starts for sent-token checks when incoming polling is disabled", () => {
    const worker = useTransactionWorkerStore();
    useSettingsStore().periodicallyCheckIncomingInvoices = false;
    useSettingsStore().checkSentTokens = true;

    worker.startTransactionWorker();

    expect(worker.transactionCheckListener).not.toBeNull();
  });

  it("continues other mint lanes while one mint is still pending", async () => {
    const worker = useTransactionWorkerStore();
    const mintStore = useMintsStore();
    const now = Date.now();
    advertiseBatchMint(mintStore, "https://slow.example");
    mintStore.mints.push({
      url: "https://fast.example",
      keys: [],
      keysets: [],
      info: { nuts: {} },
    });
    worker.quotes = [queuedQuote("slow-q", now - 20_000)];
    worker.outgoingPayments = [
      {
        id: "fast-out-1",
        type: "invoice",
        addedAt: now - 20_000,
        lastChecked: 0,
        checkCount: 0,
      },
      {
        id: "fast-out-2",
        type: "invoice",
        addedAt: now - 10_000,
        lastChecked: 0,
        checkCount: 0,
      },
    ];
    let resolveSlow;
    const slowPending = new Promise((resolve) => {
      resolveSlow = resolve;
    });
    vi.spyOn(usePaymentHistoryStore(), "upsertMintQuote").mockResolvedValue();
    const checkOutgoingInvoice = vi.fn(async () => {});
    const walletStore = {
      invoiceHistory: [
        pendingInvoice("slow-q", { mint: "https://slow.example" }),
        pendingInvoice("fast-out-1", {
          amount: -10,
          mint: "https://fast.example",
        }),
        pendingInvoice("fast-out-2", {
          amount: -10,
          mint: "https://fast.example",
        }),
      ],
      mintWallet: vi.fn(async () => ({
        checkMintQuoteBatchBolt11: vi.fn(() => slowPending),
      })),
      checkOutgoingInvoice,
      syncPaymentHistoryCache: vi.fn(),
    };

    const firstDispatch = worker.processTransactions(walletStore);
    await vi.waitFor(() =>
      expect(checkOutgoingInvoice).toHaveBeenCalledWith("fast-out-1", false)
    );
    await vi.waitFor(() =>
      expect(worker.mintLaneInFlight["https://fast.example"]).toBeUndefined()
    );

    worker.mintLastRequestAt["https://fast.example"] =
      Date.now() - worker.checkInterval;
    const secondDispatch = worker.processTransactions(walletStore);
    await vi.waitFor(() =>
      expect(checkOutgoingInvoice).toHaveBeenCalledWith("fast-out-2", false)
    );

    expect(worker.mintLaneInFlight["https://slow.example"]).toBe(true);
    resolveSlow([unpaidResponse("slow-q")]);
    await Promise.all([firstDispatch, secondDispatch]);
  });

  it("processes sent ecash through independent per-mint lanes", async () => {
    const worker = useTransactionWorkerStore();
    const now = Date.now();
    const slowMint = "https://slow.example";
    const fastMint = "https://fast.example";
    useTokensStore().historyTokens = [
      {
        token: "slow-token",
        amount: -10,
        date: new Date(now).toISOString(),
        status: "pending",
        mint: slowMint,
        unit: "sat",
      },
      {
        token: "fast-token",
        amount: -10,
        date: new Date(now).toISOString(),
        status: "pending",
        mint: fastMint,
        unit: "sat",
      },
    ];
    worker.outgoingPayments = [
      {
        id: "slow-token",
        type: "token",
        addedAt: now - 20_000,
        lastChecked: 0,
        checkCount: 0,
      },
      {
        id: "fast-token",
        type: "token",
        addedAt: now - 10_000,
        lastChecked: 0,
        checkCount: 0,
      },
    ];
    let resolveSlowCheck;
    const slowCheck = new Promise((resolve) => {
      resolveSlowCheck = resolve;
    });
    const checkTokenSpendable = vi.fn((historyToken) =>
      historyToken.token === "slow-token" ? slowCheck : Promise.resolve(false)
    );
    const walletStore = {
      invoiceHistory: [],
      checkTokenSpendable,
    };

    const processing = worker.processTransactions(walletStore);
    await vi.waitFor(() =>
      expect(checkTokenSpendable).toHaveBeenCalledWith(
        expect.objectContaining({ token: "fast-token" }),
        false
      )
    );
    expect(worker.mintLaneInFlight[slowMint]).toBe(true);

    resolveSlowCheck(false);
    await processing;
    expect(checkTokenSpendable).toHaveBeenCalledTimes(2);
    expect(
      worker.outgoingPayments.every((entry) => entry.checkCount === 1)
    ).toBe(true);
  });

  it("never overlaps work within the same mint lane", async () => {
    const worker = useTransactionWorkerStore();
    const mintStore = useMintsStore();
    const now = Date.now();
    mintStore.mints.push({
      url: "https://mint.example",
      keys: [],
      keysets: [],
      info: { nuts: {} },
    });
    worker.quotes = [
      queuedQuote("first-q", now - 20_000),
      queuedQuote("second-q", now - 10_000),
    ];
    let resolveFirst;
    const firstPending = new Promise((resolve) => {
      resolveFirst = resolve;
    });
    const checkInvoiceBolt11 = vi
      .fn()
      .mockReturnValueOnce(firstPending)
      .mockResolvedValueOnce(undefined);
    const walletStore = {
      invoiceHistory: [pendingInvoice("first-q"), pendingInvoice("second-q")],
      checkInvoiceBolt11,
    };

    const firstDispatch = worker.processTransactions(walletStore);
    await vi.waitFor(() => expect(checkInvoiceBolt11).toHaveBeenCalledOnce());
    worker.mintLastRequestAt["https://mint.example"] = 0;
    await worker.processTransactions(walletStore);

    expect(checkInvoiceBolt11).toHaveBeenCalledOnce();
    resolveFirst();
    await firstDispatch;

    worker.mintLastRequestAt["https://mint.example"] = 0;
    await worker.processTransactions(walletStore);
    expect(checkInvoiceBolt11).toHaveBeenCalledTimes(2);
  });

  it("drains newly arrived quotes after the active mint-lane request", async () => {
    const worker = useTransactionWorkerStore();
    const mintStore = useMintsStore();
    const now = Date.now();
    mintStore.mints.push({
      url: "https://mint.example",
      keys: [],
      keysets: [],
      info: { nuts: {} },
    });
    worker.quotes = [queuedQuote("first-q", now - 20_000)];
    let resolveFirst;
    const firstPending = new Promise((resolve) => {
      resolveFirst = resolve;
    });
    const checkInvoiceBolt11 = vi
      .fn()
      .mockReturnValueOnce(firstPending)
      .mockResolvedValueOnce(undefined);
    const walletStore = {
      invoiceHistory: [pendingInvoice("first-q"), pendingInvoice("new-q")],
      checkInvoiceBolt11,
    };

    const activeRequest = worker.processTransactions(walletStore);
    await vi.waitFor(() => expect(checkInvoiceBolt11).toHaveBeenCalledOnce());
    worker.addInvoiceToChecker("new-q");
    await worker.processIncomingTransactionsNow(walletStore);

    resolveFirst();
    await activeRequest;

    expect(checkInvoiceBolt11).toHaveBeenCalledTimes(2);
    expect(checkInvoiceBolt11).toHaveBeenLastCalledWith("new-q", false);
  });

  it("switches an active outgoing lane to an immediate incoming drain", async () => {
    const worker = useTransactionWorkerStore();
    const now = Date.now();
    useSettingsStore().periodicallyCheckIncomingInvoices = false;
    worker.outgoingPayments = [
      {
        id: "outgoing-q",
        type: "invoice",
        addedAt: now - 20_000,
        lastChecked: 0,
        checkCount: 0,
      },
    ];
    let resolveOutgoing;
    const outgoingPending = new Promise((resolve) => {
      resolveOutgoing = resolve;
    });
    const checkOutgoingInvoice = vi.fn(() => outgoingPending);
    const checkInvoiceBolt11 = vi.fn(async () => {});
    const walletStore = {
      invoiceHistory: [
        pendingInvoice("outgoing-q", { amount: -10 }),
        pendingInvoice("incoming-q"),
      ],
      checkOutgoingInvoice,
      checkInvoiceBolt11,
    };

    const activeRequest = worker.processTransactions(walletStore);
    await vi.waitFor(() => expect(checkOutgoingInvoice).toHaveBeenCalledOnce());
    worker.addInvoiceToChecker("incoming-q");
    await worker.processIncomingTransactionsNow(walletStore);

    resolveOutgoing();
    await activeRequest;

    expect(checkInvoiceBolt11).toHaveBeenCalledWith("incoming-q", false);
  });

  it("rate-limits completed requests per mint, not globally", async () => {
    const worker = useTransactionWorkerStore();
    const mintStore = useMintsStore();
    const now = Date.now();
    mintStore.mints.push({
      url: "https://mint.example",
      keys: [],
      keysets: [],
      info: { nuts: {} },
    });
    worker.quotes = [
      queuedQuote("first-q", now - 20_000),
      queuedQuote("second-q", now - 10_000),
    ];
    const checkInvoiceBolt11 = vi.fn(async () => {
      throw new Error("invoice pending");
    });
    const walletStore = {
      invoiceHistory: [pendingInvoice("first-q"), pendingInvoice("second-q")],
      checkInvoiceBolt11,
    };

    await worker.processTransactions(walletStore);
    await worker.processTransactions(walletStore);
    expect(checkInvoiceBolt11).toHaveBeenCalledOnce();

    worker.mintLastRequestAt["https://mint.example"] =
      Date.now() - worker.checkInterval;
    await worker.processTransactions(walletStore);
    expect(checkInvoiceBolt11).toHaveBeenCalledTimes(2);
    expect(checkInvoiceBolt11.mock.calls[0][0]).toBe("second-q");
    expect(checkInvoiceBolt11.mock.calls[1][0]).toBe("first-q");
  });

  it("batch-checks every due quote for a mint in one request", async () => {
    const worker = useTransactionWorkerStore();
    const mintStore = useMintsStore();
    const now = Date.now();
    advertiseBatchMint(mintStore, "https://mint.example");
    worker.quotes = [
      queuedQuote("first-q", now - 30_000),
      queuedQuote("second-q", now - 20_000),
      queuedQuote("third-q", now - 10_000),
    ];
    vi.spyOn(usePaymentHistoryStore(), "upsertMintQuote").mockResolvedValue();
    const checkMintQuoteBatchBolt11 = vi.fn(async (quotes) =>
      quotes.map(unpaidResponse)
    );
    const walletStore = {
      invoiceHistory: [
        pendingInvoice("first-q"),
        pendingInvoice("second-q"),
        pendingInvoice("third-q"),
      ],
      mintWallet: vi.fn(async () => ({ checkMintQuoteBatchBolt11 })),
      syncPaymentHistoryCache: vi.fn(),
    };

    await worker.processTransactions(walletStore);

    expect(checkMintQuoteBatchBolt11).toHaveBeenCalledWith([
      "third-q",
      "second-q",
      "first-q",
    ]);
    expect(worker.quotes.every((entry) => entry.checkCount === 1)).toBe(true);
  });

  it("honors the mint's batch cap and selects the newest quotes", async () => {
    const worker = useTransactionWorkerStore();
    const mintStore = useMintsStore();
    const now = Date.now();
    advertiseBatchMint(mintStore, "https://mint.example", {
      max_batch_size: 2,
    });
    worker.quotes = [
      queuedQuote("new-q", now - 10_000),
      queuedQuote("old-q", now - 30_000),
      queuedQuote("middle-q", now - 20_000),
    ];
    vi.spyOn(usePaymentHistoryStore(), "upsertMintQuote").mockResolvedValue();
    const checkMintQuoteBatchBolt11 = vi.fn(async (quotes) =>
      quotes.map(unpaidResponse)
    );
    const walletStore = {
      invoiceHistory: [
        pendingInvoice("new-q"),
        pendingInvoice("old-q"),
        pendingInvoice("middle-q"),
      ],
      mintWallet: vi.fn(async () => ({ checkMintQuoteBatchBolt11 })),
      syncPaymentHistoryCache: vi.fn(),
    };

    await worker.processTransactions(walletStore);

    expect(checkMintQuoteBatchBolt11).toHaveBeenCalledWith([
      "new-q",
      "middle-q",
    ]);
    expect(
      worker.quotes.find((entry) => entry.quote === "old-q").checkCount
    ).toBe(0);
  });

  it("does not hold the wallet mutex during a mint's batch request", async () => {
    const worker = useTransactionWorkerStore();
    const mintStore = useMintsStore();
    const now = Date.now();
    const slowMint = "https://slow.example";
    const fastMint = "https://fast.example";
    advertiseBatchMint(mintStore, slowMint);
    advertiseBatchMint(mintStore, fastMint);
    mintStore.mints.forEach((mint) => {
      mint.keysets = [{ id: "00aa", unit: "sat", active: true }];
    });
    worker.quotes = [
      queuedQuote("slow-q", now - 20_000),
      queuedQuote("fast-q", now - 10_000),
    ];
    vi.spyOn(usePaymentHistoryStore(), "upsertMintQuote").mockResolvedValue();
    vi.spyOn(useProofsStore(), "addProofs").mockResolvedValue();

    let resolveSlowMint;
    const slowMintPending = new Promise((resolve) => {
      resolveSlowMint = resolve;
    });
    const completeBatchMintByMint = {
      [slowMint]: vi.fn(() => slowMintPending),
      [fastMint]: vi.fn(async () => [{ amount: 10, secret: "fast-proof" }]),
    };
    const walletStore = {
      invoiceHistory: [
        pendingInvoice("slow-q", { mint: slowMint }),
        pendingInvoice("fast-q", { mint: fastMint }),
      ],
      mintWallet: vi.fn(async (mintUrl) => ({
        checkMintQuoteBatchBolt11: vi.fn(async (quotes) =>
          quotes.map((quote) => ({
            ...unpaidResponse(quote),
            state: "PAID",
          }))
        ),
        prepareBatchMint: vi.fn(async () => ({ preview: true })),
        completeBatchMint: completeBatchMintByMint[mintUrl],
      })),
      getKeyset: vi.fn(() => "00aa"),
      retryOnceOnSignedOutputs: vi.fn(
        async (_keysetId, operation) => await operation()
      ),
      setInvoicePaid: vi.fn(),
      syncPaymentHistoryCache: vi.fn(),
    };

    const processing = worker.processTransactions(walletStore);
    await vi.waitFor(() =>
      expect(completeBatchMintByMint[slowMint]).toHaveBeenCalledOnce()
    );
    await vi.waitFor(() =>
      expect(completeBatchMintByMint[fastMint]).toHaveBeenCalledOnce()
    );

    resolveSlowMint([{ amount: 10, secret: "slow-proof" }]);
    await processing;
  });

  it("batch-mints paid quotes and retains unpaid quotes", async () => {
    const worker = useTransactionWorkerStore();
    const mintStore = useMintsStore();
    const now = Date.now();
    advertiseBatchMint(mintStore, "https://mint.example");
    mintStore.mints[0].keysets = [{ id: "00aa", unit: "sat", active: true }];
    worker.quotes = [
      queuedQuote("paid-q", now - 20_000),
      queuedQuote("unpaid-q", now - 10_000),
    ];
    vi.spyOn(usePaymentHistoryStore(), "upsertMintQuote").mockResolvedValue();
    const addProofs = vi
      .spyOn(useProofsStore(), "addProofs")
      .mockResolvedValue();
    vi.spyOn(useUiStore(), "lockMutex").mockResolvedValue();
    vi.spyOn(useUiStore(), "unlockMutex").mockImplementation(() => {});
    const mintWallet = {
      checkMintQuoteBatchBolt11: vi.fn(async (quotes) =>
        quotes.map((quote) =>
          quote === "paid-q"
            ? { ...unpaidResponse(quote), state: "PAID" }
            : unpaidResponse(quote)
        )
      ),
      prepareBatchMint: vi.fn(async () => ({ preview: true })),
      completeBatchMint: vi.fn(async () => [{ amount: 10, secret: "proof" }]),
    };
    const walletStore = {
      invoiceHistory: [pendingInvoice("paid-q"), pendingInvoice("unpaid-q")],
      mintWallet: vi.fn(async () => mintWallet),
      getKeyset: vi.fn(() => "00aa"),
      retryOnceOnSignedOutputs: vi.fn(
        async (_keysetId, operation) => await operation()
      ),
      setInvoicePaid: vi.fn(),
      syncPaymentHistoryCache: vi.fn(),
    };

    await worker.processTransactions(walletStore);

    expect(mintWallet.prepareBatchMint).toHaveBeenCalledOnce();
    expect(addProofs).toHaveBeenCalledOnce();
    expect(walletStore.setInvoicePaid).toHaveBeenCalledWith(
      "paid-q",
      expect.any(Object)
    );
    expect(worker.quotes).toEqual([
      expect.objectContaining({ quote: "unpaid-q", checkCount: 1 }),
    ]);
  });

  it.each([PaymentMethod.Bolt12, PaymentMethod.Onchain])(
    "batch-checks and batch-mints paid %s quotes",
    async (method) => {
      const worker = useTransactionWorkerStore();
      const mintStore = useMintsStore();
      const mintUrl = "https://mint.example";
      const now = Date.now();
      advertiseBatchMint(mintStore, mintUrl, { methods: [method] });
      mintStore.mints[0].keysets = [{ id: "00aa", unit: "sat", active: true }];
      const queue = [
        queuedQuote("old-q", now - 20_000, { usesBatchPath: true }),
        queuedQuote("new-q", now - 10_000, { usesBatchPath: true }),
      ];
      if (method === PaymentMethod.Bolt12) {
        worker.bolt12Quotes = queue;
      } else {
        worker.onchainQuotes = queue;
      }

      vi.spyOn(usePaymentHistoryStore(), "upsertMintQuote").mockResolvedValue();
      const addProofs = vi
        .spyOn(useProofsStore(), "addProofs")
        .mockResolvedValue();
      vi.spyOn(useUiStore(), "lockMutex").mockResolvedValue();
      vi.spyOn(useUiStore(), "unlockMutex").mockImplementation(() => {});

      const checkBatch = vi.fn(async (...args) => {
        const quotes = args.at(-1);
        const issued = checkBatch.mock.calls.length >= 3 ? 10 : 0;
        return quotes.map((quote) => ({
          quote,
          amount: null,
          amount_paid: 10,
          amount_issued: issued,
          state: "PAID",
          request: `${method}-${quote}`,
          unit: "sat",
        }));
      });
      const mintWallet = {
        ...(method === PaymentMethod.Bolt12
          ? { checkMintQuoteBatchBolt12: checkBatch }
          : { checkMintQuoteBatch: checkBatch }),
        prepareBatchMint: vi.fn(async () => ({ preview: true })),
        completeBatchMint: vi.fn(async () => [
          { amount: 10, secret: "proof-1" },
          { amount: 10, secret: "proof-2" },
        ]),
      };
      const walletStore = {
        invoiceHistory: [
          pendingInvoice("old-q", { amount: 0, type: method }),
          pendingInvoice("new-q", { amount: 0, type: method }),
        ],
        invoiceData: {},
        mintWallet: vi.fn(async () => mintWallet),
        getKeyset: vi.fn(() => "00aa"),
        retryOnceOnSignedOutputs: vi.fn(
          async (_keysetId, operation) => await operation()
        ),
        setInvoicePaid: vi.fn(),
        addPaymentHistory: vi.fn(),
        syncPaymentHistoryCache: vi.fn(),
      };

      await worker.processIncomingTransactionsNow(walletStore);

      if (method === PaymentMethod.Bolt12) {
        expect(checkBatch).toHaveBeenNthCalledWith(1, ["new-q", "old-q"]);
      } else {
        expect(checkBatch).toHaveBeenNthCalledWith(1, method, [
          "new-q",
          "old-q",
        ]);
      }
      expect(mintWallet.prepareBatchMint).toHaveBeenCalledWith(
        method,
        [
          expect.objectContaining({ amount: 10 }),
          expect.objectContaining({ amount: 10 }),
        ],
        expect.objectContaining({ keysetId: "00aa" })
      );
      expect(addProofs).toHaveBeenCalledOnce();
      expect(walletStore.setInvoicePaid).toHaveBeenCalledTimes(2);
    }
  );

  it("does not batch-mint a quote already issued by its WebSocket callback", async () => {
    const worker = useTransactionWorkerStore();
    const mintStore = useMintsStore();
    const now = Date.now();
    advertiseBatchMint(mintStore, "https://mint.example");
    mintStore.mints[0].keysets = [{ id: "00aa", unit: "sat", active: true }];
    worker.quotes = [queuedQuote("race-q", now - 20_000)];
    vi.spyOn(usePaymentHistoryStore(), "upsertMintQuote").mockResolvedValue();
    vi.spyOn(useUiStore(), "lockMutex").mockResolvedValue();
    vi.spyOn(useUiStore(), "unlockMutex").mockImplementation(() => {});
    const checkMintQuoteBatchBolt11 = vi
      .fn()
      .mockResolvedValueOnce([{ ...unpaidResponse("race-q"), state: "PAID" }])
      .mockResolvedValueOnce([
        { ...unpaidResponse("race-q"), state: "ISSUED" },
      ]);
    const prepareBatchMint = vi.fn();
    const walletStore = {
      invoiceHistory: [pendingInvoice("race-q")],
      mintWallet: vi.fn(async () => ({
        checkMintQuoteBatchBolt11,
        prepareBatchMint,
      })),
      getKeyset: vi.fn(() => "00aa"),
      retryOnceOnSignedOutputs: vi.fn(),
      setInvoicePaid: vi.fn(),
      syncPaymentHistoryCache: vi.fn(),
    };

    await worker.processTransactions(walletStore);

    expect(checkMintQuoteBatchBolt11).toHaveBeenCalledTimes(2);
    expect(prepareBatchMint).not.toHaveBeenCalled();
    expect(walletStore.setInvoicePaid).toHaveBeenCalledWith(
      "race-q",
      expect.objectContaining({
        mintQuote: expect.objectContaining({ state: "ISSUED" }),
      })
    );
    expect(worker.quotes).toEqual([]);
  });

  it("falls back to singles when a mint's batch path is broken", async () => {
    const worker = useTransactionWorkerStore();
    const mintStore = useMintsStore();
    const now = Date.now();
    advertiseBatchMint(mintStore, "https://mint.example");
    worker.quotes = [
      queuedQuote("first-q", now - 20_000),
      queuedQuote("second-q", now - 10_000),
    ];
    const checkMintQuoteBatchBolt11 = vi.fn(async () => [
      unpaidResponse("first-q"),
      unpaidResponse("second-q"),
    ]);
    const walletStore = {
      invoiceHistory: [pendingInvoice("first-q"), pendingInvoice("second-q")],
      mintWallet: vi.fn(async () => ({
        checkMintQuoteBatchBolt11,
      })),
      checkInvoiceBolt11: vi.fn(async () => {
        throw new Error("invoice pending");
      }),
    };

    await worker.processTransactions(walletStore);

    expect(walletStore.checkInvoiceBolt11).not.toHaveBeenCalled();
    expect(worker.quotes.every((entry) => entry.checkCount === 1)).toBe(true);
    expect(
      worker.reusableMintCooldowns["https://mint.example"]
    ).toBeUndefined();
    expect(
      worker.batchPathCooldowns[
        worker.batchPathKey("https://mint.example", "sat")
      ]
    ).toEqual(expect.objectContaining({ failureCount: 1 }));

    worker.mintLastRequestAt["https://mint.example"] = 0;
    worker.quotes.forEach((entry) => {
      entry.lastChecked = 0;
    });
    await worker.processTransactions(walletStore);

    expect(checkMintQuoteBatchBolt11).toHaveBeenCalledOnce();
    expect(walletStore.checkInvoiceBolt11).toHaveBeenCalledWith(
      "first-q",
      false
    );
  });

  it("keeps network failures on the mint-wide cooldown", async () => {
    const worker = useTransactionWorkerStore();
    const mintStore = useMintsStore();
    const now = Date.now();
    advertiseBatchMint(mintStore, "https://mint.example");
    worker.quotes = [queuedQuote("first-q", now - 20_000)];
    const walletStore = {
      invoiceHistory: [pendingInvoice("first-q")],
      mintWallet: vi.fn(async () => ({
        checkMintQuoteBatchBolt11: vi.fn(async () => {
          throw new Error("NetworkError: request timed out");
        }),
      })),
    };

    await worker.processTransactions(walletStore);

    expect(worker.reusableMintCooldowns["https://mint.example"]).toEqual(
      expect.objectContaining({ failureCount: 1 })
    );
    expect(
      worker.batchPathCooldowns[
        worker.batchPathKey("https://mint.example", "sat")
      ]
    ).toBeUndefined();
  });

  it("does not dispatch sent-token checks when the privacy setting is off", async () => {
    const worker = useTransactionWorkerStore();
    const mintStore = useMintsStore();
    const now = Date.now();
    useSettingsStore().checkSentTokens = false;
    mintStore.mints.push({
      url: "https://mint.example",
      keys: [],
      keysets: [],
      info: { nuts: {} },
    });
    worker.outgoingPayments = [
      {
        id: "outgoing-q",
        type: "invoice",
        addedAt: now - 20_000,
        lastChecked: 0,
        checkCount: 0,
      },
    ];
    const walletStore = {
      invoiceHistory: [pendingInvoice("outgoing-q", { amount: -10 })],
      checkOutgoingInvoice: vi.fn(),
    };

    await worker.processTransactions(walletStore);
    await worker.processOutgoingQueue(now, walletStore);

    expect(walletStore.checkOutgoingInvoice).not.toHaveBeenCalled();
  });

  it("backs off only the failing mint", async () => {
    const worker = useTransactionWorkerStore();
    const mintStore = useMintsStore();
    const now = Date.now();
    advertiseBatchMint(mintStore, "https://offline.example");
    mintStore.mints.push({
      url: "https://online.example",
      keys: [],
      keysets: [],
      info: { nuts: {} },
    });
    worker.quotes = [
      queuedQuote("offline-q", now - 20_000),
      queuedQuote("online-q", now - 10_000),
    ];
    const checkInvoiceBolt11 = vi.fn(async () => {
      throw new Error("invoice pending");
    });
    const walletStore = {
      invoiceHistory: [
        pendingInvoice("offline-q", { mint: "https://offline.example" }),
        pendingInvoice("online-q", { mint: "https://online.example" }),
      ],
      mintWallet: vi.fn(async () => ({
        checkMintQuoteBatchBolt11: vi.fn(async () => {
          throw new Error("NetworkError: request timed out");
        }),
      })),
      checkInvoiceBolt11,
    };

    await worker.processTransactions(walletStore);

    expect(worker.reusableMintCooldowns["https://offline.example"]).toEqual(
      expect.objectContaining({ failureCount: 1 })
    );
    expect(
      worker.reusableMintCooldowns["https://online.example"]
    ).toBeUndefined();
    expect(checkInvoiceBolt11).toHaveBeenCalledWith("online-q", false);
  });

  it("preserves queue metadata when WebSockets add the same fallback twice", () => {
    const worker = useTransactionWorkerStore();
    vi.spyOn(worker, "startTransactionWorker").mockImplementation(() => {});
    worker.quotes = [
      queuedQuote("bolt11-q", 100, { lastChecked: 200, checkCount: 7 }),
    ];
    worker.onchainQuotes = [
      queuedQuote("onchain-q", 100, { lastChecked: 200, checkCount: 7 }),
    ];

    worker.addInvoiceToChecker("bolt11-q", true);
    worker.addOnchainQuoteToChecker("onchain-q", true);

    expect(worker.quotes[0]).toEqual(
      expect.objectContaining({ addedAt: 100, lastChecked: 200, checkCount: 7 })
    );
    expect(worker.onchainQuotes[0]).toEqual(
      expect.objectContaining({ addedAt: 100, lastChecked: 200, checkCount: 7 })
    );
  });

  it("queues all startup batches but caps and WebSocket-checks single quotes", () => {
    const worker = useTransactionWorkerStore();
    const mintStore = useMintsStore();
    const settingsStore = useSettingsStore();
    const batchMintUrl = "https://batch.example";
    const singleMintUrl = "https://single.example";
    const oldDate = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1_000
    ).toISOString();
    const batchInvoices = Array.from({ length: 55 }, (_, index) =>
      pendingInvoice(`batch-q-${index}`, {
        date: oldDate,
        mint: batchMintUrl,
      })
    );
    const singleInvoices = Array.from({ length: 12 }, (_, index) =>
      pendingInvoice(`single-q-${index}`, {
        date: oldDate,
        mint: singleMintUrl,
      })
    );
    settingsStore.periodicallyCheckIncomingInvoices = true;
    advertiseBatchMint(mintStore, batchMintUrl);
    mintStore.mints.push({
      url: singleMintUrl,
      keys: [],
      keysets: [],
      info: { nuts: {} },
    });
    vi.spyOn(worker, "startTransactionWorker").mockImplementation(() => {});
    const walletStore = {
      invoiceHistory: [...batchInvoices, ...singleInvoices],
      mintOnPaidBolt11: vi.fn(async () => {}),
    };

    worker.queuePendingIncomingPayments(walletStore);

    expect(worker.quotes.filter((entry) => entry.usesBatchPath)).toHaveLength(
      55
    );
    expect(worker.quotes.filter((entry) => !entry.usesBatchPath)).toHaveLength(
      10
    );
    expect(walletStore.mintOnPaidBolt11).toHaveBeenCalledTimes(10);
    expect(
      walletStore.mintOnPaidBolt11.mock.calls.map(([quote]) => quote)
    ).toEqual(singleInvoices.slice(0, 10).map((invoice) => invoice.quote));
  });

  it("immediately starts one startup batch lane for every mint", async () => {
    const worker = useTransactionWorkerStore();
    const mintStore = useMintsStore();
    useSettingsStore().periodicallyCheckIncomingInvoices = false;
    advertiseBatchMint(mintStore, "https://mint-a.example");
    advertiseBatchMint(mintStore, "https://mint-b.example");
    worker.quotes = [
      queuedQuote("a-q", Date.now() - worker.maxAge - 1, {
        usesBatchPath: true,
        lastChecked: Date.now(),
        checkCount: 9,
      }),
    ];
    worker.reusableMintCooldowns["https://mint-a.example"] = {
      failedAt: Date.now(),
      failureCount: 3,
      nextRetryAt: Date.now() + 60_000,
    };
    vi.spyOn(worker, "startTransactionWorker").mockImplementation(() => {});
    vi.spyOn(usePaymentHistoryStore(), "upsertMintQuote").mockResolvedValue();
    const batchChecks = new Map();
    const walletStore = {
      invoiceHistory: [
        pendingInvoice("a-q", { mint: "https://mint-a.example" }),
        pendingInvoice("b-q", { mint: "https://mint-b.example" }),
      ],
      mintOnPaidBolt11: vi.fn(async () => {}),
      mintWallet: vi.fn(async (mintUrl) => {
        const check = vi.fn(async (quotes) => quotes.map(unpaidResponse));
        batchChecks.set(mintUrl, check);
        return { checkMintQuoteBatchBolt11: check };
      }),
      syncPaymentHistoryCache: vi.fn(),
    };

    await worker.checkPendingTransactions(walletStore);

    expect(batchChecks.get("https://mint-a.example")).toHaveBeenCalledWith([
      "a-q",
    ]);
    expect(batchChecks.get("https://mint-b.example")).toHaveBeenCalledWith([
      "b-q",
    ]);
    expect(
      worker.reusableMintCooldowns["https://mint-a.example"]
    ).toBeUndefined();
    expect(walletStore.mintWallet).toHaveBeenCalledTimes(2);
    expect(walletStore.mintOnPaidBolt11).toHaveBeenCalledTimes(2);
    expect(walletStore.mintOnPaidBolt11).toHaveBeenCalledWith(
      "a-q",
      false,
      false
    );
    expect(walletStore.mintOnPaidBolt11).toHaveBeenCalledWith(
      "b-q",
      false,
      false
    );
  });

  it("drains every startup batch through the worker's batch cap", async () => {
    const worker = useTransactionWorkerStore();
    const mintStore = useMintsStore();
    const mintUrl = "https://mint.example";
    advertiseBatchMint(mintStore, mintUrl, { max_batch_size: 2 });
    vi.spyOn(worker, "startTransactionWorker").mockImplementation(() => {});
    vi.spyOn(usePaymentHistoryStore(), "upsertMintQuote").mockResolvedValue();
    const checkMintQuoteBatchBolt11 = vi.fn(async (quotes) =>
      quotes.map(unpaidResponse)
    );
    const walletStore = {
      invoiceHistory: [
        pendingInvoice("q-1"),
        pendingInvoice("q-2"),
        pendingInvoice("q-3"),
      ],
      mintWallet: vi.fn(async () => ({ checkMintQuoteBatchBolt11 })),
      mintOnPaidBolt11: vi.fn(async () => {}),
      syncPaymentHistoryCache: vi.fn(),
    };

    await worker.checkPendingTransactions(walletStore);

    expect(checkMintQuoteBatchBolt11).toHaveBeenCalledTimes(2);
    expect(checkMintQuoteBatchBolt11.mock.calls[0][0]).toHaveLength(2);
    expect(checkMintQuoteBatchBolt11.mock.calls.flat(2).sort()).toEqual([
      "q-1",
      "q-2",
      "q-3",
    ]);
  });

  it("keeps reusable WebSockets and worker queues active together", () => {
    const worker = useTransactionWorkerStore();
    const now = new Date().toISOString();
    vi.spyOn(worker, "startTransactionWorker").mockImplementation(() => {});
    const walletStore = {
      invoiceHistory: [
        pendingInvoice("bolt12-q", {
          amount: 0,
          date: now,
          status: "paid",
          type: PaymentMethod.Bolt12,
        }),
        pendingInvoice("onchain-q", {
          amount: 0,
          date: now,
          status: "paid",
          type: PaymentMethod.Onchain,
        }),
      ],
      mintOnPaidBolt12: vi.fn(async () => {}),
      mintOnPaidOnchain: vi.fn(async () => {}),
    };

    worker.queuePendingIncomingPayments(walletStore);

    expect(worker.bolt12Quotes.map((entry) => entry.quote)).toEqual([
      "bolt12-q",
    ]);
    expect(worker.onchainQuotes.map((entry) => entry.quote)).toEqual([
      "onchain-q",
    ]);
    expect(walletStore.mintOnPaidBolt12).toHaveBeenCalledWith(
      "bolt12-q",
      false,
      false
    );
    expect(walletStore.mintOnPaidOnchain).toHaveBeenCalledWith(
      "onchain-q",
      false,
      false
    );
  });

  it("checks reusable quotes on startup when periodic polling is off", async () => {
    const worker = useTransactionWorkerStore();
    const settingsStore = useSettingsStore();
    settingsStore.periodicallyCheckIncomingInvoices = false;
    settingsStore.checkSentTokens = false;
    const bolt12Check = vi.fn(async () => ({
      quote: "bolt12-q",
      amount_paid: 0,
      amount_issued: 0,
      state: "UNPAID",
    }));
    const onchainCheck = vi.fn(async () => ({
      quote: "onchain-q",
      amount_paid: 0,
      amount_issued: 0,
      state: "UNPAID",
    }));
    vi.spyOn(usePaymentHistoryStore(), "upsertMintQuote").mockResolvedValue();
    const walletStore = {
      invoiceHistory: [
        pendingInvoice("bolt12-q", {
          amount: 0,
          status: "paid",
          mint: "https://bolt12.example",
          type: PaymentMethod.Bolt12,
        }),
        pendingInvoice("onchain-q", {
          amount: 0,
          status: "paid",
          mint: "https://onchain.example",
          type: PaymentMethod.Onchain,
        }),
      ],
      invoiceData: {},
      mintOnPaidBolt12: vi.fn(async () => {}),
      mintOnPaidOnchain: vi.fn(async () => {}),
      mintWallet: vi.fn(async (mintUrl) =>
        mintUrl === "https://bolt12.example"
          ? { checkMintQuoteBolt12: bolt12Check }
          : { checkMintQuoteOnchain: onchainCheck }
      ),
      syncPaymentHistoryCache: vi.fn(),
    };

    await worker.checkPendingTransactions(walletStore);

    expect(bolt12Check).toHaveBeenCalledWith("bolt12-q");
    expect(onchainCheck).toHaveBeenCalledWith("onchain-q");
    expect(worker.bolt12Quotes.map((entry) => entry.quote)).toEqual([
      "bolt12-q",
    ]);
    expect(worker.onchainQuotes.map((entry) => entry.quote)).toEqual([
      "onchain-q",
    ]);
    expect(worker.transactionCheckListener).toBeNull();
  });

  it("persists an on-chain probe with no mintable delta", async () => {
    const worker = useTransactionWorkerStore();
    const now = Date.now();
    const invoice = pendingInvoice("onchain-q", {
      amount: 0,
      status: "paid",
      type: PaymentMethod.Onchain,
    });
    worker.onchainQuotes = [queuedQuote("onchain-q", now - 20_000)];
    const quote = {
      quote: "onchain-q",
      amount_paid: 0,
      amount_issued: 0,
      state: "PENDING",
      confirmations: 1,
    };
    const upsertMintQuote = vi
      .spyOn(usePaymentHistoryStore(), "upsertMintQuote")
      .mockResolvedValue();
    const checkOnchainAndMint = vi.fn();
    const walletStore = {
      invoiceHistory: [invoice],
      invoiceData: { quote: "onchain-q" },
      mintWallet: vi.fn(async () => ({
        checkMintQuoteOnchain: vi.fn(async () => quote),
      })),
      checkOnchainAndMint,
      syncPaymentHistoryCache: vi.fn(),
    };

    await worker.processIncomingQueues(now, walletStore);

    expect(invoice.mintQuote).toEqual(
      expect.objectContaining({
        quote: "onchain-q",
        state: "PENDING",
        confirmations: 1,
        method: PaymentMethod.Onchain,
      })
    );
    expect(upsertMintQuote).toHaveBeenCalledWith(
      invoice.mintQuote,
      PaymentMethod.Onchain
    );
    expect(walletStore.invoiceData.mintQuote).toBe(invoice.mintQuote);
    expect(walletStore.syncPaymentHistoryCache).toHaveBeenCalledOnce();
    expect(checkOnchainAndMint).not.toHaveBeenCalled();
  });
});
