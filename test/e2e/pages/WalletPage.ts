import { expect, type Page } from "@playwright/test";

export class WalletPage {
  private networkHardened = false;

  constructor(readonly page: Page) {}

  get balance() {
    return this.page.getByTestId("wallet-balance").filter({ visible: true });
  }

  async goto() {
    if (!this.networkHardened) {
      await this.page.route("**/*", async (route) => {
        const url = new URL(route.request().url());
        if (url.hostname === "127.0.0.1" || url.hostname === "localhost") {
          await route.continue();
        } else {
          await route.abort("blockedbyclient");
        }
      });
      await this.page.routeWebSocket("wss://**/*", (socket) => socket.close());
      this.networkHardened = true;
    }
    await this.page.goto("/");
  }

  async onboard(mintUrl: string) {
    await this.goto();
    await this.page.getByTestId("onboarding-start").click();
    await this.page.getByTestId("onboarding-next").click();
    await this.page.getByTestId("onboarding-create-wallet").click();
    await this.page.getByTestId("onboarding-seed-confirmed").click();
    await this.page.getByTestId("onboarding-next").click();

    const mintInput = this.page
      .getByTestId("onboarding-mint-url")
      .locator("input");
    await mintInput.fill(mintUrl);
    await this.page.getByTestId("onboarding-add-mint").click();
    await this.page.getByTestId("confirm-add-mint").click();
    await expect(
      this.page
        .getByText(mintUrl, { exact: true })
        .filter({ visible: true })
        .first()
    ).toBeVisible();

    await this.page.getByTestId("onboarding-next").click();
    await expect(this.page.getByTestId("wallet-send")).toBeVisible();
    await expect(this.balance).toBeVisible();
  }

  async balanceSats() {
    await expect(this.balance).toHaveAttribute("data-unit", "sat");
    const text = (await this.balance.innerText()).replace(/[^0-9-]/g, "");
    return Number(text);
  }

  async enterAmount(amount: number) {
    const keyboard = this.page.locator(".numeric-keyboard:visible");
    await expect(keyboard).toBeVisible();
    for (const digit of String(amount)) {
      await keyboard.getByRole("button", { name: digit, exact: true }).click();
    }
  }

  async closeFullscreenDialog() {
    const close = this.page.locator("button.floating-close-btn:visible");
    if (await close.count()) await close.first().click();
  }

  async openReceive(method: "lightning" | "onchain" | "ecash") {
    await this.page.getByTestId("wallet-receive").click();
    await this.page.getByTestId(`receive-${method}-option`).click();
  }

  async openSend(method: "lightning" | "onchain" | "ecash") {
    await this.page.getByTestId("wallet-send").click();
    await this.page.getByTestId(`send-${method}-option`).click();
  }

  async mintBolt11(amount: number) {
    const before = await this.balanceSats();
    await this.openReceive("lightning");
    await expect(
      this.page.getByText("Receive Lightning", { exact: true })
    ).toBeVisible();
    await this.enterAmount(amount);
    await this.page.getByTestId("create-payment-request").click();
    await expect.poll(() => this.balanceSats()).toBe(before + amount);
    await this.closeFullscreenDialog();
  }

  async mintBolt12(amount: number) {
    const before = await this.balanceSats();
    await this.openReceive("lightning");
    await this.page.getByRole("button", { name: "B11", exact: true }).click();
    await expect(
      this.page.getByText("Receive Bolt12", { exact: true })
    ).toBeVisible();
    await this.page
      .getByRole("button", { name: "Add amount", exact: true })
      .click();
    await this.enterAmount(amount);
    await this.page.getByTestId("create-payment-request").click();
    await expect.poll(() => this.balanceSats()).toBe(before + amount);
    await this.closeFullscreenDialog();
  }

  async mintOnchain(expectedAmount = 1_000) {
    const before = await this.balanceSats();
    await this.openReceive("onchain");
    await expect(
      this.page.getByText("Receive On-chain", { exact: true })
    ).toBeVisible();
    await this.page.getByTestId("create-payment-request").click();
    await expect.poll(() => this.balanceSats()).toBe(before + expectedAmount);
    await this.closeFullscreenDialog();
  }

  async payRequest(request: string, amount?: number) {
    await this.quoteRequest(request, amount);

    const pay = this.page.getByTestId("pay-payment-request");
    await expect(pay).toBeEnabled();
    await pay.click();
    await expect(this.page.getByText("Paid", { exact: false })).toBeVisible();
    await this.page.getByRole("button", { name: "Close", exact: true }).click();
  }

  async quoteRequest(request: string, amount?: number, expectPayButton = true) {
    const input = this.page
      .getByTestId("payment-request-input")
      .locator("textarea");
    await input.fill(request);

    if (amount !== undefined) {
      await this.enterAmount(amount);
      const quote = this.page.getByTestId("quote-payment-request");
      if (await quote.isEnabled()) {
        await quote.click();
      }
    } else if (expectPayButton) {
      await expect(this.page.getByTestId("pay-payment-request")).toBeVisible();
    }
  }
}
