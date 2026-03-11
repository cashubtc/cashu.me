import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const notify = vi.fn();
  const notifyApiError = vi.fn();
  const notifyError = vi.fn();
  const notifySuccess = vi.fn();
  const notifyWarning = vi.fn();

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
    setReserved: vi.fn(),
  };
  const uiStore = {
    lockMutex: vi.fn(async () => {}),
    unlockMutex: vi.fn(),
    closeDialogs: vi.fn(),
    formatCurrency: vi.fn((amount, unit) => `${amount} ${unit}`),
    vibrate: vi.fn(),
  };
  const p2pkStore = {
    isValidPubkey: vi.fn(() => false),
    setPrivateKeyUsed: vi.fn(),
  };
  const prStore = {
    decodePaymentRequest: vi.fn(async () => {}),
  };
  const mintsStore = {
    activeMintUrl: "https://mint-a.example",
    activeUnit: "sat",
    addMintData: { url: "", nickname: "" },
    mints: [],
    mintUnitKeysets: vi.fn((mint, unit) =>
      mint.keysets.filter((k) => k.unit === unit)
    ),
    mintUnitProofs: vi.fn(() => []),
    updateMintInfoAndKeys: vi.fn(async () => {}),
  };

  const walletLoadMintFromCache = vi.fn();
  const walletGetFeesForProofs = vi.fn(() => 7);
  const keychainMintToCacheDTO = vi.fn(() => ({ cache: "dto" }));

  class WalletMock {
    constructor(url, options) {
      this.mint = { mintUrl: url };
      this.unit = options.unit;
      this.options = options;
      this.loadMintFromCache = walletLoadMintFromCache;
      this.getFeesForProofs = walletGetFeesForProofs;
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
    mintsStore,
    walletLoadMintFromCache,
    walletGetFeesForProofs,
    keychainMintToCacheDTO,
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

vi.mock("@cashu/cashu-ts", () => ({
  Wallet: h.WalletMock,
  KeyChain: {
    mintToCacheDTO: (...args) => h.keychainMintToCacheDTO(...args),
  },
  CheckStateEnum: { SPENT: "SPENT" },
  MeltQuoteState: { PAID: "PAID", PENDING: "PENDING" },
  MintQuoteState: { PAID: "PAID", ISSUED: "ISSUED", PENDING: "PENDING" },
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
  useWorkersStore: () => ({ checkTokenSpendableWorker: vi.fn() }),
}));

vi.mock("src/stores/invoicesWorker", () => ({
  useInvoicesWorkerStore: () => ({
    addInvoice: vi.fn(),
    removeInvoice: vi.fn(),
  }),
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

import { useWalletStore } from "src/stores/wallet";

describe("wallet store", () => {
  beforeEach(() => {
    vi.clearAllMocks();

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
    h.p2pkStore.isValidPubkey.mockReturnValue(false);
  });

  it("manages keyset counters", () => {
    const wallet = useWalletStore();
    expect(wallet.keysetCounter("k1")).toBe(1);
    wallet.increaseKeysetCounter("k1", 4);
    expect(wallet.keysetCounter("k1")).toBe(5);
    wallet.increaseKeysetCounter("k2", 3);
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

  it("selects base64 proofs by descending amount", () => {
    const wallet = useWalletStore();
    const proofs = [
      { id: "base64-1", amount: 2, reserved: false },
      { id: "00aa", amount: 32, reserved: false },
      { id: "base64-2", amount: 8, reserved: false },
      { id: "base64-3", amount: 4, reserved: false },
    ];
    expect(wallet.coinSelectSpendBase64(proofs, 10)).toEqual([
      { id: "base64-2", amount: 8, reserved: false },
      { id: "base64-3", amount: 4, reserved: false },
    ]);
    expect(wallet.coinSelectSpendBase64(proofs, 20)).toEqual([]);
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
        bolt11: "lnbc",
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

  it("accounts for signed-output errors", () => {
    const wallet = useWalletStore();
    wallet.keysetCounters = [{ id: "00aa", counter: 1 }];

    const handled = wallet.handleOutputsHaveAlreadyBeenSignedError("00aa", {
      message: "outputs have already been signed",
    });

    expect(handled).toBe(true);
    expect(wallet.keysetCounter("00aa")).toBe(11);
    expect(h.notify).toHaveBeenCalledWith(
      "wallet.notifications.please_try_again"
    );
  });

  it("routes decodeRequest branches", async () => {
    const wallet = useWalletStore();
    vi.spyOn(wallet, "handleBolt11Invoice").mockResolvedValue(undefined);
    vi.spyOn(wallet, "lnurlPayFirst").mockResolvedValue(undefined);
    vi.spyOn(wallet, "handlePaymentRequest").mockResolvedValue(undefined);

    await wallet.decodeRequest(" lightning:lnbcabc ");
    await wallet.decodeRequest(
      "bitcoin:bc1qxyz?lightning=lnbcfrombitcoin&amount=1"
    );
    await wallet.decodeRequest("lnurl:lnurl1example");
    await wallet.decodeRequest("cashuAabcdef");

    h.p2pkStore.isValidPubkey.mockReturnValueOnce(true);
    await wallet.decodeRequest("02abcdef");
    await wallet.decodeRequest("https://mint-b.example");
    await wallet.decodeRequest("creqA123");

    expect(h.receiveTokensStore.receiveData.tokensBase64).toBe("cashuAabcdef");
    expect(h.sendTokensStore.sendData.p2pkPubkey).toBe("02abcdef");
    expect(h.mintsStore.addMintData.url).toBe("https://mint-b.example");
    expect(wallet.handlePaymentRequest).toHaveBeenCalledWith("creqA123");
    expect(h.uiStore.closeDialogs).toHaveBeenCalled();
  });
});
