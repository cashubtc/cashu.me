import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  PaymentRequest,
  type PaymentRequestTransportType,
} from "@cashu/cashu-ts";
import { usePRStore } from "src/stores/payment-request";
import { notifyError } from "src/js/notify";

vi.mock("src/js/notify", () => ({
  notifyError: vi.fn(),
  notifySuccess: vi.fn(),
  notifyWarning: vi.fn(),
}));

let SendPaymentRequest: any;

beforeAll(async () => {
  (globalThis as any).windowMixin = {};
  SendPaymentRequest = (await import("src/components/SendPaymentRequest.vue"))
    .default;
});

describe("SendPaymentRequest", () => {
  it("rejects unsupported requests reopened from history before preparing or delivering ecash", async () => {
    const request = new PaymentRequest([
      {
        type: "unknown" as PaymentRequestTransportType,
        target: "https://pay.example",
      },
    ]);
    const prStore = usePRStore();
    const context = {
      disable: false,
      isLoading: false,
      loading: false,
      sendData: { paymentRequest: request, tokensBase64: "cashuA" },
      getPaymentRequestTransport: prStore.getPaymentRequestTransport,
      prepareToken: vi.fn(),
      parseAndPayPaymentRequest: vi.fn(),
      $emit: vi.fn(),
    };
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    try {
      await SendPaymentRequest.methods.clickPaymentRequest.call(context);
      expect(notifyError).toHaveBeenCalledWith(
        "Unsupported payment request transport.",
        "Could not pay request"
      );
      expect(context.prepareToken).not.toHaveBeenCalled();
      expect(context.parseAndPayPaymentRequest).not.toHaveBeenCalled();
      expect(context.$emit).not.toHaveBeenCalled();
      expect(context.loading).toBe(false);
    } finally {
      consoleError.mockRestore();
    }
  });
});
