import { expect, test } from "../fixtures/test";
import { MINT_A_URL, counterpartyRequest } from "../fixtures/mint";
import { WalletUi } from "../pages/WalletUi";

const ANDROID_UA =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36";

const bareAddress = (request: string) =>
  request.replace(/^bitcoin:/i, "").split("?")[0];

test.describe("Android Send clipboard shortcut", () => {
  test.use({ userAgent: ANDROID_UA });

  test.beforeEach(async ({ page }) => {
    // The Android install prompt would cover the Send button.
    await page.addInitScript(() =>
      localStorage.setItem("cashu.ui.showAndroidPWAPrompt", "seen")
    );
  });

  test("opens the on-chain send preview for a copied Bitcoin address", async ({
    page,
    request,
  }) => {
    const onchainRequest = await counterpartyRequest(request, "onchain");
    const wallet = new WalletUi(page);
    await wallet.onboard(MINT_A_URL);
    await wallet.mintBolt11(50);
    await page.evaluate(
      (value) => navigator.clipboard.writeText(value),
      onchainRequest
    );

    await page.getByTestId("wallet-send").click();

    // Straight into the existing on-chain flow: no chooser in between.
    await expect(page.getByTestId("onchain-destination")).toContainText(
      bareAddress(onchainRequest)
    );
    await expect(page.getByTestId("send-ecash-option")).toBeHidden();
    // The existing confirmation controls (Quote, then Pay) are still required.
    await expect(page.getByTestId("quote-payment-request")).toBeVisible();

    await wallet.closeFullscreenDialog();
    // Nothing was spent by merely reading the clipboard.
    expect(await wallet.balanceSats()).toBe(50);
  });

  test("falls back to the Send chooser for unsupported clipboard content", async ({
    page,
  }) => {
    const wallet = new WalletUi(page);
    await wallet.onboard(MINT_A_URL);
    await page.evaluate(() =>
      navigator.clipboard.writeText("just some copied notes")
    );

    await page.getByTestId("wallet-send").click();

    await expect(page.getByTestId("send-ecash-option")).toBeVisible();
    await expect(page.getByTestId("onchain-destination")).toHaveCount(0);
  });
});

test("desktop keeps the explicit Send chooser even with an address copied", async ({
  page,
  request,
}) => {
  const onchainRequest = await counterpartyRequest(request, "onchain");
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await page.evaluate(
    (value) => navigator.clipboard.writeText(value),
    onchainRequest
  );

  await page.getByTestId("wallet-send").click();

  await expect(page.getByTestId("send-ecash-option")).toBeVisible();
  await expect(page.getByTestId("onchain-destination")).toHaveCount(0);
});
