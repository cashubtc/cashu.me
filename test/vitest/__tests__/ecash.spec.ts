import { describe, it, expect } from "vitest";
import { ensureCompressed } from "../../../src/utils/ecash";
import { getPublicKey } from "@noble/secp256k1";

describe("ensureCompressed", () => {
  it("returns the same value for an already compressed key", () => {
    const priv = new Uint8Array(32).fill(1);
    const compressed = Buffer.from(getPublicKey(priv, true)).toString("hex");
    expect(ensureCompressed(compressed)).toBe(compressed);
  });

  it("compresses an uncompressed key", () => {
    const priv = new Uint8Array(32).fill(2);
    const compressed = Buffer.from(getPublicKey(priv, true)).toString("hex");
    const uncompressed = Buffer.from(getPublicKey(priv, false)).toString("hex");
    expect(ensureCompressed(uncompressed)).toBe(compressed);
  });

  it("throws on invalid input", () => {
    expect(() => ensureCompressed("")).toThrow();
  });
});
