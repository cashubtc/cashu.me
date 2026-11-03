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
    { requestAmount: 21, expectedAmount: undefined },
    { requestAmount: undefined, expectedAmount: 21 },
  ])(
    "pays a request rebuilt from plain history data: amount $requestAmount",
    async ({ requestAmount, expectedAmount }) => {
      const request = new PaymentRequest(
        undefined,
        "pr1",
        requestAmount,
        "sat",
        ["https://mint.example"],
        undefined,
        false,
        { kind: "P2PK", data: "pubkey", tags: [] },
        true
      );
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
        // 21 requested plus 1 to cover the payee's input fee
        sendToRequest: vi.fn(async () => ({
          sendProofs: [{ amount: 16 }, { amount: 4 }, { amount: 2 }],
        })),
        serializeProofs: vi.fn(() => "cashuA"),
        addPendingToken: vi.fn(() => "history-id"),
        g: { offline: true },
      };
      await expect(
        SendTokenDialog.methods.preparePaymentRequestTokens.call(context)
      ).resolves.toBe("cashuA");
      const [, , sdkRequest, amount] = context.sendToRequest.mock
        .calls[0] as any[];
      expect(sdkRequest).toBeInstanceOf(PaymentRequest);
      expect(sdkRequest.nut10).toEqual(request.nut10);
      expect(sdkRequest.isMintListStrict).toBe(false);
      expect(amount).toBe(expectedAmount);
      expect(context.addPendingToken).toHaveBeenCalledWith(
        expect.objectContaining({ amount: -21, fee: 1 })
      );
    }
  );

  it.each([
    {
      mintsPreferred: undefined,
      activeMintUrl: "https://other.example",
      blocked: true,
    },
    {
      mintsPreferred: undefined,
      activeMintUrl: "https://mint.example/",
      blocked: false,
    },
    {
      mintsPreferred: true,
      activeMintUrl: "https://other.example",
      blocked: false,
    },
  ])(
    "blocks an unlisted mint only for a strict list: mp=$mintsPreferred, $activeMintUrl",
    ({ mintsPreferred, activeMintUrl, blocked }) => {
      const request = new PaymentRequest(
        undefined,
        "pr1",
        21,
        "sat",
        ["https://mint.example"],
        undefined,
        false,
        undefined,
        mintsPreferred
      );
      const context = {
        sendData: {
          paymentRequest: JSONInt.parse(JSONInt.stringify(request)!),
        },
        activeMintUrl,
      };
      expect(
        SendTokenDialog.computed.selectedMintViolatesRequest.call(context)
      ).toBe(blocked);
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
