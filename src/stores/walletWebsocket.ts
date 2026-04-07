import { useInvoicesWorkerStore } from "./invoicesWorker";
import { useSettingsStore } from "src/stores/settings";
import { useWorkersStore } from "./workers";
import { useUiStore } from "src/stores/ui";
import { useMintsStore } from "src/stores/mints";
import { notifySuccess, notifyApiError } from "src/js/notify";
import { MintQuoteBolt11Response } from "@cashu/cashu-ts";

export async function mintOnPaidGeneric(
  this: any,
  quoteId: string,
  {
    type,
    verbose = true,
    kickOffInvoiceChecker = true,
    hideInvoiceDetailsOnMint = true,
  }: {
    type: "bolt11" | "bolt12";
    verbose?: boolean;
    kickOffInvoiceChecker?: boolean;
    hideInvoiceDetailsOnMint?: boolean;
  }
) {
  const mintStore = useMintsStore();
  const settingsStore = useSettingsStore();

  // 1. Check Settings
  if (!settingsStore.checkIncomingInvoices) {
    console.log(
      "settingsStore.checkIncomingInvoices is disabled, skipping invoice check"
    );
    return;
  }

  // 2. Find Invoice/Offer
  const invoice = this.invoiceHistory.find((i: any) => i.quote === quoteId);
  if (!invoice) {
    throw new Error("invoice not found");
  }

  // 3. Initialize Mint Wallet
  const mintWallet = await this.mintWallet(invoice.mint, invoice.unit);
  const mint = mintStore.mints.find((m: any) => m.url === invoice.mint);

  if (!mint) {
    throw new Error("mint not found");
  }

  // 4. Fallback: Add to Background Checker
  if (kickOffInvoiceChecker) {
    if (useSettingsStore().periodicallyCheckIncomingInvoices) {
      console.log(`Adding quote ${quoteId} to long-polling checker.`);
      if (type === "bolt12") {
        useInvoicesWorkerStore().addBolt12OfferToChecker(quoteId);
      } else {
        useInvoicesWorkerStore().addInvoiceToChecker(quoteId);
      }
    } else if (useSettingsStore().checkIncomingInvoices) {
      // Legacy worker support
      console.log(`Adding quote ${quoteId} to old worker checker.`);
      if (type === "bolt11") {
        useWorkersStore().invoiceCheckWorker(quoteId);
      }
      // Bolt12 not supported in legacy worker
    }
  }

  // 5. Check Websocket Capability (NUT-17)
  const method = type === "bolt11" ? "bolt11" : "bolt12";
  const command = type === "bolt11" ? "bolt11_mint_quote" : "bolt12_mint_quote";

  if (
    !settingsStore.useWebsockets ||
    !mint.info?.nuts[17]?.supported ||
    !mint.info?.nuts[17]?.supported.find(
      (s: any) =>
        s.method == method &&
        s.unit == invoice.unit &&
        s.commands.indexOf(command) != -1
    )
  ) {
    console.log(`Websockets not supported for ${method}.`);
    return;
  }

  // 6. Subscribe via Websocket
  const uIStore = useUiStore();
  try {
    this.activeWebsocketConnections++;
    uIStore.triggerActivityOrb();

    const onPaidCallback = async (_response: MintQuoteBolt11Response) => {
      let proofs;
      try {
        if (type === "bolt11") {
          proofs = await this.mintBolt11(invoice, false);
        } else {
          proofs = await this.checkOfferAndMintBolt12(quoteId, false);
        }
      } catch (error: any) {
        console.error(error);
        throw error;
      }

      if (hideInvoiceDetailsOnMint) {
        uIStore.showInvoiceDetails = false;
      }
      useUiStore().vibrate();

      const amount =
        type === "bolt12" && proofs
          ? proofs.reduce((acc: number, p: any) => acc + p.amount, 0)
          : invoice.amount;

      notifySuccess(
        this.t("wallet.notifications.received_lightning", {
          amount: uIStore.formatCurrency(amount, invoice.unit),
        })
      );

      return proofs;
    };

    const onErrorCallback = async (error: any) => {
      if (verbose) notifyApiError(error);
      throw error;
    };

    await mintWallet.on.mintQuotePaid(quoteId, onPaidCallback, onErrorCallback);
  } catch (error) {
    console.log("Error in websocket subscription", error);
  } finally {
    this.activeWebsocketConnections--;
  }
}
