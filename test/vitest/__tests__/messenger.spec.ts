import { beforeEach, describe, expect, it, vi } from "vitest";

var sendDm: any;
var decryptDm: any;
var subscribe: any;
var walletGen: any;

vi.mock("../../../src/stores/nostr", async (importOriginal) => {
  const actual = await importOriginal();
  sendDm = vi.fn(async () => ({
    success: true,
    event: { id: "1", created_at: 0 },
  }));
  decryptDm = vi.fn(async () => "msg");
  subscribe = vi.fn(
    async (_priv: string, _pub: string, cb: any, _since?: number) => {
      cb && cb({} as any, "");
    }
  );
  walletGen = vi.fn();
  const store = {
    sendNip04DirectMessage: sendDm,
    decryptNip04: decryptDm,
    subscribeToNip04DirectMessagesCallback: subscribe,
    walletSeedGenerateKeyPair: walletGen,
    initSignerIfNotSet: vi.fn(),
    privateKeySignerPrivateKey: "priv",
    seedSignerPrivateKey: "",
    pubkey: "pub",
    connected: true,
    relays: [] as string[],
  };
  Object.defineProperty(store, "privKeyHex", {
    get() {
      return store.privateKeySignerPrivateKey;
    },
  });
  return { ...actual, useNostrStore: () => store };
});

vi.mock("../../../src/js/message-utils", () => ({
  sanitizeMessage: vi.fn((s: string) => s),
}));

var notifySpy: any;
var notifyErrorSpy: any;
vi.mock("../../../src/js/notify", () => {
  notifySpy = vi.fn();
  notifyErrorSpy = vi.fn();
  return { notifySuccess: notifySpy, notifyError: notifyErrorSpy };
});

import { useMessengerStore } from "../../../src/stores/messenger";
import { useNostrStore } from "../../../src/stores/nostr";

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("messenger store", () => {
  it("uses global key when sending DMs", async () => {
    const messenger = useMessengerStore();
    await messenger.sendDm("r", "m");
    expect(sendDm).toHaveBeenCalledWith("r", "m", "priv", "pub", undefined);
  });

  it("decrypts incoming messages with global key", async () => {
    const messenger = useMessengerStore();
    await messenger.addIncomingMessage({
      id: "1",
      pubkey: "s",
      content: "c",
      created_at: 1,
    } as any);
    expect(decryptDm).toHaveBeenCalledWith("priv", "s", "c");
  });

  it("subscribes using global key on start", async () => {
    const messenger = useMessengerStore();
    await messenger.start();
    expect(subscribe).toHaveBeenCalled();
    const args = subscribe.mock.calls[0];
    expect(args[0]).toBe("priv");
    expect(args[1]).toBe("pub");
    expect(args[3]).toBe(0);
  });

  it("notifies when starting without privkey", async () => {
    const messenger = useMessengerStore();
    const nostr = useNostrStore();
    nostr.privateKeySignerPrivateKey = "";
    await messenger.start();
    expect(notifyErrorSpy).toHaveBeenCalled();
  });

  it("handles multi-line JSON messages", async () => {
    const messenger = useMessengerStore();
    (decryptDm as any).mockResolvedValue('{"a":1}\n{"b":2}');
    await messenger.addIncomingMessage({
      id: "1",
      pubkey: "s",
      content: "c",
      created_at: 1,
    } as any);
    expect(messenger.eventLog.length).toBe(1);
    expect(messenger.eventLog[0].content).toBe('{"a":1}\n{"b":2}');
  });
});
