import { beforeAll, describe, expect, it, vi } from "vitest";
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
