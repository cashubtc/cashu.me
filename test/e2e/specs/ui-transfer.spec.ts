import { expect, test } from "../fixtures/test";
import { MINT_A_URL, MINT_B_URL } from "../fixtures/mint";
import { WalletUi } from "../pages/WalletUi";

// Independent fake backends settle separately. A real successful Lightning melt
// implies the destination invoice is paid; wait for that backend fact before
// delivering the destination's first quote check to the UI.
async function settleSwapDestination(wallet: WalletUi, mintUrl: string) {
  await wallet.page.route(
    `${mintUrl}/v1/mint/quote/bolt11/**`,
    async (route) => {
      if (route.request().method() !== "GET") return route.fallback();
      let response: Awaited<ReturnType<typeof route.fetch>>;
      await expect
        .poll(
          async () => {
            response = await route.fetch();
            return (await response.json()).state !== "UNPAID";
          },
          { timeout: 10_000 }
        )
        .toBe(true);
      await route.fulfill({ response: response! });
    }
  );
}

async function chooseSwap(
  wallet: WalletUi,
  from: string,
  to: string,
  amount: string
) {
  await wallet.home("Mints");
  await wallet.page
    .getByRole("combobox", { name: "From", exact: true })
    .click();
  await wallet.page
    .getByRole("option")
    .filter({ hasText: new URL(from).host })
    .click();
  await expect(wallet.page.getByRole("listbox")).toHaveCount(0);
  await wallet.page.getByRole("combobox", { name: "To", exact: true }).click();
  await wallet.page
    .getByRole("option")
    .filter({ hasText: new URL(to).host })
    .click();
  await expect(wallet.page.getByRole("listbox")).toHaveCount(0);
  await expect(
    wallet.page.getByRole("combobox", { name: "From", exact: true })
  ).toHaveValue(new RegExp(new URL(from).host.replaceAll(".", "\\.")));
  await expect(
    wallet.page.getByRole("combobox", { name: "To", exact: true })
  ).toHaveValue(new RegExp(new URL(to).host.replaceAll(".", "\\.")));
  await wallet.page.getByRole("spinbutton", { name: /Amount/ }).fill(amount);
  await expect(
    wallet.page.getByRole("spinbutton", { name: /Amount/ })
  ).toHaveValue(amount);
}

test("swaps between mints and preserves the correct source and destination balances", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await wallet.mintBolt11(100);
  await wallet.addMint(MINT_B_URL);
  await settleSwapDestination(wallet, MINT_B_URL);
  await chooseSwap(wallet, MINT_A_URL, MINT_B_URL, "30");
  await page.getByRole("button", { name: "Swap", exact: true }).click();
  await expect(wallet.mintCard(MINT_B_URL)).toContainText("30");
  await expect(wallet.mintCard(MINT_A_URL)).toContainText("69");
  await expect.poll(() => wallet.balanceSats()).toBe(99);
  await wallet.home("History");
  await expect(page.getByTestId("history-row")).toHaveCount(3);
});

test("rejects a swap larger than the source balance and remains usable", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await wallet.mintBolt11(10);
  await wallet.addMint(MINT_B_URL);
  await chooseSwap(wallet, MINT_A_URL, MINT_B_URL, "100");
  await page.getByRole("button", { name: "Swap", exact: true }).click();
  await expect(
    page
      .locator(".q-notification")
      .filter({ hasText: /balance|funds|enough/i })
      .first()
  ).toBeVisible();
  await expect.poll(() => wallet.balanceSats()).toBe(10);
  await expect(
    page.getByRole("combobox", { name: "From", exact: true })
  ).toHaveValue("");
  await wallet.mintCard(MINT_A_URL).click();
  await wallet.sendEcash(1);
  await expect.poll(() => wallet.balanceSats()).toBe(9);
});

test("receives an unknown-mint token through a deep link after the receive-and-trust action", async ({
  page,
  browser,
}) => {
  const sender = new WalletUi(page);
  await sender.onboard(MINT_B_URL);
  await sender.mintBolt11(50);
  const token = await sender.sendEcash(20);
  const context = await browser.newContext({
    permissions: ["clipboard-read", "clipboard-write"],
    serviceWorkers: "block",
  });
  try {
    const receiver = new WalletUi(await context.newPage());
    await receiver.onboard(MINT_A_URL);
    await receiver.page.goto(`/?token=${encodeURIComponent(token)}`);
    await expect(
      receiver.page
        .getByText(new URL(MINT_B_URL).hostname, { exact: false })
        .first()
    ).toBeVisible();
    await expect(receiver.page.getByTestId("receive-ecash")).toBeVisible();
    await receiver.closeFullscreenDialog();
    await receiver.home("Mints");
    await expect(receiver.mintCard(MINT_B_URL)).toHaveCount(0);
    await expect.poll(() => receiver.balanceSats()).toBe(0);
    await receiver.page.goto(`/?token=${encodeURIComponent(token)}`);
    await receiver.page.getByTestId("receive-ecash").click();
    await expect.poll(() => receiver.balanceSats()).toBe(20);
    await receiver.home("Mints");
    await expect(receiver.mintCard(MINT_B_URL)).toBeVisible();
    await receiver.page.reload();
    await expect.poll(() => receiver.balanceSats()).toBe(20);
  } finally {
    await context.close();
  }
});

test("retries a swap after the destination quote service recovers", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await wallet.mintBolt11(100);
  await wallet.addMint(MINT_B_URL);
  await chooseSwap(wallet, MINT_A_URL, MINT_B_URL, "20");
  const quoteUrl = `${MINT_B_URL}/v1/mint/quote/bolt11`;
  await page.route(quoteUrl, (route) =>
    route.fulfill({ status: 503, json: { detail: "Temporarily unavailable" } })
  );
  const failedQuote = page.waitForResponse(
    (r) => r.url() === quoteUrl && r.status() === 503
  );
  const swap = page.getByRole("button", { name: "Swap", exact: true });
  await swap.click();
  await failedQuote;
  await expect(
    page.getByRole("combobox", { name: "From", exact: true })
  ).toHaveValue("");
  await expect.poll(() => wallet.balanceSats()).toBe(100);
  await expect(
    wallet.mintCard(MINT_B_URL).locator(".currency-unit-text")
  ).toHaveText("₿0");
  await page.unroute(quoteUrl);
  await settleSwapDestination(wallet, MINT_B_URL);
  await chooseSwap(wallet, MINT_A_URL, MINT_B_URL, "20");
  await swap.click();
  await expect(wallet.mintCard(MINT_B_URL)).toContainText("20");
  await expect(wallet.mintCard(MINT_A_URL)).toContainText("79");
  await expect.poll(() => wallet.balanceSats()).toBe(99);
});
