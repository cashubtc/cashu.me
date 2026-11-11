import { describe, expect, it } from "vitest";
import { MintOperationError } from "@cashu/cashu-ts";
import { isTokenAlreadySpentError } from "src/js/errors";

describe("isTokenAlreadySpentError", () => {
  it("accepts a mint operation error with code 11001", () => {
    const error = new MintOperationError(11001, "Token already spent.");
    expect(isTokenAlreadySpentError(error)).toBe(true);
  });

  it("rejects other mint operation error codes", () => {
    const error = new MintOperationError(11002, "Some other error");
    expect(isTokenAlreadySpentError(error)).toBe(false);
  });

  it("accepts plain errors from legacy mints that mention spent proofs", () => {
    expect(isTokenAlreadySpentError(new Error("Token already spent."))).toBe(
      true
    );
    expect(isTokenAlreadySpentError(new Error("proofs already spent"))).toBe(
      true
    );
  });

  it("rejects plain errors without a spent-proof message", () => {
    expect(isTokenAlreadySpentError(new Error("connection refused"))).toBe(
      false
    );
    expect(isTokenAlreadySpentError(null)).toBe(false);
    expect(isTokenAlreadySpentError(undefined)).toBe(false);
    expect(isTokenAlreadySpentError({ message: 42 })).toBe(false);
  });
});
