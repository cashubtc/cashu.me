import { type Page } from "@playwright/test";
import { expect, test } from "../fixtures/test";
import { WalletPage } from "../pages/WalletPage";
import { WALLET_MUTEX_NAME } from "../../../src/js/walletMutex";

async function openTerms(page: Page) {
  await page.goto("/terms");
  await expect(
    page.getByRole("heading", { name: "Terms", exact: true })
  ).toBeVisible();
}

function acquireWalletLock(page: Page) {
  return page.evaluateHandle(async (modulePath) => {
    const { requestWalletLock } = await import(modulePath);
    return await requestWalletLock();
  }, "/src/js/walletMutex.ts");
}

async function expectPendingLock(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(async (name) => {
        const { pending } = await navigator.locks.query();
        return pending.some((lock) => lock.name === name);
      }, WALLET_MUTEX_NAME)
    )
    .toBe(true);
}

test("serializes native wallet locks across pages", async ({
  page,
  context,
}) => {
  await openTerms(page);
  const other = await context.newPage();
  try {
    await openTerms(other);
    const release = await acquireWalletLock(page);
    const waiting = acquireWalletLock(other);
    void waiting.catch(() => {});

    await expectPendingLock(page);
    await release.evaluate((unlock) => unlock());
    const releaseNext = await waiting;
    await releaseNext.evaluate((unlock) => unlock());

    const { held, pending } = await page.evaluate(() =>
      navigator.locks.query()
    );
    expect(held.some((lock) => lock.name === WALLET_MUTEX_NAME)).toBe(false);
    expect(pending.some((lock) => lock.name === WALLET_MUTEX_NAME)).toBe(false);
  } finally {
    await other.close();
  }
});

test("releases a native wallet lock when its page closes", async ({
  page,
  context,
}) => {
  await openTerms(page);
  const owner = await context.newPage();
  try {
    await openTerms(owner);
    await acquireWalletLock(owner);
    const waiting = acquireWalletLock(page);
    void waiting.catch(() => {});

    await expectPendingLock(page);
    await owner.close();
    const release = await waiting;
    await release.evaluate((unlock) => unlock());
  } finally {
    if (!owner.isClosed()) await owner.close();
  }
});

for (const native of [true, false]) {
  test(`keeps the already-running guard with Web Locks ${
    native ? "available" : "unavailable"
  }`, async ({ page, context }) => {
    await context.addInitScript((useNativeLocks) => {
      localStorage.setItem("cashu.welcome.showWelcome", "false");
      localStorage.setItem("cashu.welcome.termsAccepted", "true");
      if (!useNativeLocks) {
        Object.defineProperty(navigator, "locks", { value: undefined });
      }
    }, native);

    await new WalletPage(page).goto();
    await expect(page.getByTestId("wallet-send")).toBeVisible();
    // Legacy migration completes after the tab guard has registered.
    await expect
      .poll(() =>
        page.evaluate(() => localStorage.getItem("cashu.dexie.migrated"))
      )
      .toBe("true");
    expect(
      await page.evaluate(() => typeof navigator.locks?.request === "function")
    ).toBe(native);

    const other = await context.newPage();
    try {
      await new WalletPage(other).goto();
      await expect(other).toHaveURL(/\/already-running$/);
      await expect(page.getByTestId("wallet-send")).toBeVisible();
    } finally {
      await other.close();
    }
  });
}
