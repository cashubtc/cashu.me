/**
 * Functions related to cashu tokens
 * @typedef {{C: string, amount: number, id: number, secret: number}} Proof
 * @typedef {{proofs: Proof[], mint: string}} Token
 */

export default { decode, getProofs, getMint };

/**
 * Decodes an encoded cashu token
 * @param {string} encoded_token
 * @returns {Token}
 */
function decode(encoded_token) {
  if (!encoded_token || encoded_token === "") return "";
  try {
    encoded_token = cropPrefixes(encoded_token);
    if (isV2Token(encoded_token)) return parseV2Token(encoded_token);
    if (isV3Token(encoded_token)) return parseV3Token(encoded_token);

    throw new Error("Unknown token format");
  } catch (error) {
    return "";
  }
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

/**
 * @param {string} token
 * @returns {boolean}
 */
function isV2Token(token) {
  return token.startsWith("eyJwcm9");
}

/**
 *
 * @param {string} token
 * @returns {boolean}
 */
function isV3Token(token) {
  return token.startsWith("cashuA");
}

/**
 * @param {string} encoded_token
 * @returns {{token: Token[]}}
 */
function parseV3Token(encoded_token) {
  let prefix = "cashuA";
  let token_parsed = encoded_token.slice(prefix.length);
  let tokenJson = getTokenJSON(token_parsed);
  if (
    !(tokenJson.token.length > 0) ||
    !(tokenJson.token[0].proofs.length > 0)
  ) {
    throw new Error("No proofs in encoded token");
  }
  return tokenJson;
}

/**
 * @param {string} encoded_token
 * @returns {{token: Token[]}}
 */
function parseV2Token(encoded_token) {
  let tokenV2 = getTokenJSON(encoded_token);
  let newToken = {
    token: [
      {
        proofs: tokenV2.proofs,
        mint: tokenV2.mints[0].url,
      },
    ],
  };
  return newToken;
}

/**
 * @param {string} token
 * @returns {{token: Token[]}}
 */
function getTokenJSON(token) {
  return JSON.parse(atob(token));
}

/**
 *
 * @param {string} token
 * @returns {string}
 */
function cropPrefixes(token) {
  let uriPrefixes = ["web+cashu://", "cashu://", "cashu:"];
  uriPrefixes.forEach((prefix) => {
    if (token.startsWith(prefix)) {
      token = token.slice(prefix.length);
    }
  });
  return token;
}
