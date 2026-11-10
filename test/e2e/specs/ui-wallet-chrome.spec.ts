import type { Page } from "@playwright/test";
import { expect, test } from "../fixtures/test";
import { MINT_A_URL } from "../fixtures/mint";
import { WalletUi } from "../pages/WalletUi";

// Wallet home chrome: the History / Mints tabs, the panel's turning chevron
// (item 6) and the minimal Scan button (item 24).

test.use({ reducedMotion: "no-preference" });
test.beforeEach(({ page }) =>
  page.emulateMedia({ reducedMotion: "no-preference" })
);

const toggle = (page: Page) =>
  page.locator(".wallet-panel .wallet-history-toggle");

/** The selected tab's box, its indicator's box once settled, and the tab's corner radius. */
async function indicatorGeometry(page: Page) {
  const tab = page.locator('[data-testid="wallet-tabs"] .q-tab--active');
  const indicator = tab.locator(".q-tab__indicator");
  await expect
    .poll(() => indicator.evaluate((el) => getComputedStyle(el).transform))
    .toBe("none");
  return {
    tab: (await tab.boundingBox())!,
    indicator: (await indicator.boundingBox())!,
    radius: await tab.evaluate((el) =>
      parseFloat(getComputedStyle(el).borderTopLeftRadius)
    ),
  };
}

test("tab indicator spans the tab less its radius at every width, with no baseline", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  for (const dir of ["ltr", "rtl"]) {
    await page.evaluate(
      (d) => document.documentElement.setAttribute("dir", d),
      dir
    );
    const widths =
      dir === "ltr" ? [320, 390, 599, 600, 1023, 1024, 1280] : [390, 1280];
    for (const width of widths) {
      await page.setViewportSize({ width, height: 800 });
      for (const name of ["History", "Mints"]) {
        await page.getByRole("tab", { name, exact: true }).click();
        await expect(
          page.getByRole("tab", { name, exact: true })
        ).toHaveAttribute("aria-selected", "true");
        const g = await indicatorGeometry(page);
        expect(g.radius).toBe(10);
        const label = `${dir} ${width}px ${name}`;
        expect(
          Math.abs(g.indicator.x - (g.tab.x + g.radius)),
          label
        ).toBeLessThanOrEqual(1);
        expect(
          Math.abs(
            g.tab.x +
              g.tab.width -
              g.radius -
              (g.indicator.x + g.indicator.width)
          ),
          label
        ).toBeLessThanOrEqual(1);
      }
      expect(
        await page
          .getByTestId("wallet-tabs")
          .evaluate((el) => getComputedStyle(el).boxShadow)
      ).toBe("none");
      // The bar sits on the 16px content gutter of its column, not the column's edge.
      const inset = await page.getByTestId("wallet-tabs").evaluate((el) => {
        const bar = el.getBoundingClientRect();
        const col = el.parentElement!.getBoundingClientRect();
        return [
          Math.round(bar.left - col.left),
          Math.round(col.right - bar.right),
        ];
      });
      expect(inset, `${dir} ${width}px gutter`).toEqual([16, 16]);
    }
  }
});

test("tabs switch content by click and arrow keys", async ({ page }) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await page.getByTestId("wallet-tab-history").click();
  await expect(page.getByText("No history yet", { exact: true })).toBeVisible();
  await page.getByTestId("wallet-tab-history").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("wallet-tab-mints")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("wallet-tab-mints")).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await expect(wallet.mintCard(MINT_A_URL)).toBeVisible();
});

test("the panel chevron turns with the panel, by click and keyboard", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await page.setViewportSize({ width: 390, height: 844 });
  const header = toggle(page);
  const icon = header.locator(".expansion-indicator__icon");
  const rotation = () => icon.evaluate((el) => getComputedStyle(el).transform);
  const tabs = page.getByTestId("wallet-tabs");

  const expectState = async (expanded: boolean) => {
    await expect(header).toHaveAttribute("aria-expanded", String(expanded));
    if (expanded) await expect(tabs).toBeVisible();
    else await expect(tabs).toBeHidden();
    await expect(header).toContainText(
      expanded ? "Hide history and mints" : "Show history and mints"
    );
    // Up while open, down while closed: a settled 180° turn or none.
    await expect
      .poll(rotation)
      .toBe(
        expanded ? "matrix(-1, 0, 0, -1, 0, 0)" : "matrix(1, 0, 0, 1, 0, 0)"
      );
  };

  await expectState(true);
  const glyph = await icon.elementHandle();
  await header.click();
  await expectState(false);
  // The same glyph turns; it is not swapped for another.
  expect(await glyph!.evaluate((el) => el.isConnected)).toBe(true);
  await header.focus();
  await page.keyboard.press("Enter");
  await expectState(true);
  await page.keyboard.press("Space");
  await expectState(false);
  // Rapid toggling settles on the last state.
  for (let i = 0; i < 5; i++) await header.click();
  await expectState(true);
  // No second control inside the header.
  await expect(header.locator("button, [role=button]")).toHaveCount(0);

  // Desktop forces the panel open and hides the toggle from the keyboard.
  await header.click();
  await expectState(false);
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(tabs).toBeVisible();
  await expect(header).toBeHidden();
  // Back on a phone the toggle and the panel agree again.
  await page.setViewportSize({ width: 390, height: 844 });
  const expanded = (await header.getAttribute("aria-expanded")) === "true";
  await expectState(expanded);
});

test("the wallet Scan button opens the scanner and returns to the wallet", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await expect(wallet.walletScan).toHaveAccessibleName("Scan");
  // The minimal Scan frame (four corners), not ScanLine's extra bar.
  await expect(wallet.walletScan.locator("svg")).toHaveClass(
    /\blucide-scan-icon\b/
  );
  // It rests on the page with no disc, a 44px+ target that
  // still shows hover and the focus ring.
  const scan = wallet.walletScan;
  await page.mouse.move(0, 0);
  await expect(scan).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  const box = (await scan.boundingBox())!;
  expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
  const helperOpacity = () =>
    scan
      .locator(".q-focus-helper")
      .evaluate((e) => Number(getComputedStyle(e).opacity));
  expect(await helperOpacity()).toBe(0);
  await scan.hover();
  await expect.poll(helperOpacity).toBeGreaterThan(0);
  await page.mouse.move(0, 0);
  await scan.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(scan).toHaveCSS("outline-style", "solid");
  await wallet.walletScan.click();
  await expect(page.locator(".q-dialog:visible").last()).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).last().click();
  await expect(page.locator(".q-dialog:visible")).toHaveCount(0);
  await expect(page.getByTestId("wallet-send")).toBeVisible();
});
