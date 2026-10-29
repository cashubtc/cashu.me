import { expect, test } from "../fixtures/test";
import { MINT_A_URL, MINT_B_URL } from "../fixtures/mint";
import { WalletUi } from "../pages/WalletUi";

test("adds, cancels, normalizes and deduplicates mints after onboarding", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await wallet.addMint(MINT_B_URL, "Secondary", false);
  await expect(wallet.mintCard(MINT_B_URL)).toHaveCount(0);
  await wallet.addMint(`${MINT_B_URL}/`, "Secondary");
  await expect(wallet.mintCard(MINT_B_URL)).toContainText("Secondary");
  await wallet.addMint(MINT_B_URL, "", false);
  await expect(page.getByTestId("mint-card")).toHaveCount(2);
  await page.reload();
  await expect(wallet.mintCard(MINT_B_URL)).toContainText("Secondary");
});

test("failed mint addition leaves the funded wallet usable", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await wallet.mintBolt11(50);
  await page.route(`${MINT_B_URL}/**`, (route) =>
    route.fulfill({ status: 503, body: "Unavailable" })
  );
  await wallet.home("Mints");
  await page.getByTestId("add-mint-url").fill(MINT_B_URL);
  await page.getByRole("button", { name: "Add mint", exact: true }).click();
  await expect(page.locator(".sheet-error.active")).toBeVisible();
  await expect(page.getByTestId("confirm-add-mint")).toBeDisabled();
  await page.locator(".bottom-sheet-close:visible").click();
  await expect(wallet.mintCard(MINT_B_URL)).toHaveCount(0);
  await wallet.home();
  await expect.poll(() => wallet.balanceSats()).toBe(50);
  await wallet.sendEcash(10);
  await expect.poll(() => wallet.balanceSats()).toBe(40);
});

test("switches funded mints without mixing their balances or outgoing proofs", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await wallet.mintBolt11(70);
  await wallet.addMint(MINT_B_URL, "Secondary");
  await wallet.mintBolt11(30);
  await expect.poll(() => wallet.balanceSats()).toBe(100);
  await wallet.activateMint(MINT_A_URL);
  await wallet.sendEcash(20);
  await expect.poll(() => wallet.balanceSats()).toBe(80);
  await wallet.closeFullscreenDialog();
  await wallet.activateMint(MINT_B_URL);
  await expect(wallet.mintCard(MINT_A_URL)).toContainText("50");
  await expect(wallet.mintCard(MINT_B_URL)).toContainText("30");
  await page.reload();
  await expect(wallet.mintCard(MINT_B_URL)).toHaveClass(/q-item--active/);
  await wallet.openReceive("lightning");
  await expect(
    page.getByTestId("choose-mint").filter({ visible: true })
  ).toContainText("Secondary");
});

test("edits and cancels mint nicknames and keeps funds spendable", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await wallet.mintBolt11(40);
  await wallet.editMint(MINT_A_URL, "Cancelled", MINT_A_URL, false);
  await wallet.home("Mints");
  await expect(wallet.mintCard(MINT_A_URL)).not.toContainText("Cancelled");
  await wallet.editMint(MINT_A_URL, "Daily wallet");
  await wallet.home("Mints");
  await page.reload();
  await expect(wallet.mintCard(MINT_A_URL)).toContainText("Daily wallet");
  await wallet.sendEcash(10);
  await expect.poll(() => wallet.balanceSats()).toBe(30);
});

test("removes active and last mint, warns about funds, and recovers after re-adding", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await wallet.mintBolt11(45);
  await wallet.addMint(MINT_B_URL);
  await wallet.removeMint(MINT_A_URL, false);
  await wallet.home("Mints");
  await expect(page.getByTestId("mint-card")).toHaveCount(2);
  await wallet.activateMint(MINT_A_URL);
  await wallet.details(MINT_A_URL);
  await page.getByTestId("mint-delete").click();
  await expect(page.locator(".remove-mint-dialog")).toContainText("45");
  await page
    .locator(".remove-mint-dialog")
    .getByRole("button", { name: "Remove mint" })
    .click();
  await wallet.home("Mints");
  await expect(wallet.mintCard(MINT_B_URL)).toHaveClass(/q-item--active/);
  await wallet.removeMint(MINT_B_URL);
  await wallet.home("Mints");
  await expect(page.getByTestId("mint-card")).toHaveCount(0);
  await wallet.addMint(MINT_A_URL);
  await expect.poll(() => wallet.balanceSats()).toBe(45);
  await wallet.sendEcash(5);
  await expect.poll(() => wallet.balanceSats()).toBe(40);
});

test("rejects malformed mint input without adding a mint", async ({ page }) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await wallet.home("Mints");
  await page.getByTestId("add-mint-url").fill("not a valid mint url");
  await page.getByRole("button", { name: "Add mint", exact: true }).click();
  await expect(page.locator(".sheet-error.active")).toBeVisible();
  await expect(page.getByTestId("confirm-add-mint")).toBeDisabled();
  await page.locator(".bottom-sheet-close:visible").click();
  await expect(page.getByTestId("mint-card")).toHaveCount(1);
});

