import { expect, test } from "../fixtures/test";
import { MINT_B_URL } from "../fixtures/mint";
import { WalletUi } from "../pages/WalletUi";

async function importBackup(
  wallet: WalletUi,
  buffer: Buffer,
  expectReload = true,
  navigate = true
) {
  if (navigate) await wallet.settings("advanced");
  await wallet.page.getByText("Import wallet backup", { exact: true }).click();
  const chooser = wallet.page.waitForEvent("filechooser");
  await wallet.page
    .getByRole("button", { name: "IMPORT WALLET BACKUP", exact: true })
    .click();
  const reloaded = expectReload
    ? wallet.page.waitForEvent("load")
    : Promise.resolve();
  await (
    await chooser
  ).setFiles({
    name: "test-wallet.json",
    mimeType: "application/json",
    buffer,
  });
  await reloaded;
}

for (const repeatImport of [false, true]) {
  test(
    repeatImport
      ? "reimporting the same backup preserves funds without an unhandled error"
      : "exports and imports a funded wallet with history and spendable funds",
    async ({ page, browser }) => {
      const wallet = new WalletUi(page);
      await wallet.onboard(MINT_B_URL);
      await wallet.mintBolt11(80);
      await wallet.settings("advanced");
      const downloaded = page.waitForEvent("download");
      await page.getByText("Export wallet data", { exact: true }).click();
      const download = await downloaded;
      expect(download.suggestedFilename()).toMatch(/\.json$/);
      const stream = await download.createReadStream();
      const chunks: Buffer[] = [];
      for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
      const backup = Buffer.concat(chunks);
      expect(
        Object.hasOwn(JSON.parse(backup.toString()), "cashu.dexie.db.proofs")
      ).toBe(true);
      const context = await browser.newContext({
        permissions: ["clipboard-read", "clipboard-write"],
        serviceWorkers: "block",
      });
      try {
        const restored = new WalletUi(await context.newPage());
        await restored.onboard(MINT_B_URL);
        await importBackup(restored, backup);
        await restored.home("History");
        await expect.poll(() => restored.balanceSats()).toBe(80);
        await expect(restored.page.getByTestId("history-row")).toHaveCount(1);
        if (repeatImport) {
          const errors: string[] = [];
          restored.page.on("pageerror", (error) => errors.push(error.name));
          let reloaded = false;
          // Subscribe after opening Settings so only the import reload is counted.
          await restored.settings("advanced");
          restored.page.once("load", () => {
            reloaded = true;
          });
          await importBackup(restored, backup, false, false);
          await expect.poll(() => reloaded || errors.length > 0).toBe(true);
          test.fail(
            true,
            "UI-008: importing the same proofs twice raises an unhandled ConstraintError"
          );
          expect(errors).toEqual([]);
          await restored.home("History");
          await expect.poll(() => restored.balanceSats()).toBe(80);
          await expect(restored.page.getByTestId("history-row")).toHaveCount(1);
        }
        await restored.sendEcash(10);
        await expect.poll(() => restored.balanceSats()).toBe(70);
      } finally {
        await context.close();
      }
    }
  );
}

test("rejects invalid backup JSON without damaging current funds", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_B_URL);
  await wallet.mintBolt11(30);
  await importBackup(wallet, Buffer.from("{ not valid JSON"), false);
  await expect(
    page.getByText("Invalid backup file format", { exact: true })
  ).toBeVisible();
  await wallet.home();
  await expect.poll(() => wallet.balanceSats()).toBe(30);
});

test("reveals and copies a seed and restores spendable funds in a fresh wallet", async ({
  page,
  browser,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_B_URL);
  await wallet.mintBolt11(64);
  await wallet.settings("backup");
  await expect(page.locator("textarea")).toHaveValue(/\*/);
  await page.getByTestId("reveal-seed").click();
  const mnemonic = await page.locator("textarea").inputValue();
  expect(mnemonic.split(" ")).toHaveLength(12);
  await page.getByTestId("copy-seed").click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    mnemonic
  );
  await page.reload();
  await expect(page.locator("textarea")).toHaveValue(/\*/);
  const context = await browser.newContext({
    permissions: ["clipboard-read", "clipboard-write"],
    serviceWorkers: "block",
  });
  try {
    const restored = new WalletUi(await context.newPage());
    await restored.onboard(MINT_B_URL);
    await restored.page.goto("/restore");
    await restored.page.locator("textarea").fill("invalid seed phrase");
    await expect(
      restored.page.getByRole("button", { name: /Restore.*mint/i }).first()
    ).toBeDisabled();
    await restored.page.locator("textarea").fill(mnemonic);
    await restored.page
      .getByRole("button", { name: "Select All", exact: true })
      .click();
    await restored.page
      .getByRole("button", { name: /Restore.*mint/i })
      .first()
      .click();
    await expect(
      restored.page.getByText("Successfully restored 1 mint(s)", {
        exact: true,
      })
    ).toBeVisible({ timeout: 60000 });
    await restored.home();
    test.fail(
      true,
      "UI-006: seed restore reports success after a setup-context error"
    );
    await expect.poll(() => restored.balanceSats(), { timeout: 3000 }).toBe(64);
    await restored.sendEcash(4);
    await expect.poll(() => restored.balanceSats()).toBe(60);
  } finally {
    await context.close();
  }
});
