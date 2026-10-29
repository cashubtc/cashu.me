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

test("switches the ecash unit with the chip under the amount", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_C_URL);
  await expect(wallet.balance).toHaveAttribute("data-unit", "sat");
  for (const open of [
    () => wallet.openReceive("lightning"),
    () => wallet.openSend("ecash"),
  ]) {
    await open();
    const chip = wallet.unitChip();
    await expect(chip).toHaveAccessibleName("Unit: Bitcoin, change");
    await expect(chip).toHaveText("BTC");
    // The unit no longer sits in the header beside close (and Send's lock).
    await expect(
      page.locator(".sheet-column-header:visible .unit-chip")
    ).toHaveCount(0);
    await chip.click();
    await expect(chip).not.toHaveAccessibleName("Unit: Bitcoin, change");
    await expect(page.locator(".amount-display:visible")).not.toContainText(
      "₿"
    );
    await wallet.closeFullscreenDialog();
    await expect(wallet.balance).toHaveCount(1);
    await expect(wallet.balance).not.toHaveAttribute("data-unit", "sat");
    await page.getByRole("button", { name: "Show BTC balance" }).click();
    await expect(wallet.balance).toHaveCount(1);
    await expect(wallet.balance).toHaveAttribute("data-unit", "sat");
  }
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
  await wallet.fiatEntrySwap("EUR").click();
  await expect(page.locator(".amount-display:visible")).toHaveCount(1);
  await expect(page.locator(".amount-display:visible")).toContainText("0.08");
  await wallet.fiatEntrySwap("EUR").click();
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

// Owner item 25: the balance only moves when a unit is chosen; no hand gesture moves it.
test.describe("balance carousel", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 640 } });

  test("ignores swipes, drags and sideways scrolling; unit dots still switch", async ({
    page,
  }) => {
    const wallet = new WalletUi(page);
    await wallet.onboard(MINT_C_URL);
    const carousel = page.getByTestId("wallet-balance-carousel");
    await expect(wallet.balance).toHaveAttribute("data-unit", "sat");
    const box = (await carousel.boundingBox())!;
    const y = box.y + box.height / 2;
    const panelScroll = () =>
      carousel.evaluate((el) =>
        [...el.querySelectorAll(".q-panel, .q-carousel__slide")].map(
          (p) => `${p.scrollLeft},${p.scrollTop}`
        )
      );
    const before = await panelScroll();

    // A real touch swipe each way (CDP touch events, as a finger sends them).
    const cdp = await page.context().newCDPSession(page);
    for (const [from, to] of [
      [box.x + box.width * 0.85, box.x + box.width * 0.1],
      [box.x + box.width * 0.1, box.x + box.width * 0.85],
    ]) {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: from, y }],
      });
      for (let i = 1; i <= 8; i++)
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: from + ((to - from) * i) / 8, y }],
        });
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
      await page.waitForTimeout(400);
      await expect(wallet.balance).toHaveAttribute("data-unit", "sat");
    }

    // A mouse drag.
    await page.mouse.move(box.x + box.width * 0.85, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.1, y, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(400);
    await expect(wallet.balance).toHaveAttribute("data-unit", "sat");

    // Sideways wheel or trackpad over the balance scrolls nothing inside it.
    await page.mouse.move(box.x + box.width / 2, y);
    await page.mouse.wheel(240, 0);
    await page.mouse.wheel(0, 60);
    await page.waitForTimeout(200);
    expect(await panelScroll()).toEqual(before);
    // …while a vertical wheel still scrolls the page.
    await page.mouse.wheel(0, 300);
    await expect
      .poll(() => page.evaluate(() => document.scrollingElement!.scrollTop))
      .toBeGreaterThan(0);
    await page.evaluate(() => document.scrollingElement!.scrollTo(0, 0));

    // A unit dot still switches the balance, and the amount still hides on tap.
    await page.getByRole("button", { name: "Show USD balance" }).click();
    await expect(wallet.balance).toHaveCount(1);
    await expect(wallet.balance).toHaveAttribute("data-unit", "usd");
    await expect(wallet.balance).toContainText("$");
    await wallet.balance.click();
    await expect(wallet.balance).not.toContainText("0.00");
  });

  test("a single-unit wallet exposes no unit controls", async ({ page }) => {
    const wallet = new WalletUi(page);
    await wallet.onboard(MINT_B_URL);
    await expect(wallet.balance).toHaveAttribute("data-unit", "sat");
    await expect(
      page.getByRole("button", { name: /^Show .* balance$/ })
    ).toHaveCount(0);
    await wallet.openReceive("lightning");
    await expect(page.locator(".numeric-keyboard:visible")).toBeVisible();
    await expect(wallet.unitChip()).toHaveCount(0);
  });
});
