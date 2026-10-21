import { beforeAll, describe, expect, it, vi } from "vitest";
import { useUiStore } from "src/stores/ui";

let PayInvoiceDialog: any;

beforeAll(async () => {
  (globalThis as any).windowMixin = {};
  PayInvoiceDialog = (await import("../PayInvoiceDialog.vue")).default;
});

describe("PayInvoiceDialog", () => {
  it("queues a foreground payment before starting the melt", async () => {
    const uiStore = useUiStore();
    let rejectMelt!: (error: Error) => void;
    const meltInvoiceData = vi.fn(
      () =>
        new Promise((_, reject) => {
          rejectMelt = reject;
        })
    );
    const context = {
      payInvoiceData: { blocking: false },
      waitingForWallet: false,
      paymentInProgress: false,
      enoughtotalUnitBalance: true,
      hasMultinutSupport: false,
      multinutEnabled: false,
      openMultinutDialog: vi.fn(),
      meltInvoiceData,
      isPaying: true,
    };
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const payment = PayInvoiceDialog.methods.handleMeltButton.call(context);

    expect(meltInvoiceData).toHaveBeenCalledWith(true, "foreground");
    expect(context.waitingForWallet).toBe(true);
    expect(uiStore.foregroundPaymentRequests).toBe(1);

    rejectMelt(new Error("payment failed"));
    await payment;

    expect(context.waitingForWallet).toBe(false);
    expect(context.isPaying).toBe(false);
    expect(uiStore.foregroundPaymentRequests).toBe(0);

    consoleError.mockRestore();
  });

  it("exposes the on-chain destination address for the preview", () => {
    const onchainDestination = PayInvoiceDialog.computed.onchainDestination;
    const address = "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4";

    expect(
      onchainDestination.call({
        isOnchainPay: true,
        payInvoiceData: { invoice: { onchain: address } },
      })
    ).toBe(address);
    // Lightning/bolt12 previews keep their own destination rendering.
    expect(
      onchainDestination.call({
        isOnchainPay: false,
        payInvoiceData: { invoice: { onchain: address } },
      })
    ).toBe("");
    expect(
      onchainDestination.call({
        isOnchainPay: true,
        payInvoiceData: { invoice: null },
      })
    ).toBe("");
  });

  it("does not clamp an external on-chain amount to the wallet balance", () => {
    const maxAmount = PayInvoiceDialog.computed.amountlessPaymentInputMaxAmount;

    expect(
      maxAmount.call({
        isOnchainPay: true,
        payInvoiceData: { input: { externalAmount: true } },
        amountlessPaymentMaxAmountFromBalance: 0,
      })
    ).toBeNull();
    expect(
      maxAmount.call({
        isOnchainPay: true,
        payInvoiceData: { input: { externalAmount: false } },
        amountlessPaymentMaxAmountFromBalance: 50,
      })
    ).toBe(50);
  });
});
