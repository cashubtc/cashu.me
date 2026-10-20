import { expect, test } from "../fixtures/test";
import { MINT_A_URL, counterpartyRequest } from "../fixtures/mint";
import { forceMeltQuoteState } from "../fixtures/scenarios";
import { WalletUi } from "../pages/WalletUi";

import { disableAutomaticChecks, holdIncomingQuote } from "../fixtures/ui";

for (const method of ["bolt11", "bolt12", "onchain"] as const) {
  test(`manually checks a pending incoming ${method} from history after reload`, async ({
    page,
    request,
  }) => {
    const wallet = new WalletUi(page);
    await wallet.onboard(MINT_A_URL);
    await disableAutomaticChecks(wallet);
    await holdIncomingQuote(wallet, MINT_A_URL, method);
    await wallet.openReceive(method === "onchain" ? "onchain" : "lightning");
    if (method === "bolt12") {
      await page.getByRole("button", { name: "B11", exact: true }).click();
      await page
        .getByRole("button", { name: "Add amount", exact: true })
        .click();
    }
    await wallet.enterAmount(method === "onchain" ? 1000 : 27);
    const created = page.waitForResponse(
      (r) =>
        r.url() === `${MINT_A_URL}/v1/mint/quote/${method}` &&
        r.request().method() === "POST"
    );
    await page.getByTestId("create-payment-request").click();
    const quote = await (await created).json();
    await wallet.closeFullscreenDialog();
    await wallet.home("History");
    const row = page.getByTestId("history-row").first();
    await expect(row).toContainText("Pending");
    await page.reload();
    await expect(row).toContainText("Pending");
    await expect
      .poll(async () => {
        const response = await request.get(
          `${MINT_A_URL}/v1/mint/quote/${method}/${quote.quote}`
        );
        expect(response.ok()).toBeTruthy();
        const body = await response.json();
        return method === "bolt11"
          ? body.state === "PAID"
          : body.amount_paid > 0;
      })
      .toBe(true);
    await expect.poll(() => wallet.balanceSats()).toBe(0);
    await page.unroute(`${MINT_A_URL}/v1/mint/quote/${method}/**`);
    await row.getByTestId("history-check").click();
    await expect
      .poll(() => wallet.balanceSats())
      .toBe(method === "onchain" ? 1000 : 27);
    await expect(row).not.toContainText("Pending");
    await row.getByTestId("history-details").click();
    await expect(page.locator(".q-dialog:visible")).toBeVisible();
    await wallet.closeFullscreenDialog();
    await page.reload();
    await expect
      .poll(() => wallet.balanceSats())
      .toBe(method === "onchain" ? 1000 : 27);
  });

  test(`manually resolves a pending outgoing ${method} without paying twice`, async ({
    page,
    request,
  }) => {
    const wallet = new WalletUi(page);
    await wallet.onboard(MINT_A_URL);
    await wallet.mintBolt11(100);
    await disableAutomaticChecks(wallet);
    const payment = await counterpartyRequest(
      request,
      method,
      method === "onchain" ? undefined : 20
    );
    await forceMeltQuoteState(page, MINT_A_URL, method, "PENDING");
    await wallet.openSend(method === "onchain" ? "onchain" : "lightning");
    await wallet.quoteRequest(payment, method === "onchain" ? 20 : undefined);
    let submissions = 0;
    page.on("request", (r) => {
      if (
        r.method() === "POST" &&
        r.url() === `${MINT_A_URL}/v1/melt/${method}`
      )
        submissions++;
    });
    await page.getByTestId("pay-payment-request").click();
    await expect(page.locator(".pay-fullscreen")).toBeHidden();
    await wallet.home("History");
    await page
      .getByRole("button", { name: "Filter pending", exact: true })
      .click();
    const row = page.getByTestId("history-row").first();
    await expect(row).toContainText("Pending");
    await page.unroute(`${MINT_A_URL}/v1/melt/quote/${method}/**`);
    await row.getByTestId("history-check").click();
    await expect(page.getByTestId("history-row")).toHaveCount(0);
    // The fake backend charges the one-sat minimum fee.
    await expect.poll(() => wallet.balanceSats()).toBe(79);
    await page.reload();
    await expect.poll(() => wallet.balanceSats()).toBe(79);
    expect(submissions).toBe(1);
  });
}

test("reopens, copies, filters, reclaims and deletes unclaimed ecash history", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await wallet.mintBolt11(100);
  await disableAutomaticChecks(wallet);
  const token = await wallet.sendEcash(25);
  await wallet.closeFullscreenDialog();
  await wallet.home("History");
  await page
    .getByRole("button", { name: "Filter pending", exact: true })
    .click();
  await page.getByRole("button", { name: "Ecash Only", exact: true }).click();
  const row = page.getByTestId("history-row").first();
  await expect(page.getByTestId("history-row")).toHaveCount(1);
  await row.getByTestId("history-details").click();
  await page.getByTestId("copy-ecash-token").click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(token);
  await wallet.closeFullscreenDialog();
  await row.getByTestId("history-check").click();
  await expect(row).toContainText("Pending");
  // Long press changes the check action into the existing receive/reclaim action.
  const check = row.getByTestId("history-check");
  await check.dispatchEvent("mousedown");
  await expect(check).toContainText("arrow_circle_down");
  await check.dispatchEvent("touchend");
  await page.getByTestId("receive-ecash").click();
  await expect.poll(() => wallet.balanceSats()).toBe(100);
  await wallet.closeFullscreenDialog();
  await wallet.home("History");
  await page
    .getByTestId("history-row")
    .filter({ hasText: /Ecash/ })
    .first()
    .getByTestId("history-details")
    .click();
  await page.getByTestId("token-more").click();
  await page.getByTestId("delete-token").click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByTestId("copy-ecash-token")).toBeVisible();
  await page.getByTestId("delete-token").click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await wallet.home();
  await expect.poll(() => wallet.balanceSats()).toBe(100);
});

test("paginates history and resets correctly when filtering an empty result", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  for (let i = 1; i <= 6; i++) await wallet.mintBolt11(i);
  await wallet.home("History");
  await expect(page.getByTestId("history-row")).toHaveCount(5);
  await page
    .locator(".q-pagination")
    .getByRole("button", { name: "2", exact: true })
    .click();
  await expect(page.getByTestId("history-row")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Filter pending", exact: true })
    .click();
  await expect(page.getByText("No history yet", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Show all", exact: true }).click();
  await expect(page.getByTestId("history-row")).toHaveCount(5);
});
