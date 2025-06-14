import { ensureCompressed } from "../src/utils/ecash";
import { describe, it, expect } from "vitest";

describe("ensureCompressed", () => {
  it("converts 64-hex to 66-hex", () => {
    const raw = "1".repeat(64);
    const out = ensureCompressed(raw);
    expect(out.length).toBe(66);
    expect(out.startsWith("02") || out.startsWith("03")).toBe(true);
  });
});
