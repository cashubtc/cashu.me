import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const notify = vi.fn();
  const notifyApiError = vi.fn();
  const notifyError = vi.fn();
  const notifySuccess = vi.fn();
  const notifyWarning = vi.fn();
  const bolt12Decode = vi.fn(() => ({ amount: "0", description: "" }));

  const receiveTokensStore = {
    showReceiveTokens: false,
    receiveData: { tokensBase64: "", p2pkPrivateKey: "" },
  };
  const sendTokensStore = {
    showSendTokens: false,
    sendData: { p2pkPubkey: "" },
  };
  const tokensStore = {
    historyTokens: [],
    addPaidToken: vi.fn(),
    setTokenPaid: vi.fn(),
  };
  const proofsStore = {
    proofs: [],
    getUnreservedProofs: vi.fn((proofs) => proofs.filter((p) => !p.reserved)),
    sumProofs: vi.fn((proofs) => proofs.reduce((sum, p) => sum + p.amount, 0)),
    removeProofs: vi.fn(),
    addProofs: vi.fn(),
    addMissingProofs: vi.fn(),
    setReserved: vi.fn(),
    getProofsForQuote: vi.fn(),
  };
  const uiStore = {
    lockMutex: vi.fn(async () => {}),
    unlockMutex: vi.fn(),
    closeDialogs: vi.fn(),
    formatCurrency: vi.fn((amount, unit) => `${amount} ${unit}`),
    vibrate: vi.fn(),
    triggerActivityOrb: vi.fn(),
  };
  const p2pkStore = {
    isValidPubkey: vi.fn(() => false),
    setPrivateKeyUsed: vi.fn(),
  };
  const prStore = {
    decodePaymentRequest: vi.fn(async () => {}),
  };
  const settingsStore = {
    checkSentTokens: true,
    checkIncomingInvoices: true,
    periodicallyCheckIncomingInvoices: true,
    useWebsockets: true,
  };
  const invoicesWorkerStore = {
    addInvoice: vi.fn(),
    removeInvoice: vi.fn(),
    addInvoiceToChecker: vi.fn(),
    removeInvoiceFromChecker: vi.fn(),
    addBolt12OfferToChecker: vi.fn(),
    addOnchainQuoteToChecker: vi.fn(),
    addOutgoingTokenToChecker: vi.fn(),
  };
  const workersStore = {
    checkTokenSpendableWorker: vi.fn(),
    invoiceCheckWorker: vi.fn(),
  };
  const mintsStore = {
    activeMintUrl: "https://mint-a.example",
    activeUnit: "sat",
    assertMintError: vi.fn(),
    activateMintUrl: vi.fn(async (url) => {
      h.mintsStore.activeMintUrl = url;
    }),
    selectMintUrl: vi.fn((url) => {
      h.mintsStore.activeMintUrl = url;
    }),
    addMintData: { url: "", nickname: "" },
    mints: [],
    mintUnitKeysets: vi.fn((mint, unit) =>
      mint.keysets.filter((k) => k.unit === unit)
    ),
    mintUnitProofs: vi.fn(() => []),
    updateMintInfoAndKeys: vi.fn(async () => {}),
    fetchMintKeys: vi.fn(async () => {}),
  };
  const priceStore = {
    bitcoinPrice: 100_000,
    bitcoinPrices: { usd: 100_000 },
  };

  const walletLoadMintFromCache = vi.fn();
  const walletGetFeesForProofs = vi.fn(() => 7);
  const keychainMintToCacheDTO = vi.fn(() => ({ cache: "dto" }));
  const outputDataSerialize = vi.fn((output) => ({ serialized: output.id }));
  const outputDataDeserialize = vi.fn((output) => ({ deserialized: output }));
  const tokenModule = {
    decodeFull: vi.fn(),
    getProofs: vi.fn(),
    getMint: vi.fn(),
    getUnit: vi.fn(),
  };

  class WalletMock {
    constructor(url, options) {
      this.mint = { mintUrl: url };
      this.unit = options.unit;
      this.options = options;
      this.loadMintFromCache = walletLoadMintFromCache;
      this.getFeesForProofs = walletGetFeesForProofs;
      this.on = {
        countersReserved: vi.fn(() => () => {}),
      };
    }

    selectProofsToSend(proofs, amount) {
      let running = 0;
      const send = [];
      for (const proof of proofs) {
        if (running >= amount) break;
        send.push(proof);
        running += proof.amount;
      }
      const sendSecrets = new Set(send.map((p) => p.secret));
      return {
        send,
        keep: proofs.filter((p) => !sendSecrets.has(p.secret)),
      };
    }
  }

  return {
    notify,
    notifyApiError,
    notifyError,
    notifySuccess,
    notifyWarning,
    receiveTokensStore,
    sendTokensStore,
    tokensStore,
    proofsStore,
    uiStore,
    p2pkStore,
    prStore,
    settingsStore,
    invoicesWorkerStore,
    workersStore,
    mintsStore,
    priceStore,
    walletLoadMintFromCache,
    walletGetFeesForProofs,
    keychainMintToCacheDTO,
    outputDataSerialize,
    outputDataDeserialize,
    bolt12Decode,
    tokenModule,
    WalletMock,
  };
});

vi.mock("src/js/utils", () => ({
  currentDateStr: () => "2026-03-10T12:00:00.000Z",
}));

vi.mock("src/js/notify", () => ({
  notify: (...args) => h.notify(...args),
  notifyApiError: (...args) => h.notifyApiError(...args),
  notifyError: (...args) => h.notifyError(...args),
  notifySuccess: (...args) => h.notifySuccess(...args),
  notifyWarning: (...args) => h.notifyWarning(...args),
}));

vi.mock("@vueuse/core", () => ({
  useLocalStorage: (_key, value) => value,
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key) => key }),
  createI18n: () => ({
    global: {
      t: (key) => key,
    },
  }),
}));

vi.mock("light-bolt11-decoder", () => ({
  decode: vi.fn(() => ({ paymentRequest: "lnbc123", sections: [] })),
}));

vi.mock("src/js/bolt12", () => ({
  decodeBolt12Offer: (...args) => h.bolt12Decode(...args),
}));

vi.mock("@cashu/cashu-ts", () => ({
  Amount: {
    from: (value) => ({
      toNumber: () => Number(value),
    }),
  },
  sumProofs: (proofs) => ({
    toNumber: () =>
      proofs.reduce((sum, proof) => sum + Number(proof.amount), 0),
  }),
  Wallet: h.WalletMock,
  OutputData: {
    serialize: (...args) => h.outputDataSerialize(...args),
    deserialize: (...args) => h.outputDataDeserialize(...args),
  },
  KeyChain: {
    mintToCacheDTO: (...args) => h.keychainMintToCacheDTO(...args),
  },
  CheckStateEnum: { SPENT: "SPENT" },
  MeltQuoteState: { PAID: "PAID", PENDING: "PENDING", UNPAID: "UNPAID" },
  MintQuoteState: { PAID: "PAID", ISSUED: "ISSUED", PENDING: "PENDING" },
  createEphemeralCounterSource: (initial) => {
    const counters = new Map(Object.entries(initial ?? {}));
    return {
      reserve: async (id, n) => {
        if (n < 0) throw new Error("reserve called with negative count");
        const cur = counters.get(id) ?? 0;
        if (n === 0) return { start: cur, count: 0 };
        counters.set(id, cur + n);
        return { start: cur, count: n };
      },
      advanceToAtLeast: async (id, min) => {
        const cur = counters.get(id) ?? 0;
        if (min > cur) counters.set(id, min);
      },
      snapshot: async () => Object.fromEntries(counters),
      setNext: async (id, next) => {
        if (next < 0) throw new Error("setNext: negative next not allowed");
        counters.set(id, next);
      },
    };
  },
}));

vi.mock("src/stores/receiveTokensStore", () => ({
  useReceiveTokensStore: () => h.receiveTokensStore,
}));

vi.mock("src/stores/sendTokensStore", () => ({
  useSendTokensStore: () => h.sendTokensStore,
}));

vi.mock("src/stores/p2pk", () => ({
  useP2PKStore: () => h.p2pkStore,
}));

vi.mock("src/stores/payment-request", () => ({
  usePRStore: () => h.prStore,
}));

vi.mock("src/stores/workers", () => ({
  useWorkersStore: () => h.workersStore,
}));

vi.mock("src/stores/invoicesWorker", () => ({
  useInvoicesWorkerStore: () => h.invoicesWorkerStore,
}));

vi.mock("src/stores/settings", () => ({
  useSettingsStore: () => h.settingsStore,
}));

vi.mock("src/stores/ui", () => ({
  useUiStore: () => h.uiStore,
}));

vi.mock("src/stores/proofs", () => ({
  useProofsStore: () => h.proofsStore,
}));

vi.mock("src/stores/tokens", () => ({
  useTokensStore: () => h.tokensStore,
}));

vi.mock("src/stores/mints", async () => {
  const actual = await vi.importActual("src/stores/mints");
  return {
    ...actual,
    useMintsStore: () => h.mintsStore,
  };
});

vi.mock("src/stores/price", () => ({
  usePriceStore: () => h.priceStore,
}));

vi.mock("src/js/token", () => ({
  default: h.tokenModule,
}));

import { useWalletStore } from "src/stores/wallet";
import { cashuDb } from "src/stores/dexie";
import { PaymentMethod } from "src/stores/walletTypes";

