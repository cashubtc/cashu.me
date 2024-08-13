import { defineStore } from "pinia";
import NDK, { NDKEvent, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { useLocalStorage } from "@vueuse/core";
import { bytesToHex } from '@noble/hashes/utils' // already an installed dependency
import { generateSecretKey, getPublicKey } from 'nostr-tools'
import { nip19 } from 'nostr-tools'
import { useWalletStore } from "./wallet";
import { useReceiveTokensStore } from "./receiveTokensStore";
import { notifyApiError, notifyError, notifySuccess, notifyWarning, notify } from "../js/notify";
import { Proof } from "@cashu/cashu-ts";
import token from "../js/token";
import { WalletProof, useMintsStore } from "./mints";
import { useTokensStore } from "../stores/tokens";
import { useNostrStore } from "../stores/nostr";
// type NPCConnection = {
//   walletPublicKey: string,
//   walletPrivateKey: string,
// }

type NPCInfo = {
  mintUrl: string,
  npub: string,
  username: string
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
type NPCWithdrawl = {
  id: number;
  claim_ids: number[];
  created_at: number;
  pubkey: string;
  amount: number;
}

type NPCWithdrawals = {
  error: string,
  data: {
    count: number,
    withdrawals: Array<NPCWithdrawl>
  }
}

const NIP98Kind = 27235;

export const useNPCStore = defineStore("npc", {
  state: () => ({
    npcEnabled: useLocalStorage<boolean>("cashu.npc.enabled", false),
    // npcConnections: useLocalStorage<NPCConnection[]>("cashu.npc.connections", []),
    npcAddress: useLocalStorage<string>("cashu.npc.address", ""),
    npcDomain: useLocalStorage<string>("cashu.npc.domain", "npub.cash"),
    baseURL: useLocalStorage<string>("cashu.npc.baseURL", "https://npub.cash"),
    // ndk: new NDK(),
    // signer: {} as NDKPrivateKeySigner,
  }),
  getters: {
  },
  actions: {
    claimAllTokens: async function () {
      if (!this.npcEnabled) {
        return
      }
      const receiveStore = useReceiveTokensStore();
      const npubCashBalance = await this.getBalance();
      console.log("npub.cash balance: " + npubCashBalance);
      if (npubCashBalance > 0) {
        notifySuccess(`You have ${npubCashBalance} sats on npub.cash`);
        const token = await this.getClaim();
        if (token) {
          // add token to history first
          this.addPendingTokenToHistory(token)
          receiveStore.receiveData.tokensBase64 = token;
          try {
            // redeem token automatically
            const walletStore = useWalletStore()
            await walletStore.redeem()
          } catch {
            // if it doesn't work, show the receive window
            receiveStore.showReceiveTokens = true;
          }
          // this.storeUnclaimedProofs(token)
          // const proofsToClaim = this.getUnclaimedProofs(token)
          // const proofsStore = useProofsStore()
          // const encodedToken = proofsStore.serializeProofs(proofsToClaim)
          // receiveStore.receiveData.tokensBase64 = encodedToken;
          // const walletStore = useWalletStore()
          // try {
          //   // try to receive automatically
          //   await walletStore.redeem()
          // } catch {
          //   // if it doesn't work, show the receive window
          //   receiveStore.showReceiveTokens = true;
          // }
        }
      }
    },
    // storeUnclaimedProofs: function (encodedToken: string) {
    //   const proofs: WalletProof[] = token.getProofs(token.decode(encodedToken))
    //   const unclaimedProofs = proofs.filter((p) =>
    //     !this.unclaimedProofs.map((pu) => pu.secret).includes(p.secret)
    //   );
    //   this.unclaimedProofs = this.unclaimedProofs.concat(unclaimedProofs)
    // },
    // getUnclaimedProofs: function (encodedToken: string): WalletProof[] {
    //   // get all unclaimedProofs from the same mint as encodedToken
    //   const mintUrl = token.getMint(token.decode(encodedToken))
    //   const mintsStore = useMintsStore()
    //   const mint = mintsStore.mints.find((m) => m.url == mintUrl);
    //   if (mint == undefined) {
    //     return []
    //   }
    //   const mintKeysetIds = mint.keysets.map((k) => k.id)
    //   const unclaimedProofsFromSameMint = this.unclaimedProofs.filter((p) => mintKeysetIds.includes(p.id))
    //   console.log(`unclaimed: ${unclaimedProofsFromSameMint.length}`)
    //   return unclaimedProofsFromSameMint;
    // },
    tokenAlreadyInHistory: function (tokenStr: string) {
      const tokensStore = useTokensStore();
      return (
        tokensStore.historyTokens.find((t) => t.token === tokenStr) !== undefined
      );
    },
    addPendingTokenToHistory: function (tokenStr: string) {
      const tokensStore = useTokensStore();
      if (this.tokenAlreadyInHistory(tokenStr)) {
        return;
      }
      const decodedToken = token.decode(tokenStr);
      if (decodedToken == undefined) {
        throw Error('could not decode token')
      }
      // get amount from decodedToken.token.proofs[..].amount
      const amount = token.getProofs(decodedToken).reduce(
        (sum, el) => (sum += el.amount),
        0
      );

      const mintUrl = token.getMint(decodedToken)
      const unit = token.getUnit(decodedToken)
      tokensStore.addPendingToken({
        amount: amount,
        serializedProofs: tokenStr,
        mint: mintUrl,
        unit: unit
      });
      this.showReceiveTokens = false;
    },
    generateNPCConnection: async function () {
      const nostrStore = useNostrStore()
      // await nostrStore.initSigner()
      const walletPublicKeyHex = nostrStore.pubkey
      console.log('Lightning address for wallet:', nip19.npubEncode(walletPublicKeyHex) + '@' + this.npcDomain)
      console.log('npub:', nip19.npubEncode(walletPublicKeyHex))
      this.baseURL = `https://${this.npcDomain}`
      // get info
      const info = await this.getInfo()
      if (info.error) {
        notifyError(info.error)
        return
      }
      // log info
      console.log(info)
      if (info.username) {
        notifySuccess(`You are now logged in as ${info.username}`)
        this.npcAddress = info.username + '@' + this.npcDomain
      } else {
        this.npcAddress = nip19.npubEncode(walletPublicKeyHex) + '@' + this.npcDomain
      }
      // let conn: NPCConnection
      // NOTE: we only support one connection for now
      // if (!this.npcConnections.length) {
      //   const walletStore = useWalletStore();
      //   const sk = walletStore.seed.slice(0, 32)
      //   const walletPublicKeyHex = getPublicKey(sk) // `pk` is a hex string
      //   const walletPrivateKeyHex = bytesToHex(sk)
      //   // print nsec and npub
      //   console.log('Lightning address for wallet:', nip19.npubEncode(walletPublicKeyHex) + '@npub.cash')
      //   // console.log('nsec:', nip19.nsecEncode(sk))
      //   console.log('npub:', nip19.npubEncode(walletPublicKeyHex))
      //   // conn = {
      //   //   walletPublicKey: walletPublicKeyHex,
      //   //   walletPrivateKey: walletPrivateKeyHex,
      //   // } as NPCConnection;
      //   // this.npcConnections = this.npcConnections.concat(conn)
      //   this.npcAddress = nip19.npubEncode(this.npcConnections[0].walletPublicKey) + '@' + this.npcDomain

      // }
      // this.signer = new NDKPrivateKeySigner(this.npcConnections[0].walletPrivateKey)
      // this.ndk = new NDK({ explicitRelayUrls: this.relays, signer: this.signer });
    },
    generateNip98Event: async function (url: string, method: string, body: string): Promise<string> {
      const nostrStore = useNostrStore()
      await nostrStore.initSigner()
      const nip98Event = new NDKEvent(new NDK());
      nip98Event.kind = NIP98Kind;
      nip98Event.content = '';
      nip98Event.tags = [['u', url], ['method', method]];
      // TODO: if body is set, add 'payload' tag with sha256 hash of body
      const sig = await nip98Event.sign(nostrStore.signer)
      const eventString = JSON.stringify(nip98Event.rawEvent());
      // encode the eventString to base64
      return btoa(eventString)
    },
    getInfo: async function (): Promise<NPCInfo> {
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
        const info: NPCInfo = await response.json()
        return info
      } catch (e) {
        console.error(e)
        return {
          mintUrl: "",
          npub: "",
          username: ""
        }
      }
    },
    getBalance: async function (): Promise<number> {
      const authHeader = await this.generateNip98Event(
        `${this.baseURL}/api/v1/balance`,
        "GET"
      );
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
    },
    // getWithdraw: async function (): Promise<string> {
    //   const authHeader = await this.generateNip98Event(
    //     `${this.baseURL}/api/v1/withdrawals`,
    //     "POST",
    //   );
    //   try {
    //     const response = await fetch(`${this.baseURL}/api/v1/withdraw`, {
    //       method: "GET",
    //       headers: {
    //         Authorization: `Nostr ${authHeader}`,
    //       },
    //     })
    //     // deserialize the response to NPCClaim
    //     const claim: NPCClaim = await response.json()
    //     if (claim.error) {
    //       return ""
    //     }
    //     return claim.data.token
    //   } catch (e) {
    //     console.error(e)
    //     return ""
    //   }
    // }
  }
});
