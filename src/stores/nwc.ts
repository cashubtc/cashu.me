import { debug } from "src/js/logger";
import { defineStore } from "pinia";
import NDK, {
  NDKEvent,
  NDKNip07Signer,
  NDKNip46Signer,
  NDKFilter,
  NDKPrivateKeySigner,
  NDKKind,
  NDKSubscription,
} from "@nostr-dev-kit/ndk";
import { useLocalStorage } from "@vueuse/core";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils"; // already an installed dependency
import { generateSecretKey, getPublicKey } from "nostr-tools";
import { v2 as nip44 } from "nostr-tools/nip44";
import { useMintsStore } from "./mints";
import { useWalletStore } from "./wallet";
import { useInvoiceHistoryStore } from "./invoiceHistory";
import { InvoiceHistory } from "src/types/invoice";
import { useProofsStore } from "./proofs";
import { notify, notifyError, notifyWarning } from "../js/notify";
import { useSettingsStore } from "./settings";
import { decode as decodeBolt11 } from "light-bolt11-decoder";
import { useNostrStore } from "./nostr";
import { useNdk } from "src/composables/useNdk";

type NWCConnection = {
  walletPublicKey: string;
  connectionSecret: string;
  connectionPublicKey: string;
  allowanceLeft: number;
};

type NWCCommand = {
  method: string;
  params: any;
};

type NWCTransaction = {
  type: string;
  invoice: string;
  description: string | null;
  payment_hash: string | null;
  amount: number;
  fees_paid: number | null;
  created_at: number;
  settled_at: number | null;
  expires_at: number | null;
};

type NWCResult = {
  result_type: string;
  result: any;
};

type NWCError = {
  result_type: string;
  error: {
    code: string;
    message: string;
  };
};

const NWCKind = {
  NWCInfo: 13194,
  NWCRequest: 23194,
  NWCResponse: 23195,
};

