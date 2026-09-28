import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { copyToClipboard } from "quasar";

vi.mock("quasar", async (importOriginal) => ({
  ...(await importOriginal<typeof import("quasar")>()),
  copyToClipboard: vi.fn().mockResolvedValue(undefined),
}));

let InvoiceDetailDialog: any;

beforeAll(async () => {
  (globalThis as any).windowMixin = {};
  InvoiceDetailDialog = (await import("src/components/InvoiceDetailDialog.vue"))
    .default;
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("InvoiceDetailDialog payment display", () => {
  it("uses a bare on-chain address for the QR and clipboard", async () => {
    vi.useFakeTimers();
    const context: any = {
      isOnchain: true,
      invoiceData: {
        request: "bc1qaddress",
        amount: 1200,
        unit: "sat",
        status: "paid",
      },
    };
    expect(InvoiceDetailDialog.computed.qrLink.call(context)).toBeUndefined();
    expect(InvoiceDetailDialog.computed.qrValue.call(context)).toBe(
      "bc1qaddress"
    );
    await InvoiceDetailDialog.methods.onCopyBolt11.call(context);
    expect(copyToClipboard).toHaveBeenCalledWith("bc1qaddress");
  });

  it("renders a BIP321 QR for an on-chain quote with an amount but copies only the address", async () => {
    vi.useFakeTimers();
    const context: any = {
      isOnchain: true,
      invoiceData: {
        request: "bc1qaddress",
        requestedAmount: 25000,
        amount: 0,
        unit: "sat",
        status: "pending",
      },
    };
    expect(InvoiceDetailDialog.computed.qrValue.call(context)).toBe(
      "bitcoin:bc1qaddress?amount=0.00025"
    );
    await InvoiceDetailDialog.methods.onCopyBolt11.call(context);
    expect(copyToClipboard).toHaveBeenCalledWith("bc1qaddress");
  });

  it("displays amountless on-chain quotes", () => {
    expect(
      InvoiceDetailDialog.computed.qrValue.call({
        isOnchain: true,
        invoiceData: { request: "bc1qaddress", amount: 0, unit: "sat" },
      })
    ).toBe("bc1qaddress");
  });

  it("keeps Lightning QR and clipboard behavior", async () => {
    vi.useFakeTimers();
    const context = {
      isOnchain: false,
      invoiceData: { request: "lnbc1invoice" },
    };
    expect(InvoiceDetailDialog.computed.qrValue.call(context)).toBe(
      "lightning:LNBC1INVOICE"
    );
    await InvoiceDetailDialog.methods.onCopyBolt11.call(context);
    expect(copyToClipboard).toHaveBeenCalledWith("lnbc1invoice");
  });
});
