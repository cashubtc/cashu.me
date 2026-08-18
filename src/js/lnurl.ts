import { bech32 } from "bech32";

export function lightningAddressToLnurl(address: string): string {
  const separator = address.lastIndexOf("@");
  if (separator <= 0 || separator === address.length - 1) {
    return "";
  }

  const username = address.slice(0, separator);
  const hostname = address.slice(separator + 1);
  const endpoint = `https://${hostname}/.well-known/lnurlp/${encodeURIComponent(
    username
  )}`;

  return bech32
    .encode("lnurl", bech32.toWords(new TextEncoder().encode(endpoint)), 2000)
    .toUpperCase();
}
