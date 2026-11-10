import type { Page } from "@playwright/test";
import { expect, test } from "../fixtures/test";
import { MINT_A_URL } from "../fixtures/mint";
import { WalletUi } from "../pages/WalletUi";

// Toasts are Sonner as on kelbie.dev: top-centre, the newest in front with older
// ones tucked behind, each leaving on its own, never blocking taps outside the cards.
// The toasts come from the app's real helpers (src/js/notify.ts), loaded by the dev server.

type Kind = "success" | "error" | "warning" | "info" | "copied";

/** Calls the app's own notify helpers in order, in one task (a burst). */
async function toast(page: Page, ...messages: [Kind, string, string?][]) {
  await page.evaluate(
    `import("/src/js/notify.ts").then((n) => {
      for (const [kind, message, caption] of ${JSON.stringify(messages)}) {
        if (kind === "success") n.notifySuccess(message);
        else if (kind === "error") n.notifyError(message, caption);
        else if (kind === "warning") n.notifyWarning(message, caption);
        else if (kind === "copied") n.notifyCopied(message);
        else n.notify(message);
      }
    })`
  );
}

const toasts = (page: Page) =>
  page.locator("[data-sonner-toast]:not([data-removed='true'])");
const front = (page: Page) =>
  toasts(page).and(page.locator("[data-front='true']"));

// The stack's top edge: under the 56px header on a phone (so a toast never covers the back or
// close button), 16px from the top on wider screens (Sonner's mobile breakpoint is 600px).
const topEdge = (page: Page) => (page.viewportSize()!.width > 600 ? 16 : 60);

test.describe("toasts", () => {
  test.use({ reducedMotion: "no-preference" });
  test.beforeEach(({ page }) =>
    page.emulateMedia({ reducedMotion: "no-preference" })
  );

  test("sit top-centre, newest in front, fanning out on hover", async ({
    page,
  }) => {
    const wallet = new WalletUi(page);
    await wallet.onboard(MINT_A_URL);

    await toast(page, ["success", "First message"]);
    await expect(toasts(page)).toHaveCount(1);
    await expect(front(page)).toHaveAttribute("data-mounted", "true");
    await expect
      .poll(async () => Math.round((await front(page).boundingBox())!.y))
      .toBe(topEdge(page));
    const box = (await front(page).boundingBox())!;
    expect(
      Math.abs(box.x + box.width / 2 - page.viewportSize()!.width / 2)
    ).toBeLessThanOrEqual(1);

    await toast(page, ["error", "Second message", "With a caption line"]);
    await expect(toasts(page)).toHaveCount(2);
    await expect(front(page)).toContainText("Second message");
    await expect(front(page)).toContainText("With a caption line");

    // Hovering the stack spreads it so every card is readable.
    await front(page).hover();
    await expect
      .poll(async () => {
        const [a, b] = await Promise.all(
          (await toasts(page).all()).map(async (t) => (await t.boundingBox())!)
        );
        return Math.round(Math.abs(a.y - b.y));
      })
      .toBeGreaterThan(40);
  });

  test("goes on its own, and taps outside the cards go through", async ({
    page,
  }) => {
    const wallet = new WalletUi(page);
    await wallet.onboard(MINT_A_URL);

    // A copy confirmation is short: it leaves after two seconds without being touched, and
    // appearing never takes focus.
    await toast(page, ["copied", "Copied"]);
    await expect(toasts(page)).toHaveCount(1);
    await expect(page.locator("[data-sonner-toast] :focus")).toHaveCount(0);
    await expect(toasts(page)).toHaveCount(0, { timeout: 4000 });

    // A toast over the wallet leaves the controls beside it usable, and sits above a dialog.
    await toast(page, ["info", "Over the wallet"]);
    await expect(toasts(page)).toHaveCount(1);
    await page.getByTestId("wallet-send").click();
    await expect(page.locator(".q-dialog:visible").last()).toBeVisible();
    await toast(page, ["success", "Over the dialog"]);
    const card = toasts(page).filter({ hasText: "Over the dialog" });
    const box = (await card.boundingBox())!;
    const hit = await page.evaluate(
      ([x, y]) =>
        document.elementFromPoint(x, y)?.closest("[data-sonner-toast]") !==
        null,
      [box.x + box.width / 2, box.y + box.height / 2]
    );
    expect(hit).toBe(true);
  });

  test("long right-to-left message wraps inside the card", async ({ page }) => {
    const wallet = new WalletUi(page);
    await wallet.onboard(MINT_A_URL);
    await page.setViewportSize({ width: 320, height: 640 });
    const long =
      "تعذّر الاتصال بالمِنْت. تحقق من اتصالك بالإنترنت ثم حاول مرة أخرى بعد قليل.";
    await toast(page, ["error", long]);
    // Shrinking the viewport past Sonner's 600px breakpoint slides the stack from its centred
    // desktop place to the phone insets (Sonner's own 400ms transform transition), so measure
    // where it settles.
    await expect
      .poll(async () => {
        const box = (await front(page).boundingBox())!;
        return [Math.round(box.x), Math.round(box.x + box.width)];
      })
      .toEqual([16, 320 - 16]);
    await expect(front(page)).toContainText("مرة أخرى بعد قليل");
  });
});

test.describe("toasts under reduced motion", () => {
  // The context option alone left prefers-reduced-motion unmatched in Chromium here.
  test.use({ reducedMotion: "reduce" });
  test.beforeEach(({ page }) => page.emulateMedia({ reducedMotion: "reduce" }));

  test("are placed and removed at once", async ({ page }) => {
    const wallet = new WalletUi(page);
    await wallet.onboard(MINT_A_URL);
    await toast(page, ["info", "Still"]);
    await expect(toasts(page)).toHaveCount(1);
    expect(
      await front(page).evaluate(
        (el) => getComputedStyle(el).transitionDuration
      )
    ).toMatch(/^0s(, 0s)*$/);
  });
});
