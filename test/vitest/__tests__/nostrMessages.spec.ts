import { describe, it, expect, beforeEach, vi } from "vitest";
import { useNostrStore } from "../../../src/stores/nostr";

let receiveStore: any;
let sendStore: any;
let prStore: any;
let tokensStore: any;
let dbGet = vi.fn();
let dbPut = vi.fn();
const getEncodedTokenV4 = vi.fn(() => "enc");

vi.mock("@cashu/cashu-ts", () => ({
  getEncodedTokenV4,
}));

vi.mock("../../../src/stores/receiveTokensStore", () => ({
  useReceiveTokensStore: () => receiveStore,
}));

vi.mock("../../../src/stores/sendTokensStore", () => ({
  useSendTokensStore: () => sendStore,
}));

vi.mock("../../../src/stores/payment-request", () => ({
  usePRStore: () => prStore,
}));

vi.mock("../../../src/stores/tokens", () => ({
  useTokensStore: () => tokensStore,
}));

vi.mock("../../../src/stores/dexie", () => ({
  cashuDb: {
    profiles: { get: (...args: any[]) => dbGet(...args), put: (...args: any[]) => dbPut(...args) },
  },
}));

vi.mock("@nostr-dev-kit/ndk", () => {
  class NDK {
    constructor(_opts: any) {}
    connect() {}
    getUser() {
      return {
        fetchProfile: vi.fn(async () => {}),
        profile: { name: "alice" },
      };
    }
  }
  return {
    default: NDK,
    NDKEvent: class {},
    NDKSigner: class {},
    NDKNip07Signer: class {},
    NDKNip46Signer: class {},
    NDKFilter: class {},
    NDKPrivateKeySigner: class {},
    NostrEvent: class {},
    NDKKind: {},
    NDKRelaySet: class {},
    NDKRelay: class {},
    NDKTag: class {},
    ProfilePointer: class {},
  };
});

beforeEach(() => {
  receiveStore = { receiveData: { tokensBase64: "" }, showReceiveTokens: false, receiveIfDecodes: vi.fn(async () => true) };
  sendStore = { showSendTokens: true };
  prStore = { receivePaymentRequestsAutomatically: false, showPRDialog: true };
  tokensStore = { tokenAlreadyInHistory: vi.fn(() => null) };
  dbGet.mockReset();
  dbPut.mockReset();
});

describe("parseMessageForEcash", () => {
  it("parses payment request payload", async () => {
    const store = useNostrStore();
    vi.spyOn(store, "addPendingTokenToHistory").mockResolvedValue();
    const msg = JSON.stringify({ proofs: [], mint: "m", unit: "sat" });
    await store.parseMessageForEcash(msg);
    expect(getEncodedTokenV4).toHaveBeenCalled();
    expect(store.addPendingTokenToHistory).toHaveBeenCalledWith("enc", false);
    expect(sendStore.showSendTokens).toBe(false);
    expect(prStore.showPRDialog).toBe(false);
    expect(receiveStore.receiveData.tokensBase64).toBe("enc");
  });

  it("extracts cashu tokens from text", async () => {
    const store = useNostrStore();
    vi.spyOn(store, "addPendingTokenToHistory").mockResolvedValue();
    await store.parseMessageForEcash("here cashuAaa there cashuBbb");
    expect(store.addPendingTokenToHistory).toHaveBeenCalledTimes(2);
    expect(receiveStore.showReceiveTokens).toBe(true);
  });
});

describe("getProfile", () => {
  it("fetches and caches profile", async () => {
    const store = useNostrStore();
    dbGet.mockResolvedValue(undefined);
    const profile = await store.getProfile("pk");
    expect(profile.name).toBe("alice");
    expect(dbPut).toHaveBeenCalled();
    // second call should use cache
    dbGet.mockResolvedValue({ profile, fetchedAt: Math.floor(Date.now()/1000) });
    const cached = await store.getProfile("pk");
    expect(cached).toEqual(profile);
  });
});

