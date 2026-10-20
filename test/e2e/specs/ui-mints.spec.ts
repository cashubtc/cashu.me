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
  await page.locator(".delete-button").click();
  await expect(page.locator(".remove-mint-dialog")).toContainText("45");
  await page.locator(".remove-mint-dialog .remove-btn").click();
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
