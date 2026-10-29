import { expect, test, type Page } from "@playwright/test";
import { WalletPage } from "../pages/WalletPage";

// Owner 2026-10-29, item 16: every onboarding step uses one column, the same on the footer.
// Only the masked seed and empty recovery fields are ever on screen here.

type Box = { x: number; width: number };

async function columnBoxes(page: Page) {
  // Short settle for the carousel's panel swap (reduced motion still swaps panels).
  await page.waitForTimeout(150);
  return page.evaluate(() => {
    const visible = (e: Element) => e.getBoundingClientRect().width > 0;
    const slide = [...document.querySelectorAll(".q-carousel__slide")].find(
      visible
    );
    const box = (e: Element | null | undefined) => {
      if (!e || !visible(e)) return null;
      const r = e.getBoundingClientRect();
      return { x: r.x, width: r.width };
    };
    const blocks = [
      ...(slide?.querySelectorAll(
        "h1, .welcome-slide__description, .welcome-option, .seed-field, .words-grid, .mint-setup-section, .instructions"
      ) ?? []),
    ];
    return {
      column: box(slide?.querySelector("[data-welcome-column]")),
      blocks: blocks.map(box).filter(Boolean) as Box[],
      footer:
        box(document.querySelector(".welcome-footer__row")) ??
        box(slide?.querySelector('[data-testid="onboarding-start"]')),
    };
  });
}

for (const [width, height, content] of [
  [390, 844, 358],
  [1280, 832, 608],
] as const) {
  test(`every welcome step shares one ${content}px column at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    const wallet = new WalletPage(page);
    await wallet.goto();
    await expect(page.getByTestId("onboarding-start")).toBeVisible();

    const expectColumn = async (step: string) => {
      const { column, blocks, footer } = await columnBoxes(page);
      expect(column, step).not.toBeNull();
      expect(Math.abs(column!.width - 32 - content), step).toBeLessThanOrEqual(
        1
      );
      for (const b of [...blocks, footer!]) {
        expect(Math.abs(b.x - column!.x - 16), step).toBeLessThanOrEqual(1);
        expect(Math.abs(b.width - content), step).toBeLessThanOrEqual(1);
      }
    };

    await expectColumn("start");
    await page.getByTestId("onboarding-start").click();
    await expectColumn("install");
    await page.getByTestId("onboarding-next").click();
    await expectColumn("choice");
    await page.getByTestId("onboarding-create-wallet").click();
    await expectColumn("seed");
    await page.getByTestId("onboarding-seed-confirmed").click();
    await page.getByTestId("onboarding-next").click();
    await expect(page.getByTestId("onboarding-mint-url")).toBeVisible();
    await expectColumn("mints");

    const back = page.getByRole("button", { name: "Previous" });
    await back.click();
    await back.click();
    await page.getByTestId("onboarding-recover-wallet").click();
    await expect(page.locator(".words-grid")).toBeVisible();
    await expectColumn("recover");
  });
}

test("the seed phrase is an outlined field, masked until Show", async ({
  page,
}) => {
  const wallet = new WalletPage(page);
  await wallet.goto();
  await page.getByTestId("onboarding-start").click();
  await page.getByTestId("onboarding-next").click();
  await page.getByTestId("onboarding-create-wallet").click();

  const field = page.locator(".seed-field");
  await expect(field.locator(".q-field__label")).toHaveText("Seed phrase");
  await expect(field.locator(".seed-text")).toHaveText(/^[*\s]+$/);
  const edge = await field
    .locator(".q-field__control")
    .evaluate((c) => getComputedStyle(c, "::before").borderTopStyle);
  expect(edge).toBe("solid");
  await expect(page.getByTestId("onboarding-next")).toBeDisabled();
});

// Owner 2026-10-29b, item 6: onboarding scrolls the window, never a box inside it, so on a
// wide screen the scrollbar and the wheel area are the window's (no 640px inner scroller).
test("welcome steps scroll the window, with no nested scroller", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 560 });
  const wallet = new WalletPage(page);
  await wallet.goto();
  await expect(page.getByTestId("onboarding-start")).toBeVisible();

  const scrollers = () =>
    page.evaluate(() => {
      const se = document.scrollingElement!;
      const nested = [...document.querySelectorAll("body *")]
        .filter((e) => {
          // Text areas and menus may scroll themselves; nothing else may.
          if (e.matches("textarea") || e.closest(".q-menu")) return false;
          const overflow = getComputedStyle(e).overflowY;
          return (
            /auto|scroll/.test(overflow) && e.scrollHeight > e.clientHeight + 1
          );
        })
        .map((e) => String(e.className));
      return { nested, documentRange: se.scrollHeight - se.clientHeight };
    });

  const expectWindowScroll = async (step: string) => {
    await page.waitForTimeout(150);
    const { nested } = await scrollers();
    expect(nested, step).toEqual([]);
  };

  await expectWindowScroll("start");
  await page.getByTestId("onboarding-start").click();
  await expectWindowScroll("install");
  // The install step outgrows a 560px window: the document scrolls, also from the gutter.
  expect((await scrollers()).documentRange).toBeGreaterThan(0);
  await page.mouse.move(80, 280);
  await page.mouse.wheel(0, 200);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);
  await expect(page.getByTestId("onboarding-next")).toBeInViewport();

  await page.getByTestId("onboarding-next").click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expectWindowScroll("choice");
  await page.getByTestId("onboarding-create-wallet").click();
  await expectWindowScroll("seed");
  await page.getByTestId("onboarding-seed-confirmed").click();
  await page.getByTestId("onboarding-next").click();
  await expect(page.getByTestId("onboarding-mint-url")).toBeVisible();
  await expectWindowScroll("mints");

  const back = page.getByRole("button", { name: "Previous" });
  await back.click();
  await back.click();
  await page.getByTestId("onboarding-recover-wallet").click();
  await expect(page.locator(".words-grid")).toBeVisible();
  await expectWindowScroll("recover");
});
