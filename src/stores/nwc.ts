import { defineStore } from "pinia";
import NDK, { NDKEvent, NDKNip07Signer, NDKNip46Signer, NDKFilter, NDKPrivateKeySigner, NDKKind } from "@nostr-dev-kit/ndk";
import { connected } from "process";
import { min } from "underscore";
import { useLocalStorage } from "@vueuse/core";
import { bytesToHex } from '@noble/hashes/utils' // already an installed dependency
import { nip04, generateSecretKey, getPublicKey } from 'nostr-tools'
import { useMintsStore } from './mints'

type NWCConnection = {
  walletPublicKey: string,
  walletPrivateKey: string,
  connectionSecret: string,
  connectionPublicKey: string,
  connectionString: string

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
    connections: useLocalStorage<NWCConnection[]>("cashu.nwc.connections", []),
    relays: ["wss://nos.lol"],
    ndk: new NDK(),
  }),
  getters: {

  },
  actions: {
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
        console.log("### get_info", nwcCommand.method)
        result = {
          result_type: "get_info",
          result: {
            alias: "Cashu.me",
            color: "#FF0000",
            pubkey: event.author.pubkey,
            network: "mainnet",
            block_height: 1,
            block_hash: "abc",
            methods: ["pay_invoice", "get_balance", "get_info"]
          }
        }
      } else if (nwcCommand.method == "get_balance") {
        const mintsStore = useMintsStore()
        console.log("### get_balance", nwcCommand.method)
        result = {
          result_type: "get_balance",
          result: {
            balance: mintsStore.activeBalance * 1000
          }
        }
      } else {
        return // do nothing
      }
      await this.replyNWC(result, event, conn)
    },
    generateNWCConnection: async function () {
      let conn: NWCConnection
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
      console.log("### connectionString", conn.connectionString)

      const walletSigner = new NDKPrivateKeySigner(conn.walletPrivateKey)
      this.ndk = new NDK({ explicitRelayUrls: this.relays, signer: walletSigner });
      this.ndk.connect();


      const nip47InfoEvent = new NDKEvent(this.ndk);
      nip47InfoEvent.kind = NWCKind.NWCInfo;
      nip47InfoEvent.content = "pay_invoice get_balance get_info";
      try {
        await nip47InfoEvent.publish()
      } catch (e) {
        console.log("### could not publish nip47InfoEvent", nip47InfoEvent)
        console.log("### error", e)
      }
      // await this.ndk.publish(nip47InfoEvent);

      // // first make sure we published this event by fetching it
      // let filterInfoEvent: NDKFilter = { kinds: [13194], authors: [conn.walletPublicKey] };
      // let eventsInfoEvent = await this.ndk.fetchEvents(filterInfoEvent);
      // console.log("### InfoEvent", eventsInfoEvent)

      let filter = { kinds: [NWCKind.NWCRequest as NDKKind], authors: [conn.connectionPublicKey], "#p": [conn.walletPublicKey] } as NDKFilter;
      // let filter = { kinds: [23194] };
      console.log("### filter", filter)
      // let events = await this.ndk.fetchEvents(filter);
      const sub = this.ndk.subscribe(filter); // Get all kind:1s


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
          // console.log("### is a NWC request!")
          const decryptedContent = await nip04.decrypt(conn.connectionSecret, conn.walletPublicKey, event.content)
          // console.log("### decryptedContent", decryptedContent)
          await this.parseNWCCommand(decryptedContent, event, conn)
        }

      });
    },
  },
});
