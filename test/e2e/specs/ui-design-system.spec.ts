import { expect, test } from "../fixtures/test";
import type { Locator, Page } from "@playwright/test";
import { MINT_A_URL } from "../fixtures/mint";
import { WalletUi } from "../pages/WalletUi";
import { disableAutomaticChecks, holdIncomingQuote } from "../fixtures/ui";

// The design system board (/design-system) renders each sample like the app. A board sample
// that sits under the wrong ancestor (once, the settings column around every sample) or rebuilds
// a component from parts drifts from the app while looking plausible. These pairs measure the
// same real element in the app and on the board and require the same computed geometry, type
// and colour (owner 2026-10-29b, item 9).

/** An element's box, and the type and colour of the text inside it. */
type Metrics = {
  height: number;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  color: string;
  whiteSpace: string;
  /** Distance between the element's first glyph's and its label's vertical centres, in px. */
  iconOffset: number | null;
  /** How many lines the label wraps to. */
  labelLines: number;
};

/** Measures `el`; type and colour come from its `label` part (the element itself if none). */
async function metrics(el: Locator, label?: string): Promise<Metrics> {
  await el.scrollIntoViewIfNeeded();
  return el.evaluate((node, labelSelector) => {
    const text = (
      labelSelector ? node.querySelector(labelSelector) : node
    ) as HTMLElement;
    const style = getComputedStyle(text);
    const svg = node.querySelector("svg");
    const centre = (r: DOMRect) => r.top + r.height / 2;
    const range = document.createRange();
    range.selectNodeContents(text);
    const lines = new Set(
      [...range.getClientRects()]
        .filter((r) => r.width > 0)
        .map((r) => Math.round(r.top))
    );
    return {
      height: Math.round(node.getBoundingClientRect().height * 10) / 10,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      lineHeight: style.lineHeight,
      color: style.color,
      whiteSpace: style.whiteSpace,
      iconOffset:
        svg && text !== node
          ? Math.abs(
              centre(svg.getBoundingClientRect()) -
                centre(text.getBoundingClientRect())
            )
          : null,
      labelLines: lines.size,
    };
  }, label);
}

function expectSame(board: Metrics, app: Metrics) {
  expect(board.height).toBeCloseTo(app.height, 0);
  expect(board.fontSize).toBe(app.fontSize);
  expect(board.fontWeight).toBe(app.fontWeight);
  expect(board.lineHeight).toBe(app.lineHeight);
  expect(board.color).toBe(app.color);
  expect(board.whiteSpace).toBe(app.whiteSpace);
  expect(board.labelLines).toBe(app.labelLines);
  if (app.iconOffset !== null) {
    expect(board.iconOffset).not.toBeNull();
    expect(Math.abs(board.iconOffset! - app.iconOffset)).toBeLessThan(1);
  }
}

async function openBoard(page: Page) {
  await page.goto("/design-system");
  await expect(page.locator("[data-ds-entry]").first()).toBeVisible();
}

/** The sample stage of a board entry. */
function sample(page: Page, id: string) {
  return page.locator(`#ds-${id} .ds-entry__sample`);
}

