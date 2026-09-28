import {
  getEncodedToken,
  PaymentRequest,
  PaymentRequestTransportType,
  type PaymentRequestPayload,
} from "@cashu/cashu-ts";
import { expect, test } from "../fixtures/test";
import { MINT_A_URL } from "../fixtures/mint";
import { disableAutomaticChecks } from "../fixtures/ui";
import { WalletUi } from "../pages/WalletUi";

const endpoint = "http://127.0.0.1:4173/payment-request-recipient";

function cashuRequest(types = ["post"]) {
  return new PaymentRequest(
    types.map((type) => ({
      type: type as PaymentRequestTransportType,
      target: endpoint,
    })),
    "e2e-cashu-request",
    21,
    "sat",
    [MINT_A_URL],
    "E2E payment request"
  ).toEncodedCreqA();
}

async function enterRequest(wallet: WalletUi, encoded: string) {
  await wallet.openSend("lightning");
  await wallet.page
    .getByTestId("payment-request-input")
    .locator("textarea")
    .fill(encoded);
}

test("Cashu payment request retries failed delivery from history without spending twice", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await wallet.mintBolt11(100);
  await disableAutomaticChecks(wallet);
  const payloads: PaymentRequestPayload[] = [];
  let swaps = 0;
  page.on("request", (request) => {
    if (
      request.method() === "POST" &&
      request.url() === `${MINT_A_URL}/v1/swap`
    )
      swaps++;
  });
  await page.route(endpoint, async (route) => {
    payloads.push(route.request().postDataJSON());
    await route.fulfill({
      status: payloads.length === 1 ? 503 : 200,
      json: {},
    });
  });
  // Unknown alternatives do not prevent selecting a supported transport.
  await enterRequest(wallet, cashuRequest(["unknown", "post"]));
  await page.getByRole("button", { name: "Pay", exact: true }).click();
  await expect(
    page.locator(".q-notification").filter({ hasText: "Could not pay request" })
  ).toBeVisible();
  await wallet.closeFullscreenDialog();
  await wallet.home("History");
  const row = page.getByTestId("history-row").filter({ hasText: "Ecash" });
  await expect(row).toHaveCount(1);
  await expect(row).toContainText("Pending");
  await expect.poll(() => wallet.balanceSats()).toBe(79);
  const swapsBeforeRetry = swaps;
  await page.reload();
  await row.getByTestId("history-details").click();
  await page.getByRole("button", { name: "Pay via HTTP", exact: true }).click();
  await expect(
    page.locator(".q-notification").filter({ hasText: "Payment sent" })
  ).toBeVisible();
  expect(payloads).toHaveLength(2);
  expect(payloads[1]).toEqual(payloads[0]);
  expect(swaps).toBe(swapsBeforeRetry);
  await wallet.closeFullscreenDialog();
  await wallet.home("History");
  await expect(row).toHaveCount(1);
  // Delivery alone does not mean the recipient has redeemed the ecash.
  await expect(row).toContainText("Pending");
  await expect.poll(() => wallet.balanceSats()).toBe(79);
});

test("Cashu payment request persists pending and redeemed outgoing history", async ({
  page,
  browser,
}) => {
  const sender = new WalletUi(page);
  await sender.onboard(MINT_A_URL);
  await sender.mintBolt11(100);
  await disableAutomaticChecks(sender);
  let payload: PaymentRequestPayload | undefined;
  await page.route(endpoint, async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({ json: { accepted: true } });
  });
  await enterRequest(sender, cashuRequest());
  await page.getByRole("button", { name: "Pay", exact: true }).click();
  await expect(
    page.locator(".q-notification").filter({ hasText: "Payment sent" })
  ).toBeVisible();
  expect(payload?.id).toBe("e2e-cashu-request");
  await expect(page.locator("button.floating-close-btn:visible")).toHaveCount(
    0
  );
  await sender.home("History");
  const row = page.getByTestId("history-row").filter({ hasText: "Ecash" });
  await expect(row).toHaveCount(1);
  await expect(row).toContainText("Pending");
  await expect(row).toContainText("-₿21");
  await page.reload();
  await expect(row).toHaveCount(1);
  await expect(row).toContainText("Pending");
  await expect.poll(() => sender.balanceSats()).toBe(79);

  const context = await browser.newContext({
    permissions: ["clipboard-read", "clipboard-write"],
    serviceWorkers: "block",
  });
  try {
    const receiver = new WalletUi(await context.newPage());
    await receiver.onboard(MINT_A_URL);
    await receiver.pasteEcash(getEncodedToken(payload!));
    await receiver.page.getByTestId("receive-ecash").click();
    await expect.poll(() => receiver.balanceSats()).toBe(21);
    await row.getByTestId("history-check").click();
    await expect(row).not.toContainText("Pending");
    await page.reload();
    await expect(row).toHaveCount(1);
    await expect(row).not.toContainText("Pending");
    await expect.poll(() => sender.balanceSats()).toBe(79);
  } finally {
    await context.close();
  }
});

for (const types of [["unknown"], []]) {
  test(`Cashu payment request rejects ${
    types.length ? "an unknown" : "a missing"
  } transport without spending`, async ({ page }) => {
    const wallet = new WalletUi(page);
    await wallet.onboard(MINT_A_URL);
    await wallet.mintBolt11(100);
    const outgoing: string[] = [];
    page.on("request", (request) => {
      if (
        request.method() === "POST" &&
        (request.url().includes("/v1/swap") ||
          request.url().includes("/v1/melt/") ||
          request.url() === endpoint)
      ) {
        outgoing.push(request.url());
      }
    });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await enterRequest(wallet, cashuRequest(types));
    await expect(
      page
        .locator(".q-notification")
        .filter({ hasText: /unsupported.*transport/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Pay", exact: true })
    ).toHaveCount(0);
    await wallet.closeFullscreenDialog();
    await wallet.home("History");
    await expect(page.getByTestId("history-row")).toHaveCount(1);
    await expect.poll(() => wallet.balanceSats()).toBe(100);
    expect(outgoing).toEqual([]);
    expect(errors).toEqual([]);
    await page.reload();
    await expect.poll(() => wallet.balanceSats()).toBe(100);
    // A rejected request must not leave the wallet locked or reserve proofs.
    await wallet.sendEcash(1);
    await expect.poll(() => wallet.balanceSats()).toBe(99);
  });
}