function mockMintWebsocket(unit = "sat") {
  let onUpdate;
  let onError;
  const connection = {
    createSubscription: vi.fn((params, callback, errorCallback) => {
      onUpdate = callback;
      onError = errorCallback;
      return "sub-1";
    }),
    cancelSubscription: vi.fn(),
  };
  const mintWallet = {
    mint: {
      mintUrl: "https://mint-a.example",
      connectWebSocket: vi.fn(async () => {}),
      webSocketConnection: connection,
    },
    unit,
  };
  return {
    connection,
    mintWallet,
    onUpdate: () => onUpdate,
    onError: () => onError,
  };
}

describe("wallet store", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await cashuDb.paymentHistory.clear();
    await cashuDb.mintQuotes.clear();
    await cashuDb.meltQuotes.clear();

    h.receiveTokensStore.showReceiveTokens = false;
    h.receiveTokensStore.receiveData.tokensBase64 = "";
    h.sendTokensStore.sendData.p2pkPubkey = "";
    h.sendTokensStore.showSendTokens = false;

    h.mintsStore.activeMintUrl = "https://mint-a.example";
    h.mintsStore.activeUnit = "sat";
    h.mintsStore.addMintData = { url: "", nickname: "" };
    h.mintsStore.mints = [
      {
        url: "https://mint-a.example",
        keys: [{ id: "00aa" }],
        keysets: [
          { id: "base64-a", unit: "sat", active: true },
          { id: "00aa", unit: "sat", active: true },
        ],
        info: { name: "mint-a" },
      },
    ];

    h.proofsStore.getUnreservedProofs.mockImplementation((proofs) =>
      proofs.filter((p) => !p.reserved)
    );
    h.proofsStore.sumProofs.mockImplementation((proofs) =>
      proofs.reduce((sum, p) => sum + p.amount, 0)
    );
    h.proofsStore.getProofsForQuote.mockResolvedValue([]);
    h.p2pkStore.isValidPubkey.mockReturnValue(false);
    h.bolt12Decode.mockReturnValue({ amount: "0", description: "" });
    h.tokenModule.decodeFull.mockReset();
    h.tokenModule.getProofs.mockReset();
    h.tokenModule.getMint.mockReset();
    h.tokenModule.getUnit.mockReset();
    h.settingsStore.checkIncomingInvoices = true;
    h.settingsStore.checkSentTokens = true;
    h.settingsStore.periodicallyCheckIncomingInvoices = true;
    h.settingsStore.useWebsockets = true;
  });

  it("manages keyset counters", async () => {
    const wallet = useWalletStore();
    expect(wallet.keysetCounter("k1")).toBe(0);
    await wallet.increaseKeysetCounter("k1", 4);
    expect(wallet.keysetCounter("k1")).toBe(4);
    await wallet.increaseKeysetCounter("k2", 3);
    expect(wallet.keysetCounter("k2")).toBe(3);
  });

  it("creates a new mnemonic and archives previous counters", () => {
    const wallet = useWalletStore();
    wallet.mnemonic = "old mnemonic";
    wallet.keysetCounters = [{ id: "00aa", counter: 11 }];

    wallet.newMnemonic();

    expect(wallet.oldMnemonicCounters[0]).toEqual({
      mnemonic: "old mnemonic",
      keysetCounters: [{ id: "00aa", counter: 11 }],
    });
    expect(wallet.keysetCounters).toEqual([]);
    expect(wallet.mnemonic).not.toBe("old mnemonic");
  });

  it("splits amounts into binary chunks", () => {
    const wallet = useWalletStore();
    expect(wallet.splitAmount(0)).toEqual([]);
    expect(wallet.splitAmount(13)).toEqual([1, 4, 8]);
  });

  it("returns spendable proofs and throws on insufficient amount", () => {
    const wallet = useWalletStore();
    const proofs = [
      { id: "00aa", amount: 5, reserved: false },
      { id: "00aa", amount: 4, reserved: true },
      { id: "00aa", amount: 6, reserved: false },
    ];

    expect(wallet.spendableProofs(proofs, 10)).toHaveLength(2);
    expect(() => wallet.spendableProofs(proofs, 20)).toThrow(
      "wallet.notifications.balance_too_low"
    );
  });

  it("chooses active hex keyset first", () => {
    const wallet = useWalletStore();
    expect(wallet.getKeyset("https://mint-a.example", "sat")).toBe("00aa");
  });

  it("updates invoice status to paid", () => {
    const wallet = useWalletStore();
    wallet.invoiceHistory = [
      {
        quote: "q-1",
        amount: 1,
        request: "lnbc",
        memo: "memo",
        date: "old",
        status: "pending",
        mint: "https://mint-a.example",
        unit: "sat",
      },
    ];

    wallet.setInvoicePaid("q-1");
    expect(wallet.invoiceHistory[0].status).toBe("paid");
    expect(wallet.invoiceHistory[0].paidDate).toBe("2026-03-10T12:00:00.000Z");
  });

  it("allows paid invoice amount updates to zero", () => {
    const wallet = useWalletStore();
    wallet.invoiceData = {
      quote: "q-zero",
      amount: 10,
      request: "lnbc",
      memo: "memo",
      date: "old",
      status: "pending",
      mint: "https://mint-a.example",
      unit: "sat",
    };
    wallet.invoiceHistory = [
      {
        quote: "q-zero",
        amount: 10,
        request: "lnbc",
        memo: "memo",
        date: "old",
        status: "pending",
        mint: "https://mint-a.example",
        unit: "sat",
      },
    ];

    wallet.setInvoicePaid("q-zero", { amount: 0 });

    expect(wallet.invoiceHistory[0].amount).toBe(0);
    expect(wallet.invoiceData.amount).toBe(0);
  });

  it("adds, updates and removes outgoing invoices", async () => {
    const wallet = useWalletStore();
    wallet.payInvoiceData.input.request = "lnbc123";
    const quote = { quote: "melt-q-1", amount: 101, fee_reserve: 4 };

    await wallet.addOutgoingPendingInvoiceToHistory(
      quote,
      "https://mint-a.example",
      "sat"
    );
    wallet.updateOutgoingInvoiceInHistory(quote, {
      status: "paid",
      amount: -99,
    });
    wallet.removeOutgoingInvoiceFromHistory("melt-q-1");

    expect(wallet.invoiceHistory).toEqual([]);
  });

  it("records Bolt12 outgoing invoice type for recovery", async () => {
    const wallet = useWalletStore();
    wallet.payInvoiceData.input.request = "lno1offer";
    const quote = { quote: "bolt12-melt-q", amount: 101, fee_reserve: 4 };

    await wallet.addOutgoingPendingInvoiceToHistory(
      quote,
      "https://mint-a.example",
      "sat",
      PaymentMethod.Bolt12
    );

    expect(wallet.invoiceHistory[0]).toMatchObject({
      quote: "bolt12-melt-q",
      request: "lno1offer",
      type: PaymentMethod.Bolt12,
      amount: -105,
      status: "pending",
    });
  });

  it("creates active wallet and loads cache", async () => {
    const wallet = useWalletStore();
    wallet.mnemonic = "";
    wallet.keysetCounters = [{ id: "00aa", counter: 13 }];

    const activeWallet = await wallet.activeWallet();

    expect(activeWallet.mint.mintUrl).toBe("https://mint-a.example");
    expect(h.keychainMintToCacheDTO).toHaveBeenCalled();
    expect(h.walletLoadMintFromCache).toHaveBeenCalledWith(
      { name: "mint-a" },
      { cache: "dto" }
    );
  });

  it("gets fees using the provided mint context instead of the active mint", () => {
    const wallet = useWalletStore();
    h.mintsStore.mints.push({
      url: "https://mint-b.example",
      keys: [{ id: "00bb" }],
      keysets: [{ id: "00bb", unit: "sat", active: true }],
      info: { name: "mint-b" },
    });

    wallet.getFeesForProofs([{ id: "00bb" }], "https://mint-b.example", "sat");

    expect(h.keychainMintToCacheDTO).toHaveBeenLastCalledWith(
      "https://mint-b.example",
      [{ id: "00bb", unit: "sat", active: true }],
      [{ id: "00bb" }]
    );
    expect(h.walletGetFeesForProofs).toHaveBeenCalledWith([{ id: "00bb" }]);
  });

  it("refreshes stale keysets when requested", async () => {
    const wallet = useWalletStore();
    h.mintsStore.mints = [
      {
        url: "https://mint-a.example",
        keys: [{ id: "00aa" }],
        keysets: [{ id: "00aa", unit: "sat", active: true }],
        info: { name: "mint-a" },
        lastKeysetsUpdated: "1970-01-01T00:00:00.000Z",
      },
    ];

    await wallet.mintWallet("https://mint-a.example", "sat", true);
    expect(h.mintsStore.updateMintInfoAndKeys).toHaveBeenCalledTimes(1);
  });

  it("uses the wallet instance directly for proof selection in send", async () => {
    const wallet = useWalletStore();
    const proofs = [{ id: "00bb", amount: 10, reserved: false, secret: "s1" }];
    const selectProofsToSend = vi.fn(() => ({ send: proofs, keep: [] }));
    const foreignWallet = {
      mint: { mintUrl: "https://mint-b.example" },
      unit: "sat",
      selectProofsToSend,
      ops: {
        send: vi.fn(() => ({
          asDeterministic: vi.fn(() => ({
            keyset: vi.fn(() => ({
              proofsWeHave: vi.fn(() => ({
                includeFees: vi.fn(() => ({
                  run: vi.fn(async () => ({ keep: [], send: [] })),
                })),
              })),
            })),
          })),
        })),
      },
    };

    h.mintsStore.mints.push({
      url: "https://mint-b.example",
      keys: [{ id: "00bb" }],
      keysets: [{ id: "00bb", unit: "sat", active: true }],
      info: { name: "mint-b" },
    });

    vi.spyOn(wallet, "getKeyset").mockReturnValue("00bb");

    await wallet.send(proofs, foreignWallet, 10, false, true);

    // exact-match no-swap shortcut goes through the foreign wallet
    expect(selectProofsToSend).toHaveBeenCalledWith(
      expect.any(Array),
      10,
      true,
      true
    );
  });

  it("forwards includeFees and raw amount to the swap when no exact match exists", async () => {
    // Regression test for the "Provided: 103, needed: 104" off-by-input-fees
    // melt bug. The pre-fix code computed `targetAmount = amount + fees(selected)`
    // and passed it to the swap WITHOUT `.includeFees(true)`. That made
    // sendProofs sum to targetAmount, but the mint then charged input fees on
    // those sendProofs (a different proof count), so the inputs fell short.
    //
    // The fix: pass the raw `amount` to the swap and chain `.includeFees(true)`.
    // cashu-ts then inflates the send outputs so sendProofs sum to
    // amount + fees(sendProofs) — exactly what melt validation requires.
    const wallet = useWalletStore();
    const proofs = [{ id: "00bb", amount: 128, reserved: false, secret: "s1" }];
    const selectProofsToSend = vi.fn(
      (proofs, _amount, _includeFees, exactMatch) => {
        if (exactMatch) return { send: [], keep: proofs };
        return { send: proofs, keep: [] };
      }
    );
    // Old code calls wallet.getFeesForProofs(selected).toNumber() to compute
    // targetAmount. Mock a small input fee so it reaches the swap branch.
    const getFeesForProofs = vi.fn(() => ({ toNumber: () => 1 }));

    // Capture each step in the swap builder chain.
    const includeFeesSpy = vi.fn();
    const sendSpy = vi.fn();
    const builder = {
      asDeterministic: vi.fn(),
      keyset: vi.fn(),
      proofsWeHave: vi.fn(),
      includeFees: vi.fn(),
      run: vi.fn(async () => ({
        keep: [{ id: "00bb", amount: 23, secret: "keep1" }],
        send: [
          { id: "00bb", amount: 64, secret: "send1" },
          { id: "00bb", amount: 32, secret: "send2" },
          { id: "00bb", amount: 4, secret: "send3" },
          { id: "00bb", amount: 4, secret: "send4" },
        ],
      })),
    };
    // Make every method return the builder for chaining; spy the two we assert on.
    builder.asDeterministic.mockReturnValue(builder);
    builder.keyset.mockReturnValue(builder);
    builder.proofsWeHave.mockReturnValue(builder);
    builder.includeFees = includeFeesSpy.mockReturnValue(builder);

    const swapWallet = {
      mint: { mintUrl: "https://mint-b.example" },
      unit: "sat",
      selectProofsToSend,
      getFeesForProofs,
      ops: {
        send: sendSpy.mockReturnValue(builder),
      },
    };

    h.mintsStore.mints.push({
      url: "https://mint-b.example",
      keys: [{ id: "00bb" }],
      keysets: [{ id: "00bb", unit: "sat", active: true }],
      info: { name: "mint-b" },
    });

    vi.spyOn(wallet, "getKeyset").mockReturnValue("00bb");
    vi.spyOn(wallet, "mintWalletSync").mockReturnValue(swapWallet);

    await wallet.send(proofs, swapWallet, 100, false, true);

    // The swap is called with the raw invoice amount, NOT a precomputed
    // `amount + fees(selectedProofs)` target.
    expect(sendSpy).toHaveBeenCalledWith(100, expect.any(Array));
    // .includeFees(true) must be chained so cashu-ts inflates the send
    // outputs to cover their own input fees.
    expect(includeFeesSpy).toHaveBeenCalledWith(true);
  });

  describe("ensureKeysetsCurrent (the freshness guarantee)", () => {
    // Make fetchMintKeys rotate the store's active keyset, exactly as a mint
    // that rotated mid-session would look after a refresh.
    function rotateOnFetch() {
      h.mintsStore.fetchMintKeys.mockImplementationOnce(async (mint) => {
        mint.keysets = [
          { id: "00aa", unit: "sat", active: false },
          { id: "00cc", unit: "sat", active: true },
        ];
      });
    }

    it("(a) refreshes the mint's keys before resolving the active keyset", async () => {
      const wallet = useWalletStore();
      rotateOnFetch();
      const getKeysetSpy = vi.spyOn(wallet, "getKeyset");

      await wallet.ensureKeysetsCurrent("https://mint-a.example", "sat");

      expect(h.mintsStore.fetchMintKeys).toHaveBeenCalledTimes(1);
      expect(
        h.mintsStore.fetchMintKeys.mock.invocationCallOrder[0]
      ).toBeLessThan(getKeysetSpy.mock.invocationCallOrder[0]);
    });

    it("(b) returns the newly-active keyset id and a wallet built after the refresh", async () => {
      const wallet = useWalletStore();
      rotateOnFetch();
      const mintWalletSyncSpy = vi.spyOn(wallet, "mintWalletSync");

      const { wallet: signingWallet, keysetId } =
        await wallet.ensureKeysetsCurrent("https://mint-a.example", "sat");

      // resolves the keyset that became active during the refresh
      expect(keysetId).toBe("00cc");
      // the signing wallet is the one built AFTER the refresh
      expect(signingWallet).toBe(mintWalletSyncSpy.mock.results[0].value);
      expect(
        h.mintsStore.fetchMintKeys.mock.invocationCallOrder[0]
      ).toBeLessThan(mintWalletSyncSpy.mock.invocationCallOrder[0]);
    });

    it("(c) never triggers the mint-info / MOTD refresh path", async () => {
      const wallet = useWalletStore();
      rotateOnFetch();

      await wallet.ensureKeysetsCurrent("https://mint-a.example", "sat");

      expect(h.mintsStore.updateMintInfoAndKeys).not.toHaveBeenCalled();
    });

    it("(d) throws when the mint is unknown", async () => {
      const wallet = useWalletStore();

      await expect(
        wallet.ensureKeysetsCurrent("https://nope.example", "sat")
      ).rejects.toThrow("mint not found");
      expect(h.mintsStore.fetchMintKeys).not.toHaveBeenCalled();
    });
  });

  describe("retryOnceOnSignedOutputs (the freshness funnel)", () => {
    // Make fetchMintKeys rotate the store's active keyset, exactly as a mint
    // that rotated mid-session would look after a refresh.
    function rotateOnFetch() {
      h.mintsStore.fetchMintKeys.mockImplementationOnce(async (mint) => {
        mint.keysets = [
          { id: "00aa", unit: "sat", active: false },
          { id: "00cc", unit: "sat", active: true },
        ];
      });
    }

    it("(e) calls ensureKeysetsCurrent once and hands its wallet/keysetId to the operation", async () => {
      const wallet = useWalletStore();
      const sentinelWallet = { sentinel: true };
      const ensureSpy = vi
        .spyOn(wallet, "ensureKeysetsCurrent")
        .mockResolvedValue({ wallet: sentinelWallet, keysetId: "00cc" });
      const operation = vi.fn(async () => "ok");

      const result = await wallet.retryOnceOnSignedOutputs(
        "https://mint-a.example",
        "sat",
        operation
      );

      expect(result).toBe("ok");
      expect(ensureSpy).toHaveBeenCalledTimes(1);
      expect(ensureSpy).toHaveBeenCalledWith("https://mint-a.example", "sat");
      expect(operation).toHaveBeenCalledWith(sentinelWallet, "00cc");
    });

    it("(f) retries once with the SAME keyset after a signed-outputs error, without a second refresh", async () => {
      const wallet = useWalletStore();
      wallet.keysetCounters = [{ id: "00aa", counter: 1 }];
      const ensureSpy = vi.spyOn(wallet, "ensureKeysetsCurrent");
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error("outputs have already been signed"))
        .mockResolvedValueOnce("second-try");

      const result = await wallet.retryOnceOnSignedOutputs(
        "https://mint-a.example",
        "sat",
        operation
      );

      expect(result).toBe("second-try");
      // freshness runs exactly once, even though the operation ran twice
      expect(ensureSpy).toHaveBeenCalledTimes(1);
      expect(operation).toHaveBeenCalledTimes(2);
      // same keyset id on both attempts; only the counter was bumped
      expect(operation.mock.calls[0][1]).toBe("00aa");
      expect(operation.mock.calls[1][1]).toBe("00aa");
      expect(wallet.keysetCounter("00aa")).toBe(11);
    });

    it("(g) rethrows an unrelated error without retrying", async () => {
      const wallet = useWalletStore();
      const operation = vi.fn().mockRejectedValue(new Error("mint offline"));

      await expect(
        wallet.retryOnceOnSignedOutputs(
          "https://mint-a.example",
          "sat",
          operation
        )
      ).rejects.toThrow("mint offline");
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it("(h) propagates a second signed-outputs failure after the single retry", async () => {
      const wallet = useWalletStore();
      const operation = vi
        .fn()
        .mockRejectedValue(new Error("outputs have already been signed"));

      await expect(
        wallet.retryOnceOnSignedOutputs(
          "https://mint-a.example",
          "sat",
          operation
        )
      ).rejects.toThrow("outputs have already been signed");
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it("routes send()'s swap through the wrapper onto the rotated keyset", async () => {
      const wallet = useWalletStore();
      const proofs = [
        { id: "00aa", amount: 128, reserved: false, secret: "s1" },
      ];
      const builder = {
        asDeterministic: vi.fn(),
        keyset: vi.fn(),
        proofsWeHave: vi.fn(),
        includeFees: vi.fn(),
        run: vi.fn(async () => ({ keep: [], send: [] })),
      };
      builder.asDeterministic.mockReturnValue(builder);
      builder.keyset.mockReturnValue(builder);
      builder.proofsWeHave.mockReturnValue(builder);
      builder.includeFees.mockReturnValue(builder);

      const swapWallet = {
        mint: { mintUrl: "https://mint-a.example" },
        unit: "sat",
        // no exact match -> force the swap branch
        selectProofsToSend: vi.fn((p, _a, _f, exact) =>
          exact ? { send: [], keep: p } : { send: p, keep: [] }
        ),
        ops: { send: vi.fn(() => builder) },
      };

      rotateOnFetch();
      vi.spyOn(wallet, "mintWalletSync").mockReturnValue(swapWallet);

      await wallet.send(proofs, swapWallet, 100, false, true);

      expect(h.mintsStore.fetchMintKeys).toHaveBeenCalledTimes(1);
      expect(builder.keyset).toHaveBeenCalledWith("00cc");
    });
  });

  it("accounts for signed-output errors", async () => {
    const wallet = useWalletStore();
    wallet.keysetCounters = [{ id: "00aa", counter: 1 }];

    const handled = await wallet.handleOutputsHaveAlreadyBeenSignedError(
      "00aa",
      {
        message: "outputs have already been signed",
      }
    );

    expect(handled).toBe(true);
    expect(wallet.keysetCounter("00aa")).toBe(11);
    expect(h.notify).toHaveBeenCalledWith("wallet.notifications.trying_again");
  });

  it("cancels Bolt11 mint websocket subscriptions after a paid callback", async () => {
    const wallet = useWalletStore();
    const websocket = mockMintWebsocket();
    wallet.invoiceHistory = [
      {
        quote: "bolt11-q",
        amount: 100,
        request: "lnbc123",
        memo: "memo",
        date: "old",
        status: "pending",
        mint: "https://mint-a.example",
        unit: "sat",
        type: PaymentMethod.Bolt11,
      },
    ];
    h.mintsStore.mints[0].info = {
      nuts: {
        17: {
          supported: [
            {
              method: PaymentMethod.Bolt11,
              unit: "sat",
              commands: ["bolt11_mint_quote"],
            },
          ],
        },
      },
    };
    vi.spyOn(wallet, "mintWallet").mockResolvedValue(websocket.mintWallet);
    vi.spyOn(wallet, "mintBolt11").mockResolvedValue([
      { id: "00aa", amount: 100, secret: "s1" },
    ]);

    await wallet.mintOnPaidBolt11("bolt11-q");
    await websocket.onUpdate()({ state: "PAID" });

    expect(websocket.connection.createSubscription).toHaveBeenCalledWith(
      { kind: "bolt11_mint_quote", filters: ["bolt11-q"] },
      expect.any(Function),
      expect.any(Function)
    );
    expect(websocket.connection.cancelSubscription).toHaveBeenCalledTimes(1);
  });

  it("subscribes Bolt12 minting to Bolt12 websocket updates", async () => {
    const wallet = useWalletStore();
    const websocket = mockMintWebsocket();
    wallet.invoiceHistory = [
      {
        quote: "bolt12-q",
        amount: 0,
        request: "lno1offer",
        memo: "memo",
        date: "old",
        status: "pending",
        mint: "https://mint-a.example",
        unit: "sat",
        type: PaymentMethod.Bolt12,
      },
    ];
    h.mintsStore.mints[0].info = {
      nuts: {
        17: {
          supported: [
            {
              method: PaymentMethod.Bolt12,
              unit: "sat",
              commands: ["bolt12_mint_quote"],
            },
          ],
        },
      },
    };
    vi.spyOn(wallet, "mintWallet").mockResolvedValue(websocket.mintWallet);
    vi.spyOn(wallet, "checkOfferAndMintBolt12").mockResolvedValue([
      { id: "00aa", amount: 100, secret: "s1" },
    ]);

    await wallet.mintOnPaidBolt12("bolt12-q");
    await websocket.onUpdate()({ state: "PAID" });

    expect(h.invoicesWorkerStore.addBolt12OfferToChecker).toHaveBeenCalledWith(
      "bolt12-q"
    );
    expect(websocket.connection.createSubscription).toHaveBeenCalledWith(
      { kind: "bolt12_mint_quote", filters: ["bolt12-q"] },
      expect.any(Function),
      expect.any(Function)
    );
    expect(wallet.checkOfferAndMintBolt12).toHaveBeenCalledWith(
      "bolt12-q",
      true,
      true
    );
    expect(websocket.connection.cancelSubscription).not.toHaveBeenCalled();
  });

  it("subscribes on-chain minting to on-chain websocket updates", async () => {
    const wallet = useWalletStore();
    const websocket = mockMintWebsocket();
    wallet.invoiceHistory = [
      {
        quote: "onchain-q",
        amount: 0,
        request: "bc1qabc",
        memo: "memo",
        date: "old",
        status: "pending",
        mint: "https://mint-a.example",
        unit: "sat",
        type: PaymentMethod.Onchain,
      },
    ];
    h.mintsStore.mints[0].info = {
      nuts: {
        17: {
          supported: [
            {
              method: PaymentMethod.Onchain,
              unit: "sat",
              commands: ["onchain_mint_quote"],
            },
          ],
        },
      },
    };
    vi.spyOn(wallet, "mintWallet").mockResolvedValue(websocket.mintWallet);
    vi.spyOn(wallet, "checkOnchainAndMint").mockResolvedValue([
      { id: "00aa", amount: 100, secret: "s1" },
    ]);

    await wallet.mintOnPaidOnchain("onchain-q");
    await websocket.onUpdate()({ state: "PAID" });

    expect(h.invoicesWorkerStore.addOnchainQuoteToChecker).toHaveBeenCalledWith(
      "onchain-q",
      true
    );
    expect(websocket.connection.createSubscription).toHaveBeenCalledWith(
      { kind: "onchain_mint_quote", filters: ["onchain-q"] },
      expect.any(Function),
      expect.any(Function)
    );
    expect(wallet.checkOnchainAndMint).toHaveBeenCalledWith(
      "onchain-q",
      true,
      true
    );
    expect(websocket.connection.cancelSubscription).not.toHaveBeenCalled();
  });

  it("subscribes sent-token proof-state websocket on the token mint", async () => {
    const wallet = useWalletStore();
    h.mintsStore.activeMintUrl = "https://mint-a.example";
    h.mintsStore.mints = [
      {
        url: "https://mint-a.example",
        keys: [{ id: "00aa" }],
        keysets: [{ id: "00aa", unit: "sat", active: true }],
        info: { name: "mint-a" },
      },
      {
        url: "https://mint-b.example",
        keys: [{ id: "00bb" }],
        keysets: [{ id: "00bb", unit: "sat", active: true }],
        info: {
          nuts: {
            17: {
              supported: [
                {
                  method: PaymentMethod.Bolt11,
                  unit: "sat",
                  commands: ["proof_state"],
                },
              ],
            },
          },
        },
      },
    ];
    const tokenWallet = {
      on: {
        proofStateUpdates: vi.fn(async () => vi.fn()),
      },
    };
    h.tokenModule.decodeFull.mockResolvedValue({ proofs: [] });
    h.tokenModule.getProofs.mockReturnValue([
      { id: "00bb", amount: 1, secret: "s1" },
    ]);
    const mintWalletSpy = vi
      .spyOn(wallet, "mintWallet")
      .mockResolvedValue(tokenWallet);
    vi.spyOn(wallet, "activeWallet");

    await wallet.onTokenPaid({
      token: "cashu-token",
      amount: -1,
      mint: "https://mint-b.example",
      unit: "sat",
      status: "pending",
    });

    expect(
      h.invoicesWorkerStore.addOutgoingTokenToChecker
    ).toHaveBeenCalledWith("cashu-token", true);
    expect(mintWalletSpy).toHaveBeenCalledWith("https://mint-b.example", "sat");
    expect(wallet.activeWallet).not.toHaveBeenCalled();
    expect(tokenWallet.on.proofStateUpdates).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          id: "00bb",
          secret: "s1",
        }),
      ],
      expect.any(Function),
      expect.any(Function)
    );
  });

  it("serializes Bolt12 minting so concurrent checks use distinct counters", async () => {
    const wallet = useWalletStore();
    wallet.invoiceHistory = [
      {
        quote: "offer-q",
        amount: 0,
        request: "lno1offer",
        memo: "memo",
        date: "old",
        status: "pending",
        mint: "https://mint-a.example",
        unit: "sat",
        privKey: "privkey",
        type: PaymentMethod.Bolt12,
      },
    ];
    wallet.keysetCounters = [{ id: "00aa", counter: 1 }];

    let locked = false;
    h.uiStore.lockMutex.mockImplementation(async () => {
      while (locked) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      locked = true;
    });
    h.uiStore.unlockMutex.mockImplementation(() => {
      locked = false;
    });

    const quoteStates = [
      { quote: "offer-q", amount_paid: 100, amount_issued: 0 },
      { quote: "offer-q", amount_paid: 100, amount_issued: 100 },
      { quote: "offer-q", amount_paid: 200, amount_issued: 100 },
      { quote: "offer-q", amount_paid: 200, amount_issued: 200 },
    ];
    const counters = [];
    const mintBolt12 = vi.fn((amount) => {
      const builder = {
        keyset: vi.fn(() => builder),
        asDeterministic: vi.fn(() => builder),
        proofsWeHave: vi.fn(() => builder),
        privkey: vi.fn(() => builder),
        run: vi.fn(async () => {
          const counter = wallet.keysetCounter("00aa");
          counters.push(counter);
          wallet.increaseKeysetCounter("00aa", 1);
          return [{ id: "00aa", amount, secret: `secret-${counter}` }];
        }),
      };
      return builder;
    });
    const mintWallet = {
      checkMintQuoteBolt12: vi.fn(async () => quoteStates.shift()),
      ops: { mintBolt12 },
    };
    vi.spyOn(wallet, "mintWalletSync").mockReturnValue(mintWallet);

    await Promise.all([
      wallet.checkOfferAndMintBolt12("offer-q", false, false),
      wallet.checkOfferAndMintBolt12("offer-q", false, false),
    ]);

    const subpayment = wallet.invoiceHistory.find(
      (invoice) => invoice.type === PaymentMethod.Bolt12Subpayment
    );
    expect(counters).toEqual([1, 2]);
    expect(wallet.keysetCounter("00aa")).toBe(3);
    expect(subpayment).toMatchObject({
      amount: 100,
      quote: "offer-q",
      parentQuote: "offer-q",
      type: PaymentMethod.Bolt12Subpayment,
    });
    expect(subpayment.id).toMatch(/^subpayment:/);
    expect(subpayment.id).not.toContain("offer-q");
    expect(h.uiStore.lockMutex).toHaveBeenCalledTimes(2);
    expect(h.uiStore.unlockMutex).toHaveBeenCalledTimes(2);
  });

  it("records on-chain subpayments with an explicit parent quote", async () => {
    const wallet = useWalletStore();
    const parentQuote = "onchain_quote_with_underscores";
    wallet.invoiceHistory = [
      {
        quote: parentQuote,
        amount: 100,
        request: "bc1qexample",
        memo: "memo",
        date: "old",
        paidDate: "old",
        status: "paid",
        mint: "https://mint-a.example",
        unit: "sat",
        privKey: "privkey",
        type: PaymentMethod.Onchain,
      },
    ];
    wallet.keysetCounters = [{ id: "00aa", counter: 1 }];

    const quoteStates = [
      { quote: parentQuote, amount_paid: 175, amount_issued: 100 },
      { quote: parentQuote, amount_paid: 175, amount_issued: 175 },
    ];
    const mintOnchain = vi.fn((amount) => {
      const builder = {
        keyset: vi.fn(() => builder),
        asDeterministic: vi.fn(() => builder),
        proofsWeHave: vi.fn(() => builder),
        privkey: vi.fn(() => builder),
        run: vi.fn(async () => [{ id: "00aa", amount, secret: "secret-1" }]),
      };
      return builder;
    });
    const mintWallet = {
      checkMintQuoteOnchain: vi.fn(async () => quoteStates.shift()),
      ops: { mintOnchain },
    };
    vi.spyOn(wallet, "mintWalletSync").mockReturnValue(mintWallet);

    await wallet.checkOnchainAndMint(parentQuote, false, false);

    const subpayment = wallet.invoiceHistory.find(
      (invoice) => invoice.type === PaymentMethod.OnchainSubpayment
    );
    expect(subpayment).toMatchObject({
      amount: 75,
      quote: parentQuote,
      parentQuote,
      type: PaymentMethod.OnchainSubpayment,
    });
    expect(subpayment.id).toMatch(/^subpayment:/);
    expect(subpayment.id).not.toContain(parentQuote);
    expect(mintWallet.checkMintQuoteOnchain).toHaveBeenCalledWith(parentQuote);
  });

  it("converts fiat input to msat for amountless Bolt12 melt quotes", async () => {
    const wallet = useWalletStore();
    h.mintsStore.activeUnit = "usd";
    const createMeltQuoteBolt12 = vi.fn(async () => ({
      quote: "q",
      amount: 500,
      fee_reserve: 0,
    }));
    vi.spyOn(wallet, "activeWallet").mockResolvedValue({
      createMeltQuoteBolt12,
    });
    wallet.payInvoiceData.invoice = {
      bolt12: "lno1offer",
      msat: 0,
      sat: 0,
    };
    wallet.payInvoiceData.input.amount = 5;

    await wallet.meltQuoteInvoiceDataBolt12();

    expect(createMeltQuoteBolt12).toHaveBeenCalledWith("lno1offer", 5_000_000);
  });

  it("shows an error when no mint supports Bolt12 offers", async () => {
    const wallet = useWalletStore();
    h.mintsStore.mints = [
      {
        url: "https://mint-a.example",
        keys: [{ id: "00aa" }],
        keysets: [{ id: "00aa", unit: "sat", active: true }],
        info: {
          nuts: { 5: { methods: [{ method: "bolt11" }] } },
        },
      },
    ];

    await wallet.handleBolt12Offer("lno1amountless");

    expect(wallet.payInvoiceData.meltQuote.error).toBe(
      "wallet.notifications.no_bolt12_mint"
    );
    expect(h.mintsStore.activateMintUrl).not.toHaveBeenCalled();
    expect(h.mintsStore.selectMintUrl).not.toHaveBeenCalled();
  });

  it("switches to a Bolt12-enabled mint when paying an offer", async () => {
    const wallet = useWalletStore();
    h.mintsStore.activeMintUrl = "https://mint-a.example";
    h.mintsStore.mints = [
      {
        url: "https://mint-a.example",
        keys: [{ id: "00aa" }],
        keysets: [{ id: "00aa", unit: "sat", active: true }],
        info: {
          nuts: { 5: { methods: [{ method: "bolt11" }] } },
        },
      },
      {
        url: "https://mint-b.example",
        keys: [{ id: "00bb" }],
        keysets: [{ id: "00bb", unit: "sat", active: true }],
        info: {
          nuts: { 5: { methods: [{ method: "bolt12" }] } },
        },
      },
    ];

    await wallet.handleBolt12Offer("lno1amountless");

    expect(h.mintsStore.selectMintUrl).toHaveBeenCalledWith(
      "https://mint-b.example"
    );
    expect(h.mintsStore.activateMintUrl).not.toHaveBeenCalled();
    expect(wallet.payInvoiceData.meltQuote.error).toBe("");
  });

  it("does not treat Bolt12 mint support as sufficient for paying an offer", async () => {
    const wallet = useWalletStore();
    h.mintsStore.activeMintUrl = "https://mint-a.example";
    h.mintsStore.mints = [
      {
        url: "https://mint-a.example",
        keys: [{ id: "00aa" }],
        keysets: [{ id: "00aa", unit: "sat", active: true }],
        info: {
          nuts: { 4: { methods: [{ method: "bolt12" }] } },
        },
      },
      {
        url: "https://mint-b.example",
        keys: [{ id: "00bb" }],
        keysets: [{ id: "00bb", unit: "sat", active: true }],
        info: {
          nuts: { 5: { methods: [{ method: "bolt12" }] } },
        },
      },
    ];

    await wallet.handleBolt12Offer("lno1amountless");

    expect(h.mintsStore.selectMintUrl).toHaveBeenCalledWith(
      "https://mint-b.example"
    );
    expect(h.mintsStore.activateMintUrl).not.toHaveBeenCalled();
    expect(wallet.payInvoiceData.meltQuote.error).toBe("");
  });

  it("shows an error when no mint supports Bolt11 invoices", async () => {
    const wallet = useWalletStore();
    h.mintsStore.mints = [
      {
        url: "https://mint-a.example",
        keys: [{ id: "00aa" }],
        keysets: [{ id: "00aa", unit: "sat", active: true }],
        info: {
          nuts: { 5: { methods: [{ method: "bolt12" }] } },
        },
      },
    ];
    wallet.payInvoiceData.input.request = "lnbc123";

    await wallet.handleBolt11InvoiceBolt11();

    expect(wallet.payInvoiceData.meltQuote.error).toBe(
      "wallet.notifications.no_bolt11_mint"
    );
    expect(h.mintsStore.activateMintUrl).not.toHaveBeenCalled();
    expect(h.mintsStore.selectMintUrl).not.toHaveBeenCalled();
  });

  it("switches to a Bolt11 melt-enabled mint when paying an invoice", async () => {
    const wallet = useWalletStore();
    h.mintsStore.activeMintUrl = "https://mint-b.example";
    h.mintsStore.mints = [
      {
        url: "https://mint-a.example",
        keys: [{ id: "00aa" }],
        keysets: [{ id: "00aa", unit: "sat", active: true }],
        info: {
          nuts: { 5: { methods: [{ method: "bolt11" }] } },
        },
      },
      {
        url: "https://mint-b.example",
        keys: [{ id: "00bb" }],
        keysets: [{ id: "00bb", unit: "sat", active: true }],
        info: {
          nuts: { 5: { methods: [{ method: "bolt12" }] } },
        },
      },
    ];
    wallet.payInvoiceData.input.request = "lnbc123";
    const quoteSpy = vi
      .spyOn(wallet, "meltQuoteInvoiceDataBolt11")
      .mockResolvedValue(undefined);

    await wallet.handleBolt11InvoiceBolt11();

    expect(h.mintsStore.selectMintUrl).toHaveBeenCalledWith(
      "https://mint-a.example"
    );
    expect(h.mintsStore.activateMintUrl).not.toHaveBeenCalled();
    expect(quoteSpy).toHaveBeenCalled();
  });

  it("does not treat Bolt11 mint support as sufficient for paying an invoice", async () => {
    const wallet = useWalletStore();
    h.mintsStore.activeMintUrl = "https://mint-a.example";
    h.mintsStore.mints = [
      {
        url: "https://mint-a.example",
        keys: [{ id: "00aa" }],
        keysets: [{ id: "00aa", unit: "sat", active: true }],
        info: {
          nuts: { 4: { methods: [{ method: "bolt11" }] } },
        },
      },
      {
        url: "https://mint-b.example",
        keys: [{ id: "00bb" }],
        keysets: [{ id: "00bb", unit: "sat", active: true }],
        info: {
          nuts: { 5: { methods: [{ method: "bolt11" }] } },
        },
      },
    ];
    wallet.payInvoiceData.input.request = "lnbc123";
    const quoteSpy = vi
      .spyOn(wallet, "meltQuoteInvoiceDataBolt11")
      .mockResolvedValue(undefined);

    await wallet.handleBolt11InvoiceBolt11();

    expect(h.mintsStore.selectMintUrl).toHaveBeenCalledWith(
      "https://mint-b.example"
    );
    expect(quoteSpy).toHaveBeenCalled();
  });

  it("clears stale Bolt11 melt quotes before requesting a replacement quote", async () => {
    const wallet = useWalletStore();
    wallet.payInvoiceData.input.request = "lnbc123";
    wallet.payInvoiceData.meltQuote.response = {
      quote: "old-quote-from-previous-mint",
      amount: 100,
      fee_reserve: 5,
    };
    vi.spyOn(wallet, "activeWallet").mockResolvedValue({});
    vi.spyOn(wallet, "meltQuoteBolt11").mockRejectedValue(
      new Error("quote failed")
    );

    await expect(wallet.meltQuoteInvoiceDataBolt11()).rejects.toThrow(
      "quote failed"
    );

    expect(wallet.payInvoiceData.meltQuote.response).toEqual({
      quote: "",
      amount: 0,
      fee_reserve: 0,
    });
  });

  it("resets stale Bolt12 amount and quote state for amountless offers", async () => {
    const wallet = useWalletStore();
    h.mintsStore.mints[0].info = {
      nuts: {
        5: {
          methods: [{ method: PaymentMethod.Bolt12, unit: "sat" }],
        },
      },
    };
    wallet.payInvoiceData.input.amount = 42;
    wallet.payInvoiceData.input.quote = "old-input-quote";
    wallet.payInvoiceData.meltQuote.error = "old error";
    wallet.payInvoiceData.meltQuote.response = {
      quote: "old-quote",
      amount: 42,
      fee_reserve: 1,
    };
    const quoteSpy = vi
      .spyOn(wallet, "meltQuoteInvoiceData")
      .mockResolvedValue(undefined);

    await wallet.handleBolt12Offer("lno1amountless");

    expect(wallet.payInvoiceData.input.amount).toBeUndefined();
    expect(wallet.payInvoiceData.input.quote).toBe("");
    expect(wallet.payInvoiceData.meltQuote.error).toBe("");
    expect(wallet.payInvoiceData.meltQuote.response).toEqual({
      quote: "",
      amount: 0,
      fee_reserve: 0,
    });
    expect(wallet.payInvoiceData.invoice.bolt12).toBe("lno1amountless");
    expect(quoteSpy).not.toHaveBeenCalled();
  });

  it("checks pending Bolt12 outgoing invoices with Bolt12 melt quotes", async () => {
    const wallet = useWalletStore();
    const proofs = [{ id: "00aa", amount: 105, secret: "s1" }];
    const checkMeltQuoteBolt12 = vi.fn(async () => ({
      quote: "bolt12-melt-q",
      amount: 101,
      fee_reserve: 4,
      state: "PAID",
    }));
    wallet.invoiceHistory = [
      {
        quote: "bolt12-melt-q",
        amount: -105,
        request: "lno1offer",
        memo: "Outgoing invoice",
        date: "old",
        status: "pending",
        mint: "https://mint-a.example",
        unit: "sat",
        type: PaymentMethod.Bolt12,
      },
    ];
    h.proofsStore.getProofsForQuote.mockResolvedValue(proofs);
    vi.spyOn(wallet, "mintWallet").mockResolvedValue({
      mint: { checkMeltQuoteBolt12 },
      unit: "sat",
    });
    vi.spyOn(wallet, "checkProofsSpendable").mockResolvedValue(proofs);

    await wallet.checkOutgoingInvoice("bolt12-melt-q", false);

    expect(checkMeltQuoteBolt12).toHaveBeenCalledWith("bolt12-melt-q");
    expect(wallet.checkProofsSpendable).toHaveBeenCalledWith(
      proofs,
      expect.objectContaining({ mint: { checkMeltQuoteBolt12 } }),
      true
    );
    expect(wallet.invoiceHistory[0].status).toBe("paid");
    expect(wallet.invoiceHistory[0].meltQuote).toMatchObject({
      quote: "bolt12-melt-q",
      state: "PAID",
    });
  });

  it("persists melt change output data before completing a melt", async () => {
    const wallet = useWalletStore();
    const proofs = [{ id: "00aa", amount: 105, secret: "s1" }];
    const quote = {
      quote: "bolt11-melt-q",
      amount: 100,
      fee_reserve: 5,
      state: "PENDING",
      expiry: 0,
      request: "lnbc123",
      payment_preimage: null,
    };
    const preview = {
      method: "bolt11",
      inputs: proofs,
      outputData: [{ id: "change-output" }],
      keysetId: "00aa",
      quote,
    };
    const prepareMelt = vi.fn(async () => preview);
    const completeMelt = vi.fn(async () => ({
      quote: { ...quote, state: "PAID", payment_preimage: "preimage-1" },
      change: [{ id: "00aa", amount: 2, secret: "change" }],
      outputData: [],
    }));
    const mintWallet = {
      mint: { mintUrl: "https://mint-a.example" },
      unit: "sat",
      prepareMelt,
      completeMelt,
    };
    vi.spyOn(wallet, "mintWalletSync").mockReturnValue(mintWallet);
    vi.spyOn(wallet, "send").mockResolvedValue({
      keepProofs: [],
      sendProofs: proofs,
    });

    await wallet.meltGeneric(
      proofs,
      quote,
      mintWallet,
      true,
      vi.fn(),
      PaymentMethod.Bolt11
    );

    expect(prepareMelt).toHaveBeenCalledWith(
      PaymentMethod.Bolt11,
      expect.objectContaining({ quote: "bolt11-melt-q" }),
      proofs,
      { keysetId: "00aa" }
    );
    expect(h.outputDataSerialize).toHaveBeenCalledWith({ id: "change-output" });
    expect(completeMelt).toHaveBeenCalledWith(preview, undefined, undefined);
    expect(h.proofsStore.addMissingProofs).toHaveBeenCalledWith([
      { id: "00aa", amount: 2, secret: "change" },
    ]);
    expect(wallet.invoiceHistory[0].meltQuote).toMatchObject({
      quote: "bolt11-melt-q",
      state: "PAID",
      payment_preimage: "preimage-1",
      fee_paid: 3,
    });
    expect(wallet.invoiceHistory[0].meltChangeOutputData).toEqual([]);
    expect(wallet.invoiceHistory[0].meltOutputData).toEqual([]);
  });

  it("keeps the mutex during normal melts and only releases when requested", async () => {
    const wallet = useWalletStore();
    wallet.invoiceHistory = [];
    wallet.payInvoiceData.input.request = "lnbc123";
    const proofs = [{ id: "00aa", amount: 105, secret: "s1" }];
    const quote = {
      quote: "bolt11-melt-q",
      amount: 100,
      fee_reserve: 5,
      state: "PENDING",
      expiry: 0,
      request: "lnbc123",
      payment_preimage: null,
    };
    const preview = {
      method: PaymentMethod.Bolt11,
      inputs: proofs,
      outputData: [],
      keysetId: "00aa",
      quote,
    };
    const prepareMelt = vi.fn(async () => preview);
    const completeMelt = vi.fn(async () => {
      expect(h.uiStore.unlockMutex).not.toHaveBeenCalled();
      return {
        quote: { ...quote, state: "PAID" },
        change: [],
        outputData: [],
      };
    });
    const mintWallet = {
      mint: { mintUrl: "https://mint-a.example" },
      unit: "sat",
      prepareMelt,
      completeMelt,
    };
    // meltGeneric now gets its signing wallet from retryOnceOnSignedOutputs
    vi.spyOn(wallet, "mintWalletSync").mockReturnValue(mintWallet);
    vi.spyOn(wallet, "send").mockResolvedValue({
      keepProofs: [],
      sendProofs: proofs,
    });

    await wallet.meltGeneric(
      proofs,
      quote,
      mintWallet,
      true,
      vi.fn(),
      PaymentMethod.Bolt11
    );

    expect(h.uiStore.unlockMutex).toHaveBeenCalledTimes(1);

    h.uiStore.lockMutex.mockClear();
    h.uiStore.unlockMutex.mockClear();
    wallet.invoiceHistory = [];
    completeMelt.mockImplementationOnce(async () => {
      expect(h.uiStore.unlockMutex).toHaveBeenCalledTimes(1);
      return {
        quote: { ...quote, state: "PAID" },
        change: [],
        outputData: [],
      };
    });

    await wallet.meltGeneric(
      proofs,
      quote,
      mintWallet,
      true,
      vi.fn(),
      PaymentMethod.Bolt11,
      undefined,
      true
    );

    expect(h.uiStore.unlockMutex).toHaveBeenCalledTimes(2);
  });

  it("forwards the silent flag through meltInvoiceData", async () => {
    const wallet = useWalletStore();
    const proofs = [{ id: "00aa", amount: 105, secret: "s1" }];
    const quote = {
      quote: "bolt11-melt-q",
      amount: 100,
      fee_reserve: 5,
      state: "PENDING",
      expiry: 0,
      request: "lnbc123",
      payment_preimage: null,
    };
    wallet.invoiceHistory = [];
    wallet.payInvoiceData.invoice = {
      sat: 100,
      memo: "",
      request: "lnbc123",
    };
    wallet.payInvoiceData.meltQuote.response = quote;
    h.mintsStore.activeProofs = proofs;
    const mintWallet = {
      mint: { mintUrl: "https://mint-a.example" },
      unit: "sat",
    };
    vi.spyOn(wallet, "mintWallet").mockResolvedValue(mintWallet);
    const meltBolt11 = vi.spyOn(wallet, "meltBolt11").mockResolvedValue({
      change: [],
    });

    await wallet.meltInvoiceData(true);

    expect(meltBolt11).toHaveBeenCalledWith(proofs, quote, mintWallet, true);
  });

  it("passes selected on-chain fee index through recoverable melt completion", async () => {
    const wallet = useWalletStore();
    wallet.payInvoiceData.input.request = "bitcoin:bc1qabc?amount=0.00000100";
    const proofs = [{ id: "00aa", amount: 112, secret: "s1" }];
    const quote = {
      quote: "onchain-melt-q",
      amount: 100,
      fee_reserve: 12,
      unit: "sat",
      state: "PENDING",
      expiry: 0,
      request: "bitcoin:bc1qabc?amount=0.00000100",
      payment_preimage: null,
      selected_fee_index: 7,
      fee_options: [
        { fee_index: 3, fee_reserve: 20, estimated_blocks: 6 },
        { fee_index: 7, fee_reserve: 12, estimated_blocks: 12 },
      ],
    };
    const preview = {
      method: PaymentMethod.Onchain,
      inputs: proofs,
      outputData: [{ id: "change-output" }],
      keysetId: "00aa",
      quote,
    };
    const prepareMelt = vi.fn(async () => preview);
    const completeMelt = vi.fn(async () => ({
      quote: { ...quote, state: "PAID" },
      change: [],
      outputData: [],
    }));
    const mintWallet = {
      mint: { mintUrl: "https://mint-a.example" },
      unit: "sat",
      prepareMelt,
      completeMelt,
    };
    vi.spyOn(wallet, "mintWalletSync").mockReturnValue(mintWallet);
    vi.spyOn(wallet, "send").mockResolvedValue({
      keepProofs: [],
      sendProofs: proofs,
    });

    await wallet.meltOnchain(proofs, quote, mintWallet, true);

    expect(prepareMelt).toHaveBeenCalledWith(
      PaymentMethod.Onchain,
      expect.objectContaining({ quote: "onchain-melt-q" }),
      proofs,
      { keysetId: "00aa" }
    );
    expect(completeMelt).toHaveBeenCalledWith(preview, undefined, {
      extraPayload: { fee_index: 7 },
    });
  });

  it("recovers deferred melt change before finalizing pending payments", async () => {
    const wallet = useWalletStore();
    const proofs = [{ id: "00aa", amount: 105, secret: "s1" }];
    const changeProofs = [{ id: "00aa", amount: 3, secret: "change" }];
    const changeSigs = [{ id: "00aa", amount: 3, C_: "sig" }];
    const checkMeltQuoteBolt12 = vi.fn(async () => ({
      quote: "bolt12-melt-q",
      amount: 100,
      fee_reserve: 5,
      state: "PAID",
      change: changeSigs,
    }));
    const createMeltChangeProofs = vi.fn(() => changeProofs);
    wallet.invoiceHistory = [
      {
        quote: "bolt12-melt-q",
        amount: -105,
        request: "lno1offer",
        memo: "Outgoing invoice",
        date: "old",
        status: "pending",
        mint: "https://mint-a.example",
        unit: "sat",
        type: PaymentMethod.Bolt12,
        meltChangeOutputData: [{ serialized: "change-output" }],
      },
    ];
    h.proofsStore.getProofsForQuote.mockResolvedValue(proofs);
    vi.spyOn(wallet, "mintWallet").mockResolvedValue({
      mint: { checkMeltQuoteBolt12 },
      unit: "sat",
      createMeltChangeProofs,
    });
    vi.spyOn(wallet, "checkProofsSpendable").mockResolvedValue(proofs);

    await wallet.checkOutgoingInvoice("bolt12-melt-q", false);

    expect(h.outputDataDeserialize).toHaveBeenCalledWith({
      serialized: "change-output",
    });
    expect(createMeltChangeProofs).toHaveBeenCalledWith(
      [{ deserialized: { serialized: "change-output" } }],
      changeSigs
    );
    expect(h.proofsStore.addMissingProofs).toHaveBeenCalledWith(changeProofs);
    expect(wallet.invoiceHistory[0]).toMatchObject({
      status: "paid",
      amount: -102,
      meltChangeOutputData: [],
    });
    expect(wallet.invoiceHistory[0].meltQuote).toMatchObject({
      fee_paid: 2,
    });
  });

  it("recovers deferred melt change from legacy output data records", async () => {
    const wallet = useWalletStore();
    const proofs = [{ id: "00aa", amount: 105, secret: "s1" }];
    const changeProofs = [{ id: "00aa", amount: 3, secret: "change" }];
    const changeSigs = [{ id: "00aa", amount: 3, C_: "sig" }];
    const createMeltChangeProofs = vi.fn(() => changeProofs);
    wallet.invoiceHistory = [
      {
        quote: "legacy-melt-q",
        amount: -105,
        request: "lnbc",
        memo: "Outgoing invoice",
        date: "old",
        status: "pending",
        mint: "https://mint-a.example",
        unit: "sat",
        type: PaymentMethod.Bolt11,
        meltOutputData: [{ serialized: "legacy-change-output" }],
      },
    ];

    await wallet.finalizePaidMeltInvoice(
      "legacy-melt-q",
      { createMeltChangeProofs },
      {
        quote: "legacy-melt-q",
        amount: 100,
        fee_reserve: 5,
        state: "PAID",
        change: changeSigs,
      },
      proofs,
      false
    );

    expect(h.outputDataDeserialize).toHaveBeenCalledWith({
      serialized: "legacy-change-output",
    });
    expect(createMeltChangeProofs).toHaveBeenCalledWith(
      [{ deserialized: { serialized: "legacy-change-output" } }],
      changeSigs
    );
    expect(wallet.invoiceHistory[0]).toMatchObject({
      status: "paid",
      amount: -102,
      meltChangeOutputData: [],
      meltOutputData: [],
    });
  });

  it("routes decodeRequest branches", async () => {
    const wallet = useWalletStore();
    vi.spyOn(wallet, "handleBolt11InvoiceBolt11").mockResolvedValue(undefined);
    vi.spyOn(wallet, "lnurlPayFirst").mockResolvedValue(undefined);
    vi.spyOn(wallet, "handlePaymentRequest").mockResolvedValue(undefined);

    await wallet.decodeRequest(" lightning:lnbcabc ");
    await wallet.decodeRequest(
      "bitcoin:bc1qxyz?lightning=lnbcfrombitcoin&amount=1"
    );
    await wallet.decodeRequest(
      "bitcoin:bc1qxyz?creq=creqb1cashurequest&lightning=lnbcfrombitcoin&amount=1"
    );
    await wallet.decodeRequest("lnurl:lnurl1example");
    await wallet.decodeRequest("cashuAabcdef");

    h.p2pkStore.isValidPubkey.mockReturnValueOnce(true);
    await wallet.decodeRequest("02abcdef");
    await wallet.decodeRequest("https://mint-b.example");
    await wallet.decodeRequest("creqA123");
    await wallet.decodeRequest("creqb1xyz");

    expect(h.receiveTokensStore.receiveData.tokensBase64).toBe("cashuAabcdef");
    expect(h.sendTokensStore.sendData.p2pkPubkey).toBe("02abcdef");
    expect(h.mintsStore.addMintData.url).toBe("https://mint-b.example");
    expect(wallet.handlePaymentRequest).toHaveBeenCalledWith("creqA123");
    expect(wallet.handlePaymentRequest).toHaveBeenCalledWith("creqb1xyz");
    expect(wallet.handlePaymentRequest).toHaveBeenCalledWith(
      "creqb1cashurequest"
    );
    expect(h.uiStore.closeDialogs).toHaveBeenCalled();
  });

  it("decodes BIP-321 bitcoin: URIs with uppercase query keys", async () => {
    const wallet = useWalletStore();
    vi.spyOn(wallet, "handleBolt11InvoiceBolt11").mockResolvedValue(undefined);
    vi.spyOn(wallet, "handlePaymentRequest").mockResolvedValue(undefined);

    await wallet.decodeRequest(
      "BITCOIN:?LIGHTNING=LNBCUPPER&CREQ=CREQB1UPPERCASE"
    );

    expect(wallet.handlePaymentRequest).toHaveBeenCalledWith("CREQB1UPPERCASE");
  });

  it("redeem shows the normalized received amount for v4 proofs", async () => {
    const wallet = useWalletStore();
    h.receiveTokensStore.receiveData.tokensBase64 = "cashuB500";

    const decodedToken = { mint: "https://mint-a.example", unit: "sat" };
    const inputProofs = [{ id: "00aa", amount: 500, secret: "s-in" }];
    const receivedProofs = [
      { id: "00aa", amount: { weird: "amount-shape" }, secret: "s-out" },
    ];

    h.tokenModule.decodeFull.mockResolvedValue(decodedToken);
    h.tokenModule.getProofs.mockReturnValue(inputProofs);
    h.tokenModule.getMint.mockReturnValue("https://mint-a.example");
    h.tokenModule.getUnit.mockReturnValue("sat");

    h.proofsStore.sumProofs.mockImplementation((proofs) => {
      if (proofs === receivedProofs) return 500;
      return proofs.reduce((sum, p) => sum + p.amount, 0);
    });

    vi.spyOn(wallet, "mintWalletSync").mockReturnValue({
      ops: {
        receive: vi.fn(() => ({
          asDeterministic: vi.fn(() => ({
            privkey: vi.fn(() => ({
              proofsWeHave: vi.fn(() => ({
                run: vi.fn(async () => receivedProofs),
              })),
            })),
          })),
        })),
      },
    });

    await wallet.redeem();

    expect(h.notifySuccess).toHaveBeenCalledWith(
      "wallet.notifications.received"
    );
    expect(h.uiStore.formatCurrency).toHaveBeenCalledWith(500, "sat");
    expect(h.tokensStore.addPaidToken).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 500, fee: 0, unit: "sat" })
    );
  });

  describe("signing paths route through the wrapper (post-rotation)", () => {
    // Every signing path must build outputs on the keyset that is active
    // after the refresh, not the one cached before it.
    function rotateOnFetch() {
      h.mintsStore.fetchMintKeys.mockImplementationOnce(async (mint) => {
        mint.keysets = [
          { id: "00aa", unit: "sat", active: false },
          { id: "00cc", unit: "sat", active: true },
        ];
      });
    }

    function mintBuilder() {
      const builder = {
        keyset: vi.fn(),
        asDeterministic: vi.fn(),
        proofsWeHave: vi.fn(),
        privkey: vi.fn(),
        run: vi.fn(async () => [{ id: "00cc", amount: 100, secret: "s1" }]),
      };
      builder.keyset.mockReturnValue(builder);
      builder.asDeterministic.mockReturnValue(builder);
      builder.proofsWeHave.mockReturnValue(builder);
      builder.privkey.mockReturnValue(builder);
      return builder;
    }

    it("redeem receives on a wallet built after the refresh", async () => {
      const wallet = useWalletStore();
      h.receiveTokensStore.receiveData.tokensBase64 = "cashuB500";
      h.tokenModule.decodeFull.mockResolvedValue({});
      h.tokenModule.getProofs.mockReturnValue([
        { id: "00aa", amount: 500, secret: "s-in" },
      ]);
      h.tokenModule.getMint.mockReturnValue("https://mint-a.example");
      h.tokenModule.getUnit.mockReturnValue("sat");

      rotateOnFetch();
      const mintWalletSyncSpy = vi
        .spyOn(wallet, "mintWalletSync")
        .mockReturnValue({
          ops: {
            receive: vi.fn(() => ({
              asDeterministic: vi.fn(() => ({
                privkey: vi.fn(() => ({
                  proofsWeHave: vi.fn(() => ({
                    run: vi.fn(async () => [
                      { id: "00cc", amount: 500, secret: "s-out" },
                    ]),
                  })),
                })),
              })),
            })),
          },
        });

      await wallet.redeem();

      // the receive wallet is constructed only after the keys refresh, so
      // cts implicit keyset selection sees the rotated keyset
      expect(h.mintsStore.fetchMintKeys).toHaveBeenCalledTimes(1);
      expect(
        h.mintsStore.fetchMintKeys.mock.invocationCallOrder[0]
      ).toBeLessThan(mintWalletSyncSpy.mock.invocationCallOrder[0]);
    });

    it("mintBolt11 mints on the rotated keyset", async () => {
      const wallet = useWalletStore();
      const invoice = {
        quote: "q-1",
        amount: 100,
        mint: "https://mint-a.example",
        unit: "sat",
        privKey: "privkey",
      };
      wallet.invoiceHistory = [invoice];
      const builder = mintBuilder();

      rotateOnFetch();
      vi.spyOn(wallet, "mintWalletSync").mockReturnValue({
        checkMintQuoteBolt11: vi.fn(async () => ({
          state: "PAID",
          quote: "q-1",
          amount: 100,
        })),
        ops: { mintBolt11: vi.fn(() => builder) },
      });

      await wallet.mintBolt11(invoice, false);

      expect(h.mintsStore.fetchMintKeys).toHaveBeenCalledTimes(1);
      expect(builder.keyset).toHaveBeenCalledWith("00cc");
    });

    it("checkOfferAndMintBolt12 mints on the rotated keyset", async () => {
      const wallet = useWalletStore();
      wallet.invoiceHistory = [
        {
          quote: "offer-q",
          amount: 0,
          request: "lno1offer",
          memo: "memo",
          date: "old",
          status: "pending",
          mint: "https://mint-a.example",
          unit: "sat",
          privKey: "privkey",
          type: PaymentMethod.Bolt12,
        },
      ];
      const builder = mintBuilder();
      const quoteStates = [
        { quote: "offer-q", amount_paid: 100, amount_issued: 0 },
        { quote: "offer-q", amount_paid: 100, amount_issued: 100 },
      ];

      rotateOnFetch();
      vi.spyOn(wallet, "mintWalletSync").mockReturnValue({
        checkMintQuoteBolt12: vi.fn(async () => quoteStates.shift()),
        ops: { mintBolt12: vi.fn(() => builder) },
      });

      await wallet.checkOfferAndMintBolt12("offer-q", false, false);

      expect(h.mintsStore.fetchMintKeys).toHaveBeenCalledTimes(1);
      expect(builder.keyset).toHaveBeenCalledWith("00cc");
    });

    it("checkOnchainAndMint mints on the rotated keyset", async () => {
      const wallet = useWalletStore();
      wallet.invoiceHistory = [
        {
          quote: "onchain-q",
          amount: 100,
          request: "bc1qexample",
          memo: "memo",
          date: "old",
          status: "pending",
          mint: "https://mint-a.example",
          unit: "sat",
          privKey: "privkey",
          network: "mainnet",
          type: PaymentMethod.Onchain,
        },
      ];
      const builder = mintBuilder();
      const quoteStates = [
        { quote: "onchain-q", amount_paid: 100, amount_issued: 0 },
        { quote: "onchain-q", amount_paid: 100, amount_issued: 100 },
      ];

      rotateOnFetch();
      vi.spyOn(wallet, "mintWalletSync").mockReturnValue({
        checkMintQuoteOnchain: vi.fn(async () => quoteStates.shift()),
        ops: { mintOnchain: vi.fn(() => builder) },
      });

      await wallet.checkOnchainAndMint("onchain-q", false, false);

      expect(h.mintsStore.fetchMintKeys).toHaveBeenCalledTimes(1);
      expect(builder.keyset).toHaveBeenCalledWith("00cc");
    });

    it("melt prepares change outputs on the rotated keyset", async () => {
      const wallet = useWalletStore();
      wallet.invoiceHistory = [];
      wallet.payInvoiceData.input.request = "lnbc123";
      const proofs = [{ id: "00aa", amount: 105, secret: "s1" }];
      const quote = {
        quote: "bolt11-melt-q",
        amount: 100,
        fee_reserve: 5,
        state: "PENDING",
        expiry: 0,
        request: "lnbc123",
        payment_preimage: null,
      };
      const prepareMelt = vi.fn(async () => ({
        method: "bolt11",
        inputs: proofs,
        outputData: [],
        keysetId: "00cc",
        quote,
      }));
      const mintWallet = {
        mint: { mintUrl: "https://mint-a.example" },
        unit: "sat",
        prepareMelt,
        completeMelt: vi.fn(async () => ({
          quote: { ...quote, state: "PAID" },
          change: [],
          outputData: [],
        })),
      };

      rotateOnFetch();
      vi.spyOn(wallet, "mintWalletSync").mockReturnValue(mintWallet);
      vi.spyOn(wallet, "send").mockResolvedValue({
        keepProofs: [],
        sendProofs: proofs,
      });

      await wallet.meltGeneric(
        proofs,
        quote,
        mintWallet,
        true,
        vi.fn(),
        PaymentMethod.Bolt11
      );

      expect(h.mintsStore.fetchMintKeys).toHaveBeenCalledTimes(1);
      expect(prepareMelt).toHaveBeenCalledWith(
        PaymentMethod.Bolt11,
        expect.objectContaining({ quote: "bolt11-melt-q" }),
        proofs,
        { keysetId: "00cc" }
      );
    });

    it("sendToLock locks to the rotated keyset", async () => {
      const wallet = useWalletStore();
      const proofs = [
        { id: "00aa", amount: 10, reserved: false, secret: "s1" },
      ];
      const builder = {
        keyset: vi.fn(),
        asP2PK: vi.fn(),
        run: vi.fn(async () => ({ keep: [], send: [] })),
      };
      builder.keyset.mockReturnValue(builder);
      builder.asP2PK.mockReturnValue(builder);

      const lockWallet = {
        mint: { mintUrl: "https://mint-a.example" },
        unit: "sat",
        selectProofsToSend: vi.fn(() => ({ send: proofs, keep: [] })),
        ops: { send: vi.fn(() => builder) },
      };

      rotateOnFetch();
      vi.spyOn(wallet, "mintWalletSync").mockReturnValue(lockWallet);

      await wallet.sendToLock(proofs, lockWallet, 10, "02pubkey");

      expect(h.mintsStore.fetchMintKeys).toHaveBeenCalledTimes(1);
      expect(builder.keyset).toHaveBeenCalledWith("00cc");
      expect(builder.asP2PK).toHaveBeenCalledWith({ pubkey: "02pubkey" });
    });
  });
});
