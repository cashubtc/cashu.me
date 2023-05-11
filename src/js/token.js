import { getDecodedToken } from "@cashu/cashu-ts";
/**
 * Functions related to cashu tokens
 * @typedef {{C: string, amount: number, id: number, secret: number}} Proof
 * @typedef {{proofs: Proof[], mint: string}} Token
 */

export default { decode, getProofs, getMint };

/**
 * Decodes an encoded cashu token
 * @param {string} encoded_token
 * @returns {{token: Token[]}}
 */
function decode(encoded_token) {
  if (!encoded_token || encoded_token === "") return "";
  return getDecodedToken(encoded_token);
}

/**
 * Returns a list of proofs from a decoded token
 * @param {{token: Token[]}} decoded_token
 * @returns {Proof[]}
 */
function getProofs(decoded_token) {
  if (
    !(decoded_token.token.length > 0) ||
    !(decoded_token.token[0].proofs.length > 0)
  ) {
    throw new Error("Token format wrong");
  }
  return decoded_token.token.map((t) => t.proofs).flat();
}

/**
 * @param {{token: Token[]}} decoded_token
 * @returns {string}
 */
function getMint(decoded_token) {
  /*
      Returns first mint of a token (very rough way).
      */
  if (decoded_token.token != null && decoded_token.token.length > 0) {
    return decoded_token.token[0].mint;
  } else {
    return "";
  }
}
