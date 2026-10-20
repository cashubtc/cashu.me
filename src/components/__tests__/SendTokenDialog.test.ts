import { beforeAll, describe, expect, it, vi } from "vitest";
import { JSONInt, PaymentRequest } from "@cashu/cashu-ts";
import { useUiStore } from "src/stores/ui";

vi.mock("components/DisplayTokenComponent.vue", () => ({
  default: {},
}));

let SendTokenDialog: any;

beforeAll(async () => {
  (globalThis as any).windowMixin = {};
  SendTokenDialog = (await import("../SendTokenDialog.vue")).default;
});

describe("SendTokenDialog", () => {
  it.each([
    { nut10: undefined, expected: undefined },
    {
      nut10: {
        kind: "P2PK",
        data: "pubkey",
        tags: [["locktime", "1750000000"]],
      },
      expected: { pubkey: "pubkey", locktime: 1750000000 },
    },
    {
      nut10: { kind: "HTLC", data: "hash", tags: [["pubkeys", "pubkey"]] },
      expected: { hashlock: "hash", pubkey: ["pubkey"] },
    },
  ])(
    "prepares the requested spending condition from plain history data: $nut10",
    async ({ nut10, expected }) => {
      const request = new PaymentRequest();
      request.nut10 = nut10;
      const context = {
        sendData: {
          paymentRequest: JSONInt.parse(JSONInt.stringify(request)!),
          amount: 21,
          tokensBase64: "",
        },
        activeUnitCurrencyMultiplyer: 1,
        activeMintUrl: "https://mint.example",
        activeUnit: "sat",
        activeProofs: [],
        mintWallet: vi.fn(async () => ({})),
        send: vi.fn(async () => ({ sendProofs: [] })),
        sendToLock: vi.fn(async () => ({ sendProofs: [] })),
        serializeProofs: vi.fn(() => "cashuA"),
        addPendingToken: vi.fn(() => "history-id"),
        g: { offline: true },
      };
      await expect(
        SendTokenDialog.methods.preparePaymentRequestTokens.call(context)
      ).resolves.toBe("cashuA");
      if (expected) {
        expect(context.sendToLock).toHaveBeenCalledWith(
          [],
          {},
          21,
          expect.objectContaining(expected)
        );
        expect(context.send).not.toHaveBeenCalled();
      } else {
        expect(context.send).toHaveBeenCalledOnce();
        expect(context.sendToLock).not.toHaveBeenCalled();
      }
    }
  );

  it("queues an ecash send as foreground work after the user taps Send", async () => {
    const uiStore = useUiStore();
    let rejectSend!: (error: Error) => void;
    const send = vi.fn(
      () =>
        new Promise((_, reject) => {
          rejectSend = reject;
        })
    );
    const context = {
      sendingEcash: false,
      sendData: { amount: 21, p2pkPubkey: "" },
      maybeConvertNpub: vi.fn(() => ""),
      isValidPubkey: vi.fn(() => false),
      activeUnitCurrencyMultiplyer: 1,
      activeMintUrl: "https://mint.example",
      activeUnit: "sat",
      activeProofs: [],
      includeFeesInSendAmount: false,
      mintWallet: vi.fn(async () => ({ id: "wallet" })),
      send,
      serializeProofs: vi.fn(),
      addPendingToken: vi.fn(),
      g: { offline: true },
    };
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const sending = SendTokenDialog.methods.sendTokens.call(context);

    await vi.waitFor(() => {
      expect(send).toHaveBeenCalledWith(
        [],
        { id: "wallet" },
        21,
        true,
        false,
        "foreground"
      );
    });
    expect(context.sendingEcash).toBe(true);
    expect(uiStore.foregroundPaymentRequests).toBe(1);

    rejectSend(new Error("send failed"));
    await sending;

    expect(context.sendingEcash).toBe(false);
    expect(uiStore.foregroundPaymentRequests).toBe(0);

    consoleError.mockRestore();
  });

  it("uses foreground priority for a locked ecash send", async () => {
    const uiStore = useUiStore();
    let finishLock!: () => void;
    const lockTokens = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishLock = resolve;
        })
    );
    const context = {
      sendingEcash: false,
      sendData: { amount: 21, p2pkPubkey: "pubkey" },
      maybeConvertNpub: vi.fn(() => "pubkey"),
      isValidPubkey: vi.fn(() => true),
      lockTokens,
    };

    const sending = SendTokenDialog.methods.sendTokens.call(context);

    expect(lockTokens).toHaveBeenCalledWith("foreground");
    expect(context.sendingEcash).toBe(true);
    expect(uiStore.foregroundPaymentRequests).toBe(1);

    finishLock();
    await sending;

    expect(context.sendingEcash).toBe(false);
    expect(uiStore.foregroundPaymentRequests).toBe(0);
  });
});
