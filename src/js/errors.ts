import { isMintOperationError } from "@cashu/cashu-ts";

// NUT-00 mint error codes:
// https://github.com/cashubtc/nuts/blob/main/error_codes.md
export const TOKEN_ALREADY_SPENT_CODE = 11001;

// Legacy mints without NUT-00 error codes reject the request with a plain
// 400 whose detail mentions the spent proofs (Nutshell: "Token already
// spent." / "proofs already spent").
const ALREADY_SPENT_MESSAGE = /already spent/i;

/**
 * True when the mint rejected the operation because at least one input
 * proof has already been spent. This happens when the wallet missed the
 * response of a previous spend (eg. the page was reloaded mid-swap) and
 * still counts those proofs as balance.
 */
export function isTokenAlreadySpentError(error: unknown): boolean {
  if (isMintOperationError(error)) {
    return error.code === TOKEN_ALREADY_SPENT_CODE;
  }
  const message = (error as { message?: unknown } | null | undefined)?.message;
  return typeof message === "string" && ALREADY_SPENT_MESSAGE.test(message);
}
