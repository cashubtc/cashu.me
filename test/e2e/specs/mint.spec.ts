import { expect, test } from "@playwright/test";
import { MINT_A_URL } from "../fixtures/mint";
import { WalletPage } from "../pages/WalletPage";

test("mints through BOLT11, BOLT12, and on-chain and persists the proofs", async ({
  page,
}) => {
  const wallet = new WalletPage(page);
  await wallet.onboard(MINT_A_URL);

  await wallet.mintBolt11(101);
  await wallet.mintBolt12(102);
  await wallet.mintOnchain();
  await expect.poll(() => wallet.balanceSats()).toBe(1_203);

  await page.reload();
  await expect(page.getByTestId("wallet-send")).toBeVisible();
  await expect.poll(() => wallet.balanceSats()).toBe(1_203);
});
