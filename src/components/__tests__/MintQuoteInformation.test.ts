import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { PaymentMethod } from "src/stores/walletTypes";

vi.mock("src/stores/mints", () => ({
  useMintsStore: () => ({ activeMintUrl: "", activeUnit: "sat", mints: [] }),
}));

let MintQuoteInformation: any;

beforeAll(async () => {
  (globalThis as any).windowMixin = {};
  MintQuoteInformation = (await import("../MintQuoteInformation.vue")).default;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("MintQuoteInformation", () => {
  it("shows a pending chain status when the tip height is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            {
              txid: "example-tx",
              status: { confirmed: true, block_height: 100 },
              vout: [{ scriptpubkey_address: "bc1qexample", value: 1000 }],
            },
          ],
        })
        .mockResolvedValueOnce({ ok: false })
    );
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const context: any = {
      isOnchain: true,
      invoice: { request: "bc1qexample" },
      mintConfirmations: () => 3,
      loadingOnchainMetadata: false,
      onchainMetadata: null,
    };
    await MintQuoteInformation.methods.loadOnchainMetadata.call(context);

    expect(context.loadingOnchainMetadata).toBe(false);
    expect(context.onchainMetadata).toMatchObject({
      confirmed: false,
      confirmations: 1,
      confirmationThreshold: 3,
    });
    expect(
      MintQuoteInformation.computed.onchainStatusDisplay.call(context)
    ).toBe("Pending (1/3)");
  });

  it("uses the address explorer page until a transaction is available", () => {
    const onchainExplorerUrl = MintQuoteInformation.computed.onchainExplorerUrl;
    const context: any = {
      isOnchain: true,
      invoice: { request: "bc1qexampleaddress" },
      onchainMetadata: null,
    };

    expect(onchainExplorerUrl.call(context)).toBe(
      "https://mempool.space/address/bc1qexampleaddress"
    );

    context.onchainMetadata = {
      url: "https://mempool.space/tx/transaction-id",
    };

    expect(onchainExplorerUrl.call(context)).toBe(
      "https://mempool.space/tx/transaction-id"
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
    const onchainExplorerUrl = MintQuoteInformation.computed.onchainExplorerUrl;

    expect(
      onchainExplorerUrl.call({
        isOnchain: false,
        method: PaymentMethod.Bolt11,
        invoice: { request: "lnbc1example" },
        onchainMetadata: null,
      })
    ).toBeNull();
  });
});
