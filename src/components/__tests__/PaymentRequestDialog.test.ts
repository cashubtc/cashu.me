import { beforeAll, describe, expect, it, vi } from "vitest";
import { PaymentRequest } from "@cashu/cashu-ts";

let PaymentRequestDialog: any;

beforeAll(async () => {
  (globalThis as any).windowMixin = {};
  PaymentRequestDialog = (
    await import("src/components/PaymentRequestDialog.vue")
  ).default;
});

describe("PaymentRequestDialog", () => {
  const request = new PaymentRequest(
    undefined,
    "pr1",
    21,
    "sat",
    ["https://mint.example"],
    "coffee",
    false,
    { kind: "P2PK", data: "02" + "11".repeat(32), tags: [] }
  );

  it("shows the terms of the displayed request", () => {
    const context: any = {
      amountLabelDefault: "Add amount",
      activeUnit: "sat",
    };
    PaymentRequestDialog.watch.shownRequest.handler.call(context, request);
    expect(context.paymentRequestAmount).toBe(21);
    expect(context.chosenMintUrl).toBe("https://mint.example");
    expect(context.memo).toBe("coffee");
    expect(context.locked).toBe(true);
  });

  it("only replaces the request when its description or lock changed", () => {
    const context: any = {
      shownRequest: request,
      memo: "coffee",
      locked: true,
      updatePaymentRequest: vi.fn(),
    };
    PaymentRequestDialog.methods.onDetailsChanged.call(context);
    expect(context.updatePaymentRequest).not.toHaveBeenCalled();
    context.locked = false;
    PaymentRequestDialog.methods.onDetailsChanged.call(context);
    expect(context.updatePaymentRequest).toHaveBeenCalledOnce();
  });
});
