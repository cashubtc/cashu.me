import { defineStore } from "pinia";
import NDK, { NDKEvent, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { useLocalStorage } from "@vueuse/core";
import { bytesToHex } from '@noble/hashes/utils' // already an installed dependency
import { generateSecretKey, getPublicKey } from 'nostr-tools'
import { nip19 } from 'nostr-tools'

type NPCConnection = {
  walletPublicKey: string,
  walletPrivateKey: string,
}

type NPCBalance = {
  error: string,
  data: number
}

type NPCClaim = {
  error: string,
  data: {
    token: string,
  }
}

const NIP98Kind = 27235;

export const useNPCStore = defineStore("npc", {
  state: () => ({
    npcEnabled: useLocalStorage<boolean>("cashu.npc.enabled", false),
    npcConnections: useLocalStorage<NPCConnection[]>("cashu.npc.connections", []),
    npcAddress: useLocalStorage<string>("cashu.npc.address", ""),
    npcDomain: useLocalStorage<string>("cashu.npc.domain", "npub.cash"),
    baseURL: useLocalStorage<string>("cashu.npc.baseURL", "https://npub.cash"),
    ndk: new NDK(),
    signer: {} as NDKPrivateKeySigner,
  }),
  getters: {
  },
  actions: {
    generateNPCConnection: async function () {
      let conn: NPCConnection
      // NOTE: we only support one connection for now
      if (!this.npcConnections.length) {
        const sk = generateSecretKey() // `sk` is a Uint8Array
        const walletPublicKeyHex = getPublicKey(sk) // `pk` is a hex string
        const walletPrivateKeyHex = bytesToHex(sk)
        conn = {
          walletPublicKey: walletPublicKeyHex,
          walletPrivateKey: walletPrivateKeyHex,
        } as NPCConnection;
        this.npcConnections = this.npcConnections.concat(conn)
        this.npcAddress = nip19.npubEncode(this.npcConnections[0].walletPublicKey) + '@' + this.npcDomain
        this.baseURL = `https://${this.npcDomain}`
      }
      this.signer = new NDKPrivateKeySigner(this.npcConnections[0].walletPrivateKey)
      this.ndk = new NDK({ explicitRelayUrls: this.relays, signer: this.signer });
    },
    generateNip98Event: async function (url: string, method: string, body: string): Promise<string> {
      const nip98Event = new NDKEvent(this.ndk);
      nip98Event.kind = NIP98Kind;
      nip98Event.content = '';
      nip98Event.tags = [['u', url], ['method', method]];
      // TODO: if body is set, add 'payload' tag with sha256 hash of body
      const sig = await nip98Event.sign(this.signer)
      const eventString = JSON.stringify(nip98Event.rawEvent());
      // encode the eventString to base64
      return btoa(eventString)
    },
    getInfo: async function () {
      const authHeader = await this.generateNip98Event(
        `${this.baseURL}/api/v1/info`,
        "GET"
      );
      try {
        const response = await fetch(`${this.baseURL}/api/v1/info`, {
          method: "GET",
          headers: {
            Authorization: `Nostr ${authHeader}`,
          },
        })
        return response.json()
      } catch (e) {
        console.error(e)
      }
    },
    getBalance: async function (): Promise<number> {
      const authHeader = await this.generateNip98Event(
        `${this.baseURL}/api/v1/balance`,
        "GET"
      );
      console.log("Npub cash " + authHeader);
      try {
        const response = await fetch(`${this.baseURL}/api/v1/balance`, {
          method: "GET",
          headers: {
            Authorization: `Nostr ${authHeader}`,
          },
        })
        // deserialize the response to NPCBalance
        const balance: NPCBalance = await response.json()
        if (balance.error) {
          return 0
        }
        return balance.data
      } catch (e) {
        console.error(e)
        return 0
      }
    },
    getClaim: async function (): Promise<string> {
      const authHeader = await this.generateNip98Event(
        `${this.baseURL}/api/v1/claim`,
        "GET"
      );
      console.log("Npub cash " + authHeader);
      try {
        const response = await fetch(`${this.baseURL}/api/v1/claim`, {
          method: "GET",
          headers: {
            Authorization: `Nostr ${authHeader}`,
          },
        })
        // deserialize the response to NPCClaim
        const claim: NPCClaim = await response.json()
        if (claim.error) {
          return ""
        }
        return claim.data.token
      } catch (e) {
        console.error(e)
        return ""
      }
    }
  }
});
