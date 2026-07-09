import { beforeEach, describe, expect, it, vi } from "vitest";
import { useInvoicesWorkerStore } from "src/stores/invoicesWorker";
import { useMintsStore } from "src/stores/mints";
import { usePaymentHistoryStore } from "src/stores/paymentHistory";
import { useProofsStore } from "src/stores/proofs";
import { useUiStore } from "src/stores/ui";
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

describe("invoices worker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const worker = useInvoicesWorkerStore();
    worker.quotes = [];
    worker.bolt12Quotes = [];
    worker.onchainQuotes = [];
    worker.outgoingPayments = [];
    worker.reusableMintCooldowns = {};
    worker.batchPathCooldowns = {};
    worker.lastInvoiceCheckTime = 0;
    worker.lastOutgoingCheckTime = 0;
  });

  it.each([
    [{ nuts: { 29: {} } }, true],
    [{ nuts: { 29: { methods: ["bolt11"] } } }, true],
    [{ nuts: { 29: { methods: ["bolt12"] } } }, false],
    [{ nuts: {} }, false],
  ])("detects advertised Bolt11 batch support", (info, expected) => {
    const worker = useInvoicesWorkerStore();

    expect(worker.mintSupportsBolt11Batch({ info })).toBe(expected);
  });

  it("uses cashu-ts's normalized batch cap when the mint omits one", () => {
    const worker = useInvoicesWorkerStore();

    expect(worker.bolt11BatchSizeLimit({ info: { nuts: { 29: {} } } })).toBe(
      100
    );
  });

  it("uses the single-quote checker for a mint without NUT-29 support", async () => {
    const worker = useInvoicesWorkerStore();
    const mintStore = useMintsStore();
    const now = Date.now();
    mintStore.mints = [
      {
        url: "https://mint.example",
        keys: [],
        keysets: [],
        info: { nuts: {} },
      },
    ];
    worker.quotes = [queuedQuote("unsupported-q", now - 10_000)];
    const walletStore = {
      invoiceHistory: [pendingInvoice("unsupported-q")],
      mintWallet: vi.fn(),
      checkInvoiceBolt11: vi.fn(async () => {}),
    };

    await worker.processIncomingQueues(now, walletStore);

    expect(walletStore.mintWallet).not.toHaveBeenCalled();
    expect(walletStore.checkInvoiceBolt11).toHaveBeenCalledWith(
      "unsupported-q",
      false
    );
  });

  it("uses the single-quote checker while an advertised batch path is cooling down", async () => {
    const worker = useInvoicesWorkerStore();
    const mintStore = useMintsStore();
    const now = Date.now();
    mintStore.mints = [
      {
        url: "https://mint.example",
        keys: [],
        keysets: [],
        info: { nuts: { 29: { methods: ["bolt11"] } } },
      },
    ];
    worker.quotes = [
      {
        quote: "bolt11-q",
        addedAt: now - 10_000,
        lastChecked: 0,
        checkCount: 0,
      },
    ];
    worker.batchPathCooldowns = {
      "https://mint.example|sat|bolt11": {
        failedAt: now - 1_000,
        failureCount: 1,
        nextRetryAt: now + 60_000,
      },
    };
    const walletStore = {
      invoiceHistory: [
        {
          quote: "bolt11-q",
          amount: 10,
          date: new Date(now).toISOString(),
          status: "pending",
          mint: "https://mint.example",
          unit: "sat",
          type: PaymentMethod.Bolt11,
        },
      ],
      checkInvoiceBolt11: vi.fn(async () => {}),
    };

    await worker.processIncomingQueues(now, walletStore);

    expect(walletStore.checkInvoiceBolt11).toHaveBeenCalledWith(
      "bolt11-q",
      false
    );
  });

  it("batch-checks one due Bolt11 group and persists unpaid and issued states", async () => {
    const worker = useInvoicesWorkerStore();
    const mintStore = useMintsStore();
    const paymentHistoryStore = usePaymentHistoryStore();
    const now = Date.now();
    advertiseBatchMint(mintStore, "https://mint.example");
    worker.quotes = [
      queuedQuote("unpaid-q", now - 20_000),
      queuedQuote("issued-q", now - 10_000),
    ];
    const invoices = [pendingInvoice("unpaid-q"), pendingInvoice("issued-q")];
    const batchResponses = [
      {
        quote: "unpaid-q",
        amount: "10",
        state: "UNPAID",
        request: "lnbc-unpaid",
        unit: "sat",
      },
      {
        quote: "issued-q",
        amount: "10",
        state: "ISSUED",
        request: "lnbc-issued",
        unit: "sat",
      },
    ];
    const checkMintQuoteBatchBolt11 = vi.fn(async () => batchResponses);
    const upsertMintQuote = vi
      .spyOn(paymentHistoryStore, "upsertMintQuote")
      .mockResolvedValue();
    const walletStore = {
      invoiceHistory: invoices,
      mintWallet: vi.fn(async () => ({ checkMintQuoteBatchBolt11 })),
      checkInvoiceBolt11: vi.fn(),
      setInvoicePaid: vi.fn(async (quote, { mintQuote }) => {
        const invoice = invoices.find((item) => item.quote === quote);
        invoice.status = "paid";
        invoice.mintQuote = mintQuote;
      }),
      syncPaymentHistoryCache: vi.fn(),
    };

    await worker.processIncomingQueues(now, walletStore);

    expect(checkMintQuoteBatchBolt11).toHaveBeenCalledWith([
      "unpaid-q",
      "issued-q",
    ]);
    expect(walletStore.checkInvoiceBolt11).not.toHaveBeenCalled();
    expect(upsertMintQuote).toHaveBeenCalledTimes(2);
    expect(upsertMintQuote).toHaveBeenCalledWith(
      expect.objectContaining({ quote: "unpaid-q", amount: 10 }),
      PaymentMethod.Bolt11
    );
    expect(worker.quotes).toEqual([
      expect.objectContaining({
        quote: "unpaid-q",
        lastChecked: now,
        checkCount: 1,
      }),
    ]);
    expect(walletStore.setInvoicePaid).toHaveBeenCalledWith(
      "issued-q",
      expect.objectContaining({
        mintQuote: expect.objectContaining({ state: "ISSUED", amount: 10 }),
      })
    );
    expect(walletStore.syncPaymentHistoryCache).toHaveBeenCalled();
  });

  it("batch-mints only paid responses before marking their invoices paid", async () => {
    const worker = useInvoicesWorkerStore();
    const mintStore = useMintsStore();
    const paymentHistoryStore = usePaymentHistoryStore();
    const proofsStore = useProofsStore();
    const uiStore = useUiStore();
    const now = Date.now();
    advertiseBatchMint(mintStore, "https://mint.example");
    mintStore.mints[0].keysets = [{ id: "00aa", unit: "sat", active: true }];
    worker.quotes = [
      queuedQuote("paid-q", now - 20_000),
      queuedQuote("unpaid-q", now - 10_000),
    ];
    const invoices = [pendingInvoice("paid-q"), pendingInvoice("unpaid-q")];
    const paidResponse = {
      quote: "paid-q",
      amount: "10",
      state: "PAID",
      request: "lnbc-paid",
      unit: "sat",
    };
    const unpaidResponse = {
      quote: "unpaid-q",
      amount: "10",
      state: "UNPAID",
      request: "lnbc-unpaid",
      unit: "sat",
    };
    const preview = { keysetId: "00aa", quotes: [paidResponse] };
    const proofs = [{ id: "00aa", amount: 10, secret: "batch-proof" }];
    const checkMintQuoteBatchBolt11 = vi.fn(async () => [
      paidResponse,
      unpaidResponse,
    ]);
    const prepareBatchMint = vi.fn(async () => preview);
    const completeBatchMint = vi.fn(async () => {
      expect(uiStore.unlockMutex).not.toHaveBeenCalled();
      return proofs;
    });
    vi.spyOn(paymentHistoryStore, "upsertMintQuote").mockResolvedValue();
    const addProofs = vi.spyOn(proofsStore, "addProofs").mockResolvedValue();
    vi.spyOn(uiStore, "lockMutex").mockResolvedValue();
    vi.spyOn(uiStore, "unlockMutex").mockImplementation(() => {});
    const setInvoicePaid = vi.fn(async (quote) => {
      expect(addProofs).toHaveBeenCalledWith(proofs);
      invoices.find((invoice) => invoice.quote === quote).status = "paid";
    });
    const retryOnceOnSignedOutputs = vi.fn(
      async (_keysetId, operation) => await operation()
    );
    const walletStore = {
      invoiceHistory: invoices,
      mintWallet: vi.fn(async () => ({
        checkMintQuoteBatchBolt11,
        prepareBatchMint,
        completeBatchMint,
      })),
      getKeyset: vi.fn(() => "00aa"),
      retryOnceOnSignedOutputs,
      checkInvoiceBolt11: vi.fn(),
      setInvoicePaid,
      syncPaymentHistoryCache: vi.fn(),
    };

    await worker.processIncomingQueues(now, walletStore);

    expect(prepareBatchMint).toHaveBeenCalledWith(
      PaymentMethod.Bolt11,
      [
        {
          amount: 10,
          quote: expect.objectContaining({ quote: "paid-q", state: "PAID" }),
        },
      ],
      { keysetId: "00aa", proofsWeHave: [] }
    );
    expect(completeBatchMint).toHaveBeenCalledWith(preview);
    expect(retryOnceOnSignedOutputs).toHaveBeenCalledWith(
      "00aa",
      expect.any(Function),
      false
    );
    expect(uiStore.lockMutex).toHaveBeenCalledOnce();
    expect(uiStore.unlockMutex).toHaveBeenCalledOnce();
    expect(addProofs).toHaveBeenCalledWith(proofs);
    expect(setInvoicePaid).toHaveBeenCalledTimes(1);
    expect(setInvoicePaid).toHaveBeenCalledWith(
      "paid-q",
      expect.objectContaining({
        mintQuote: expect.objectContaining({ quote: "paid-q" }),
      })
    );
    expect(worker.quotes).toEqual([
      expect.objectContaining({ quote: "unpaid-q", checkCount: 1 }),
    ]);
  });

  it("batch-mints mixed locked and unlocked quotes with a unique signing key set", async () => {
    const worker = useInvoicesWorkerStore();
    const mintStore = useMintsStore();
    const paymentHistoryStore = usePaymentHistoryStore();
    const proofsStore = useProofsStore();
    const uiStore = useUiStore();
    const now = Date.now();
    const privKey = "0".repeat(63) + "1";
    const pubkey =
      "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798";
    advertiseBatchMint(mintStore, "https://mint.example");
    mintStore.mints[0].keysets = [{ id: "00aa", unit: "sat", active: true }];
    worker.quotes = [
      queuedQuote("locked-q", now - 20_000),
      queuedQuote("open-q", now - 10_000),
    ];
    const responses = [
      {
        quote: "locked-q",
        amount: 10,
        state: "PAID",
        request: "lnbc-locked",
        unit: "sat",
        pubkey,
      },
      {
        quote: "open-q",
        amount: 10,
        state: "PAID",
        request: "lnbc-open",
        unit: "sat",
      },
    ];
    const prepareBatchMint = vi.fn(async () => ({ keysetId: "00aa" }));
    const completeBatchMint = vi.fn(async () => []);
    vi.spyOn(paymentHistoryStore, "upsertMintQuote").mockResolvedValue();
    vi.spyOn(proofsStore, "addProofs").mockResolvedValue();
    vi.spyOn(uiStore, "lockMutex").mockResolvedValue();
    vi.spyOn(uiStore, "unlockMutex").mockImplementation(() => {});
    const walletStore = {
      invoiceHistory: [
        pendingInvoice("locked-q", { privKey }),
        pendingInvoice("open-q"),
      ],
      mintWallet: vi.fn(async () => ({
        checkMintQuoteBatchBolt11: vi.fn(async () => responses),
        prepareBatchMint,
        completeBatchMint,
      })),
      getKeyset: vi.fn(() => "00aa"),
      retryOnceOnSignedOutputs: vi.fn(
        async (_keysetId, operation) => await operation()
      ),
      checkInvoiceBolt11: vi.fn(),
      setInvoicePaid: vi.fn(),
      syncPaymentHistoryCache: vi.fn(),
    };

    await worker.processIncomingQueues(now, walletStore);

    expect(prepareBatchMint).toHaveBeenCalledWith(
      PaymentMethod.Bolt11,
      [
        {
          amount: 10,
          quote: expect.objectContaining({ quote: "locked-q", pubkey }),
        },
        {
          amount: 10,
          quote: expect.objectContaining({ quote: "open-q" }),
        },
      ],
      { keysetId: "00aa", proofsWeHave: [], privkey: [privKey] }
    );
  });

  it("excludes a key-missing locked quote while batch-minting other paid quotes", async () => {
    const worker = useInvoicesWorkerStore();
    const mintStore = useMintsStore();
    const paymentHistoryStore = usePaymentHistoryStore();
    const proofsStore = useProofsStore();
    const uiStore = useUiStore();
    const now = Date.now();
    advertiseBatchMint(mintStore, "https://mint.example");
    mintStore.mints[0].keysets = [{ id: "00aa", unit: "sat", active: true }];
    worker.quotes = [
      queuedQuote("missing-key-q", now - 20_000),
      queuedQuote("open-q", now - 10_000),
    ];
    const responses = [
      {
        quote: "missing-key-q",
        amount: 10,
        state: "PAID",
        request: "lnbc-locked",
        unit: "sat",
        pubkey:
          "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
      },
      {
        quote: "open-q",
        amount: 10,
        state: "PAID",
        request: "lnbc-open",
        unit: "sat",
      },
    ];
    const prepareBatchMint = vi.fn(async () => ({ keysetId: "00aa" }));
    vi.spyOn(paymentHistoryStore, "upsertMintQuote").mockResolvedValue();
    vi.spyOn(proofsStore, "addProofs").mockResolvedValue();
    vi.spyOn(uiStore, "lockMutex").mockResolvedValue();
    vi.spyOn(uiStore, "unlockMutex").mockImplementation(() => {});
    const walletStore = {
      invoiceHistory: [
        pendingInvoice("missing-key-q"),
        pendingInvoice("open-q"),
      ],
      mintWallet: vi.fn(async () => ({
        checkMintQuoteBatchBolt11: vi.fn(async () => responses),
        prepareBatchMint,
        completeBatchMint: vi.fn(async () => []),
      })),
      getKeyset: vi.fn(() => "00aa"),
      retryOnceOnSignedOutputs: vi.fn(
        async (_keysetId, operation) => await operation()
      ),
      checkInvoiceBolt11: vi.fn(),
      setInvoicePaid: vi.fn(),
      syncPaymentHistoryCache: vi.fn(),
    };

    await worker.processIncomingQueues(now, walletStore);

    expect(prepareBatchMint).toHaveBeenCalledWith(
      PaymentMethod.Bolt11,
      [
        {
          amount: 10,
          quote: expect.objectContaining({ quote: "open-q" }),
        },
      ],
      { keysetId: "00aa", proofsWeHave: [] }
    );
    expect(walletStore.checkInvoiceBolt11).not.toHaveBeenCalled();
    expect(worker.quotes).toEqual([
      expect.objectContaining({ quote: "missing-key-q", checkCount: 1 }),
    ]);
  });

  it("uses one single-quote attempt when every paid locked quote lacks its key", async () => {
    const worker = useInvoicesWorkerStore();
    const mintStore = useMintsStore();
    const paymentHistoryStore = usePaymentHistoryStore();
    const now = Date.now();
    advertiseBatchMint(mintStore, "https://mint.example");
    worker.quotes = [queuedQuote("missing-key-q", now - 20_000)];
    const prepareBatchMint = vi.fn();
    vi.spyOn(paymentHistoryStore, "upsertMintQuote").mockResolvedValue();
    const walletStore = {
      invoiceHistory: [pendingInvoice("missing-key-q")],
      mintWallet: vi.fn(async () => ({
        checkMintQuoteBatchBolt11: vi.fn(async () => [
          {
            quote: "missing-key-q",
            amount: 10,
            state: "PAID",
            request: "lnbc-locked",
            unit: "sat",
            pubkey:
              "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
          },
        ]),
        prepareBatchMint,
      })),
      checkInvoiceBolt11: vi.fn(async () => {}),
      setInvoicePaid: vi.fn(),
      syncPaymentHistoryCache: vi.fn(),
    };

    await worker.processIncomingQueues(now, walletStore);

    expect(prepareBatchMint).not.toHaveBeenCalled();
    expect(walletStore.checkInvoiceBolt11).toHaveBeenCalledOnce();
    expect(walletStore.checkInvoiceBolt11).toHaveBeenCalledWith(
      "missing-key-q",
      false
    );
  });

  it("records cooldown and falls back once after a protocol batch-check failure", async () => {
    const worker = useInvoicesWorkerStore();
    const mintStore = useMintsStore();
    const now = Date.now();
    advertiseBatchMint(mintStore, "https://mint.example");
    worker.quotes = [
      queuedQuote("first-q", now - 20_000),
      queuedQuote("second-q", now - 10_000),
    ];
    const walletStore = {
      invoiceHistory: [pendingInvoice("first-q"), pendingInvoice("second-q")],
      mintWallet: vi.fn(async () => ({
        checkMintQuoteBatchBolt11: vi.fn(async () => {
          throw new Error("batch endpoint rejected request");
        }),
      })),
      checkInvoiceBolt11: vi.fn(async () => {}),
    };

    await worker.processIncomingQueues(now, walletStore);

    expect(walletStore.checkInvoiceBolt11).toHaveBeenCalledOnce();
    expect(walletStore.checkInvoiceBolt11).toHaveBeenCalledWith(
      "first-q",
      false
    );
    expect(
      worker.batchPathCooldowns["https://mint.example|sat|bolt11"]
    ).toEqual(
      expect.objectContaining({
        failedAt: now,
        failureCount: 1,
        lastError: "batch endpoint rejected request",
      })
    );
    expect(worker.quotes).toEqual([
      expect.objectContaining({ quote: "second-q", checkCount: 1 }),
    ]);
  });

  it("records cooldown without single fallback after a rate-limit batch failure", async () => {
    const worker = useInvoicesWorkerStore();
    const mintStore = useMintsStore();
    const now = Date.now();
    advertiseBatchMint(mintStore, "https://mint.example");
    worker.quotes = [
      queuedQuote("first-q", now - 20_000),
      queuedQuote("second-q", now - 10_000),
    ];
    const rateLimitError = Object.assign(new Error("too many requests"), {
      status: 429,
    });
    const walletStore = {
      invoiceHistory: [pendingInvoice("first-q"), pendingInvoice("second-q")],
      mintWallet: vi.fn(async () => ({
        checkMintQuoteBatchBolt11: vi.fn(async () => {
          throw rateLimitError;
        }),
      })),
      checkInvoiceBolt11: vi.fn(),
    };

    await worker.processIncomingQueues(now, walletStore);

    expect(walletStore.checkInvoiceBolt11).not.toHaveBeenCalled();
    expect(
      worker.batchPathCooldowns["https://mint.example|sat|bolt11"]
    ).toEqual(expect.objectContaining({ failedAt: now, failureCount: 1 }));
    expect(worker.quotes.every((entry) => entry.checkCount === 1)).toBe(true);
  });

  it("falls back to one paid quote after a protocol batch-mint failure", async () => {
    const worker = useInvoicesWorkerStore();
    const mintStore = useMintsStore();
    const paymentHistoryStore = usePaymentHistoryStore();
    const proofsStore = useProofsStore();
    const uiStore = useUiStore();
    const now = Date.now();
    advertiseBatchMint(mintStore, "https://mint.example");
    mintStore.mints[0].keysets = [{ id: "00aa", unit: "sat", active: true }];
    worker.quotes = [
      queuedQuote("first-q", now - 20_000),
      queuedQuote("second-q", now - 10_000),
    ];
    vi.spyOn(paymentHistoryStore, "upsertMintQuote").mockResolvedValue();
    const addProofs = vi.spyOn(proofsStore, "addProofs").mockResolvedValue();
    vi.spyOn(uiStore, "lockMutex").mockResolvedValue();
    vi.spyOn(uiStore, "unlockMutex").mockImplementation(() => {});
    const responses = ["first-q", "second-q"].map((quote) => ({
      quote,
      amount: 10,
      state: "PAID",
      request: `lnbc-${quote}`,
      unit: "sat",
    }));
    const walletStore = {
      invoiceHistory: [pendingInvoice("first-q"), pendingInvoice("second-q")],
      mintWallet: vi.fn(async () => ({
        checkMintQuoteBatchBolt11: vi.fn(async () => responses),
        prepareBatchMint: vi.fn(async () => {
          throw new Error("batch mint rejected");
        }),
      })),
      getKeyset: vi.fn(() => "00aa"),
      retryOnceOnSignedOutputs: vi.fn(
        async (_keysetId, operation) => await operation()
      ),
      checkInvoiceBolt11: vi.fn(async () => {}),
      syncPaymentHistoryCache: vi.fn(),
    };

    await worker.processIncomingQueues(now, walletStore);

    expect(addProofs).not.toHaveBeenCalled();
    expect(uiStore.unlockMutex).toHaveBeenCalledOnce();
    expect(walletStore.checkInvoiceBolt11).toHaveBeenCalledOnce();
    expect(walletStore.checkInvoiceBolt11).toHaveBeenCalledWith(
      "first-q",
      false
    );
    expect(
      worker.batchPathCooldowns["https://mint.example|sat|bolt11"]
    ).toEqual(
      expect.objectContaining({
        failedAt: now,
        lastError: "batch mint rejected",
      })
    );
  });

  it("clears an expired batch cooldown after a valid batch response", async () => {
    const worker = useInvoicesWorkerStore();
    const mintStore = useMintsStore();
    const paymentHistoryStore = usePaymentHistoryStore();
    const now = Date.now();
    advertiseBatchMint(mintStore, "https://mint.example");
    worker.batchPathCooldowns = {
      "https://mint.example|sat|bolt11": {
        failedAt: now - 120_000,
        failureCount: 2,
        nextRetryAt: now - 1,
      },
    };
    worker.quotes = [queuedQuote("unpaid-q", now - 20_000)];
    vi.spyOn(paymentHistoryStore, "upsertMintQuote").mockResolvedValue();
    const walletStore = {
      invoiceHistory: [pendingInvoice("unpaid-q")],
      mintWallet: vi.fn(async () => ({
        checkMintQuoteBatchBolt11: vi.fn(async () => [
          {
            quote: "unpaid-q",
            amount: 10,
            state: "UNPAID",
            request: "lnbc-unpaid",
            unit: "sat",
          },
        ]),
      })),
      checkInvoiceBolt11: vi.fn(),
      syncPaymentHistoryCache: vi.fn(),
    };

    await worker.processIncomingQueues(now, walletStore);

    expect(worker.batchPathCooldowns).toEqual({});
  });

  it("selects the largest due group, capped and ordered by oldest queue entry", async () => {
    const worker = useInvoicesWorkerStore();
    const mintStore = useMintsStore();
    const paymentHistoryStore = usePaymentHistoryStore();
    const now = Date.now();
    advertiseBatchMint(mintStore, "https://mint-a.example", {
      max_batch_size: 2,
    });
    advertiseBatchMint(mintStore, "https://mint-b.example");
    vi.spyOn(paymentHistoryStore, "upsertMintQuote").mockResolvedValue();
    worker.quotes = [
      queuedQuote("a-new", now - 10_000),
      queuedQuote("a-old", now - 30_000),
      queuedQuote("a-middle", now - 20_000),
      queuedQuote("b-one", now - 15_000),
      queuedQuote("not-due", now, { lastChecked: now }),
      queuedQuote("wrong-method", now - 40_000),
    ];
    const invoices = [
      pendingInvoice("a-new", { mint: "https://mint-a.example" }),
      pendingInvoice("a-old", { mint: "https://mint-a.example" }),
      pendingInvoice("a-middle", { mint: "https://mint-a.example" }),
      pendingInvoice("b-one", { mint: "https://mint-b.example" }),
      pendingInvoice("not-due", { mint: "https://mint-a.example" }),
      pendingInvoice("wrong-method", { type: PaymentMethod.Bolt12 }),
    ];
    const checkMintQuoteBatchBolt11 = vi.fn(async (quotes) =>
      quotes.map((quote) => ({
        quote,
        amount: 10,
        state: "UNPAID",
        request: `lnbc-${quote}`,
        unit: "sat",
      }))
    );
    const walletStore = {
      invoiceHistory: invoices,
      mintWallet: vi.fn(async () => ({ checkMintQuoteBatchBolt11 })),
      checkInvoiceBolt11: vi.fn(async () => {
        throw new Error("invoice still pending");
      }),
      syncPaymentHistoryCache: vi.fn(),
    };

    await worker.processIncomingQueues(now, walletStore);

    expect(walletStore.mintWallet).toHaveBeenCalledTimes(1);
    expect(walletStore.mintWallet).toHaveBeenCalledWith(
      "https://mint-a.example",
      "sat"
    );
    expect(checkMintQuoteBatchBolt11).toHaveBeenCalledOnce();
    expect(checkMintQuoteBatchBolt11).toHaveBeenCalledWith([
      "a-old",
      "a-middle",
    ]);
    expect(worker.quotes.map((entry) => entry.quote)).not.toContain(
      "wrong-method"
    );
  });

  it.each([
    ["wrong response length", [{ quote: "first-q", state: "UNPAID" }]],
    [
      "out-of-order quote IDs",
      [
        { quote: "second-q", state: "UNPAID" },
        { quote: "first-q", state: "UNPAID" },
      ],
    ],
    [
      "duplicate quote IDs",
      [
        { quote: "first-q", state: "UNPAID" },
        { quote: "first-q", state: "UNPAID" },
      ],
    ],
    [
      "missing quote ID",
      [{ quote: "first-q", state: "UNPAID" }, { state: "UNPAID" }],
    ],
  ])("rejects malformed batch success: %s", async (_case, responses) => {
    const worker = useInvoicesWorkerStore();
    const mintStore = useMintsStore();
    const paymentHistoryStore = usePaymentHistoryStore();
    const now = Date.now();
    advertiseBatchMint(mintStore, "https://mint.example");
    worker.quotes = [
      queuedQuote("first-q", now - 20_000),
      queuedQuote("second-q", now - 10_000),
    ];
    const upsertMintQuote = vi
      .spyOn(paymentHistoryStore, "upsertMintQuote")
      .mockResolvedValue();
    const checkMintQuoteBatchBolt11 = vi.fn(async () => responses);
    const walletStore = {
      invoiceHistory: [pendingInvoice("first-q"), pendingInvoice("second-q")],
      mintWallet: vi.fn(async () => ({ checkMintQuoteBatchBolt11 })),
      checkInvoiceBolt11: vi.fn(async () => {
        throw new Error("invoice still pending");
      }),
      setInvoicePaid: vi.fn(),
      syncPaymentHistoryCache: vi.fn(),
    };

    await worker.processIncomingQueues(now, walletStore);

    expect(upsertMintQuote).not.toHaveBeenCalled();
    expect(walletStore.setInvoicePaid).not.toHaveBeenCalled();
    expect(walletStore.checkInvoiceBolt11).toHaveBeenCalledOnce();
    expect(
      worker.batchPathCooldowns["https://mint.example|sat|bolt11"]
    ).toEqual(expect.objectContaining({ failedAt: now, failureCount: 1 }));
    expect(worker.quotes).toEqual([
      expect.objectContaining({ quote: "first-q", checkCount: 1 }),
      expect.objectContaining({ quote: "second-q", checkCount: 1 }),
    ]);
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
