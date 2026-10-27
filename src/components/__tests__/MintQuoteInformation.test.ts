import { beforeAll, describe, expect, it, vi } from "vitest";
import { PaymentMethod } from "src/stores/walletTypes";

vi.mock("src/stores/mints", () => ({
  useMintsStore: () => ({ activeMintUrl: "", activeUnit: "sat", mints: [] }),
}));

let MintQuoteInformation: any;

beforeAll(async () => {
  (globalThis as any).windowMixin = {};
  MintQuoteInformation = (await import("../MintQuoteInformation.vue")).default;
});

describe("MintQuoteInformation", () => {
  it("keeps linking the address to its explorer page once a transaction is known", () => {
    const addressExplorerUrl = MintQuoteInformation.computed.addressExplorerUrl;
    const context: any = {
      isOnchain: true,
      invoice: { request: "bc1qexampleaddress" },
      onchainMetadata: null,
    };

    expect(addressExplorerUrl.call(context)).toBe(
      "https://mempool.space/address/bc1qexampleaddress"
    );

    context.onchainMetadata = {
      url: "https://mempool.space/tx/transaction-id",
    };

    expect(addressExplorerUrl.call(context)).toBe(
      "https://mempool.space/address/bc1qexampleaddress"
    );
  });

  it("refreshes on-chain metadata when an incoming payment becomes paid", () => {
    const loadOnchainMetadata = vi.fn();

    MintQuoteInformation.watch["invoice.status"].call(
      { loadOnchainMetadata },
      "paid"
    );
    MintQuoteInformation.watch["invoice.status"].call(
      { loadOnchainMetadata },
      "pending"
    );

    expect(loadOnchainMetadata).toHaveBeenCalledTimes(1);
  });

  it("does not create an explorer URL for non-on-chain payments", () => {
    const addressExplorerUrl = MintQuoteInformation.computed.addressExplorerUrl;

    expect(
      addressExplorerUrl.call({
        isOnchain: false,
        method: PaymentMethod.Bolt11,
        invoice: { request: "lnbc1example" },
        onchainMetadata: null,
      })
    ).toBeNull();
  });
});
