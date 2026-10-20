import { expect, test } from "../fixtures/test";
import { MINT_A_URL, MINT_B_URL } from "../fixtures/mint";
import { WalletUi } from "../pages/WalletUi";
import { disableAutomaticChecks } from "../fixtures/ui";

const privacyLabels = [
  "Check incoming invoice",
  "Check pending invoices on startup",
  "Check all invoices",
  "Check sent ecash",
];

test("persists privacy controls and suppresses automatic quote and price requests", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await disableAutomaticChecks(wallet);
  await wallet.settings("privacy");
  await wallet.toggleSetting("Get exchange rate from Coinbase", false);
  await expect(page.getByText("Use WebSockets", { exact: true })).toBeHidden();
  await page.reload();
  for (const label of privacyLabels) {
    await expect(
      page
        .locator(".q-item")
        .filter({ has: page.getByText(label, { exact: true }) })
        .getByRole("switch")
    ).toHaveAttribute("aria-checked", "false");
  }
  await expect(page.getByRole("combobox")).toHaveCount(0);
  const priceRequests: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("api.coinbase.com")) priceRequests.push(r.url());
  });
  await wallet.home();
  await expect.poll(() => wallet.balanceSats()).toBe(0);
  await expect(page.locator(".balance-secondary-line:visible")).toBeEmpty();
  expect(priceRequests).toHaveLength(0);
  await wallet.settings("privacy");
  await wallet.toggleSetting("Check incoming invoice", true);
  await expect(page.getByText("Use WebSockets", { exact: true })).toBeVisible();
});

test("changes theme, bitcoin symbol, keyboard preference and language persistently", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await wallet.mintBolt11(20);
  await wallet.settings("appearance");
  await wallet.toggleSetting("Use ₿ symbol", false);
  await wallet.toggleSetting("Use numeric keyboard", true);
  await page.getByText("bitcoin", { exact: true }).click();
  await page.reload();
  await expect(page.locator(".q-item--active")).toContainText("bitcoin");
  await wallet.home();
  await expect(wallet.balance).toContainText("sat");
  await wallet.openSend("ecash");
  await expect(page.locator(".numeric-keyboard:visible")).toBeVisible();
  await wallet.enterAmount(5);
  await expect(page.locator(".amount-display:visible")).toContainText("5");
  await wallet.closeFullscreenDialog();
  await wallet.settings("language");
  await page.getByText("Deutsch", { exact: true }).click();
  await page.reload();
  await expect(page.locator(".q-item--active")).toContainText("Deutsch");
  await page.goto("/");
  await expect(page.getByTestId("wallet-send")).not.toHaveText("Send");
  await page.getByTestId("wallet-send").click();
  await expect(page.getByTestId("send-ecash-option")).toBeVisible();
});

test("enables NWC, edits its allowance, copies and reopens the connection", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await wallet.settings("nwc");
  await wallet.toggleSetting("Enable NWC", true);
  await page
    .getByRole("spinbutton", { name: "Allowance left (sat)" })
    .fill("250");
  await page
    .locator("i")
    .filter({ hasText: /^qr_code$/ })
    .click();
  await page.getByRole("button", { name: "Copy", exact: true }).click();
  const connection = await page.evaluate(() => navigator.clipboard.readText());
  expect(connection).toMatch(/^nostr\+walletconnect:\/\//);
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("spinbutton", { name: "Allowance left (sat)" })
  ).toHaveValue("250");
  await wallet.toggleSetting("Enable NWC", false);
  await expect(page.getByRole("spinbutton")).toHaveCount(0);
});

