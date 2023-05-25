import { type Token, getDecodedToken } from "@cashu/cashu-ts";

export default { decode, getProofs, getMint };

/**
 * Decodes an encoded cashu token
 */
function decode(encoded_token: string) {
  if (!encoded_token || encoded_token === "") return;
  return getDecodedToken(encoded_token);
}

/**
 * Returns a list of proofs from a decoded token
 */
function getProofs(decoded_token: Token) {
  if (
    !(decoded_token.token.length > 0) ||
    !(decoded_token.token[0].proofs.length > 0)
  ) {
    throw new Error("Token format wrong");
  }
  return decoded_token.token.map((t) => t.proofs).flat();
}

function getMint(decoded_token: Token) {
  /*
      Returns first mint of a token (very rough way).
      */
  if (decoded_token.token != null && decoded_token.token.length > 0) {
    return decoded_token.token[0].mint;
  } else {
    return "";
  }
}
