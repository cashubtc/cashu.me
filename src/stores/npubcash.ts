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
      let conn: NPCConnection
      // NOTE: we only support one connection for now
      if (!this.npcConnections.length) {
        const walletStore = useWalletStore();
        const sk = walletStore.seed.slice(0, 32)
        const walletPublicKeyHex = getPublicKey(sk) // `pk` is a hex string
        const walletPrivateKeyHex = bytesToHex(sk)
        // print nsec and npub
        console.log('Lightning address for wallet:', nip19.npubEncode(walletPublicKeyHex) + '@npub.cash')
        // console.log('nsec:', nip19.nsecEncode(sk))
        console.log('npub:', nip19.npubEncode(walletPublicKeyHex))
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
      return 123;
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
      return "cashuAeyJ0b2tlbiI6W3sicHJvb2ZzIjpbeyJhbW91bnQiOjY0LCJzZWNyZXQiOiJlZjExOTBhYWYyY2UzMjBmZDg5ZDRlZWZmNjk3NTZiZTU1YjUxOThjMDk5N2ZkMjdkNjE1MjVjZTAwOTgyZDc5IiwiQyI6IjAzYjdkMzJlODgyNDA4YmE0ODVhODQ4NWY2NWFjNWFlYzM5ZTU5YTFlZjQzNTY1NjU1ODU5ZjIxNzE0Zjk1N2RmNyIsImlkIjoiMDBhZDI2OGM0ZDFmNTgyNiJ9LHsiYW1vdW50Ijo4LCJzZWNyZXQiOiIzOWZiY2ExZDE3YjNkZTU0MGQyMjI1OGRiYTkyYmRjMTZjMjM4N2M4NGYxMDM5MjBhNzc1NDI3ODg2OGY1MTU3IiwiQyI6IjAzZjU2ODAyZGNmNzE3NWYyNTViYTFhYmRiMmEyYjdjOTFhMWI0N2EzMDBkOGY1YjhhNzNkMDQwNzhhYTJmNGU5NCIsImlkIjoiMDBhZDI2OGM0ZDFmNTgyNiJ9LHsiYW1vdW50Ijo0LCJzZWNyZXQiOiJkOTYwYWVhM2UwMTc3YTg5NjQ4ZGU2NDFlMTIxOWJlZThlMWU5ZTUyNDdhYTdlNjU1NmJlMjQwMDUxMDE4YzE1IiwiQyI6IjAyZGYyZTA4MGZlOTQzYzAyYTIyNzQ0YzQ1YzQ2NDAwMzFiNmE5NThmZDcxODRlNDJmMTllMjczM2EwYjNkMTY0NyIsImlkIjoiMDBhZDI2OGM0ZDFmNTgyNiJ9LHsiYW1vdW50IjoxLCJzZWNyZXQiOiI3MWM2NmMwZTkyMjVhODc4OWRhNTM4NGUzMTI3ODBkYmU3NGRlY2I2OGQ0YWY4ODQ5MGUxYWNhNTUwMTQ5MjI3IiwiQyI6IjAyNzNhYzhjODQzMTUxNjI2MDExYjJiYTBjMWY3OGFiYmY5YWEwYjY5ZWQ5YzE5NmY2MTM2MzBhNGNjM2VkYzhiNSIsImlkIjoiMDBhZDI2OGM0ZDFmNTgyNiJ9XSwibWludCI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzMzOCJ9XSwidW5pdCI6InNhdCJ9";
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
