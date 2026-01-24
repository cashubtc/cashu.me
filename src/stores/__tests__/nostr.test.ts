import { createPinia, setActivePinia } from "pinia";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useNostrStore, SignerType } from "../nostr";
import { useWalletStore } from "../wallet";

// Mock NDK
vi.mock("@nostr-dev-kit/ndk", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      connect: vi.fn(),
      fetchEvents: vi.fn().mockResolvedValue(new Set()),
      subscribe: vi.fn().mockReturnValue({
        on: vi.fn(),
        stop: vi.fn(),
      }),
      publish: vi.fn(),
    })),
    NDKEvent: vi.fn().mockImplementation(() => ({
      sign: vi.fn(),
      publish: vi.fn(),
      getEventHash: vi.fn().mockReturnValue("hash"),
      toNostrEvent: vi.fn().mockResolvedValue({}),
    })),
    NDKPrivateKeySigner: vi.fn().mockImplementation(() => ({
      blockUntilReady: vi.fn(),
      user: vi.fn().mockResolvedValue({ pubkey: "pubkey" }),
    })),
    NDKNip07Signer: vi.fn(),
    NDKNip46Signer: vi.fn(),
    NDKKind: { EncryptedDirectMessage: 4 },
  };
});

// Mock nostr-tools
vi.mock("nostr-tools", async () => {
  const actual: any = await vi.importActual("nostr-tools");
  return {
    ...actual,
    nip04: {
      encrypt: vi.fn().mockResolvedValue("encrypted"),
      decrypt: vi.fn().mockResolvedValue("decrypted"),
    },
    nip19: {
      ...actual.nip19,
      decode: vi.fn().mockReturnValue({ data: new Uint8Array(32) }),
      nsecEncode: vi.fn().mockReturnValue("nsec1..."),
      nprofileEncode: vi.fn().mockReturnValue("nprofile..."),
    },
  };
});

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    d: (key: string) => key,
  }),
}));

vi.mock("src/boot/i18n", () => ({
  i18n: {
    global: {
      t: (key: string) => key,
    },
  },
}));

vi.mock("src/js/notify", () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
}));

describe("useNostrStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize private key signer from wallet seed", async () => {
    const store = useNostrStore();
    const walletStore = useWalletStore();

    // Mock wallet mnemonic
    walletStore.mnemonic =
      "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

    await store.initWalletSeedPrivateKeySigner();

    expect(store.signerType).toBe(SignerType.SEED);
    expect(store.seedSignerPrivateKey).toBeDefined();
    expect(store.seedSignerPublicKey).toBeDefined();
  });

  it("should send NIP-04 direct message", async () => {
    const store = useNostrStore();
    const walletStore = useWalletStore();
    walletStore.mnemonic =
      "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

    await store.initWalletSeedPrivateKeySigner();

    // Mock notify
    const { notifySuccess } = await import("src/js/notify");

    await store.sendNip04DirectMessage("recipient_pubkey", "message");

    // Verify NDKEvent was created and published
    // We can't easily spy on the instance created inside, but we can verify notifySuccess called
    expect(notifySuccess).toHaveBeenCalledWith("NIP-04 event published");
  });
});
