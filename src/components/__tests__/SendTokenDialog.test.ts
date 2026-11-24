import { beforeAll, describe, expect, it, vi } from "vitest";
import { JSONInt, PaymentRequest } from "@cashu/cashu-ts";
import { useUiStore } from "src/stores/ui";

vi.mock("components/DisplayTokenComponent.vue", () => ({
  default: {},
}));

let SendTokenDialog: any;

// A stored mint whose /v1/info offers the given melt methods (NUT-05)
const storedMint = (url: string, melt: { method: string; unit: string }[]) => ({
  url,
  info: {
    nuts: {
      4: { methods: [], disabled: false },
      5: { methods: melt, disabled: false },
    },
  },
});

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
        addPendingToken: vi.fn(async () => "history-id"),
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

  it("prepares a payment request token for the request it was given", async () => {
    const requestA = {
      id: "request-a",
      amount: 21,
      unit: "sat",
      transport: [],
    };
    const requestB = {
      id: "request-b",
      amount: 50,
      unit: "sat",
      transport: [],
    };
    const context = {
      sendData: { paymentRequest: requestB, amount: 21, tokensBase64: "" },
      activeUnitCurrencyMultiplyer: 1,
      activeMintUrl: "https://mint.example",
      activeUnit: "sat",
      activeProofs: [],
      mintWallet: vi.fn(async () => ({})),
      sendToRequest: vi.fn(async () => ({ sendProofs: [{ amount: 21 }] })),
      serializeProofs: vi.fn(() => "cashuA"),
      addPendingToken: vi.fn(async () => "history-id"),
      g: { offline: true },
    };

    await SendTokenDialog.methods.preparePaymentRequestTokens.call(
      context,
      requestA
    );

    const [, , sdkRequest] = context.sendToRequest.mock.calls[0] as any[];
    expect(sdkRequest.id).toBe("request-a");
    expect(context.addPendingToken).toHaveBeenCalledWith(
      expect.objectContaining({ paymentRequest: requestA })
    );
  });

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

  it.each([
    { activeMintUrl: "https://other.example", methods: ["bolt11"], fee: 2 },
    { activeMintUrl: "https://mint.example", methods: ["bolt11"], fee: 0 },
    { activeMintUrl: "https://other.example", methods: undefined, fee: 0 },
  ])(
    "prices the request's method fee from $activeMintUrl: $fee",
    ({ activeMintUrl, methods, fee }) => {
      const request = new PaymentRequest(
        undefined,
        "pr1",
        21,
        "sat",
        ["https://mint.example"],
        undefined,
        false,
        undefined,
        true,
        methods?.map((method) => ({ method, fee: 2 }))
      );
      const context = {
        sendData: {
          paymentRequest: JSONInt.parse(JSONInt.stringify(request)!),
        },
        activeMintUrl,
        activeMintMeltMethods:
          SendTokenDialog.computed.activeMintMeltMethods.call({
            mints: [
              storedMint(activeMintUrl, [{ method: "bolt11", unit: "sat" }]),
            ],
            activeMintUrl,
            activeUnit: "sat",
          }),
      };
      expect(
        SendTokenDialog.computed.paymentRequestMethodFee.call(context)
      ).toBe(fee);
    }
  );

  it.each([
    { name: "matching unit and method", unit: "sat", sm: ["bolt11"], key: "" },
    {
      name: "another unit",
      unit: "usd",
      sm: undefined,
      key: "SendTokenDialog.errors.unit_not_matching_request",
    },
    {
      name: "a method the mint lacks",
      unit: "sat",
      sm: ["bolt12"],
      key: "SendTokenDialog.errors.mint_lacks_request_methods",
    },
    { name: "no method list", unit: "sat", sm: undefined, key: "" },
  ])("blocks Pay for a request with $name: '$key'", ({ unit, sm, key }) => {
    const request = new PaymentRequest(
      undefined,
      "pr1",
      21,
      unit,
      undefined,
      undefined,
      false,
      undefined,
      undefined,
      sm?.map((method) => ({ method }))
    );
    const activeMintUrl = "https://mint.example";
    const context = {
      sendData: {
        paymentRequest: JSONInt.parse(JSONInt.stringify(request)!),
        amount: 21,
      },
      insufficientFunds: false,
      globalMutexLock: false,
      selectedMintViolatesRequest: false,
      activeUnit: "sat",
      // the mint melts bolt12 too, but only in usd
      activeMintMeltMethods:
        SendTokenDialog.computed.activeMintMeltMethods.call({
          mints: [
            storedMint(activeMintUrl, [
              { method: "bolt11", unit: "sat" },
              { method: "bolt12", unit: "usd" },
            ]),
          ],
          activeMintUrl,
          activeUnit: "sat",
        }),
      $t: (k: string) => k,
    };
    const warning =
      SendTokenDialog.computed.paymentRequestMintWarning.call(context);
    expect(warning).toBe(key);
    expect(
      SendTokenDialog.computed.paymentRequestButtonDisabled.call({
        ...context,
        paymentRequestMintWarning: warning,
      })
    ).toBe(!!key);
  });

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
      addPendingToken: vi.fn(async () => "history-id"),
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

  it("still shows a sent token when saving it to history fails", async () => {
    let historyTokenWhenShown: unknown = "not shown";
    const sendData: any = { amount: 21, p2pkPubkey: "" };
    Object.defineProperty(sendData, "tokens", {
      get: () => sendData._tokens,
      set: (value) => {
        historyTokenWhenShown = sendData.historyToken;
        sendData._tokens = value;
      },
    });
    const sendProofs = [{ amount: 21 }];
    const context = {
      sendingEcash: false,
      // the dialog was closed while the history write was pending
      showSendTokens: false,
      sendData,
      maybeConvertNpub: vi.fn(() => ""),
      isValidPubkey: vi.fn(() => false),
      activeUnitCurrencyMultiplyer: 1,
      activeMintUrl: "https://mint.example",
      activeUnit: "sat",
      activeProofs: [],
      includeFeesInSendAmount: false,
      mintWallet: vi.fn(async () => ({ id: "wallet" })),
      send: vi.fn(async () => ({ sendProofs })),
      serializeProofs: vi.fn(() => "cashuSent"),
      addPendingToken: vi.fn(async () => {
        throw new Error("history write failed");
      }),
      onTokenPaid: vi.fn(),
      $t: (key: string) => key,
      g: { offline: false },
    };

    await SendTokenDialog.methods.sendTokens.call(context);

    expect(sendData.tokens).toBe(sendProofs);
    expect(sendData.tokensBase64).toBe("cashuSent");
    expect(historyTokenWhenShown).toEqual(
      expect.objectContaining({ amount: -21, token: "cashuSent" })
    );
    expect(context.onTokenPaid).toHaveBeenCalledWith(sendData.historyToken);
    // History has no copy of the token, so the dialog is shown again.
    expect(context.showSendTokens).toBe(true);
  });

  function sentTokenContext(
    sendData: any,
    showSendTokens: boolean,
    addPendingToken: () => Promise<string>
  ) {
    return {
      sendingEcash: false,
      showSendTokens,
      sendData,
      maybeConvertNpub: vi.fn(() => ""),
      isValidPubkey: vi.fn(() => false),
      activeUnitCurrencyMultiplyer: 1,
      activeMintUrl: "https://mint.example",
      activeUnit: "sat",
      activeProofs: [],
      includeFeesInSendAmount: false,
      mintWallet: vi.fn(async () => ({ id: "wallet" })),
      send: vi.fn(async () => ({ sendProofs: [{ amount: 21 }] })),
      serializeProofs: vi.fn(() => "cashuSent"),
      addPendingToken: vi.fn(addPendingToken),
      onTokenPaid: vi.fn(),
      $t: (key: string) => key,
      g: { offline: false },
    };
  }

  it("shows the whole sent token once it is saved to history", async () => {
    const sendData: any = { amount: 21, p2pkPubkey: "", tokensBase64: "" };
    const context = sentTokenContext(sendData, true, async () => "history-id");

    await SendTokenDialog.methods.sendTokens.call(context);

    expect(sendData.tokens).toEqual([{ amount: 21 }]);
    expect(sendData.tokensBase64).toBe("cashuSent");
    expect(sendData.historyToken).toEqual(
      expect.objectContaining({ id: "history-id", token: "cashuSent" })
    );
    expect(context.onTokenPaid).toHaveBeenCalledWith(sendData.historyToken);
  });

  it("leaves the view alone if the user moved on during a successful history write", async () => {
    // closed the dialog
    const closedData: any = { amount: 21, p2pkPubkey: "", tokensBase64: "" };
    const closed = sentTokenContext(closedData, true, async () => {
      closed.showSendTokens = false;
      return "history-id";
    });
    await SendTokenDialog.methods.sendTokens.call(closed);
    expect(closed.showSendTokens).toBe(false);
    expect(closedData.tokens).toBeUndefined();
    expect(closedData.tokensBase64).toBe("");
    // the token is in history, so it is still checked
    expect(closed.onTokenPaid).toHaveBeenCalledWith(
      expect.objectContaining({ id: "history-id", token: "cashuSent" })
    );

    // opened another token from history
    const otherData: any = { amount: 21, p2pkPubkey: "", tokensBase64: "" };
    const other = sentTokenContext(otherData, true, async () => {
      otherData.tokensBase64 = "cashuOther";
      return "history-id";
    });
    await SendTokenDialog.methods.sendTokens.call(other);
    expect(otherData.tokensBase64).toBe("cashuOther");
    expect(otherData.tokens).toBeUndefined();
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
