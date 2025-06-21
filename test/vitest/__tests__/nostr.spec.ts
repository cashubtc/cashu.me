import { describe, it, expect, beforeEach, vi } from "vitest";
import { useNostrStore } from "../../../src/stores/nostr";
import { NDKKind } from "@nostr-dev-kit/ndk";

const ndkStub = {};
vi.mock("../../../src/composables/useNdk", () => ({
  useNdk: vi.fn().mockResolvedValue(ndkStub),
}));

const encryptMock = vi.fn((content: string) => content);
let publishSuccess = true;
vi.mock("nostr-tools", () => ({
  nip04: { encrypt: encryptMock },
  nip19: { decode: vi.fn(), nsecEncode: vi.fn(), nprofileEncode: vi.fn() },
  nip44: {
    v2: {
      encrypt: encryptMock,
      utils: { getConversationKey: vi.fn(() => "k") },
    },
  },
  generateSecretKey: () => new Uint8Array(32).fill(1),
  getPublicKey: () => "pubkey",
  SimplePool: class {
    publish() {
      if (publishSuccess) {
        return [];
      }
      throw new Error("fail");
    }
  },
}));

vi.mock("@noble/hashes/utils", () => ({
  bytesToHex: (b: Uint8Array) => Buffer.from(b).toString("hex"),
  hexToBytes: (h: string) => Uint8Array.from(Buffer.from(h, "hex")),
}));

vi.mock("../../../src/stores/wallet", () => ({
  useWalletStore: () => ({ seed: new Uint8Array(32).fill(2) }),
}));

const notifySuccess = vi.fn();
const notifyError = vi.fn();
vi.mock("../../../src/js/notify", () => ({
  notifySuccess,
  notifyError,
}));

beforeEach(() => {
  encryptMock.mockClear();
  localStorage.clear();
  notifySuccess.mockClear();
  notifyError.mockClear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runAllTimers();
  vi.useRealTimers();
});

describe("sendNip04DirectMessage", () => {
  it("returns signed event when published", async () => {
    const store = useNostrStore();
    const promise = store.sendNip04DirectMessage("r", "m");
    vi.runAllTimers();
    const res = await promise;
    expect(res.success).toBe(true);
    expect(res.event).not.toBeNull();
    expect(res.event!.sig).toBeDefined();
    const used = encryptMock.mock.calls[0][0];
    const parsed = JSON.parse(used);
    expect(parsed.sig).toBeDefined();
  });

  it("constructs event with correct kind and tags", async () => {
    const store = useNostrStore();
    const res = await store.sendNip04DirectMessage("receiver", "msg");
    vi.runAllTimers();
    expect(res.event!.kind).toBe(NDKKind.EncryptedDirectMessage);
    expect(res.event!.tags).toContainEqual(["p", "receiver"]);
    expect(res.event!.tags).toContainEqual(["p", store.seedSignerPublicKey]);
  });

  it("generates keypair if not set", async () => {
    const store = useNostrStore();
    expect(store.seedSignerPrivateKey).toBe("");
    const res = await store.sendNip04DirectMessage("receiver", "msg");
    vi.runAllTimers();
    expect(res.success).toBe(true);
    expect(res.event).not.toBeNull();
    expect(store.seedSignerPrivateKey).not.toBe("");
  });

  it("returns null when publish fails", async () => {
    const store = useNostrStore();
    publishSuccess = false;
    const promise = store.sendNip04DirectMessage("r", "m");
    vi.runAllTimers();
    const res = await promise;
    expect(res.success).toBe(false);
    expect(res.event).toBeNull();
    expect(notifyError).toHaveBeenCalled();
    publishSuccess = true;
  });
});
