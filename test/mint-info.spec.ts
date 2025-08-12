import { describe, it, expect, vi } from "vitest";
import { verifyMint } from "../src/boot/mint-info";

describe("verifyMint", () => {
  it("returns true when nuts supported", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: async () => ({
          nuts: {
            "10": { supported: true },
            "11": { supported: true },
            "14": { supported: true },
          },
        }),
      })) as any
    );
    expect(await verifyMint("https://mint")).toBe(true);
  });

  it("returns false on network error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("fail");
      }) as any
    );
    expect(await verifyMint("https://mint")).toBe(false);
  });
});