test("the board's History sample renders like the wallet's History", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await disableAutomaticChecks(wallet);
  // A pending incoming invoice, so the wallet's History has a Check status action.
  await holdIncomingQuote(wallet, MINT_A_URL, "bolt11");
  await wallet.openReceive("lightning");
  await wallet.enterAmount(27);
  const created = page.waitForResponse(
    (r) =>
      r.url() === `${MINT_A_URL}/v1/mint/quote/bolt11` &&
      r.request().method() === "POST"
  );
  await page.getByTestId("create-payment-request").click();
  await created;
  await wallet.closeFullscreenDialog();
  await wallet.home("History");

  const appRow = page
    .getByTestId("history-row")
    .filter({ has: page.getByTestId("history-check") })
    .first();
  const app = {
    check: await metrics(
      appRow.getByTestId("history-check"),
      ".history-check-btn__label"
    ),
    row: await metrics(appRow, ".activity-row__label"),
    amount: await metrics(appRow.locator(".activity-row__amount")),
    filter: await metrics(
      page.locator(".history-filter-btn").first(),
      ".q-btn__content"
    ),
  };
  // The app's own check action: icon and label on one line, a 44px target.
  expect(app.check.labelLines).toBe(1);
  expect(app.check.iconOffset!).toBeLessThan(1.5);
  expect(app.check.height).toBeGreaterThanOrEqual(44);

  await openBoard(page);
  const history = sample(page, "history");
  // The board's own data, never the wallet's: the wallet's pending ₿27 isn't on it.
  await expect(history.getByTestId("history-row").first()).toBeVisible();
  await expect(history).not.toContainText("₿27");
  await expect(history.locator(".q-pagination")).toBeVisible();
  // Not under a settings ancestor (History never sits in the settings column).
  expect(await history.evaluate((e) => !!e.closest(".settings-view"))).toBe(
    false
  );

  const boardRow = history
    .getByTestId("history-row")
    .filter({ has: page.getByTestId("history-check") })
    .first();
  expectSame(
    await metrics(
      boardRow.getByTestId("history-check"),
      ".history-check-btn__label"
    ),
    app.check
  );
  expectSame(await metrics(boardRow, ".activity-row__label"), app.row);
  expectSame(
    await metrics(boardRow.locator(".activity-row__amount")),
    app.amount
  );
  expectSame(
    await metrics(
      history.locator(".history-filter-btn").first(),
      ".q-btn__content"
    ),
    app.filter
  );

  // Fixture rows are inert: Check status opens nothing and changes nothing.
  await boardRow.getByTestId("history-check").click();
  await expect(page.locator(".q-dialog:visible")).toHaveCount(0);

  // Page numbers sit on one line, as in the app's pagination.
  const cells = history.locator(".q-pagination .q-btn");
  const tops = await cells.evaluateAll((els) =>
    els.map((e) => Math.round(e.getBoundingClientRect().top))
  );
  expect(new Set(tops).size).toBe(1);
});

test("the board's settings rows render like the settings pages", async ({
  page,
}) => {
  const wallet = new WalletUi(page);
  await wallet.onboard(MINT_A_URL);
  await wallet.settings("about");
  const appRow = page.locator(".settings-view .settings-menu-item").first();
  const app = {
    row: await metrics(appRow, ".q-item__label"),
    caption: await metrics(appRow, ".q-item__label--caption"),
  };

  await openBoard(page);
  const links = sample(page, "settings-link-row");
  // Settings samples get the settings column from their registry context.
  expect(
    await links.evaluate((e) => e.classList.contains("settings-view"))
  ).toBe(true);
  const boardRow = links.locator(".settings-menu-item").first();
  expectSame(await metrics(boardRow, ".q-item__label"), app.row);
  expectSame(await metrics(boardRow, ".q-item__label--caption"), app.caption);
});

// Owner 2026-10-29b, items 2 and 10: the board's rows show the real colours. Every detail row's
// trailing glyph is its value's colour; a met threshold and Paid read in the theme's positive
// colour after a check, the pending states stay muted after a clock or dots.
test("the board's detail, confirmation and status rows show their colours", async ({
  page,
}) => {
  await openBoard(page);
  const positive = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.className = "text-positive";
    document.body.append(probe);
    const colour = getComputedStyle(probe).color;
    probe.remove();
    return colour;
  });

  const details = sample(page, "detail-row");
  await details.scrollIntoViewIfNeeded();
  const glyphs = await details
    .locator(".detail-item:has(.detail-value svg)")
    .evaluateAll((rows) =>
      rows.map((row) => {
        const value = row.querySelector(".detail-value")!;
        const text = value.querySelector(".detail-value__text") ?? value;
        return [
          getComputedStyle(text).color,
          getComputedStyle(value.querySelector("svg")!).color,
        ];
      })
    );
  expect(glyphs.length).toBeGreaterThanOrEqual(3);
  for (const [text, glyph] of glyphs) expect(glyph).toBe(text);

  const confirmations = sample(page, "confirmations-row").getByTestId(
    "confirmations-value"
  );
  await expect(confirmations).toHaveText(["1/3", "3/3"]);
  const colour = (l: Locator) => l.evaluate((e) => getComputedStyle(e).color);
  expect(await colour(confirmations.nth(1))).toBe(positive);
  expect(await colour(confirmations.nth(0))).not.toBe(positive);
  await expect(
    confirmations.nth(1).locator(".lucide-circle-check-icon")
  ).toHaveCount(1);
  await expect(confirmations.nth(0).locator(".lucide-clock-icon")).toHaveCount(
    1
  );

  const status = sample(page, "onchain-status").getByTestId("quote-status");
  await expect(status).toHaveText([
    "Waiting for payment",
    "Confirming (1/3)",
    "Issuing ecash",
    "Paid",
  ]);
  expect(await colour(status.nth(3))).toBe(positive);
  for (const i of [0, 1, 2])
    expect(await colour(status.nth(i))).not.toBe(positive);
});
