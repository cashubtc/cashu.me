import { beforeAll, describe, expect, it } from "vitest";

let CreateInvoiceDialog: any;

beforeAll(async () => {
  (globalThis as any).windowMixin = {};
  CreateInvoiceDialog = (await import("../CreateInvoiceDialog.vue")).default;
});

describe("CreateInvoiceDialog", () => {
  it("uses the amount-first flow when showing the Lightning address is disabled", () => {
    const showNpubCashPreview =
      CreateInvoiceDialog.computed.showNpubCashPreview;

    expect(
      showNpubCashPreview.call({
        showCreateInvoiceDialog: true,
        isOnchain: false,
        isBolt12: false,
        activeUnit: "sat",
        npubCashAddAmount: false,
        hasConfiguredNpubCashAddress: true,
        showAddressOnReceive: false,
        activeMintUrl: "https://mint.example",
        npubCashMintUrl: "https://mint.example",
      })
    ).toBe(false);
  });

  it("shows the Lightning address preview by default when it is enabled", () => {
    const showNpubCashPreview =
      CreateInvoiceDialog.computed.showNpubCashPreview;

    expect(
      showNpubCashPreview.call({
        showCreateInvoiceDialog: true,
        isOnchain: false,
        isBolt12: false,
        activeUnit: "sat",
        npubCashAddAmount: false,
        hasConfiguredNpubCashAddress: true,
        showAddressOnReceive: true,
        activeMintUrl: "https://mint.example",
        npubCashMintUrl: "https://mint.example",
      })
    ).toBe(true);
  });
});
