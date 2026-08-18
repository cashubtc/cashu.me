import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { useTransactionWorkerStore } from "src/stores/transactionWorker";
import { useMintsStore } from "src/stores/mints";
import { useNostrStore } from "src/stores/nostr";
import { useNpubCashStore } from "src/stores/npubcash";
import { useSettingsStore } from "src/stores/settings";
import { useWalletStore } from "src/stores/wallet";

vi.mock("vue-i18n", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-i18n")>();
  return {
    ...actual,
    useI18n: () => ({ t: (key: string) => key }),
  };
});

class MockQuoteWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 3;
  static instances: MockQuoteWebSocket[] = [];

  readyState = MockQuoteWebSocket.CONNECTING;
  sent: string[] = [];
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;

  constructor(public url: string) {
    MockQuoteWebSocket.instances.push(this);
  }

  open() {
    this.readyState = MockQuoteWebSocket.OPEN;
  }

  message(message: unknown) {
    this.onmessage?.({ data: JSON.stringify(message) });
  }

  send(message: string) {
    this.sent.push(message);
  }

  close() {
    if (this.readyState === MockQuoteWebSocket.CLOSED) return;
    this.readyState = MockQuoteWebSocket.CLOSED;
    this.onclose?.();
  }
}

describe("npub.cash store", () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    localStorage.clear();
    vi.restoreAllMocks();
    MockQuoteWebSocket.instances = [];
    vi.stubGlobal("WebSocket", MockQuoteWebSocket);
  });

  it("starts a fresh wallet with canonical defaults", () => {
    const store = useNpubCashStore();

    expect(store.$state).toMatchObject({
      enabled: false,
      claimAutomatically: true,
      lastCheck: null,
      address: "",
      mintUrl: null,
      loading: false,
    });
    expect(localStorage.getItem("cashu.npubcash.storageVersion")).toBe("1");
  });

  it("preserves enabled v1 preferences during an in-place upgrade", () => {
    localStorage.setItem("cashu.npc.enabled", "true");
    localStorage.setItem("cashu.npc.automaticClaim", "false");
    localStorage.setItem("cashu.npc.address", "old@npub.cash");

    const store = useNpubCashStore();

    expect(store.enabled).toBe(true);
    expect(store.claimAutomatically).toBe(false);
    expect(store.address).toBe("");
    expect(localStorage.getItem("cashu.npc.enabled")).toBeNull();
    expect(localStorage.getItem("cashu.npc.automaticClaim")).toBeNull();
    expect(localStorage.getItem("cashu.npc.address")).toBeNull();
  });

  it("preserves v2 quote synchronization preferences during an upgrade", () => {
    localStorage.setItem("cashu.npc.v2.enabled", "true");
    localStorage.setItem("cashu.npc.v2.claimAutomatically", "false");
    localStorage.setItem("cashu.npc.v2.lastCheck", "1712345678");
    localStorage.setItem("cashu.npc.v2.address", "old@npubx.cash");
    localStorage.setItem("cashu.npc.v2.mint", "https://mint.example");

    const store = useNpubCashStore();

    expect(store.enabled).toBe(true);
    expect(store.claimAutomatically).toBe(false);
    expect(store.lastCheck).toBe(1712345678);
    expect(store.mintUrl).toBe("https://mint.example");
    expect(store.address).toBe("");
    expect(localStorage.getItem("cashu.npc.v2.enabled")).toBeNull();
    expect(localStorage.getItem("cashu.npc.v2.mint")).toBeNull();
  });

  it("prefers enabled v2 automatic-claim settings when both versions exist", () => {
    localStorage.setItem("cashu.npc.enabled", "true");
    localStorage.setItem("cashu.npc.automaticClaim", "false");
    localStorage.setItem("cashu.npc.v2.enabled", "true");
    localStorage.setItem("cashu.npc.v2.claimAutomatically", "true");

    const store = useNpubCashStore();

    expect(store.enabled).toBe(true);
    expect(store.claimAutomatically).toBe(true);
  });

  it("does not let a disabled v2 default erase enabled v1 settings", () => {
    localStorage.setItem("cashu.npc.enabled", "true");
    localStorage.setItem("cashu.npc.automaticClaim", "false");
    localStorage.setItem("cashu.npc.v2.enabled", "false");
    localStorage.setItem("cashu.npc.v2.claimAutomatically", "true");

    const store = useNpubCashStore();

    expect(store.enabled).toBe(true);
    expect(store.claimAutomatically).toBe(false);
  });

  it("does not make requests when initialization is disabled", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const store = useNpubCashStore();

    await store.initializeNpubCash();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("initializes the signer before assigning an address", async () => {
    const signer = new NDKPrivateKeySigner("1".padStart(64, "0"));
    const nostrStore = useNostrStore();
    nostrStore.pubkey = "";
    vi.spyOn(nostrStore, "initSignerIfNotSet").mockImplementation(async () => {
      if (nostrStore.initialized) {
        return;
      }
      nostrStore.signer = signer;
      nostrStore.pubkey = (await signer.user()).pubkey;
      nostrStore.initialized = true;
    });

    const mintUrl = "https://mint.example";
    const mintsStore = useMintsStore();
    mintsStore.mints = [{ url: mintUrl, keys: [], keysets: [] }];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url === "https://npub.cash/api/v2/user/info") {
          return new Response(
            JSON.stringify({
              error: false,
              data: {
                user: {
                  lockQuote: false,
                  mintUrl,
                  pubkey: nostrStore.pubkey,
                },
              },
            })
          );
        }
        if (url.startsWith("https://npub.cash/api/v2/wallet/quotes?")) {
          return new Response(
            JSON.stringify({
              error: false,
              data: { quotes: [] },
              metadata: { limit: 100, total: 0 },
            })
          );
        }
        throw new Error(`Unexpected request: ${url}`);
      })
    );

    const store = useNpubCashStore();
    store.enabled = true;
    await store.initializeNpubCash();

    expect(store.address).toMatch(/^npub1.+@npub\.cash$/);
  });

  it("initializes only through canonical npub.cash v2 routes", async () => {
    const signer = new NDKPrivateKeySigner("1".padStart(64, "0"));
    const nostrStore = useNostrStore();
    nostrStore.signer = signer;
    nostrStore.pubkey = (await signer.user()).pubkey;
    nostrStore.initialized = true;

    const mintUrl = "https://mint.example";
    const mintsStore = useMintsStore();
    mintsStore.mints = [{ url: mintUrl, keys: [], keysets: [] }];

    const requestedUrls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        requestedUrls.push(url);
        if (url === "https://npub.cash/api/v2/user/info") {
          return new Response(
            JSON.stringify({
              error: false,
              data: {
                user: {
                  lockQuote: false,
                  mintUrl,
                  pubkey: nostrStore.pubkey,
                },
              },
            })
          );
        }
        if (url.startsWith("https://npub.cash/api/v2/wallet/quotes?")) {
          return new Response(
            JSON.stringify({
              error: false,
              data: { quotes: [] },
              metadata: { limit: 100, total: 0 },
            })
          );
        }
        throw new Error(`Unexpected request: ${url}`);
      })
    );

    const store = useNpubCashStore();
    store.enabled = true;
    await store.initializeNpubCash();

    expect(requestedUrls.sort()).toEqual([
      "https://npub.cash/api/v2/user/info",
      "https://npub.cash/api/v2/wallet/quotes?limit=50&offset=0",
    ]);
    expect(store.address).toMatch(/^npub1.+@npub\.cash$/);
    expect(store.mintUrl).toBe(mintUrl);
  });

  it("leaves canonical preferences unchanged after migration", async () => {
    localStorage.setItem("cashu.npc.v2.enabled", "true");
    localStorage.setItem("cashu.npc.v2.claimAutomatically", "false");
    localStorage.setItem("cashu.npc.v2.lastCheck", "1712345678");
    localStorage.setItem("cashu.npc.v2.mint", "https://mint.example");
    const migratedStore = useNpubCashStore();
    migratedStore.address = "alice@npub.cash";
    await nextTick();

    setActivePinia(createPinia());
    const reloadedStore = useNpubCashStore();

    expect(reloadedStore.$state).toMatchObject({
      enabled: true,
      claimAutomatically: false,
      lastCheck: 1712345678,
      address: "alice@npub.cash",
      mintUrl: "https://mint.example",
    });
  });

  it("queues restored npub.cash quotes for background reconciliation", async () => {
    const mintUrl = "https://mint.example";
    const now = Math.floor(Date.now() / 1_000);
    const store = useNpubCashStore();
    store.enabled = true;
    store.claimAutomatically = true;
    const settingsStore = useSettingsStore();
    settingsStore.periodicallyCheckIncomingInvoices = true;
    const mintsStore = useMintsStore();
    mintsStore.mints = [
      { url: mintUrl, keys: [], keysets: [], info: { nuts: { 29: {} } } },
    ];
    const worker = useTransactionWorkerStore();
    worker.quotes = [];
    vi.spyOn(worker, "startTransactionWorker").mockImplementation(() => {});
    const processNow = vi
      .spyOn(worker, "processIncomingTransactionsNow")
      .mockResolvedValue();
    const walletStore = useWalletStore();
    walletStore.invoiceHistory = [];
    vi.spyOn(walletStore, "addPaymentHistory").mockImplementation(
      async (invoice) => {
        walletStore.invoiceHistory.push(invoice);
      }
    );
    const mintOnPaid = vi
      .spyOn(walletStore, "mintOnPaidBolt11")
      .mockResolvedValue(undefined);
    vi.spyOn(store, "sendAuthedRequest").mockResolvedValue(
      new Response(
        JSON.stringify({
          error: false,
          data: {
            quotes: [
              {
                createdAt: now - 3,
                paidAt: now - 2,
                expiresAt: now + 3_600,
                mintUrl,
                quoteId: "npub-q-1",
                request: "lnbc1",
                amount: 10,
                state: "UNPAID",
                locked: false,
              },
              {
                createdAt: now - 1,
                paidAt: now,
                expiresAt: now + 3_600,
                mintUrl,
                quoteId: "npub-q-2",
                request: "lnbc2",
                amount: 20,
                state: "PAID",
                locked: false,
              },
            ],
          },
          metadata: { limit: 100, total: 2 },
        })
      )
    );

    await store.synchronizeQuotes();

    expect(mintOnPaid).not.toHaveBeenCalled();
    expect(worker.quotes.map((quote) => quote.quote)).toEqual([
      "npub-q-1",
      "npub-q-2",
    ]);
    expect(worker.quotes.every((quote) => quote.usesBatchPath)).toBe(true);
    expect(walletStore.invoiceHistory[0].mintQuote?.state).toBe("UNPAID");
    expect(processNow).toHaveBeenCalledOnce();
  });

  it("uses the worker immediately when periodic checking is disabled", async () => {
    const mintUrl = "https://mint.example";
    const now = Math.floor(Date.now() / 1_000);
    const store = useNpubCashStore();
    store.enabled = true;
    store.claimAutomatically = true;
    const settingsStore = useSettingsStore();
    settingsStore.periodicallyCheckIncomingInvoices = false;
    useMintsStore().mints = [
      { url: mintUrl, keys: [], keysets: [], info: { nuts: { 29: {} } } },
    ];
    const worker = useTransactionWorkerStore();
    worker.quotes = [];
    vi.spyOn(worker, "startTransactionWorker").mockImplementation(() => {});
    const processNow = vi
      .spyOn(worker, "processIncomingTransactionsNow")
      .mockResolvedValue();
    const walletStore = useWalletStore();
    walletStore.invoiceHistory = [];
    vi.spyOn(walletStore, "addPaymentHistory").mockImplementation(
      async (invoice) => {
        walletStore.invoiceHistory.push(invoice);
      }
    );
    const mintOnPaid = vi
      .spyOn(walletStore, "mintOnPaidBolt11")
      .mockResolvedValue(undefined);
    vi.spyOn(store, "sendAuthedRequest").mockResolvedValue(
      new Response(
        JSON.stringify({
          error: false,
          data: {
            quotes: [
              {
                createdAt: now - 1,
                paidAt: now,
                expiresAt: now + 3_600,
                mintUrl,
                quoteId: "npub-q-1",
                request: "lnbc1",
                amount: 10,
                state: "PAID",
                locked: false,
              },
            ],
          },
          metadata: { limit: 100, total: 1 },
        })
      )
    );

    await store.synchronizeQuotes();

    expect(worker.quotes).toEqual([
      expect.objectContaining({ quote: "npub-q-1", usesBatchPath: true }),
    ]);
    expect(mintOnPaid).not.toHaveBeenCalled();
    expect(processNow).toHaveBeenCalledOnce();
  });

  it("authenticates realtime updates and debounces quote synchronization", async () => {
    vi.useFakeTimers();
    const store = useNpubCashStore();
    store.enabled = true;
    const generateToken = vi
      .spyOn(store, "generateNip98Event")
      .mockResolvedValue("signed-event");
    const synchronize = vi
      .spyOn(store, "synchronizeQuotes")
      .mockResolvedValue();

    store.startQuoteUpdates();
    const socket = MockQuoteWebSocket.instances[0];
    socket.open();
    socket.message({
      type: "challenge",
      payload: {
        url: "wss://npub.cash/api/v2/ws/quote",
        method: "GET",
      },
    });
    await vi.waitFor(() => expect(socket.sent).toHaveLength(1));

    expect(generateToken).toHaveBeenCalledWith(
      "wss://npub.cash/api/v2/ws/quote",
      "GET"
    );
    expect(JSON.parse(socket.sent[0])).toEqual({
      type: "challenge-response",
      payload: "Nostr signed-event",
    });

    socket.message({ type: "update", payload: { quoteId: "zap-1" } });
    socket.message({ type: "update", payload: { quoteId: "zap-2" } });
    await vi.advanceTimersByTimeAsync(249);
    expect(synchronize).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(synchronize).toHaveBeenCalledOnce();
  });

  it("supports the documented top-level WebSocket auth protocol", async () => {
    const store = useNpubCashStore();
    store.enabled = true;
    vi.spyOn(store, "generateNip98Event").mockResolvedValue("signed-event");

    store.startQuoteUpdates();
    const socket = MockQuoteWebSocket.instances[0];
    socket.open();
    socket.message({ type: "challenge", challenge: "nonce" });
    await vi.waitFor(() => expect(socket.sent).toHaveLength(1));

    expect(JSON.parse(socket.sent[0])).toEqual({
      type: "auth",
      token: "Nostr signed-event",
    });
  });

  it("paginates quotes and advances the paidAt watermark", async () => {
    const mintUrl = "https://mint.example";
    const store = useNpubCashStore();
    store.enabled = true;
    store.lastCheck = 100;
    store.claimAutomatically = true;
    useMintsStore().mints = [
      { url: mintUrl, keys: [], keysets: [], info: { nuts: { 29: {} } } },
    ];
    const walletStore = useWalletStore();
    walletStore.invoiceHistory = [];
    vi.spyOn(walletStore, "addPaymentHistory").mockImplementation(
      async (invoice) => {
        walletStore.invoiceHistory.push(invoice);
      }
    );
    const worker = useTransactionWorkerStore();
    vi.spyOn(worker, "startTransactionWorker").mockImplementation(() => {});
    const processNow = vi
      .spyOn(worker, "processIncomingTransactionsNow")
      .mockResolvedValue();
    const requestedUrls: string[] = [];
    vi.spyOn(store, "sendAuthedRequest").mockImplementation(async (url) => {
      requestedUrls.push(url);
      const offset = Number(new URL(url).searchParams.get("offset"));
      const index = offset === 0 ? 1 : 2;
      return new Response(
        JSON.stringify({
          error: false,
          data: {
            quotes: [
              {
                createdAt: 90 + index,
                paidAt: 100 + index,
                expiresAt: 1_000,
                mintUrl,
                quoteId: `zap-${index}`,
                request: `lnbc${index}`,
                amount: index * 10,
                state: "PAID",
                locked: false,
              },
            ],
          },
          metadata: { limit: 50, total: 2 },
        })
      );
    });

    await store.synchronizeQuotes();

    expect(requestedUrls).toEqual([
      "https://npub.cash/api/v2/wallet/quotes?limit=50&offset=0&since=99",
      "https://npub.cash/api/v2/wallet/quotes?limit=50&offset=1&since=99",
    ]);
    expect(walletStore.invoiceHistory.map((invoice) => invoice.quote)).toEqual([
      "zap-1",
      "zap-2",
    ]);
    expect(store.lastCheck).toBe(102);
    expect(processNow).toHaveBeenCalledOnce();
  });

  it("serializes quote sync bursts and follows up without overlap", async () => {
    const store = useNpubCashStore();
    store.enabled = true;
    let releaseFirstRequest: (() => void) | undefined;
    const firstRequest = new Promise<void>((resolve) => {
      releaseFirstRequest = resolve;
    });
    let requests = 0;
    let activeRequests = 0;
    let maxActiveRequests = 0;
    vi.spyOn(store, "sendAuthedRequest").mockImplementation(async () => {
      requests += 1;
      activeRequests += 1;
      maxActiveRequests = Math.max(maxActiveRequests, activeRequests);
      if (requests === 1) await firstRequest;
      activeRequests -= 1;
      return new Response(
        JSON.stringify({
          error: false,
          data: { quotes: [] },
          metadata: { limit: 50, total: 0 },
        })
      );
    });

    const firstSync = store.synchronizeQuotes();
    const burstSync = store.synchronizeQuotes();
    releaseFirstRequest?.();
    await Promise.all([firstSync, burstSync]);

    expect(requests).toBe(2);
    expect(maxActiveRequests).toBe(1);
  });

  it("reconnects realtime quote updates with backoff", async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const store = useNpubCashStore();
    store.enabled = true;

    store.startQuoteUpdates();
    MockQuoteWebSocket.instances[0].close();
    expect(MockQuoteWebSocket.instances).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(999);
    expect(MockQuoteWebSocket.instances).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(MockQuoteWebSocket.instances).toHaveLength(2);
  });
});
