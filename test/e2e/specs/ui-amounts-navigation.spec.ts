import { expect, test } from "../fixtures/test";
import {
  MINT_A_URL,
  MINT_B_URL,
  MINT_C_URL,
  createMintQuote,
  counterpartyRequest,
} from "../fixtures/mint";
import { WalletUi } from "../pages/WalletUi";

test("edits amounts with physical keys, rejects zero and overspending, and sends exact balance", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await wallet.mintBolt11(35);
  await wallet.openSend("ecash");
  await expect(page.getByTestId("send-ecash")).toBeDisabled();
  await page.keyboard.type("360");
  await page.keyboard.press("Backspace");
  await expect(page.locator(".amount-display:visible")).toContainText("36");
  await expect(page.getByTestId("send-ecash")).toBeDisabled();
  await page.keyboard.press("Backspace");
  await page.keyboard.type("5");
  await expect(page.locator(".amount-display:visible")).toContainText("35");
  await page.getByTestId("send-ecash").click();
  await expect(page.getByTestId("copy-ecash-token")).toBeVisible();
  await expect.poll(() => wallet.balanceSats()).toBe(0);
});

test("closes and reopens drafts without submitting or retaining an old amount", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  let submissions = 0;
  page.on("request", (r) => {
    if (r.method() === "POST" && /\/v1\/(mint|melt|swap)/.test(r.url()))
      submissions++;
  });
  await wallet.openReceive("lightning");
  await wallet.enterAmount(123);
  await wallet.closeFullscreenDialog();
  await wallet.openReceive("lightning");
  await expect(page.getByTestId("create-payment-request")).toBeDisabled();
  await wallet.closeFullscreenDialog();
  await wallet.home("Mints");
  await page.getByRole("tab", { name: "History", exact: true }).click();
  await expect(page.getByText("No history yet", { exact: true })).toBeVisible();
  expect(submissions).toBe(0);
});

test("opens mint deep links and cancels without spending or adding", async ({
  page,
  request,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await wallet.mintBolt11(100);
  await page.goto(`/?mint=${encodeURIComponent(MINT_B_URL)}`);
  await expect(page.getByTestId("confirm-add-mint")).toBeEnabled();
  await page.locator(".bottom-sheet-close:visible").click();
  await expect(wallet.mintCard(MINT_B_URL)).toHaveCount(0);
  await page.goto("/settings");
  await page.getByText("Privacy", { exact: true }).click();
  await expect(page).toHaveURL(/settings\/privacy/);
  await page.goBack();
  await expect(page).toHaveURL(/\/settings$/);
});

test("opens and closes QR scanner when camera access is unavailable", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await wallet.openSend("lightning");
  await page
    .locator(".q-dialog:visible")
    .getByText("Scan QR Code", { exact: true })
    .click();
  await expect(page.locator(".q-dialog:visible").last()).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).last().click();
  await expect(page.getByTestId("payment-request-input")).toBeVisible();
});

test("switching the mint in a payment dialog replaces the old quote", async ({
  page,
  request,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await wallet.mintBolt11(100);
  await wallet.addMint(MINT_B_URL, "Payment mint");
  await wallet.mintBolt11(50);
  await wallet.activateMint(MINT_A_URL);
  const { request: invoice } = await createMintQuote(request, "bolt11", {
    amount: 15,
    mintUrl: MINT_C_URL,
  });
  await wallet.openSend("lightning");
  await wallet.quoteRequest(invoice);
  await page.getByTestId("choose-mint").filter({ visible: true }).click();
  const newQuote = page.waitForResponse(
    (r) =>
      r.url() === `${MINT_B_URL}/v1/melt/quote/bolt11` &&
      r.request().method() === "POST"
  );
  await page
    .locator(".mint-option")
    .filter({ hasText: "Payment mint" })
    .click();
  expect((await newQuote).ok()).toBe(true);
  const paid = page.waitForRequest(
    (r) => r.url() === `${MINT_B_URL}/v1/melt/bolt11` && r.method() === "POST"
  );
  await page.getByTestId("pay-payment-request").click();
  await paid;
  await expect(page.getByText("Paid", { exact: false })).toBeVisible();
  await expect(page.locator(".pay-fullscreen")).toBeHidden();
  await wallet.home("Mints");
  await expect(wallet.mintCard(MINT_A_URL)).toContainText("100");
  await expect(wallet.mintCard(MINT_B_URL)).toContainText("34");
});

test("clipboard denial leaves manual payment entry usable", async ({
  page,
  request,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await wallet.mintBolt11(40);
  const clipboardErrors: string[] = [];
  page.on("pageerror", (error) => {
    if (error.message.includes("Clipboard permission denied"))
      clipboardErrors.push(error.message);
  });
  await page.evaluate(() => {
    // Capacitor prefers read(), then falls back to readText(). Deny both paths.
    for (const method of ["read", "readText"]) {
      Object.defineProperty(navigator.clipboard, method, {
        configurable: true,
        value: async () => {
          throw new DOMException(
            "Clipboard permission denied",
            "NotAllowedError"
          );
        },
      });
    }
  });
  await wallet.openSend("lightning");
  await page
    .locator(".q-dialog:visible")
    .getByText("Paste", { exact: true })
    .click();
  const invoice = await counterpartyRequest(request, "bolt11", 10);
  await wallet.quoteRequest(invoice);
  await expect(page.getByTestId("pay-payment-request")).toBeEnabled();
  await wallet.closeFullscreenDialog();
  await expect.poll(() => wallet.balanceSats()).toBe(40);
  test.fail(
    true,
    "UI-011: clipboard permission denial escapes the paste handler as an unhandled error"
  );
  expect(clipboardErrors).toEqual([]);
});
