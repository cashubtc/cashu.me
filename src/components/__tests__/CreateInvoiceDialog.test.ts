import { beforeAll, describe, expect, it, vi } from "vitest";
import { PaymentMethod } from "src/stores/walletTypes";

const stores = vi.hoisted(() => ({
  wallet: { invoiceHistory: [] as any[] },
  mints: {
    activeMintUrl: "https://mint.example",
    activeUnit: "sat",
    mints: [] as any[],
  },
}));

vi.mock("src/stores/wallet", () => ({
  useWalletStore: () => stores.wallet,
}));

vi.mock("src/stores/mints", () => ({
  useMintsStore: () => stores.mints,
}));

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

  it("does not reuse an on-chain address after it has been paid", () => {
    stores.wallet.invoiceHistory = [
      {
        amount: 100,
        date: "2026-08-18T00:00:00.000Z",
        mint: "https://mint.example",
        request: "bc1qalreadyusedaddress",
        status: "paid",
        type: PaymentMethod.Onchain,
        unit: "sat",
      },
    ] as any;

    const reusableQuotes =
      CreateInvoiceDialog.methods.findReusableOnchainQuotes.call({});

    expect(reusableQuotes).toEqual([]);
  });
});
