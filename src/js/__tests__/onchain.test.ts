import { describe, expect, it } from "vitest";
import { onchainAddressExplorerUrl } from "src/js/onchain";

describe("onchainAddressExplorerUrl", () => {
  it("returns the mainnet Mempool address page", () => {
    expect(onchainAddressExplorerUrl("bc1qexampleaddress")).toBe(
      "https://mempool.space/address/bc1qexampleaddress"
    );
  });

  it("normalizes bitcoin URIs and selects the Mutinynet explorer", () => {
    expect(
      onchainAddressExplorerUrl("bitcoin:tb1qexampleaddress?amount=1")
    ).toBe("https://mutinynet.com/address/tb1qexampleaddress");
  });

  it("does not return an explorer URL for an unrecognized address", () => {
    expect(onchainAddressExplorerUrl("invalid-address")).toBeNull();
  });
});
