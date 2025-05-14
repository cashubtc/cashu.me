import { defineStore } from "pinia";
import NDK, { NDKEvent, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { useLocalStorage } from "@vueuse/core";
import { bytesToHex } from "@noble/hashes/utils"; // already an installed dependency
import { generateSecretKey, getPublicKey } from "nostr-tools";
import { nip19 } from "nostr-tools";
import { useWalletStore } from "./wallet";
import { useReceiveTokensStore } from "./receiveTokensStore";
import {
  notifyApiError,
  notifyError,
  notifySuccess,
  notifyWarning,
  notify,
} from "../js/notify";
import { MintQuoteState, Proof } from "@cashu/cashu-ts";
import token from "../js/token";
import { WalletProof, useMintsStore } from "./mints";
import { useTokensStore } from "../stores/tokens";
import { useNostrStore } from "../stores/nostr";
import { useInvoicesWorkerStore } from "./invoicesWorker";
import { currentDateStr } from "src/js/utils";
import { date } from "quasar";
// type NPCConnection = {
//   walletPublicKey: string,
//   walletPrivateKey: string,
// }

type NPCInfo = {
  mintUrl: string;
  npub: string;
  username: string;
  error?: string;
};

type NPCBalance = {
  error: string;
  data: number;
};

type NPCClaim = {
  error: string;
  data: {
    token: string;
  };
};

type NPCQuote = {
  created_at: number;
  paid_at: number;
  mint_url: string;
  quote_id: string;
  amount: number;
  state: "PAID";
};

type NPCQuoteResponse =
  | {
      error: true;
      message: string;
    }
  | {
      error: false;
      data: {
        quotes: NPCQuote[];
      };
      metadata: { limit: number; total: number; since?: number };
    };

type NPCWithdrawl = {
  id: number;
  claim_ids: number[];
  created_at: number;
  pubkey: string;
  amount: number;
};

type NPCWithdrawals = {
  error: string;
  data: {
    count: number;
    withdrawals: Array<NPCWithdrawl>;
  };
};

const NIP98Kind = 27235;

export const useNPCStore = defineStore("npc", {
  state: () => ({
    npcEnabled: useLocalStorage<boolean>("cashu.npc.enabled", false),
    npcV2Enabled: useLocalStorage<boolean>("cashu.npc.v2Enabled", false),
    npcLastCheck: useLocalStorage<number>("cashu.npc.lastCheck", null),
    automaticClaim: useLocalStorage<boolean>("cashu.npc.automaticClaim", true),
    // npcConnections: useLocalStorage<NPCConnection[]>("cashu.npc.connections", []),
    npcAddress: useLocalStorage<string>("cashu.npc.address", ""),
    npcV2Address: useLocalStorage<string>("cashu.npc.v2Address", ""),
    npcDomain: useLocalStorage<string>("cashu.npc.domain", "npub.cash"),
    npcV2Domain: useLocalStorage<string>("cashu.npc.v2Domain", "npubx.cash"),
    baseURL: useLocalStorage<string>("cashu.npc.baseURL", "https://npub.cash"),
    v2BaseURL: useLocalStorage<string>(
      "cashu.npc.v2BaseURL",
      "https://npubx.cash"
    ),
    npcLoading: false,
    // ndk: new NDK(),
    // signer: {} as NDKPrivateKeySigner,
  }),
  getters: {},
  actions: {
    generateNPCConnection: async function () {
      const nostrStore = useNostrStore();
      if (!nostrStore.pubkey) {
        return;
      }
      const walletPublicKeyHex = nostrStore.pubkey;
      console.log(
        "Lightning address for wallet:",
        nip19.npubEncode(walletPublicKeyHex) + "@" + this.npcDomain
      );
      console.log("npub:", nip19.npubEncode(walletPublicKeyHex));
      this.baseURL = `https://${this.npcDomain}`;
      const previousAddress = this.npcAddress;
      this.npcAddress =
        nip19.npubEncode(walletPublicKeyHex) + "@" + this.npcDomain;
      if (!this.npcEnabled) {
        return;
      }
      // get info
      this.npcLoading = true;
      try {
        const info = await this.getInfo();
        if (info.error) {
          notifyError(info.error);
          return;
        }
        // log info
        console.log(info);
        if (info.username) {
          const usernameAddress = info.username + "@" + this.npcDomain;
          if (previousAddress !== usernameAddress) {
            notifySuccess(`Logged in as ${info.username}`);
          }
          this.npcAddress = usernameAddress;
        }
      } catch (e: any) {
        notifyApiError(e);
      } finally {
        this.npcLoading = false;
      }
    },
    generateNPCV2Connection: async function () {
      const nostrStore = useNostrStore();
      if (!nostrStore.pubkey) {
        return;
      }
      const walletPublicKeyHex = nostrStore.pubkey;
      this.v2BaseURL = `https://${this.npcV2Domain}`;
      this.npcV2Address =
        nip19.npubEncode(walletPublicKeyHex) + "@" + this.npcV2Domain;
    },
    generateNip98Event: async function (
      url: string,
      method: string,
      body?: string
    ): Promise<string> {
      const nostrStore = useNostrStore();
      await nostrStore.initSignerIfNotSet();
      const nip98Event = new NDKEvent(new NDK());
      nip98Event.kind = NIP98Kind;
      nip98Event.content = "";
      nip98Event.tags = [
        ["u", url],
        ["method", method],
      ];
      // TODO: if body is set, add 'payload' tag with sha256 hash of body
      const sig = await nip98Event.sign(nostrStore.signer);
      const eventString = JSON.stringify(nip98Event.rawEvent());
      // encode the eventString to base64
      return btoa(eventString);
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
        });
        const info: NPCInfo = await response.json();
        return info;
      } catch (e) {
        console.error(e);
        return {
          mintUrl: "",
          npub: "",
          username: "",
        };
      }
    },
    getLatestQuotes: async function () {
      if (!this.npcV2Enabled) {
        return;
      }
      const walletStore = useWalletStore();
      const since = this.npcLastCheck ? `?since=${this.npcLastCheck}` : "";

      const quoteUrl = `${this.v2BaseURL}/api/v2/wallet/quotes`;
      const authHeader = await this.generateNip98Event(quoteUrl, "GET");
      try {
        const response = await fetch(quoteUrl + since, {
          headers: {
            Authorization: `Nostr ${authHeader}`,
          },
        });
        const resData: NPCQuoteResponse = await response.json();
        if (resData.error) {
          return;
        }
        resData.data.quotes.forEach((quote) => {
          if (
            walletStore.invoiceHistory.find((i) => i.quote === quote.quote_id)
          ) {
            return;
          }
          walletStore.invoiceHistory.push({
            mint: quote.mint_url,
            memo: "123",
            bolt11: "12345",
            amount: quote.amount,
            quote: quote.quote_id,
            date: date.formatDate(
              new Date(quote.created_at * 1000),
              "YYYY-MM-DD HH:mm:ss"
            ),
            status: "pending",
            unit: "sat",
            mintQuote: {
              request: "12345",
              quote: quote.quote_id,
              state: MintQuoteState.PAID,
              expiry: 9999999999,
            },
          });
        });
        // this.npcLastCheck = Math.floor(Date.now() / 1000);
      } catch (e) {
        console.error(e);
        return;
      }
    },
    claimAllTokens: async function () {
      if (!this.npcEnabled) {
        return;
      }
      const receiveStore = useReceiveTokensStore();
      const npubCashBalance = await this.getBalance();
      console.log("npub.cash balance: " + npubCashBalance);
      if (npubCashBalance > 0) {
        notifySuccess(`You have ${npubCashBalance} sats on npub.cash`);
        const token = await this.getClaim();
        if (token) {
          // add token to history first
          this.addPendingTokenToHistory(token);
          receiveStore.receiveData.tokensBase64 = token;
          if (this.automaticClaim) {
            try {
              // redeem token automatically
              const walletStore = useWalletStore();
              await walletStore.redeem();
            } catch {
              // if it doesn't work, show the receive window
              receiveStore.showReceiveTokens = true;
            }
          } else {
            receiveStore.showReceiveTokens = true;
          }
        }
      }
    },
    tokenAlreadyInHistory: function (tokenStr: string) {
      const tokensStore = useTokensStore();
      return (
        tokensStore.historyTokens.find((t) => t.token === tokenStr) !==
        undefined
      );
    },
    addPendingTokenToHistory: function (tokenStr: string) {
      const receiveStore = useReceiveTokensStore();
      if (this.tokenAlreadyInHistory(tokenStr)) {
        notifySuccess("Ecash already in history");
        receiveStore.showReceiveTokens = false;
        return;
      }
      const tokensStore = useTokensStore();
      const decodedToken = token.decode(tokenStr);
      if (decodedToken == undefined) {
        throw Error("could not decode token");
      }
      // get amount from decodedToken.token.proofs[..].amount
      const amount = token
        .getProofs(decodedToken)
        .reduce((sum, el) => (sum += el.amount), 0);

      const mintUrl = token.getMint(decodedToken);
      const unit = token.getUnit(decodedToken);
      tokensStore.addPendingToken({
        amount: amount,
        token: tokenStr,
        mint: mintUrl,
        unit: unit,
      });
      receiveStore.showReceiveTokens = false;
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
        });
        // deserialize the response to NPCBalance
        const balance: NPCBalance = await response.json();
        if (balance.error) {
          return 0;
        }
        return balance.data;
      } catch (e) {
        console.error(e);
        return 0;
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
        });
        // deserialize the response to NPCClaim
        const claim: NPCClaim = await response.json();
        if (claim.error) {
          return "";
        }
        return claim.data.token;
      } catch (e) {
        console.error(e);
        return "";
      }
    },
  },
});
