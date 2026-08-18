import { bech32 } from "bech32";
import { describe, expect, it } from "vitest";
import { lightningAddressToLnurl } from "src/js/lnurl";

function decodeLnurl(lnurl: string): string {
  const decoded = bech32.decode(lnurl, 2000);
  return new TextDecoder().decode(
    new Uint8Array(bech32.fromWords(decoded.words))
  );
}

describe("lightningAddressToLnurl", () => {
  it("encodes the Lightning Address well-known endpoint", () => {
    const lnurl = lightningAddressToLnurl("alice@npub.cash");

    expect(lnurl).toMatch(/^LNURL1/);
    expect(decodeLnurl(lnurl)).toBe(
      "https://npub.cash/.well-known/lnurlp/alice"
    );
  });

  it("encodes npub usernames without truncating them", () => {
    const username = "npub1example";
    const lnurl = lightningAddressToLnurl(`${username}@npub.cash`);

    expect(decodeLnurl(lnurl)).toBe(
      `https://npub.cash/.well-known/lnurlp/${username}`
    );
  });

  it.each(["", "alice", "@npub.cash", "alice@"])(
    "rejects an incomplete Lightning Address: %s",
    (address) => {
      expect(lightningAddressToLnurl(address)).toBe("");
    }
  );
});
