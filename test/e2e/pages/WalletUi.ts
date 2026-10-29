import { expect, type Locator, type Page } from "@playwright/test";
import { WalletPage } from "./WalletPage";

/** All mutations under test go through visible controls. Storage reads are oracles only. */
export class WalletUi extends WalletPage {
  constructor(page: Page) {
    super(page);
  }

  async home(tab?: "Mints" | "History") {
    await this.page.goto("/");
    // The wallet's hero (Receive and Send only show once the wallet has a mint).
    await expect(this.page.locator(".wallet-hero")).toBeVisible();
    if (tab)
      await this.page.getByRole("tab", { name: tab, exact: true }).click();
  }

  async settings(section: string) {
    await this.page.goto(`/settings/${section}`);
    await expect(this.page.locator(".settings-sub-page")).toBeVisible();
  }

  mintCard(url: string) {
    return this.page
      .getByTestId("mint-card")
      .filter({ hasText: new URL(url).host });
  }

  async addMint(url: string, nickname = "", confirm = true) {
    await this.home("Mints");
    await this.page.getByTestId("add-mint-url").fill(url);
    await this.page.getByTestId("add-mint-nickname").fill(nickname);
    await this.page
      .locator(".add-mint-container")
      .getByRole("button", { name: "Add mint", exact: true })
      .click();
    if (confirm) {
      await this.page.getByTestId("confirm-add-mint").click();
      await expect(this.page.getByTestId("confirm-add-mint")).toBeHidden();
      await expect(this.mintCard(url)).toBeVisible();
    } else {
      await this.page.locator(".bottom-sheet-close:visible").click();
    }
  }

  async activateMint(url: string) {
    await this.home("Mints");
    await this.mintCard(url).click();
    await expect(this.mintCard(url)).toHaveClass(/q-item--active/);
  }

  async details(url: string) {
    await this.home("Mints");
    await this.mintCard(url).getByTestId("mint-details").click();
    await expect(this.page).toHaveURL(/mintdetails/);
  }

  async removeMint(url: string, confirm = true) {
    await this.details(url);
    await this.page.getByTestId("mint-delete").click();
    const dialog = this.page.locator(".remove-mint-dialog");
    await expect(dialog).toBeVisible();
    await dialog
      .getByRole("button", {
        name: confirm ? "Remove mint" : "Cancel",
        exact: true,
      })
      .click();
    await expect(dialog).toBeHidden();
  }

  async editMint(
    url: string,
    nickname: string,
    replacementUrl = url,
    save = true
  ) {
    await this.details(url);
    await this.page.getByText("Edit mint", { exact: true }).click();
    const dialog = this.page.locator(".edit-mint-dialog");
    await dialog.locator("textarea").nth(0).fill(replacementUrl);
    await dialog
      .getByLabel("Nickname (optional)", { exact: true })
      .fill(nickname);
    // The sheet has one Update action; dismissing uses the header close.
    await this.page
      .getByRole("button", { name: save ? "Update" : "Close", exact: true })
      .filter({ visible: true })
      .last()
      .click();
    await expect(dialog).toBeHidden();
  }

  async sendEcash(amount: number) {
    await this.openSend("ecash");
    await this.enterAmount(amount);
    await this.page.getByTestId("send-ecash").click();
    await this.page.getByTestId("copy-ecash-token").click();
    const token = await this.page.evaluate(() =>
      navigator.clipboard.readText()
    );
    expect(token).toMatch(/^cashu[AB]/);
    return token;
  }

  async pasteEcash(token: string) {
    await this.page.evaluate(
      (value) => navigator.clipboard.writeText(value),
      token
    );
    await this.openReceive("ecash");
    await this.page.getByTestId("receive-ecash-paste").click();
  }

  async toggleSetting(label: string, enabled: boolean) {
    const row = this.page
      .locator(".q-item")
      .filter({ has: this.page.getByText(label, { exact: true }) });
    const toggle = row.getByRole("switch");
    await expect(toggle).toBeVisible();
    if ((await toggle.getAttribute("aria-checked")) !== String(enabled))
      await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", String(enabled));
  }

  /** Paste and Scan sit inside the Pay / Receive field as labelled icon buttons. */
  async payInputAction(name: "Paste" | "Scan") {
    await this.page
      .locator(".q-dialog:visible .q-field")
      .getByRole("button", { name, exact: true })
      .click();
  }

  /** Lock mode on the Send ecash amount step, with the receiver's key typed in. */
  async lockSendTo(pubkey: string) {
    const field = this.page.getByTestId("send-p2pk-pubkey").locator("input");
    if (!(await field.isVisible()))
      await this.page
        .getByRole("button", { name: "Lock", exact: true })
        .click();
    await field.fill(pubkey);
  }

  /** Wallet home's scanner button (the minimal Scan glyph). */
  get walletScan() {
    return this.page.getByTestId("wallet-scan");
  }

  /** The shared full-screen header's Back: client navigation, never page.goto. */
  async fullscreenBack() {
    await this.page.getByTestId("fullscreen-back").click();
  }

  /**
   * After client navigation to a full-screen page: the URL, the destination's own content and a
   * usable control, one settled route wrapper for `path` and no leftover page transition classes.
   * A URL check alone passes while the page is blank.
   */
  async expectFullscreenPage(path: string, anchor: Locator) {
    await expect.poll(() => new URL(this.page.url()).pathname).toBe(path);
    await expect(anchor).toBeVisible();
    const routes = this.page.getByTestId("fullscreen-route");
    await expect(routes).toHaveCount(1);
    await expect(routes).toHaveAttribute("data-route-path", path);
    await expect(
      this.page.locator('[class*="page-slide-"], [class*="page-fade-"]')
    ).toHaveCount(0);
    // Trial click: the control is the hit target (no lingering backdrop or placeholder over it).
    await anchor.click({ trial: true });
  }

  async stored(key: string) {
    return this.page.evaluate((name) => localStorage.getItem(name), key);
  }
}
