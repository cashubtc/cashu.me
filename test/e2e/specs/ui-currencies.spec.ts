import { expect, test } from "../fixtures/test";
import { MINT_C_URL, MINT_B_URL } from "../fixtures/mint";
import { WalletUi } from "../pages/WalletUi";

for (const unit of ["usd", "eur"] as const) {
  test(`mints, sends and persists real ${unit} balances without changing sats`, async ({
    page,
  }) => {
    const wallet = new WalletUi(page);
    await wallet.onboard(MINT_C_URL);
    await wallet.mintBolt11(40);
    await page
      .getByRole("button", { name: `Show ${unit.toUpperCase()} balance` })
      .click();
    await expect(wallet.balance).toHaveCount(1);
    await expect(wallet.balance).toHaveAttribute("data-unit", unit);
    await wallet.openReceive("lightning");
    await wallet.enterAmount(123);
    const quoteRequest = page.waitForRequest(
      (r) =>
        r.url() === `${MINT_C_URL}/v1/mint/quote/bolt11` &&
        r.method() === "POST"
    );
    await page.getByTestId("create-payment-request").click();
    expect((await quoteRequest).postDataJSON()).toMatchObject({
      unit,
      amount: 123,
    });
    await expect(wallet.balance).toContainText("1.23");
    await wallet.closeFullscreenDialog();
    await page.reload();
    await expect(wallet.balance).toHaveCount(1);
    await expect(wallet.balance).toHaveAttribute("data-unit", unit);
    await expect(wallet.balance).toContainText("1.23");
    await wallet.sendEcash(23);
    await expect(wallet.balance).toContainText("1.00");
    await wallet.closeFullscreenDialog();
    await wallet.home("History");
    await expect(page.getByTestId("history-row").first()).toContainText("0.23");
    await page.getByRole("button", { name: "Show BTC balance" }).click();
    await expect.poll(() => wallet.balanceSats()).toBe(40);
  });
}

test("falls back to a supported unit when selecting a sat-only mint", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_C_URL);
  await wallet.addMint(MINT_B_URL);
  await wallet.activateMint(MINT_C_URL);
  await page.getByRole("button", { name: "Show EUR balance" }).click();
  await expect(wallet.balance).toHaveCount(1);
  await expect(wallet.balance).toHaveAttribute("data-unit", "eur");
  await wallet.activateMint(MINT_B_URL);
  await expect(wallet.balance).toHaveCount(1);
  await expect(wallet.balance).toHaveAttribute("data-unit", "sat");
  await expect(
    page.getByRole("button", { name: "Show EUR balance" })
  ).toBeHidden();
  await wallet.mintBolt11(10);
});

test("changes fiat display currency and amount mode using deterministic prices", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_C_URL);
  await page.route("https://api.coinbase.com/**", (route) =>
    route.fulfill({
      json: { data: { rates: { USD: "100000", EUR: "80000" } } },
    })
  );
  await wallet.settings("privacy");
  await wallet.toggleSetting("Get exchange rate from Coinbase", false);
  await wallet.toggleSetting("Get exchange rate from Coinbase", true);
  await wallet.home();
  await wallet.mintBolt11(1000);
  await expect(page.locator(".balance-secondary-line:visible")).toContainText(
    "1.00"
  );
  await wallet.settings("privacy");
  await page.getByRole("combobox").click();
  await page.getByRole("option").filter({ hasText: "EUR" }).click();
  await wallet.home();
  await expect(page.locator(".balance-secondary-line:visible")).toContainText(
    "0.80"
  );
  await expect.poll(() => wallet.balanceSats()).toBe(1000);
  await wallet.openSend("ecash");
  await wallet.enterAmount(100);
  await page.locator(".fiat-icon:visible").click();
  await expect(page.locator(".amount-display:visible")).toHaveCount(1);
  await expect(page.locator(".amount-display:visible")).toContainText("0.08");
  await page.locator(".fiat-icon:visible").click();
  await expect(page.locator(".amount-display:visible")).toHaveCount(1);
  await expect(page.locator(".amount-display:visible")).toContainText("100");
  await wallet.closeFullscreenDialog();
  await page.reload();
  await expect(page.locator(".balance-secondary-line:visible")).toContainText(
    "0.80"
  );
});

test("hides balances across units and persists the privacy preference", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_C_URL);
  await wallet.mintBolt11(123);
  await wallet.balance.click();
  await expect(wallet.balance).not.toContainText("123");
  await page.reload();
  await expect(wallet.balance).not.toContainText("123");
  await page.getByRole("button", { name: "Show USD balance" }).click();
  await expect(wallet.balance).toHaveCount(1);
  await expect(wallet.balance).not.toContainText("0.00");
  await page.getByRole("button", { name: "Show BTC balance" }).click();
  await expect(wallet.balance).toHaveCount(1);
  await wallet.balance.click();
  await expect.poll(() => wallet.balanceSats()).toBe(123);
});
