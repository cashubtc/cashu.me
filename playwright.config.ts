import { defineConfig, devices } from "@playwright/test";

const appUrl = process.env.E2E_APP_URL ?? "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "test/e2e/specs",
  outputDir: "test-results",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  timeout: 90_000,
  expect: {
    timeout: 20_000,
  },
  reporter: process.env.CI
    ? [["line"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL: appUrl,
    locale: "en-US",
    permissions: ["clipboard-read", "clipboard-write"],
    reducedMotion: "reduce",
    serviceWorkers: "block",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: process.env.E2E_VIDEO === "on" ? "on" : "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --port 4173",
    env: {
      ...process.env,
      E2E: "true",
    },
    url: appUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
