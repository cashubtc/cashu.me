import { expect, test } from "../fixtures/test";
import { MINT_A_URL, MINT_C_URL, counterpartyRequest } from "../fixtures/mint";
import { WalletUi } from "../pages/WalletUi";
import { installCamera } from "../fixtures/camera";

test("decodes a camera QR frame into a payable invoice", async ({
  page,
  request,
}) => {
  const invoice = await counterpartyRequest(request, "bolt11", 11);
  await installCamera(page, invoice);
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  // The scanner currently requests its WASM from a CDN (UI-007). Serve the
  // installed dependency locally so this test still exercises actual decoding.
  await page.route(
    "https://fastly.jsdelivr.net/**/zxing_reader.wasm",
    (route) =>
      route.fulfill({
        path: require.resolve("zxing-wasm/reader/zxing_reader.wasm"),
        contentType: "application/wasm",
      })
  );
  await wallet.mintBolt11(50);
  await wallet.openSend("lightning");
  await page
    .locator(".q-dialog:visible")
    .getByText("Scan QR Code", { exact: true })
    .click();
  await expect(page.getByTestId("pay-payment-request")).toBeVisible();
  await expect(page.locator(".pay-fullscreen")).toContainText("11");
  await page.getByTestId("pay-payment-request").click();
  await expect(page.getByText("Paid", { exact: false })).toBeVisible();
});

test.describe("touch viewport", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  test("switches currency with a swipe and keeps payment controls reachable", async ({
    page,
    context,
  }) => {
    const wallet = new WalletUi(page);
    await wallet.onboard(MINT_C_URL);
    await wallet.mintBolt11(20);
    const slide = page.locator(".balance-carousel");
    await slide.scrollIntoViewIfNeeded();
    const box = await slide.boundingBox();
    const cdp = await context.newCDPSession(page);
    const y = box!.y + box!.height / 2;
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: box!.x + box!.width - 30, y }],
    });
    for (let step = 1; step <= 8; step++) {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [
          { x: box!.x + box!.width - 30 - ((box!.width - 60) * step) / 8, y },
        ],
      });
    }
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect(wallet.balance).toHaveCount(1);
    await expect(wallet.balance).not.toHaveAttribute("data-unit", "sat");
    await page.getByRole("button", { name: "Show BTC balance" }).tap();
    await wallet.openSend("ecash");
    await wallet.enterAmount(5);
    await expect(page.getByTestId("send-ecash")).toBeInViewport();
    await page.getByTestId("send-ecash").tap();
    await expect(page.getByTestId("copy-ecash-token")).toBeInViewport();
    await wallet.closeFullscreenDialog();
    await expect.poll(() => wallet.balanceSats()).toBe(15);
  });

  test("adds and removes a mint on a narrow screen", async ({ page }) => {
    const wallet = new WalletUi(page);
    await wallet.onboard(MINT_A_URL);
    await wallet.addMint(MINT_C_URL, "Mobile mint");
    await expect(wallet.mintCard(MINT_C_URL)).toContainText("Mobile mint");
    await wallet.removeMint(MINT_C_URL);
    await wallet.home("Mints");
    await expect(wallet.mintCard(MINT_C_URL)).toHaveCount(0);
    await expect(wallet.mintCard(MINT_A_URL)).toBeVisible();
  });
});

test("scans a QR code without fetching decoder code from a public CDN", async ({
  page,
  request,
}) => {
  const invoice = await counterpartyRequest(request, "bolt11", 10);
  await installCamera(page, invoice);
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await wallet.mintBolt11(20);
  const decoderRequests: string[] = [];
  page.on("request", (request) => {
    if (
      request.url().startsWith("https://") &&
      request.url().endsWith("zxing_reader.wasm")
    )
      decoderRequests.push(new URL(request.url()).hostname);
  });
  await wallet.openSend("lightning");
  await page
    .locator(".q-dialog:visible")
    .getByText("Scan QR Code", { exact: true })
    .click();
  await expect(page.locator("video")).toBeVisible();
  test.fail(true, "UI-007: scanner still loads decoder WASM from a public CDN");
  await expect(page.getByTestId("pay-payment-request")).toBeVisible({
    timeout: 5000,
  });
  expect(decoderRequests).toHaveLength(0);
});
