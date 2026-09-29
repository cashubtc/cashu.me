import { expect, test } from "../fixtures/test";
import {
  MINT_A_URL,
  MINT_B_URL,
  MINT_C_URL,
  counterpartyRequest,
} from "../fixtures/mint";
import { WalletUi } from "../pages/WalletUi";

test("removing an inactive mint preserves the active mint", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await wallet.addMint(MINT_B_URL);
  await wallet.addMint(MINT_C_URL);
  await expect(wallet.mintCard(MINT_C_URL)).toHaveClass(/q-item--active/);
  await wallet.removeMint(MINT_B_URL);
  await wallet.home("Mints");
  await expect(wallet.mintCard(MINT_B_URL)).toHaveCount(0);
  test.fail(true, "UI-001: removing an inactive mint resets the active mint");
  await expect(wallet.mintCard(MINT_C_URL)).toHaveClass(/q-item--active/, {
    timeout: 3000,
  });
});

async function mintEntries(wallet: WalletUi) {
  return JSON.parse((await wallet.stored("cashu.mints"))!).map(
    ({
      url,
      nickname,
      keys,
      keysets,
    }: {
      url: string;
      nickname?: string;
      keys: unknown;
      keysets: unknown;
    }) => ({ url, nickname, keys, keysets })
  );
}

for (const suffix of ["", "/"]) {
  test(`editing a mint rejects a duplicate URL${
    suffix ? " after normalization" : ""
  }`, async ({ page }) => {
    const wallet = new WalletUi(page);
    await wallet.onboard(MINT_A_URL);
    await wallet.addMint(MINT_B_URL);
    const before = await mintEntries(wallet);
    await wallet.editMint(
      MINT_B_URL,
      "Duplicate",
      ` ${MINT_A_URL}${suffix} `,
      true,
      false
    );
    await expect(
      page.getByRole("alert").filter({ hasText: "Mint already added" })
    ).toBeVisible();
    expect(await mintEntries(wallet)).toEqual(before);
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await page.reload();
    expect(await mintEntries(wallet)).toEqual(before);
  });
}

for (const url of [
  "not a mint url",
  "https://not%20a%20mint",
  "ftp://mint.example",
  "",
]) {
  test(`editing a mint rejects a malformed URL: ${url || "empty"}`, async ({
    page,
  }) => {
    const wallet = new WalletUi(page);
    await wallet.onboard(MINT_A_URL);
    const before = await mintEntries(wallet);
    await wallet.editMint(MINT_A_URL, "Invalid", url, true, false);
    await expect(
      page.getByRole("alert").filter({ hasText: "Invalid URL" })
    ).toBeVisible();
    expect(await mintEntries(wallet)).toEqual(before);
  });
}

test("rejects a structurally invalid backup before writing wallet state", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_B_URL);
  await wallet.settings("advanced");
  await page.getByText("Import wallet backup", { exact: true }).click();
  const chooser = page.waitForEvent("filechooser");
  await page
    .getByRole("button", { name: "IMPORT WALLET BACKUP", exact: true })
    .click();
  let loaded = false;
  page.once("load", () => {
    loaded = true;
  });
  await (
    await chooser
  ).setFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({ "cashu.activeMintUrl": "not a mint url" })
    ),
  });
  await expect
    .poll(
      async () =>
        loaded ||
        (await page
          .locator(".q-notification")
          .filter({ hasText: /invalid|unrecognized/i })
          .isVisible())
    )
    .toBe(true);
  test.fail(
    true,
    "UI-005: structurally invalid backup is accepted and writes state"
  );
  expect(await wallet.stored("cashu.activeMintUrl")).toBe(MINT_B_URL);
});

test("a Lightning deep link parses its prefilled invoice", async ({
  page,
  request,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await wallet.mintBolt11(100);
  const invoice = await counterpartyRequest(request, "bolt11", 10);
  await page.goto(`/?lightning=${encodeURIComponent(invoice)}`);
  await expect(
    page.getByTestId("payment-request-input").locator("textarea")
  ).toHaveValue(invoice);
  test.fail(
    true,
    "UI-004: Lightning deep links fill the input without parsing it"
  );
  await expect(page.getByTestId("pay-payment-request")).toBeVisible({
    timeout: 3000,
  });
});

test("opening a fresh wallet reaches onboarding without unhandled initialization errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const wallet = new WalletUi(page);
  await wallet.goto();
  await expect(page.getByTestId("onboarding-start")).toBeVisible();
  test.fail(
    true,
    "UI-010: the home page initializes Nostr before a fresh wallet has a seed"
  );
  expect(errors).toEqual([]);
});
