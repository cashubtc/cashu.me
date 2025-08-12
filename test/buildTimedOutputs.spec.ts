import { describe, it, expect, beforeEach } from "vitest";
import { CashuWallet } from "@cashu/cashu-ts";
import { buildTimedOutputs } from "stores/p2pk";

describe("buildTimedOutputs", () => {
  let wallet: CashuWallet;

  beforeEach(async () => {
    wallet = new CashuWallet("https://example-mint.test", "sat");
    // mock internal methods so test is pure
    wallet.split = async (amts, { buildSecret }) => {
      return {
        proofs: amts.map((a, idx) => ({
          id: "1",
          amount: a,
          secret: buildSecret(idx),
        })),
        tokenStrings: amts.map((a, idx) => `cashu_mock_${idx}_${a}`),
      } as any;
    };
  });

  it("creates N proofs, each with a locktime tag except index\u00a00", async () => {
    const { proofs } = await buildTimedOutputs(
      wallet,
      120,
      3,
      "0202…abcd", // sample SEC hex
      1_700_000_000,
      100,
    );
    expect(proofs).toHaveLength(3);
    proofs.forEach((p, idx) => {
      const secret = JSON.parse(p.secret);
      const tags = secret[1].tags || [];
      const lock = tags.find((t: any[]) => t[0] === "locktime");
      if (idx === 0) {
        expect(lock).toBeUndefined();
      } else {
        expect(lock).toBeDefined();
      }
      // no hash tag
      const hash = tags.find((t: any[]) => t[0] === "hash");
      expect(hash).toBeUndefined();
    });
  });
});