export const useNWCStore = defineStore("nwc", {
  state: () => ({
    nwcEnabled: useLocalStorage<boolean>("cashu.nwc.enabled", false),
    connections: useLocalStorage<NWCConnection[]>("cashu.nwc.connections", []),
    seenCommandsUntil: useLocalStorage<number>(
      "cashu.nwc.seenCommandsUntil",
      0
    ),
    supportedMethods: [
      "pay_invoice",
      "make_invoice",
      "get_balance",
      "get_info",
      "list_transactions",
      "lookup_invoice",
    ],
    relays: useLocalStorage<string[]>(
      "cashu.nwc.relays",
      useSettingsStore().defaultNostrRelays
    ),
    blocking: false,
    subscriptions: [] as NDKSubscription[],
    showNWCDialog: false,
    showNWCData: { connection: {} as NWCConnection, connectionString: "" },
  }),
  getters: {},
  actions: {
    // ––––---------- NWC Command Handlers ––––----------
    handleGetInfo: async function (nwcCommand: NWCCommand) {
      debug("### get_info", nwcCommand.method);
      return {
        result_type: "get_info",
        result: {
          alias: "Cashu.me",
          color: "#FF0000",
          pubkey: this.connections[0].walletPublicKey,
          network: "mainnet",
          block_height: 1,
          block_hash: "blockchain disrespectoor",
          methods: this.supportedMethods,
        },
      };
    },
    handleGetBalance: async function (nwcCommand: NWCCommand) {
      const mintsStore = useMintsStore();
      debug("### get_balance", nwcCommand.method);
      return {
        result_type: "get_balance",
        result: {
          balance: mintsStore.totalUnitBalance * 1000,
        },
      };
    },
    handlePayInvoice: async function (nwcCommand: NWCCommand) {
      const invoice = nwcCommand.params.invoice;
      const amountMsat = nwcCommand.params.amount;
      debug("### pay_invoice", nwcCommand.method);
      debug("### invoice", invoice);
      debug("### amountMsat", amountMsat);
      // pay invoice
      const walletStore = useWalletStore();
      const proofsStore = useProofsStore();
      const mintStore = useMintsStore();
      try {
        await walletStore.decodeRequest(invoice);
      } catch (e) {
        debug("### error decoding invoice", e);
        return {
          result_type: nwcCommand.method,
          error: { code: "INTERNAL", message: "Invalid invoice" },
        } as NWCError;
      }
      // expect that the melt quote was requested
      if (
        walletStore.payInvoiceData.meltQuote.response.amount == 0 ||
        walletStore.payInvoiceData.meltQuote.error
      ) {
        notifyWarning("NWC: Error requesting melt quote");
        return {
          result_type: nwcCommand.method,
          error: { code: "INTERNAL", message: "Error requesting melt quote" },
        } as NWCError;
      }
      const maximumAmount =
        walletStore.payInvoiceData.meltQuote.response.amount +
        walletStore.payInvoiceData.meltQuote.response.fee_reserve;
      if (mintStore.activeUnit != "sat") {
        notifyWarning("NWC: Active unit must be sats");
        return {
          result_type: nwcCommand.method,
          error: { code: "INTERNAL", message: "Your active must be sats" },
        } as NWCError;
      }
      if (maximumAmount > this.connections[0].allowanceLeft) {
        notifyWarning("NWC: Allowance exceeded");
        return {
          result_type: nwcCommand.method,
          error: { code: "QUOTA_EXCEEDED", message: "Your quota has exceeded" },
        } as NWCError;
      }
      try {
        const meltData = await walletStore.meltInvoiceData();
        const paidAmount =
          walletStore.payInvoiceData.meltQuote.response.amount +
          walletStore.payInvoiceData.meltQuote.response.fee_reserve -
          proofsStore.sumProofs(meltData.change);
        this.connections[0].allowanceLeft -= paidAmount;
        return {
          result_type: nwcCommand.method,
          result: {},
        };
      } catch (e) {
        return {
          result_type: nwcCommand.method,
          error: { code: "INTERNAL", message: "Could not pay invoice" },
        } as NWCError;
      }
    },
    handleMakeInvoice: async function (nwcCommand: NWCCommand) {
      const { amount, description, expiry } = nwcCommand.params;
      debug("### make_invoice");
      debug("### amount", amount); // msats
      debug("### description", description);
      debug("### expiry", expiry); // seconds
      // make invoice
      const walletStore = useWalletStore();
      const quote = await walletStore.requestMint(
        amount / 1000,
        walletStore.wallet
      );
      if (!quote) {
        return {
          // requesting mint invoice can fail if no mint was selected yet
          // the error will have been shown as a notification
          // TODO: make requestMint throw and return useful message
          result_type: nwcCommand.method,
          error: {
            code: "INTERNAL",
            message: "failed to request mint invoice",
          },
        };
      }

      walletStore.mintOnPaid(quote.quote, false, true);

      return {
        result_type: nwcCommand.method,
        result: {
          type: "incoming",
          invoice: quote?.request,
          description,
          amount,
        },
      };
    },
    handleListTransactions: async function (nwcCommand: NWCCommand) {
      debug("### list_transactions", nwcCommand.method);
      const walletStore = useWalletStore();
      const from = nwcCommand.params.from || 0;
      const until = nwcCommand.params.until || Math.floor(Date.now() / 1000);
      const limit = nwcCommand.params.limit || 10;
      const offset = nwcCommand.params.offset || 0;
      const unpaid = nwcCommand.params.unpaid || false;
      const type = nwcCommand.params.type || undefined;

      const invoiceHistory = useInvoiceHistoryStore().invoiceHistory;
      const transactionsHistory = invoiceHistory
        .filter((invoice) => {
          const date = new Date(invoice.date);
          const created_at = Math.floor(date.getTime() / 1000);
          if (from && created_at < from) {
            return false;
          }
          if (until && created_at > until) {
            return false;
          }
          if (type && type == "incoming" && invoice.amount < 0) {
            return false;
          }
          if (type && type == "outgoing" && invoice.amount > 0) {
            return false;
          }
          if (unpaid && invoice.status == "paid") {
            return false;
          }
          return true;
        })
        .slice(offset, offset + limit);
      // now create an array "transactions" out of nwcTransaction from transactionsHistory
      //
      // type = "incoming" if amount > 0 else "outgoing"
      // amount = abs(amount)
      // created_at = unix timestamp of date
      // settled_at = unix timestamp of date if status == "paid" else null

      // According to the NWC spec (NIP47): "Transactions are returned in descending order of creation time."
      const transactions = transactionsHistory
        .map(this.mapToNwcTransaction)
        .sort(
          (a: any, b: any) =>
            (b.created_at as number) - (a.created_at as number)
        );

      return {
        result_type: "list_transactions",
        result: {
          transactions: transactions,
        },
      };
    },
    handleLookupInvoice: async function (nwcCommand: NWCCommand) {
      let hash = nwcCommand.params.payment_hash;
      if (!hash) {
        const bolt11 = nwcCommand.params.invoice;
        const decoded = bolt11 ? decodeBolt11(bolt11) : null;
        // @ts-ignore
        hash = decoded?.sections.find((s) => s.name === "payment_hash")?.value;
      }
      if (!hash) {
        return {
          result_type: nwcCommand.method,
          error: { code: "OTHER", message: "invoice or payment_hash required" },
        };
      }

      debug("### lookup_invoice");
      const walletStore = useWalletStore();
      const invoiceHistory = useInvoiceHistoryStore().invoiceHistory;

      for (const inv of invoiceHistory) {
        const decoded = decodeBolt11(nwcCommand.params.invoice);
        // @ts-ignore
        const invHash = decoded.sections.find(
          (s) => s.name === "payment_hash"
        )?.value;
        if (invHash === hash) {
          return {
            result_type: nwcCommand.method,
            result: this.mapToNwcTransaction(inv),
          };
        }
      }

      return {
        result_type: nwcCommand.method,
        error: {
          code: "NOT_FOUND",
          message: "invoice not found",
        },
      };
    },
    mapToNwcTransaction(invoice: InvoiceHistory): NWCTransaction {
      let type = invoice.amount > 0 ? "incoming" : "outgoing";
      let amount = Math.abs(invoice.amount) * 1000;
      let created_at = Math.floor(new Date(invoice.date).getTime() / 1000);
      let settled_at =
        invoice.status == "paid"
          ? Math.floor(new Date(invoice.date).getTime() / 1000)
          : null;
      return {
        type: type,
        invoice: invoice.bolt11,
        description: invoice.memo,
        amount: amount,
        fees_paid: 0,
        created_at: created_at,
        settled_at: settled_at,
      } as NWCTransaction;
    },
    // ––––---------- NWC Connection ––––----------
    replyNWC: async function (
      result: NWCResult | NWCError,
      event: NDKEvent,
      conn: NWCConnection
    ) {
      // reply to NWC with result
      const ndk = await useNdk();
      let replyEvent = new NDKEvent(ndk);
      replyEvent.kind = 23195;
      debug("### replying with", JSON.stringify(result));
      const nostr = useNostrStore();
      replyEvent.content = nip44.encrypt(
        JSON.stringify(result),
        nip44.utils.getConversationKey(
          hexToBytes(nostr.privKeyHex),
          event.author.pubkey
        )
      );
      replyEvent.tags = [
        ["p", event.author.pubkey],
        ["e", event.id],
      ];
      debug("### replyEvent", replyEvent);
      debug("### replying to", event.id);
      // await this.ndk.publish(replyEvent);
      await replyEvent.publish();
    },
    parseNWCCommand: async function (
      command: string,
      event: NDKEvent,
      conn: NWCConnection
    ) {
      // parse command to JSON object {method: 'pay_invoice', params: {invoice: '1234'}}
      let nwcCommand: NWCCommand;
      let result: NWCResult | NWCError;
      try {
        nwcCommand = JSON.parse(command);
      } catch (e) {
        debug("### failed to parse NWC command", command);
        result = {
          result_type: "parse_error",
          error: { code: "OTHER", message: "Failed to parse command" },
        } as NWCError;
        await this.replyNWC(result, event, conn);
        return;
      }
      debug("### nwcCommand", nwcCommand);
      // parse "get_info" without params
      if (nwcCommand.method == "get_info") {
        result = await this.handleGetInfo(nwcCommand);
      } else if (nwcCommand.method == "get_balance") {
        result = await this.handleGetBalance(nwcCommand);
      } else if (nwcCommand.method == "pay_invoice") {
        if (this.blocking) {
          result = {
            result_type: nwcCommand.method,
            error: {
              code: "INTERNAL",
              message: "Already processing a payment.",
            },
          } as NWCError;
        }
        this.blocking = true;
        try {
          result = await this.handlePayInvoice(nwcCommand);
        } catch (e) {
          return;
        } finally {
          this.blocking = false;
        }
      } else if (nwcCommand.method === "make_invoice") {
        result = await this.handleMakeInvoice(nwcCommand);
      } else if (nwcCommand.method == "list_transactions") {
        result = await this.handleListTransactions(nwcCommand);
      } else if (nwcCommand.method === "lookup_invoice") {
        result = await this.handleLookupInvoice(nwcCommand);
      } else {
        debug("### method not supported", nwcCommand.method);
        result = {
          result_type: nwcCommand.method,
          error: { code: "NOT_IMPLEMENTED", message: "Method not supported" },
        } as NWCError;
      }
      await this.replyNWC(result, event, conn);
    },
    getConnectionString: function (connection: NWCConnection) {
      const nostr = useNostrStore();
      const walletPublicKeyHex = connection.walletPublicKey;
      const connectionSecretHex = connection.connectionSecret;
      return `nostr+walletconnect://${walletPublicKeyHex}?relay=${nostr.relays.join(
        "&relay="
      )}&secret=${connectionSecretHex}`;
    },
    generateNWCConnection: async function () {
      const nostr = useNostrStore();
      await nostr.initSignerIfNotSet();
      this.relays = nostr.relays as any;
      let conn: NWCConnection;
      // NOTE: we only support one connection for now
      if (!this.connections.length) {
        const connectionSecret = generateSecretKey();
        const connectionPublicKeyHex = getPublicKey(connectionSecret);
        const connectionSecretHex = bytesToHex(connectionSecret);
        conn = {
          walletPublicKey: nostr.pubkey,
          connectionSecret: connectionSecretHex,
          connectionPublicKey: connectionPublicKeyHex,
          allowanceLeft: 1000,
        } as NWCConnection;
        this.connections = this.connections.concat(conn);
      } else {
        conn = this.connections[0];
        conn.walletPublicKey = nostr.pubkey;
      }

      const walletSigner = nostr.signer;
      // close and delete all old subscriptions
      this.unsubscribeNWC();
      const ndk = await useNdk();
      await ndk.connect();

      const nip47InfoEvent = new NDKEvent(ndk);
      nip47InfoEvent.kind = NWCKind.NWCInfo;
      nip47InfoEvent.content = this.supportedMethods.join(" ");
      try {
        // let's fetch the info event from the relay to see if we need to republish it
        // use NWCKind.NWCInfo as an integer here
        let filterInfoEvent: NDKFilter = {
          kinds: [NWCKind.NWCInfo],
          authors: [conn.walletPublicKey],
        };
        let eventsInfoEvent = await ndk.fetchEvents(filterInfoEvent);
        if (eventsInfoEvent.size === 0) {
          await nip47InfoEvent.publish();
          debug("### published nip47InfoEvent", nip47InfoEvent);
        } else {
          debug("### nip47InfoEvent already published");
        }
      } catch (e) {
        debug("### could not publish nip47InfoEvent", nip47InfoEvent);
        debug("### error", e);
      }
    },
    listenToNWCCommands: async function () {
      // if (!this.connections.length) {
      //   await this.generateNWCConnection()
      // }
      await this.generateNWCConnection();
      // we only support one connection for now
      const conn = this.connections[0];

      const currentUnitTime = Math.floor(Date.now() / 1000);
      const subscribeSince = currentUnitTime - 60; // 1 minute
      let filter = {
        kinds: [NWCKind.NWCRequest as NDKKind],
        since: subscribeSince,
        authors: [conn.connectionPublicKey],
        "#p": [conn.walletPublicKey],
      } as NDKFilter;
      const ndk = await useNdk();
      const sub = ndk.subscribe(filter);
      const nostr = useNostrStore();
      debug("### subscribing to NWC on relays: ", nostr.relays);
      this.subscriptions.push(sub);

      sub.on("eose", () =>
        debug("All relays have reached the end of the event stream")
      );
      sub.on("close", () => debug("Subscription closed"));

      sub.on("event", async (event) => {
        // debug("### event", event)
        // debug('### event.kind', event.kind)
        // debug('### event.id', event.id)
        // debug('### event.author.pubkey', event.author.pubkey)
        // debug("### event.tagValue('p')", event.tagValue("p"))
        // debug("### event.tagValue('e')", event.tagValue("e"))
        // debug("### event.content", event.content)
        if (event.kind != NWCKind.NWCRequest) {
          return; // ignore non-NWC events
        }
        if (!this.nwcEnabled) {
          debug("### Received NWC command but NWC is disabled");
          return;
        }
        // check if the events date is after the last seen command
        if (event.created_at <= this.seenCommandsUntil) {
          return;
        }
        this.seenCommandsUntil = event.created_at;

        debug("### NWC request!");
        debug("### event", event);
        const decryptedContent = await nip44.decrypt(
          event.content,
          nip44.utils.getConversationKey(
            hexToBytes(conn.connectionSecret),
            conn.walletPublicKey
          )
        );
        // debug("### decryptedContent", decryptedContent)
        await this.parseNWCCommand(decryptedContent, event, conn);
      });
    },
    unsubscribeNWC: function () {
      debug("### unsubscribing from NWC");
      for (let sub of this.subscriptions) {
        sub.stop();
      }
      this.subscriptions = [];
    },
  },
});
