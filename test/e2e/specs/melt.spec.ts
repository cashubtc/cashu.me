import { expect, test } from "@playwright/test";
import { counterpartyRequest, MINT_A_URL } from "../fixtures/mint";
import { WalletPage } from "../pages/WalletPage";

test("melts to BOLT11, BOLT12, and on-chain payment requests", async ({
  page,
  request,
}) => {
  const wallet = new WalletPage(page);
  await wallet.onboard(MINT_A_URL);
  await wallet.mintBolt11(1_000);

  const bolt11 = await counterpartyRequest(request, "bolt11", 31);
  const beforeBolt11 = await wallet.balanceSats();
  await wallet.openSend("lightning");
  await wallet.payRequest(bolt11);
  await expect.poll(() => wallet.balanceSats()).toBeLessThan(beforeBolt11);

  const bolt12 = await counterpartyRequest(request, "bolt12");
  const beforeBolt12 = await wallet.balanceSats();
  await wallet.openSend("lightning");
  await wallet.payRequest(bolt12, 32);
  await expect.poll(() => wallet.balanceSats()).toBeLessThan(beforeBolt12);

  const address = await counterpartyRequest(request, "onchain");
  const beforeOnchain = await wallet.balanceSats();
  await wallet.openSend("onchain");
  await wallet.payRequest(address, 33);
  await expect.poll(() => wallet.balanceSats()).toBeLessThan(beforeOnchain);
});
