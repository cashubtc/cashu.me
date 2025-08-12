import { describe, it, expect, vi } from "vitest";
import cashuBoot from "../../../src/boot/cashu";

var verifyMintMock: any;
var initKeysMock: any;

vi.mock("../../../src/boot/mint-info", () => {
  verifyMintMock = vi.fn();
  return { verifyMint: verifyMintMock };
});
vi.mock("../../../src/stores/wallet", () => {
  initKeysMock = vi.fn();
  return { useWalletStore: () => ({ wallet: { initKeys: initKeysMock } }) };
});
vi.mock("../../../src/stores/mints", () => ({
  useMintsStore: () => ({ activeMintUrl: "" }),
}));
vi.mock("quasar", () => ({ Notify: { create: vi.fn() } }));

describe("cashu boot", () => {
  it("succeeds without active mint", async () => {
    await expect(cashuBoot()).resolves.toBeUndefined();
    expect(verifyMintMock).not.toHaveBeenCalled();
    expect(initKeysMock).toHaveBeenCalled();
  });
});
