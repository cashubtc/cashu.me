import type { Page } from "@playwright/test";
import { expect, test } from "../fixtures/test";
import { MINT_A_URL } from "../fixtures/mint";
import { WalletUi } from "../pages/WalletUi";

// Owner item 7: toasts sit top-centre, newest first, at most two, each fully readable with its
// own 44px close button, and never block taps outside the cards. The toasts come from the app's
// real helpers (src/js/notify.ts), loaded by the dev server as the app loads them.

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

const toasts = (page: Page) => page.getByTestId("app-toast");

/** Settled stack: the messages top to bottom, and each card's box. */
async function stack(page: Page) {
  await expect(page.locator('[class*="q-notification--top-"]')).toHaveCount(0);
  const cards = await toasts(page).all();
  return Promise.all(
    cards.map(async (card) => ({
      text: (await card.locator(".q-notification__message").innerText())
        .split("\n")[0]
        .trim(),
      box: (await card.boundingBox())!,
      close: (await card.getByRole("button", { name: "Close" }).boundingBox())!,
    }))
  );
}

test.describe("toasts", () => {
  test.use({ reducedMotion: "no-preference" });
  test.beforeEach(({ page }) =>
    page.emulateMedia({ reducedMotion: "no-preference" })
  );

  test("stack newest first at the top, two readable cards at most", async ({
    page,
  }) => {
    const wallet = new WalletUi(page);
    await wallet.onboard(MINT_A_URL);

    await toast(page, ["success", "First message"]);
    await expect(toasts(page)).toHaveCount(1);
    let cards = await stack(page);
    // Top-centre: 8px under the (here zero) safe area, centred in the viewport.
    const viewport = page.viewportSize()!;
    expect(Math.round(cards[0].box.y)).toBe(8);
    expect(
      Math.abs(cards[0].box.x + cards[0].box.width / 2 - viewport.width / 2)
    ).toBeLessThanOrEqual(1);
    await expect(toasts(page)).toHaveAttribute("role", "status");

    await toast(page, ["error", "Second message", "With a caption line"]);
    await expect(toasts(page)).toHaveCount(2);
    cards = await stack(page);
    expect(cards.map((c) => c.text)).toEqual([
      "Second message",
      "First message",
    ]);
    expect(
      Math.round(cards[1].box.y - (cards[0].box.y + cards[0].box.height))
    ).toBe(8);
    for (const card of cards) {
      expect(card.close.width).toBeGreaterThanOrEqual(44);
      expect(card.close.height).toBeGreaterThanOrEqual(44);
    }
    await expect(toasts(page).first()).toHaveAttribute("role", "alert");
    await expect(page.getByText("With a caption line")).toBeVisible();

    // A third dismisses the oldest; identical messages are separate toasts (no grouping badge).
    await toast(page, ["info", "Third message"]);
    await expect(toasts(page)).toHaveCount(2);
    expect((await stack(page)).map((c) => c.text)).toEqual([
      "Third message",
      "Second message",
    ]);
    await toast(page, ["info", "Same"], ["info", "Same"], ["info", "Same"]);
    await expect(toasts(page)).toHaveCount(2);
    expect((await stack(page)).map((c) => c.text)).toEqual(["Same", "Same"]);
    await expect(page.locator(".q-notification__badge")).toHaveCount(0);

    // No bottom list in use.
    await expect(
      page.locator(".q-notifications__list--bottom .q-notification")
    ).toHaveCount(0);
  });

  test("close removes only its own toast, and taps outside the cards go through", async ({
    page,
  }) => {
    const wallet = new WalletUi(page);
    await wallet.onboard(MINT_A_URL);

    await toast(page, ["success", "Older"], ["warning", "Newer"]);
    await expect(toasts(page)).toHaveCount(2);
    // Appearing does not take focus.
    await expect(page.locator(".q-notification :focus")).toHaveCount(0);

    await toasts(page)
      .filter({ hasText: "Newer" })
      .getByRole("button", { name: "Close" })
      .click();
    await expect(toasts(page)).toHaveCount(1);
    await expect(toasts(page)).toContainText("Older");
    // The survivor moves up into the vacated place.
    await expect
      .poll(async () => Math.round((await stack(page))[0].box.y))
      .toBe(8);

    await toast(page, ["info", "Newest"]);
    await expect(toasts(page)).toHaveCount(2);
    await toasts(page)
      .filter({ hasText: "Older" })
      .getByRole("button", { name: "Close" })
      .click();
    await expect(toasts(page)).toHaveCount(1);
    await expect(toasts(page)).toContainText("Newest");

    // Keyboard reaches the close control.
    const close = toasts(page).getByRole("button", { name: "Close" });
    await close.focus();
    await expect(close).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(toasts(page)).toHaveCount(0);

    // A toast over the wallet leaves the controls beside it usable.
    await toast(page, ["info", "Over the wallet"]);
    await expect(toasts(page)).toHaveCount(1);
    await page.getByTestId("wallet-send").click();
    await expect(page.locator(".q-dialog:visible").last()).toBeVisible();
    // Toasts sit above an open dialog.
    await toast(page, ["success", "Over the dialog"]);
    const card = toasts(page).filter({ hasText: "Over the dialog" });
    const box = (await card.boundingBox())!;
    const hit = await page.evaluate(
      ([x, y]) =>
        document.elementFromPoint(x, y)?.closest(".q-notification") !== null,
      [box.x + box.width / 2, box.y + box.height / 2]
    );
    expect(hit).toBe(true);
  });

  test("long right-to-left message wraps inside the card", async ({ page }) => {
    const wallet = new WalletUi(page);
    await wallet.onboard(MINT_A_URL);
    await page.setViewportSize({ width: 320, height: 640 });
    await page.evaluate(() =>
      document.documentElement.setAttribute("dir", "rtl")
    );
    const long =
      "تعذّر الاتصال بالمِنْت. تحقق من اتصالك بالإنترنت ثم حاول مرة أخرى بعد قليل.";
    await toast(page, ["error", long], ["success", "₿500"]);
    const cards = await stack(page);
    expect(cards).toHaveLength(2);
    for (const c of cards) {
      expect(c.box.x).toBeGreaterThanOrEqual(16 - 1);
      expect(c.box.x + c.box.width).toBeLessThanOrEqual(320 - 16 + 1);
    }
    await expect(toasts(page).filter({ hasText: "تعذّر" })).toContainText(
      "مرة أخرى بعد قليل"
    );
    expect(cards[1].box.y).toBeGreaterThan(
      cards[0].box.y + cards[0].box.height
    );
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
    const card = toasts(page);
    await expect(card).toHaveCount(1);
    expect(
      await card.evaluate((el) => getComputedStyle(el).transitionDuration)
    ).toMatch(/^0s(, 0s)*$/);
  });
});