test("generates and browses P2PK keys and enables quick access", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await wallet.settings("p2pk");
  await page.getByRole("button", { name: "Generate key", exact: true }).click();
  const publicKey = page
    .locator(".q-item__label")
    .filter({ hasText: /^0[23][a-f0-9]{64}$/ })
    .first();
  await expect(publicKey).toBeVisible();
  const key = await publicKey.innerText();
  await publicKey.click();
  await page.getByRole("button", { name: /Copy/i }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(key);
  await wallet.closeFullscreenDialog();
  await wallet.toggleSetting("Quick access to lock", true);
  await page.reload();
  await expect(publicKey).toHaveText(key);
  await wallet.home();
  await wallet.openReceive("ecash");
  await expect(page.getByText("Lock", { exact: true })).toBeVisible();
});

test("enables ecash payment requests and edits the request amount", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await wallet.settings("payment-requests");
  await wallet.toggleSetting("Enable Payment Requests", true);
  await wallet.home();
  await wallet.openReceive("ecash");
  await page.getByText("Request", { exact: true }).click();
  await page.getByRole("button", { name: /Add amount/i }).click();
  await page.getByPlaceholder("Enter amount", { exact: true }).fill("15");
  await page.getByPlaceholder("Enter amount", { exact: true }).press("Enter");
  await expect(page.getByRole("button", { name: /15/ })).toBeVisible();
  await page.getByRole("button", { name: "Copy", exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(
    /^creq/
  );
});

for (const directNavigation of [false, true]) {
  test(
    directNavigation
      ? "opens Lightning address settings directly and enables the address"
      : "configures a Lightning address and its mint using a local service response",
    async ({ page }) => {
      const wallet = new WalletUi(page);
      await wallet.onboard(MINT_A_URL);
      await wallet.addMint(MINT_B_URL, "Address mint");
      let selectedMint = MINT_A_URL;
      await page.route("https://npub.cash/**", async (route) => {
        if (
          route.request().method() === "PATCH" ||
          route.request().method() === "PUT" ||
          route.request().method() === "POST"
        ) {
          selectedMint =
            route.request().postDataJSON()?.mint_url ?? selectedMint;
        }
        await route.fulfill({
          json: {
            data: {
              user: {
                name: "ui-fixture",
                mintUrl: selectedMint,
                pubkey: "",
                lockQuote: false,
              },
              quotes: [],
            },
            metadata: { total: 0 },
          },
        });
      });
      if (directNavigation) {
        await wallet.settings("lightning-address");
      } else {
        await wallet.home();
        await page
          .getByRole("button", { name: "Settings", exact: true })
          .click();
        await page.getByText("Lightning Address", { exact: true }).click();
      }
      await wallet.toggleSetting("Enable", true);
      if (directNavigation)
        test.fail(
          true,
          "UI-009: direct Lightning address settings navigation initializes wallet store outside setup"
        );
      await expect(page.locator("input[readonly]")).toHaveValue(/@npub.cash$/, {
        timeout: 5000,
      });
      await page.getByTestId("choose-mint").click();
      await page
        .locator(".mint-option")
        .filter({ hasText: "Address mint" })
        .click();
      await expect.poll(() => selectedMint).toBe(MINT_B_URL);
      await wallet.toggleSetting("Enable", false);
      await expect(page.getByTestId("choose-mint")).toBeHidden();
    }
  );
}

test("startup checking can be disabled and re-enabled for an unpaid invoice", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await disableAutomaticChecks(wallet);
  await wallet.openReceive("lightning");
  await wallet.enterAmount(17);
  await page.getByTestId("create-payment-request").click();
  await wallet.closeFullscreenDialog();
  let checks = 0;
  page.on("request", (request) => {
    if (
      (request.method() === "GET" || request.url().endsWith("/check")) &&
      request.url().includes("/v1/mint/quote/bolt11/")
    )
      checks++;
  });
  await wallet.home("History");
  await expect(page.getByTestId("history-row").first()).toContainText(
    "Pending"
  );
  expect(checks).toBe(0);
  await wallet.settings("privacy");
  await wallet.toggleSetting("Check pending invoices on startup", true);
  await wallet.home("History");
  await expect.poll(() => wallet.balanceSats()).toBe(17);
  expect(checks).toBeGreaterThan(0);
});
