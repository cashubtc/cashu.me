import { useInvoicesWorkerStore } from "./invoicesWorker";
import { useSettingsStore } from "src/stores/settings";
import { useWorkersStore } from "./workers";
import { useUiStore } from "src/stores/ui";
import { useMintsStore } from "src/stores/mints";
import { notifySuccess, notifyApiError } from "src/js/notify";
import type {
  MintQuoteBolt11Response,
  MintQuoteBolt12Response,
  MintQuoteOnchainResponse,
} from "@cashu/cashu-ts";
import { PaymentMethod } from "src/stores/walletTypes";

type IncomingMintMethod =
  | PaymentMethod.Bolt11
  | PaymentMethod.Bolt12
  | PaymentMethod.Onchain;

type MintQuotePaidResponse =
  | MintQuoteBolt11Response
  | MintQuoteBolt12Response
  | MintQuoteOnchainResponse;

type MintOnPaidConfig = {
  command: string;
  oneShot: boolean;
  addToChecker: (quoteId: string) => void;
  onPaid: (
    walletStore: any,
    quoteId: string,
    invoice: any,
    verbose: boolean,
    hideInvoiceDetailsOnMint: boolean
  ) => Promise<any[] | undefined>;
};

const mintOnPaidConfigs: Record<IncomingMintMethod, MintOnPaidConfig> = {
  [PaymentMethod.Bolt11]: {
    command: "bolt11_mint_quote",
    oneShot: true,
    addToChecker: (quoteId: string) =>
      useInvoicesWorkerStore().addInvoiceToChecker(quoteId),
    onPaid: async (walletStore: any, _quoteId, invoice) =>
      walletStore.mintBolt11(invoice, false),
  },
  [PaymentMethod.Bolt12]: {
    command: "bolt12_mint_quote",
    oneShot: false,
    addToChecker: (quoteId: string) =>
      useInvoicesWorkerStore().addBolt12OfferToChecker(quoteId),
    onPaid: async (
      walletStore: any,
      quoteId,
      _invoice,
      verbose,
      hideInvoiceDetailsOnMint
    ) =>
      walletStore.checkOfferAndMintBolt12(
        quoteId,
        verbose,
        hideInvoiceDetailsOnMint
      ),
  },
  [PaymentMethod.Onchain]: {
    command: "onchain_mint_quote",
    oneShot: false,
    addToChecker: (quoteId: string) =>
      useInvoicesWorkerStore().addOnchainQuoteToChecker(quoteId, true),
    onPaid: async (
      walletStore: any,
      quoteId,
      _invoice,
      verbose,
      hideInvoiceDetailsOnMint
    ) =>
      walletStore.checkOnchainAndMint(
        quoteId,
        verbose,
        hideInvoiceDetailsOnMint
      ),
  },
};

const activeMintQuoteSubscriptions = new Map<string, () => void>();

function nut17Supported(mint: any, method: IncomingMintMethod, unit: string) {
  const supported =
    mint.info?.nuts?.[17]?.supported || mint.info?.nuts?.["17"]?.supported;
  const command = mintOnPaidConfigs[method].command;
  return (
    Array.isArray(supported) &&
    supported.some(
      (s: any) =>
        s.method === method &&
        s.unit === unit &&
        Array.isArray(s.commands) &&
        s.commands.includes(command)
    )
  );
}

function subscriptionKey(invoice: any, method: IncomingMintMethod) {
  return `${method}:${invoice.mint}:${invoice.unit}:${invoice.quote}`;
}

async function subscribeMintQuotePaid(
  mintWallet: any,
  quoteId: string,
  command: string,
  onPaidCallback: (response: MintQuotePaidResponse) => void | Promise<void>,
  onErrorCallback: (error: any) => void | Promise<void>
) {
  await mintWallet.mint.connectWebSocket();
  const connection = mintWallet.mint.webSocketConnection;
  if (!connection) {
    throw new Error("Failed to establish WebSocket connection.");
  }

  const onUpdate = async (response: MintQuotePaidResponse) => {
    if (response.state === "PAID") {
      await onPaidCallback(response);
    }
  };
  const subscriptionId = connection.createSubscription(
    {
      kind: command,
      filters: [quoteId],
    },
    onUpdate,
    onErrorCallback
  );

  return () => {
    connection.cancelSubscription(subscriptionId, onUpdate, onErrorCallback);
  };
}