// Owner 2026-10-29, items 8, 11, 19, 23, 34, 35: every detail row is one 44px box 4px from
// the next, on the page edge, its tint inside its own box; contacts are copy rows with no
// row for an empty entry; the audit retry keeps its row while busy. The page blocks outside
// requests, so the auditor is unavailable unless a test routes it.
const AUDITOR = "https://api.audit.8333.space";

async function rowBoxes(table: import("@playwright/test").Locator) {
  return table.locator(":scope > .detail-item").evaluateAll((rows) =>
    rows.map((r) => {
      const b = r.getBoundingClientRect();
      return { top: b.top, bottom: b.bottom, height: b.height };
    })
  );
}

test("mint details rows share one height, gap and edge", async ({ page }) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await wallet.details(MINT_A_URL);

  const features = page.getByRole("button", { name: /Supported features/ });
  const table = page.locator(".detail-table").filter({ has: features });
  await expect(features).toBeVisible();

  const boxes = await rowBoxes(table);
  expect(boxes.length).toBeGreaterThanOrEqual(3);
  for (const b of boxes) expect(Math.abs(b.height - 44)).toBeLessThan(0.6);
  for (let i = 1; i < boxes.length; i++) {
    expect(Math.abs(boxes[i].top - boxes[i - 1].bottom - 4)).toBeLessThan(0.6);
  }

  // The rows' text sits on the page's 16px edge, the same as the section heading's line.
  const heading = page.locator(".section-divider-block").filter({
    hasText: "Mint details",
  });
  const headingX = (await heading.boundingBox())!.x;
  const urlIcon = table.locator(".detail-item").first().locator(".detail-icon");
  const iconX = (await urlIcon.boundingBox())!.x;
  expect(Math.abs(iconX - headingX)).toBeLessThan(0.6);

  // The hover tint is the row's own box.
  await features.hover();
  const before = (prop: "inset" | "backgroundColor") =>
    features.evaluate((el, p) => getComputedStyle(el, "::before")[p], prop);
  expect(await before("inset")).toBe("0px");
  await expect
    .poll(() => before("backgroundColor"))
    .not.toBe("rgba(0, 0, 0, 0)");

  // Copy mint URL appears once: as the URL row.
  await expect(
    page.getByRole("button", { name: "Copy mint URL", exact: true })
  ).toHaveCount(1);
});

test("mint contacts are copy rows and an empty entry draws nothing", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  const npub =
    "npub1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqxyz789";
  await page.route(`${MINT_A_URL}/v1/info`, async (route) => {
    const response = await route.fetch();
    const info = await response.json();
    info.contact = [
      { method: "email", info: "ops@mint.example" },
      { method: "nostr", info: "" },
      { method: "nostr", info: npub },
    ];
    await route.fulfill({ response, json: info });
  });
  await wallet.details(MINT_A_URL);

  const email = page.getByRole("button", { name: "Email: ops@mint.example" });
  const nostr = page.getByRole("button", { name: `Nostr: ${npub}` });
  await expect(email).toBeVisible();
  await expect(nostr).toBeVisible();
  await expect(nostr).toContainText("npub1qqqqq…xyz789");
  await expect(page.getByRole("button", { name: /^Nostr:/ })).toHaveCount(1);
  for (const row of [email, nostr]) {
    expect(Math.abs((await row.boundingBox())!.height - 44)).toBeLessThan(0.6);
  }
});

test("mints without contacts show no contact section", async ({ page }) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await page.route(`${MINT_A_URL}/v1/info`, async (route) => {
    const response = await route.fetch();
    const info = await response.json();
    info.contact = [{ method: "nostr", info: "" }];
    await route.fulfill({ response, json: info });
  });
  await wallet.details(MINT_A_URL);
  await expect(
    page.getByRole("button", { name: /Supported features/ })
  ).toBeVisible();
  await expect(
    page.locator(".section-divider-block").filter({ hasText: "Contact" })
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Nostr:/ })).toHaveCount(0);
});

test("the audit retry keeps its row and shows it is busy", async ({ page }) => {
  const wallet = new WalletUi(page);
  let release: (() => void) | undefined;
  let calls = 0;
  await wallet.onboard(MINT_A_URL);
  // After onboarding, so it wins over the page's block on every outside request.
  await page.route(`${AUDITOR}/mints/url**`, async (route) => {
    calls += 1;
    if (calls === 1) return route.abort();
    await new Promise<void>((resolve) => (release = resolve));
    await route.abort();
  });
  await wallet.details(MINT_A_URL);

  const retry = page.getByRole("button", { name: "Refresh", exact: true });
  await expect(retry).toBeVisible();
  await expect(retry).toContainText("Audit info is unavailable right now.");
  const before = (await retry.boundingBox())!;
  expect(Math.abs(before.height - 44)).toBeLessThan(0.6);

  await retry.click();
  await expect(retry).toHaveAttribute("aria-busy", "true");
  await expect(retry.locator(".busy-label")).toContainText("Refresh");
  const busy = (await retry.boundingBox())!;
  expect(Math.abs(busy.y - before.y)).toBeLessThan(0.6);
  expect(Math.abs(busy.height - before.height)).toBeLessThan(0.6);
  await retry.click({ force: true });
  expect(calls).toBe(2);

  await expect.poll(() => Boolean(release)).toBe(true);
  release!();
  await expect(retry).not.toHaveAttribute("aria-busy", "true");
});
