import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { useMintsStore } from "src/stores/mints";
import { useNostrStore } from "src/stores/nostr";
import { useNpubCashStore } from "src/stores/npubcash";

vi.mock("vue-i18n", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-i18n")>();
  return {
    ...actual,
    useI18n: () => ({ t: (key: string) => key }),
  };
});

describe("npub.cash store", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
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
        if (url === "https://npub.cash/api/v2/wallet/quotes") {
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
        if (url === "https://npub.cash/api/v2/wallet/quotes") {
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
      "https://npub.cash/api/v2/wallet/quotes",
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
});
