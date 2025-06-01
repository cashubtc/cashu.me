import { describe, it, expect, beforeEach, vi } from "vitest";
import { useNostrStore } from "../../../src/stores/nostr";
import { NDKKind } from "@nostr-dev-kit/ndk";

vi.mock("@nostr-dev-kit/ndk", () => {
  class NDKEvent {
    kind: number | undefined;
    content: any;
    tags: any[] = [];
    created_at: number | undefined;
    pubkey = "";
    sig: string | undefined;
    id = "";
    constructor(public ndk?: any) {}
    getEventHash() {
      return "hash";
    }
    async sign(_s?: any) {
      this.sig = "signature";
      return this.sig;
    }
    async toNostrEvent() {
      return {
        kind: this.kind,
        content: this.content,
        tags: this.tags,
        created_at: this.created_at,
        pubkey: this.pubkey,
        id: this.id,
        sig: this.sig,
      };
    }
    async publish() {}
  }
  class NDKPrivateKeySigner {
    constructor(privateKey: string) {
      this.privateKey = privateKey;
    }
  }
  class NDK {
    constructor(opts: any) {
      this.opts = opts;
    }
    connect() {}
  }
  return {
    default: NDK,
    NDKEvent,
    NDKSigner: class {},
    NDKNip07Signer: class {},
    NDKNip46Signer: class {},
    NDKFilter: class {},
    NDKPrivateKeySigner,
    NostrEvent: class {},
    NDKKind: { EncryptedDirectMessage: 4 },
    NDKRelaySet: class {},
    NDKRelay: class {},
    NDKTag: class {},
    ProfilePointer: class {},
  };
});

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
      return [
        {
          on: (event: string, cb: Function) => {
            if (event === "ok" && publishSuccess) cb({ url: "r" });
            if (event === "failed" && !publishSuccess) cb("fail");
          },
        },
      ];
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
    const ev = await promise;
    expect(ev).not.toBeNull();
    expect(ev!.sig).toBeDefined();
    const used = encryptMock.mock.calls[0][0];
    const parsed = JSON.parse(used);
    expect(parsed.sig).toBeDefined();
  });

  it("constructs event with correct kind and tags", async () => {
    const store = useNostrStore();
    const ev = await store.sendNip04DirectMessage("receiver", "msg");
    vi.runAllTimers();
    expect(ev!.kind).toBe(NDKKind.EncryptedDirectMessage);
    expect(ev!.tags).toContainEqual(["p", "receiver"]);
    expect(ev!.tags).toContainEqual(["p", store.seedSignerPublicKey]);
  });

  it("generates keypair if not set", async () => {
    const store = useNostrStore();
    expect(store.seedSignerPrivateKey).toBe("");
    const ev = await store.sendNip04DirectMessage("receiver", "msg");
    vi.runAllTimers();
    expect(ev).not.toBeNull();
    expect(store.seedSignerPrivateKey).not.toBe("");
  });

  it("returns null when publish fails", async () => {
    const store = useNostrStore();
    publishSuccess = false;
    const promise = store.sendNip04DirectMessage("r", "m");
    vi.runAllTimers();
    const ev = await promise;
    expect(ev).toBeNull();
    expect(notifyError).toHaveBeenCalled();
    publishSuccess = true;
  });
});
