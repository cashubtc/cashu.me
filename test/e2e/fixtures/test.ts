import { test as base } from "@playwright/test";

export { expect } from "@playwright/test";

/** Drain route.fetch handlers before Playwright disposes their API responses. */
export const test = base.extend<{ routeCleanup: void }>({
  routeCleanup: [
    async ({ page }, use) => {
      await use();
      if (!page.isClosed()) await page.unrouteAll({ behavior: "wait" });
    },
    { auto: true },
  ],
});
