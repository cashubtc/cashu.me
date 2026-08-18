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
});
