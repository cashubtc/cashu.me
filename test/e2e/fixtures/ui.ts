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
