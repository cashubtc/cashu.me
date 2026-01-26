import { useInvoicesWorkerStore } from "./invoicesWorker";
import { useSettingsStore } from "src/stores/settings";
import { useWorkersStore } from "./workers";
import { useUiStore } from "src/stores/ui";
import { useMintsStore } from "src/stores/mints";
import { notifySuccess, notifyApiError } from "src/js/notify";
import { MintQuoteResponse, Bolt12MintQuoteResponse } from "@cashu/cashu-ts";

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

    // Variable to hold the unsubscribe function
    // It will be assigned once the subscription is established
    let unsub: () => void = () => {};

    const onPaidCallback = async (
      response: MintQuoteResponse | Bolt12MintQuoteResponse
    ) => {
      console.log(`Websocket: ${type} quote paid.`);
      let proofs;
      try {
        if (type === "bolt11") {
          proofs = await this.mintBolt11(invoice, false);
        } else {
          proofs = await this.checkOfferAndMintBolt12(quoteId, false);
        }
      } catch (error: any) {
        console.error(error);
        // notifyApiError(error);
        throw error;
      }

      if (hideInvoiceDetailsOnMint) {
        uIStore.showInvoiceDetails = false;
      }
      useUiStore().vibrate();

      // For Bolt12, checkOfferAndMintBolt12 might return proofs.
      // If it does, we can sum them to get the amount paid.
      // If not (e.g. no new funds), we might fall back to invoice.amount.
      let amount = invoice.amount;
      if (type === "bolt12" && proofs) {
        amount = proofs.reduce((acc: number, p: any) => acc + p.amount, 0);
      }

      notifySuccess(
        this.t("wallet.notifications.received_lightning", {
          amount: uIStore.formatCurrency(amount, invoice.unit),
        })
      );

      // Unsubscribe after payment for Bolt11
      if (unsub) {
        unsub();
      }

      return proofs;
    };

    const onErrorCallback = async (error: any) => {
      if (verbose) {
        notifyApiError(error);
      }
      console.log("Invoice still pending", invoice.quote);
      throw error;
    };

    if (type === "bolt11") {
      unsub = await mintWallet.onMintQuotePaid(
        quoteId,
        onPaidCallback as (payload: MintQuoteResponse) => void,
        onErrorCallback
      );
    } else {
      // Manual subscription for Bolt12
      // Ensure websocket connection exists
      if (!mintWallet.mint.webSocketConnection) {
        await mintWallet.mint.connectWebSocket();
      }

      const ws = mintWallet.mint.webSocketConnection;
      if (!ws) {
        console.error("Could not connect to websocket for Bolt12");
        return;
      }

      // Create subscription manually
      // params: { kind: ..., filters: ... }
      // NUT-17: subscription params for bolt12_mint_quote: [quoteId]
      const subId = ws.createSubscription(
        { kind: command, filters: [quoteId] } as any,
        onPaidCallback,
        onErrorCallback
      );

      unsub = () => {
        ws.cancelSubscription(subId, onPaidCallback);
      };
    }
  } catch (error) {
    console.log("Error in websocket subscription", error);
  } finally {
    this.activeWebsocketConnections--;
  }
}
