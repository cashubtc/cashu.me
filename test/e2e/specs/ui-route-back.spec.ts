import type { Page } from "@playwright/test";
import { expect, test } from "../fixtures/test";
import { MINT_A_URL } from "../fixtures/mint";
import { WalletUi } from "../pages/WalletUi";

// Owner item 17: Back on many pages showed a blank screen. The page transition waited forever on
// pages whose template compiled to a fragment (a leading comment), leaving only its placeholder.
// Every step here is client navigation (header Back, browser history, router links); page.goto
// would remount the app and hide the defect. Only the last test starts from fresh direct entries.

/** Client-side push through the app's own router, for a destination with no visible link (404). */
async function routerPush(page: Page, path: string) {
  await page.evaluate((target) => {
    const root = document.querySelector("#q-app") as unknown as {
      __vue_app__: {
        config: { globalProperties: { $router: { push(p: string): unknown } } };
      };
    };
    return root.__vue_app__.config.globalProperties.$router.push(target);
  }, path);
}

/** Page errors and transition warnings raised after onboarding. */
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "warning" && /Transition|out-in/i.test(m.text()))
      errors.push(`warning: ${m.text()}`);
  });
  return errors;
}

/** One visible, destination-specific control per page. */
const anchors = (page: Page) => ({
  settings: page.getByText("Privacy", { exact: true }),
  privacy: page.locator(".settings-page-header", { hasText: "Privacy" }),
  appearance: page.locator(".settings-page-header", { hasText: "Appearance" }),
  notFound: page.getByText("Go back home", { exact: true }),
  details: page.getByTestId("mint-edit"),
  ratings: page.getByRole("button", { name: "Write a review" }).first(),
  review: page.getByText("Publishing as").first(),
});

async function expectWallet(page: Page) {
  await expect.poll(() => new URL(page.url()).pathname).toBe("/");
  await expect(page.locator(".wallet-hero")).toBeVisible();
  await expect(page.getByTestId("fullscreen-route")).toHaveCount(0);
  await page.getByTestId("wallet-send").click({ trial: true });
}

for (const motion of ["no-preference", "reduce"] as const) {
  test.describe(`Back renders its destination (${motion} motion)`, () => {
    test.use({ reducedMotion: motion });

    test("settings, unknown route and sub-pages", async ({ page }) => {
      const wallet = new WalletUi(page);
      await wallet.onboard(MINT_A_URL);
      const errors = watchErrors(page);
      const a = anchors(page);

      // Wallet → Settings → browser Back: a layout switch.
      await page.getByRole("button", { name: "Settings", exact: true }).click();
      await wallet.expectFullscreenPage("/settings", a.settings);
      await page.goBack();
      await expectWallet(page);
      await page.goForward();
      await wallet.expectFullscreenPage("/settings", a.settings);

      // Settings → unknown route → Back → Forward → Back (the page that used to blank).
      await routerPush(page, "/no-such-page");
      await wallet.expectFullscreenPage("/no-such-page", a.notFound);
      await page.goBack();
      await wallet.expectFullscreenPage("/settings", a.settings);
      await page.goForward();
      await wallet.expectFullscreenPage("/no-such-page", a.notFound);
      await page.goBack();
      await wallet.expectFullscreenPage("/settings", a.settings);

      // Settings → Privacy → header Back; Appearance → header Back → wallet.
      await a.settings.click();
      await wallet.expectFullscreenPage("/settings/privacy", a.privacy);
      await wallet.fullscreenBack();
      await wallet.expectFullscreenPage("/settings", a.settings);
      await page.getByText("Appearance", { exact: true }).click();
      await wallet.expectFullscreenPage("/settings/appearance", a.appearance);
      await wallet.fullscreenBack();
      await wallet.expectFullscreenPage("/settings", a.settings);
      await wallet.fullscreenBack();
      await expectWallet(page);

      // Rapid Back/Forward while the transitions are still running.
      await page.goForward();
      await wallet.expectFullscreenPage("/settings", a.settings);
      await routerPush(page, "/no-such-page");
      await wallet.expectFullscreenPage("/no-such-page", a.notFound);
      for (let i = 0; i < 3; i++) {
        await page.evaluate(() => history.back());
        await page.evaluate(() => history.forward());
      }
      await page.evaluate(() => history.back());
      await wallet.expectFullscreenPage("/settings", a.settings);

      expect(errors).toEqual([]);
    });

    test("mint details, ratings and create review", async ({ page }) => {
      const wallet = new WalletUi(page);
      await wallet.onboard(MINT_A_URL);
      const errors = watchErrors(page);
      const a = anchors(page);

      await page.getByRole("tab", { name: "Mints", exact: true }).click();
      await wallet.mintCard(MINT_A_URL).getByTestId("mint-details").click();
      await wallet.expectFullscreenPage("/mintdetails", a.details);

      // Mint details → Ratings → header Back, then browser Back.
      await routerPush(
        page,
        `/mintratings?mintUrl=${encodeURIComponent(MINT_A_URL)}`
      );
      await wallet.expectFullscreenPage("/mintratings", a.ratings);
      await wallet.fullscreenBack();
      await wallet.expectFullscreenPage("/mintdetails", a.details);
      await page.goForward();
      await wallet.expectFullscreenPage("/mintratings", a.ratings);
      await page.goBack();
      await wallet.expectFullscreenPage("/mintdetails", a.details);

      // Ratings → Create review → Back → Back.
      await page.goForward();
      await wallet.expectFullscreenPage("/mintratings", a.ratings);
      await a.ratings.click();
      await wallet.expectFullscreenPage("/createreview", a.review);
      await wallet.fullscreenBack();
      await wallet.expectFullscreenPage("/mintratings", a.ratings);
      await wallet.fullscreenBack();
      await wallet.expectFullscreenPage("/mintdetails", a.details);

      // A sheet opened and dismissed before Back leaves no backdrop over the destination.
      await a.details.click();
      const sheet = page.locator(".edit-mint-dialog");
      await expect(sheet).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(sheet).toBeHidden();
      await wallet.fullscreenBack();
      await expectWallet(page);
      await expect(page.locator(".q-dialog__backdrop:visible")).toHaveCount(0);
      await page.getByRole("tab", { name: "History", exact: true }).click();
      await expect(
        page.getByRole("tab", { name: "History", exact: true })
      ).toHaveAttribute("aria-selected", "true");

      expect(errors).toEqual([]);
    });
  });
}

test("header Back from a fresh direct entry climbs to the parent route", async ({
  page,
  context,
}) => {
  await new WalletUi(page).onboard(MINT_A_URL);
  // Each case opens its own tab, so there is no in-app history to go back through. Only one tab
  // runs at a time: the wallet blocks a second live instance.
  await page.close();
  for (const [entry, parent] of [
    ["/settings/privacy", "/settings"],
    ["/settings", "/"],
  ]) {
    const fresh = await context.newPage();
    const wallet = new WalletUi(fresh);
    const a = anchors(fresh);
    await fresh.goto(entry);
    await wallet.expectFullscreenPage(
      entry,
      entry === "/settings" ? a.settings : a.privacy
    );
    await wallet.fullscreenBack();
    if (parent === "/") await expectWallet(fresh);
    else await wallet.expectFullscreenPage(parent, a.settings);
    await fresh.close();
  }
});
