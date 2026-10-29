import type { Locator } from "@playwright/test";
import { WalletUi } from "../pages/WalletUi";

export async function disableAutomaticChecks(wallet: WalletUi) {
  await wallet.settings("privacy");
  for (const label of [
    "Check incoming invoice",
    "Check pending invoices on startup",
    "Check all invoices",
    "Check sent ecash",
  ]) {
    await wallet.toggleSetting(label, false);
  }
  await wallet.home();
}

/** Reusable quotes use amount_paid instead of BOLT11's state field. */
export async function holdIncomingQuote(
  wallet: WalletUi,
  mintUrl: string,
  method: "bolt11" | "bolt12" | "onchain"
) {
  await wallet.page.route(
    `${mintUrl}/v1/mint/quote/${method}/**`,
    async (route) => {
      if (route.request().method() !== "GET") {
        await route.fallback();
        return;
      }
      const response = await route.fetch();
      const body = await response.json();
      if (method === "bolt11") body.state = "UNPAID";
      else {
        body.amount_paid = 0;
        body.amount_issued = 0;
      }
      await route.fulfill({ response, json: body });
    }
  );
}

/** One settings-style row's vertical alignment, in CSS px. */
export type RowAlignment = {
  label: string;
  /** The leading icon's centre minus the text block's centre (null: no icon). */
  icon: number | null;
  /** The end glyph's centre minus the text block's centre (null: no glyph). */
  end: number | null;
  /** The title's computed line height. */
  lineHeight: number;
};

/**
 * Every visible settings-style row (SettingsActionRow, SettingsLinkRow, toggles) under `root`:
 * where its icon and end glyph sit against its text (owner 2026-10-29b, item 5).
 */
export async function rowAlignment(root: Locator): Promise<RowAlignment[]> {
  return root.locator(".q-item:has(.q-item__label)").evaluateAll((items) =>
    items
      .filter((item) => (item as HTMLElement).offsetParent !== null)
      .map((item) => {
        const centre = (el: Element | null) => {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return r.top + r.height / 2;
        };
        const title = item.querySelector(
          ".q-item__label:not(.q-item__label--caption)"
        )!;
        // The text block: the title alone, or the title and its caption together.
        const text = centre(title.closest(".q-item__section--main"));
        const delta = (el: Element | null) => {
          const c = centre(el);
          return c === null || text === null ? null : c - text;
        };
        return {
          label: title.textContent!.trim(),
          icon: delta(item.querySelector(".settings-menu-icon svg")),
          end: delta(item.querySelector(".q-item__section--side svg")),
          lineHeight: parseFloat(getComputedStyle(title).lineHeight),
        };
      })
  );
}
