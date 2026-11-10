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
  await wallet.scanQrCode();
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

  // Owner item 25: the balance never moves under a finger; the unit control switches it.
  test("switches currency with the unit control and keeps payment controls reachable", async ({
    page,
  }) => {
    const wallet = new WalletUi(page);
    await wallet.onboard(MINT_C_URL);
    await wallet.mintBolt11(20);
    await page.getByRole("button", { name: "Show USD balance" }).tap();
    await expect(wallet.balance).toHaveCount(1);
    await expect(wallet.balance).toHaveAttribute("data-unit", "usd");
    await page.getByRole("button", { name: "Show BTC balance" }).tap();
    await expect(wallet.balance).toHaveCount(1);
    await expect(wallet.balance).toHaveAttribute("data-unit", "sat");
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

// Owner batch 2, item 3: the labelled scan row is the one scan affordance on Pay Lightning
// and Pay on-chain (Paste stays in the field), and Receive ecash names a token.
test("Pay and Receive ecash show the labelled scan row, not an in-field Scan", async ({
  page,
}) => {
  await installCamera(page, null);
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  const field = page.locator(".q-dialog:visible .q-field");
  for (const method of ["lightning", "onchain"] as const) {
    await wallet.openSend(method);
    await expect(wallet.scanRow).toBeVisible();
    await expect(wallet.scanRow).toContainText("Tap to scan an address");
    await expect(
      field.getByRole("button", { name: "Scan", exact: true })
    ).toHaveCount(0);
    await wallet.scanQrCode();
    await page
      .getByRole("button", { name: "Close", exact: true })
      .last()
      .click();
    await expect(page.getByTestId("payment-request-input")).toBeVisible();
    await wallet.closeFullscreenDialog();
  }
  // An empty clipboard opens Receive ecash on its empty field.
  await wallet.pasteEcash("");
  await expect(page.getByTestId("receive-token-input")).toBeVisible();
  await expect(wallet.scanRow).toContainText("Tap to scan a token");
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
  await wallet.scanQrCode();
  await expect(page.locator("video")).toBeVisible();
  test.fail(true, "UI-007: scanner still loads decoder WASM from a public CDN");
  await expect(page.getByTestId("pay-payment-request")).toBeVisible({
    timeout: 5000,
  });
  expect(decoderRequests).toHaveLength(0);
});