export async function mintOnPaidGeneric(
  this: any,
  quoteId: string,
  {
    type,
    verbose = true,
    kickOffInvoiceChecker = true,
    hideInvoiceDetailsOnMint = true,
  }: {
    type: IncomingMintMethod;
    verbose?: boolean;
    kickOffInvoiceChecker?: boolean;
    hideInvoiceDetailsOnMint?: boolean;
  }
) {
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
  const config = mintOnPaidConfigs[type];

  // 3. Fallback: Add to Background Checker
  if (kickOffInvoiceChecker) {
    if (useSettingsStore().periodicallyCheckIncomingInvoices) {
      console.log(`Adding quote ${quoteId} to long-polling checker.`);
      config.addToChecker(quoteId);
    } else if (useSettingsStore().checkIncomingInvoices) {
      // Legacy worker support
      console.log(`Adding quote ${quoteId} to old worker checker.`);
      if (type === PaymentMethod.Bolt11) {
        useWorkersStore().invoiceCheckWorker(quoteId);
      }
      // Bolt12 not supported in legacy worker
    }
  }

  const mintStore = useMintsStore();
  const mint = mintStore.mints.find((m: any) => m.url === invoice.mint);
  if (!mint) {
    throw new Error("mint not found");
  }

  // 4. Check Websocket Capability (NUT-17)
  if (
    !settingsStore.useWebsockets ||
    !nut17Supported(mint, type, invoice.unit)
  ) {
    console.log(`Websockets not supported for ${type}.`);
    return;
  }

  const key = subscriptionKey(invoice, type);
  if (activeMintQuoteSubscriptions.has(key)) {
    console.log(`Websocket mint listener already active for ${type}.`);
    return;
  }

  const mintWallet = await this.mintWallet(invoice.mint, invoice.unit);

  // 5. Subscribe via Websocket
  const uIStore = useUiStore();
  let cleanup = () => activeMintQuoteSubscriptions.delete(key);
  try {
    this.activeWebsocketConnections++;
    uIStore.triggerActivityOrb();
    let unsubscribe: (() => void) | undefined = undefined;
    let cleanupRequested = false;
    cleanup = () => {
      if (unsubscribe) {
        unsubscribe();
      } else {
        cleanupRequested = true;
      }
      activeMintQuoteSubscriptions.delete(key);
    };
    activeMintQuoteSubscriptions.set(key, cleanup);

    const onPaidCallback = async (_response: MintQuotePaidResponse) => {
      let proofs;
      try {
        proofs = await config.onPaid(
          this,
          quoteId,
          invoice,
          verbose,
          hideInvoiceDetailsOnMint
        );
      } catch (error: any) {
        if (verbose) {
          console.error(error);
        }
        throw error;
      } finally {
        if (config.oneShot) {
          cleanup();
        }
      }

      if (type === PaymentMethod.Bolt11) {
        if (hideInvoiceDetailsOnMint) {
          uIStore.showInvoiceDetails = false;
        }
        useUiStore().vibrate();
        if (verbose) {
          notifySuccess(
            this.t("wallet.notifications.received_lightning", {
              amount: uIStore.formatCurrency(invoice.amount, invoice.unit),
            })
          );
        }
      }

      return proofs;
    };

    const onErrorCallback = async (error: any) => {
      if (verbose) notifyApiError(error);
      cleanup();
      throw error;
    };

    unsubscribe = await subscribeMintQuotePaid(
      mintWallet,
      quoteId,
      config.command,
      onPaidCallback,
      onErrorCallback
    );
    if (cleanupRequested) {
      cleanup();
    }
  } catch (error) {
    cleanup();
    if (verbose) {
      console.log("Error in websocket subscription", error);
    }
  } finally {
    this.activeWebsocketConnections--;
  }
}
