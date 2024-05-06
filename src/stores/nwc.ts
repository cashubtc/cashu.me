import { defineStore } from "pinia";
import NDK, { NDKEvent, NDKNip07Signer, NDKNip46Signer, NDKFilter, NDKPrivateKeySigner, NDKKind, NDKSubscription } from "@nostr-dev-kit/ndk";
import { connected } from "process";
import { min } from "underscore";
import { useLocalStorage } from "@vueuse/core";
import { bytesToHex } from '@noble/hashes/utils' // already an installed dependency
import { nip04, generateSecretKey, getPublicKey } from 'nostr-tools'
import { useMintsStore } from './mints'
import { useWalletStore } from "./wallet";
import { unsubscribe } from "diagnostics_channel";

type NWCConnection = {
  walletPublicKey: string,
  walletPrivateKey: string,
  connectionSecret: string,
  connectionPublicKey: string,
  connectionString: string,
  allowanceLeft?: number
}

type NWCCommand = {
  method: string,
  params: any
}

type NWCResult = {
  result_type: string,
  result: any
}
enum NWCKind {
  NWCInfo = 13194,
  NWCRequest = 23194,
  NWCResponse = 23195
}

export const useNWCStore = defineStore("nwc", {
  state: () => ({
    nwcEnabled: useLocalStorage<boolean>("cashu.nwc.enabled", false),
    connections: useLocalStorage<NWCConnection[]>("cashu.nwc.connections", []),
    supportedMethods: ["pay_invoice", "get_balance", "get_info", "list_transactions"],
    relays: ["wss://relay.snort.social"],
    ndk: new NDK(),
    subscriptions: [] as NDKSubscription[],
    showNWCDialog: false,
    showNWCData: {
      connectionString: "",
    }
  }),
  getters: {

  },
  actions: {
    // ––––---------- NWC Command Handlers ––––----------
    handleGetInfo: async function (nwcCommand: NWCCommand) {
      console.log("### get_info", nwcCommand.method)
      return {
        result_type: "get_info",
        result: {
          alias: "Cashu.me",
          color: "#FF0000",
          network: "mainnet",
          methods: this.supportedMethods
        }
      }
    },
    handleGetBalance: async function (nwcCommand: NWCCommand) {
      const mintsStore = useMintsStore()
      console.log("### get_balance", nwcCommand.method)
      return {
        result_type: "get_balance",
        result: {
          balance: mintsStore.activeBalance * 1000
        }
      }
    },
    handlePayInvoice: async function (nwcCommand: NWCCommand) {
      const invoice = nwcCommand.params.invoice
      const amountMsat = nwcCommand.params.amount
      console.log("### pay_invoice", nwcCommand.method)
      console.log("### invoice", invoice)
      console.log("### amountMsat", amountMsat)
      // pay invoice
      const walletStore = useWalletStore()
      walletStore.decodeRequest(invoice)
      // expect that the melt quote was requested
      if (walletStore.payInvoiceData.meltQuote.response.amount == 0 || walletStore.payInvoiceData.meltQuote.error) {
        throw new Error("Melt quote not requested")
      }
      const meltData = await walletStore.melt()
      return {
        result_type: "pay_invoice",
        result: {
          preimage: meltData.preimage,
        }
      }
    },
    handleListTransactions: async function (nwcCommand: NWCCommand) {
      console.log("### list_transactions", nwcCommand.method)

      const walletStore = useWalletStore()
      const from = nwcCommand.params.from || 0
      const until = nwcCommand.params.until || Math.floor(Date.now() / 1000)
      const limit = nwcCommand.params.limit || 10
      const offset = nwcCommand.params.offset || 0
      const unpaid = nwcCommand.params.unpaid || false
      const type = nwcCommand.params.type || undefined


      const invoiceHistory = walletStore.invoiceHistory
      const transactions = invoiceHistory.filter((invoice) => {
        const date = new Date(invoice.date)
        const dateSeconds = Math.floor(date.getTime() / 1000)
        if (from && dateSeconds < from) {
          return false
        }
        if (until && dateSeconds > until) {
          return false
        }
        if (type && type == "incoming" && invoice.amount < 0) {
          return false
        }
        if (type && type == "outgoing" && invoice.amount > 0) {
          return false
        }
        if (unpaid && invoice.status == "paid") {
          return false
        }
        return true
      }
      ).slice(offset, offset + limit)
      return {
        result_type: "list_transactions",
        result: {
          transactions: transactions
        }
      }
    },
    // ––––---------- NWC Connection ––––----------
    replyNWC: async function (result: NWCResult, event: NDKEvent, conn: NWCConnection) {
      // reply to NWC with result
      let replyEvent = new NDKEvent(event.ndk);
      replyEvent.kind = 23195;
      console.log("### replying with", JSON.stringify(result))
      replyEvent.content = await nip04.encrypt(conn.walletPrivateKey, event.author.pubkey, JSON.stringify(result));
      replyEvent.tags = [["p", event.author.pubkey], ["e", event.id]];
      console.log("### replyEvent", replyEvent)
      console.log("### replying to", event.id)
      // await this.ndk.publish(replyEvent);
      await replyEvent.publish()
    },
    parseNWCCommand: async function (command: string, event: NDKEvent, conn: NWCConnection) {
      // parse command to JSON object {method: 'pay_invoice', params: {invoice: '1234'}}
      let nwcCommand: NWCCommand = JSON.parse(command)
      let result: NWCResult
      console.log("### nwcCommand", nwcCommand)
      // parse "get_info" without params
      if (nwcCommand.method == "get_info") {
        result = await this.handleGetInfo(nwcCommand)
      } else if (nwcCommand.method == "get_balance") {
        result = await this.handleGetBalance(nwcCommand)
      } else if (nwcCommand.method == "pay_invoice") {
        result = await this.handlePayInvoice(nwcCommand)
      } else if (nwcCommand.method == "list_transactions") {
        result = await this.handleListTransactions(nwcCommand)
      } else {
        console.log("### method not supported", nwcCommand.method)
        return // do nothing
      }
      await this.replyNWC(result, event, conn)
    },
    generateNWCConnection: async function () {
      let conn: NWCConnection
      // NOTE: we only support one connection for now
      if (!this.connections.length) {
        const sk = generateSecretKey() // `sk` is a Uint8Array
        const walletPublicKeyHex = getPublicKey(sk) // `pk` is a hex string
        const walletPrivateKeyHex = bytesToHex(sk)

        const connectionSecret = generateSecretKey()
        const connectionPublicKeyHex = getPublicKey(connectionSecret)
        const connectionSecretHex = bytesToHex(connectionSecret)
        // create a string with format nostr+walletconnect://<walletPublicKeyHex>?relay=<relay1>&relay=<relay2>&relay=<relay3>&secret=<connectionSecret>
        const connectionString = `nostr+walletconnect://${walletPublicKeyHex}?relay=${this.relays.join('&relay=')}&secret=${connectionSecretHex}`
        conn = {
          walletPublicKey: walletPublicKeyHex,
          walletPrivateKey: walletPrivateKeyHex,
          connectionSecret: connectionSecretHex,
          connectionPublicKey: connectionPublicKeyHex,
          connectionString: connectionString
        } as NWCConnection;
        this.connections = this.connections.concat(conn)
      } else {
        conn = this.connections[0]
      }

      const walletSigner = new NDKPrivateKeySigner(conn.walletPrivateKey)
      this.ndk = new NDK({ explicitRelayUrls: this.relays, signer: walletSigner });
      this.ndk.connect();


      const nip47InfoEvent = new NDKEvent(this.ndk);
      nip47InfoEvent.kind = NWCKind.NWCInfo;
      nip47InfoEvent.content = this.supportedMethods.join(' ')
      try {
        await nip47InfoEvent.publish()
      } catch (e) {
        console.log("### could not publish nip47InfoEvent", nip47InfoEvent)
        console.log("### error", e)
      }
    },
    listenToNWCCommands: async function () {
      // if (!this.connections.length) {
      //   await this.generateNWCConnection()
      // }
      await this.generateNWCConnection()
      // we only support one connection for now
      const conn = this.connections[0]

      console.log("### REMOVE THIS: connection string: ", conn.connectionString)

      const currentUnitTime = Math.floor(Date.now() / 1000)
      let filter = {
        kinds: [NWCKind.NWCRequest as NDKKind],
        since: currentUnitTime,
        authors: [conn.connectionPublicKey],
        "#p": [conn.walletPublicKey]
      } as NDKFilter;
      console.log("### filter", filter)
      const sub = this.ndk.subscribe(filter);
      this.subscriptions.push(sub)

      sub.on("eose", () => console.log("All relays have reached the end of the event stream"));
      sub.on("close", () => console.log("Subscription closed"));

      sub.on("event", async (event) => {
        // console.log("### event", event)
        // console.log('### event.kind', event.kind)
        // console.log('### event.id', event.id)
        // console.log('### event.author.pubkey', event.author.pubkey)
        // console.log("### event.tagValue('p')", event.tagValue("p"))
        // console.log("### event.tagValue('e')", event.tagValue("e"))
        // console.log("### event.content", event.content)
        if (event.kind == 23194) {
          if (!this.nwcEnabled) {
            console.log("### Received NWC command but NWC is disabled")
            return
          }
          // console.log("### is a NWC request!")
          const decryptedContent = await nip04.decrypt(conn.connectionSecret, conn.walletPublicKey, event.content)
          // console.log("### decryptedContent", decryptedContent)
          await this.parseNWCCommand(decryptedContent, event, conn)
        }

      });
    },
    unsubscribeNWC: async function () {
      console.log("### unsubscribing from NWC")
      for (let sub of this.subscriptions) {
        sub.closeOnEose = true
        console.log("### closing subscription")
      }
    }
  },
});
