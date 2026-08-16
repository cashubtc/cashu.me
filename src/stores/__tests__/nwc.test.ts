import { describe, expect, it, vi } from "vitest";
import { useNWCStore } from "src/stores/nwc";

describe("NWC payment concurrency", () => {
  it("rejects a concurrent payment without executing it", async () => {
    const store = useNWCStore();
    let resolveFirstPayment!: (result: any) => void;
    const firstPaymentPending = new Promise((resolve) => {
      resolveFirstPayment = resolve;
    });
    const handlePayInvoice = vi
      .spyOn(store, "handlePayInvoice")
      .mockReturnValue(firstPaymentPending);
    const replyNWC = vi.spyOn(store, "replyNWC").mockResolvedValue(undefined);
    const event = {} as any;
    const connection = {} as any;
    const command = JSON.stringify({
      method: "pay_invoice",
      params: { invoice: "lnbc1" },
    });

    const firstPayment = store.parseNWCCommand(command, event, connection);
    await store.parseNWCCommand(command, event, connection);

    expect(handlePayInvoice).toHaveBeenCalledOnce();
    expect(replyNWC).toHaveBeenCalledWith(
      expect.objectContaining({
        result_type: "pay_invoice",
        error: expect.objectContaining({
          message: "Already processing a payment.",
        }),
      }),
      event,
      connection
    );

    resolveFirstPayment({ result_type: "pay_invoice", result: {} });
    await firstPayment;

    expect(store.blocking).toBe(false);
    expect(replyNWC).toHaveBeenCalledTimes(2);
  });
});
