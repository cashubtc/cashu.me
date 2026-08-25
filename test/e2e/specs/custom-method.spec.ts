import { expect, test, type Page } from "@playwright/test";
import { WalletPage } from "../pages/WalletPage";
import {
  BranchMint,
  BRANCH_MINT_URL,
  BRANCH_METHOD_NAME,
} from "../fixtures/branchMint";

// End-to-end coverage for custom (generic) payment methods: a mint that
// advertises a non-built-in method ("branch", pecan-style counter
// settlement) in NUT-04/NUT-05. Runs against the in-process mock mint —
// no docker stack required.

let mint: BranchMint;

test.beforeAll(async () => {
  mint = new BranchMint();
  await mint.start();
});

test.afterAll(async () => {
  await mint.stop();
});

// Same flow as WalletPage.onboard, but tolerant of the mint URL appearing
// more than once on the add-mints page.
async function onboard(wallet: WalletPage, page: Page, mintUrl: string) {
  await wallet.goto();
  await page.getByTestId("onboarding-start").click();
  await page.getByTestId("onboarding-next").click();
  await page.getByTestId("onboarding-create-wallet").click();
  await page.getByTestId("onboarding-seed-confirmed").click();
  await page.getByTestId("onboarding-next").click();

  const mintInput = page.getByTestId("onboarding-mint-url").locator("input");
  await mintInput.fill(mintUrl);
  await page.getByTestId("onboarding-add-mint").click();
  await page.getByTestId("confirm-add-mint").click();
  await expect(page.getByText(mintUrl, { exact: true }).first()).toBeVisible();

  await page.getByTestId("onboarding-next").click();
  await expect(page.getByTestId("wallet-send")).toBeVisible();
  await expect(wallet.balance).toBeVisible();
}

async function balanceOra(wallet: WalletPage): Promise<number> {
  await expect(wallet.balance).toHaveAttribute("data-unit", "ora");
  const text = await wallet.balance.innerText();
  // en-US currency formatting, e.g. "ORA 25.00"
  const numeric = text.replace(/[^0-9.,-]/g, "").replace(/,/g, "");
  return Number(numeric);
}

test("mints and melts via a custom payment method", async ({
  page,
  request,
}) => {
  const wallet = new WalletPage(page);
  await onboard(wallet, page, BRANCH_MINT_URL);

  // The mint only issues "ora", so the wallet switches to it.
  await expect(wallet.balance).toHaveAttribute("data-unit", "ora");

  // --- Receive via the advertised custom method -------------------------
  await page.getByTestId("wallet-receive").click();
  await page.getByTestId("receive-branch-option").click();
  // The advertised NUT-06 method_name is used for display, not the raw id.
  await expect(
    page.getByText(`Receive ${BRANCH_METHOD_NAME}`, { exact: true })
  ).toBeVisible();
  await wallet.enterAmount(25);
  await page.getByTestId("create-payment-request").click();

  // The quote id is displayed for the teller (last 6 chars emphasized).
  const quoteIdDisplay = page.getByTestId("custom-quote-id");
  await expect(quoteIdDisplay).toBeVisible();
  const quoteId = (
    await quoteIdDisplay.locator(".quote-id-value").innerText()
  ).replace(/\s+/g, "");
  expect(quoteId).toMatch(/^[0-9a-f]{32}$/);
  await expect(quoteIdDisplay.locator(".quote-id-tail")).toHaveText(
    quoteId.slice(-6)
  );
  // Tapping the quote id copies it.
  await quoteIdDisplay.click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    quoteId
  );

  // The teller confirms the cash was received.
  const payResponse = await request.post(
    `${BRANCH_MINT_URL}/__test__/pay/${quoteId}`
  );
  expect(payResponse.ok()).toBeTruthy();

  // The wallet polls the quote and mints the ecash.
  await expect.poll(() => balanceOra(wallet), { timeout: 45_000 }).toBe(25);
  await wallet.closeFullscreenDialog();

  // --- Withdraw via the advertised custom method -------------------------
  await page.getByTestId("wallet-send").click();
  await page.getByTestId("send-branch-option").click();
  await expect(
    page.getByText(`Withdraw ${BRANCH_METHOD_NAME}`, { exact: true })
  ).toBeVisible();
  await wallet.enterAmount(10);
  await page.getByTestId("quote-payment-request").click();

  // The melt quote id is shown for the teller to match: QR code (bare
  // quote id) plus emphasized text, tap to copy — matching the mint flow.
  const meltQuoteDisplay = page.getByTestId("custom-melt-quote-id");
  await expect(meltQuoteDisplay).toBeVisible();
  await expect(meltQuoteDisplay.locator("canvas")).toBeVisible();
  const meltQuoteId = (
    await meltQuoteDisplay.locator(".quote-id-value").innerText()
  ).replace(/\s+/g, "");
  expect(meltQuoteId).toMatch(/^[0-9a-f]{32}$/);
  await expect(meltQuoteDisplay.locator(".quote-id-tail")).toHaveText(
    meltQuoteId.slice(-6)
  );
  await meltQuoteDisplay.locator(".quote-id-value").click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    meltQuoteId
  );

  const pay = page.getByTestId("pay-payment-request");
  await expect(pay).toBeEnabled();
  await pay.click();

  await expect.poll(() => balanceOra(wallet), { timeout: 45_000 }).toBe(15);

  // The mock settled the melt immediately.
  const state = await (
    await request.get(`${BRANCH_MINT_URL}/__test__/quotes`)
  ).json();
  const melt = state.melt.find((q: any) => q.quote === meltQuoteId);
  expect(melt?.state).toBe("PAID");
});
