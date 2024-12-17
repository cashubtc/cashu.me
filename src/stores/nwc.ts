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
import { bytesToHex } from "@noble/hashes/utils"; // already an installed dependency
import { nip04, generateSecretKey, getPublicKey } from "nostr-tools";
import { useMintsStore } from "./mints";
import { useWalletStore } from "./wallet";
import { useProofsStore } from "./proofs";
import { notify, notifyError, notifyWarning } from "../js/notify";
import { useSettingsStore } from "./settings";

type NWCConnection = {
  walletPublicKey: string;
  walletPrivateKey: string;
  connectionSecret: string;
  connectionPublicKey: string;
  allowanceLeft: number;
};

type NWCCommand = {
  method: string;
  params: any;
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
    supportedMethods: [
      "pay_invoice",
      "get_balance",
      "get_info",
      "list_transactions",
    ],
    relays: useLocalStorage<string[]>(
      "cashu.nwc.relays",
      useSettingsStore().defaultNostrRelays
    ),
    blocking: false,
    ndk: new NDK(),
    subscriptions: [] as NDKSubscription[],
    showNWCDialog: false,
    showNWCData: { connection: {} as NWCConnection, connectionString: "" },
  }),
  getters: {},
  actions: {
    // ––––---------- NWC Command Handlers ––––----------
    handleGetInfo: async function (nwcCommand: NWCCommand) {
      console.log("### get_info", nwcCommand.method);
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
      console.log("### get_balance", nwcCommand.method);
      return {
        result_type: "get_balance",
        result: {
          balance: mintsStore.activeBalance * 1000,
        },
      };
    },
    handlePayInvoice: async function (nwcCommand: NWCCommand) {
      const invoice = nwcCommand.params.invoice;
      const amountMsat = nwcCommand.params.amount;
      console.log("### pay_invoice", nwcCommand.method);
      console.log("### invoice", invoice);
      console.log("### amountMsat", amountMsat);
      // pay invoice
      const walletStore = useWalletStore();
      const proofsStore = useProofsStore();
      const mintStore = useMintsStore();
      try {
        await walletStore.decodeRequest(invoice);
      } catch (e) {
        console.log("### error decoding invoice", e);
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
        const meltData = await walletStore.melt();
        const paidAmount =
          walletStore.payInvoiceData.meltQuote.response.amount +
          proofsStore.sumProofs(meltData.change);
        this.connections[0].allowanceLeft -= paidAmount;
        return {
          result_type: nwcCommand.method,
          result: {
            preimage: meltData.preimage,
          },
        };
      } catch (e) {
        return {
          result_type: nwcCommand.method,
          error: { code: "INTERNAL", message: "Could not pay invoice" },
        } as NWCError;
      }
    },
    handleListTransactions: async function (nwcCommand: NWCCommand) {
      console.log("### list_transactions", nwcCommand.method);
      type nwcTransaction = {
        type: string;
        invoice: string;
        description: string | null;
        preimage: string | null;
        payment_hash: string | null;
        amount: number;
        fees_paid: number | null;
        created_at: number;
        settled_at: number | null;
        expires_at: number | null;
      };
      const walletStore = useWalletStore();
      const from = nwcCommand.params.from || 0;
      const until = nwcCommand.params.until || Math.floor(Date.now() / 1000);
      const limit = nwcCommand.params.limit || 10;
      const offset = nwcCommand.params.offset || 0;
      const unpaid = nwcCommand.params.unpaid || false;
      const type = nwcCommand.params.type || undefined;

      const invoiceHistory = walletStore.invoiceHistory;
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

      const transactions = transactionsHistory.map((invoice) => {
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
        } as nwcTransaction;
      });

      return {
        result_type: "list_transactions",
        result: {
          transactions: transactions,
        },
      };
    },
    // ––––---------- NWC Connection ––––----------
    replyNWC: async function (
      result: NWCResult | NWCError,
      event: NDKEvent,
      conn: NWCConnection
    ) {
      // reply to NWC with result
      let replyEvent = new NDKEvent(event.ndk);
      replyEvent.kind = 23195;
      console.log("### replying with", JSON.stringify(result));
      replyEvent.content = await nip04.encrypt(
        conn.walletPrivateKey,
        event.author.pubkey,
        JSON.stringify(result)
      );
      replyEvent.tags = [
        ["p", event.author.pubkey],
        ["e", event.id],
      ];
      console.log("### replyEvent", replyEvent);
      console.log("### replying to", event.id);
      // await this.ndk.publish(replyEvent);
      await replyEvent.publish();
    },
    parseNWCCommand: async function (
      command: string,
      event: NDKEvent,
      conn: NWCConnection
    ) {
      // parse command to JSON object {method: 'pay_invoice', params: {invoice: '1234'}}
      let nwcCommand: NWCCommand = JSON.parse(command);
      let result: NWCResult | NWCError;
      console.log("### nwcCommand", nwcCommand);
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
      } else if (nwcCommand.method == "list_transactions") {
        result = await this.handleListTransactions(nwcCommand);
      } else {
        console.log("### method not supported", nwcCommand.method);
        result = {
          result_type: nwcCommand.method,
          error: { code: "NOT_IMPLEMENTED", message: "Method not supported" },
        } as NWCError;
      }
      await this.replyNWC(result, event, conn);
    },
    getConnectionString: function (connection: NWCConnection) {
      const walletPublicKeyHex = connection.walletPublicKey;
      const connectionSecretHex = connection.connectionSecret;
      return `nostr+walletconnect://${walletPublicKeyHex}?relay=${this.relays.join(
        "&relay="
      )}&secret=${connectionSecretHex}`;
    },
    generateNWCConnection: async function () {
      let conn: NWCConnection;
      // NOTE: we only support one connection for now
      if (!this.connections.length) {
        const sk = generateSecretKey(); // `sk` is a Uint8Array
        const walletPublicKeyHex = getPublicKey(sk); // `pk` is a hex string
        const walletPrivateKeyHex = bytesToHex(sk);

        const connectionSecret = generateSecretKey();
        const connectionPublicKeyHex = getPublicKey(connectionSecret);
        const connectionSecretHex = bytesToHex(connectionSecret);
        conn = {
          walletPublicKey: walletPublicKeyHex,
          walletPrivateKey: walletPrivateKeyHex,
          connectionSecret: connectionSecretHex,
          connectionPublicKey: connectionPublicKeyHex,
          allowanceLeft: 1000,
        } as NWCConnection;
        this.connections = this.connections.concat(conn);
      } else {
        conn = this.connections[0];
      }

      const walletSigner = new NDKPrivateKeySigner(conn.walletPrivateKey);
      // close and delete all old subscriptions
      this.unsubscribeNWC();
      this.ndk = new NDK({
        explicitRelayUrls: this.relays,
        signer: walletSigner,
      });
      this.ndk.connect();

      const nip47InfoEvent = new NDKEvent(this.ndk);
      nip47InfoEvent.kind = NWCKind.NWCInfo;
      nip47InfoEvent.content = this.supportedMethods.join(" ");
      try {
        // let's fetch the info event from the relay to see if we need to republish it
        // use NWCKind.NWCInfo as an integer here
        let filterInfoEvent: NDKFilter = {
          kinds: [NWCKind.NWCInfo],
          authors: [conn.walletPublicKey],
        };
        let eventsInfoEvent = await this.ndk.fetchEvents(filterInfoEvent);
        if (eventsInfoEvent.size === 0) {
          await nip47InfoEvent.publish();
          console.log("### published nip47InfoEvent", nip47InfoEvent);
        } else {
          console.log("### nip47InfoEvent already published");
        }
      } catch (e) {
        console.log("### could not publish nip47InfoEvent", nip47InfoEvent);
        console.log("### error", e);
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
      let filter = {
        kinds: [NWCKind.NWCRequest as NDKKind],
        since: currentUnitTime,
        authors: [conn.connectionPublicKey],
        "#p": [conn.walletPublicKey],
      } as NDKFilter;
      const sub = this.ndk.subscribe(filter);
      console.log("### subscribing to NWC on relays: ", this.relays);
      this.subscriptions.push(sub);

      sub.on("eose", () =>
        console.log("All relays have reached the end of the event stream")
      );
      sub.on("close", () => console.log("Subscription closed"));

      sub.on("event", async (event) => {
        // console.log("### event", event)
        // console.log('### event.kind', event.kind)
        // console.log('### event.id', event.id)
        // console.log('### event.author.pubkey', event.author.pubkey)
        // console.log("### event.tagValue('p')", event.tagValue("p"))
        // console.log("### event.tagValue('e')", event.tagValue("e"))
        // console.log("### event.content", event.content)
        if (event.kind != NWCKind.NWCRequest) {
          return; // ignore non-NWC events
        }
        if (!this.nwcEnabled) {
          console.log("### Received NWC command but NWC is disabled");
          return;
        }
        console.log("### NWC request!");
        console.log("### event", event);
        const decryptedContent = await nip04.decrypt(
          conn.connectionSecret,
          conn.walletPublicKey,
          event.content
        );
        // console.log("### decryptedContent", decryptedContent)
        await this.parseNWCCommand(decryptedContent, event, conn);
      });
    },
    unsubscribeNWC: function () {
      console.log("### unsubscribing from NWC");
      for (let sub of this.subscriptions) {
        sub.stop();
      }
      this.subscriptions = [];
    },
  },
});
