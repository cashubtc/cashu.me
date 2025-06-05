import { defineStore } from "pinia";
import NDK, { NDKEvent } from "@nostr-dev-kit/ndk";
import { useLocalStorage } from "@vueuse/core";
import { nip19 } from "nostr-tools";
import { useWalletStore } from "./wallet";
import { notifyApiError, notifyError, notifySuccess } from "../js/notify";
import { MintQuoteState, Proof } from "@cashu/cashu-ts";
import { useNostrStore } from "../stores/nostr";
import { date } from "quasar";
import { useMintsStore } from "./mints";

type NPCUser = {
  lockQuote: boolean;
  mintUrl: string;
  name?: string;
  pubkey: string;
};

type NPCV2InfoReponse =
  | {
      error: true;
      message: string;
    }
  | {
      error: false;
      data: {
        user: NPCUser;
      };
    };

type NPCV2UsernameReponse =
  | { error: true; message: string }
  | { error: false; data: { user: NPCUser } };

type NPCQuote = {
  createdAt: number;
  paidAt: number;
  expiresAt: number;
  mintUrl: string;
  quoteId: string;
  request: string;
  amount: number;
  state: string;
  locked: boolean;
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

type UsernameQuote = { username: string; creq: string };

const NIP98Kind = 27235;

export const useNPCV2Store = defineStore("npcV2", {
  state: () => ({
    npcV2Enabled: useLocalStorage<boolean>("cashu.npc.v2.enabled", false),
    npcV2ClaimAutomatically: useLocalStorage<boolean>(
      "cashu.npc.v2.claimAutomatically",
      true
    ),
    npcV2LastCheck: useLocalStorage<number>("cashu.npc.v2.lastCheck", null),
    npcV2Address: useLocalStorage<string>("cashu.npc.v2.address", ""),
    npcV2Mint: useLocalStorage<string>("cashu.npc.v2.mint", null),
    npcV2Domain: "",
    npcV2BaseURL: useLocalStorage<string>(
      "cashu.npc.v2.baseURL",
      "https://npubx.cash"
    ),
    npcV2Loading: false,
    // ndk: new NDK(),
    // signer: {} as NDKPrivateKeySigner,
  }),
  getters: {},
  actions: {
    generateNPCV2Connection: async function () {
      if (!this.npcV2Enabled) {
        return;
      }
      const nostrStore = useNostrStore();
      const mintsStore = useMintsStore();
      if (!nostrStore.pubkey) {
        return;
      }
      const walletPublicKeyHex = nostrStore.pubkey;
      this.npcV2Domain = new URL(this.npcV2BaseURL).hostname;
      this.npcV2Address =
        nip19.npubEncode(walletPublicKeyHex) + "@" + this.npcV2Domain;
      this.npcV2Loading = true;
      try {
        const previousAddress = this.npcV2Address;
        const info = await this.getV2Info();
        if (info.name) {
          const usernameAddress = info.name + "@" + this.npcV2Domain;
          if (previousAddress !== usernameAddress) {
            notifySuccess(`Logged in as ${info.name}`);
          }
          this.npcV2Address = usernameAddress;
        }
        if (mintsStore.mints.map((m) => m.url).includes(info.mintUrl)) {
          this.npcV2Mint = info.mintUrl;
        } else if (mintsStore.activeMintUrl) {
          await this.changeMintUrl(mintsStore.activeMintUrl);
        } else {
          await mintsStore.addMint({ url: info.mintUrl });
          this.npcV2Mint = info.mintUrl;
        }
      } catch (e) {
        if (e instanceof Error) {
          notifyApiError(e);
        }
        console.log(e);
      } finally {
        this.npcV2Loading = false;
      }
    },
    getV2Info: async function (): Promise<{
      name?: string;
      mintUrl: string;
      lockQuote: boolean;
      pubkey: string;
    }> {
      try {
        const response = await this.sendAuthedRequest(
          `${this.npcV2BaseURL}/api/v2/user/info`
        );
        const info: NPCV2InfoReponse = await response.json();
        if (info.error) {
          notifyError(info.message);
          throw new Error(info.message);
        }
        return info.data.user;
      } catch (e) {
        console.error(e);
        return {
          mintUrl: "",
          name: "",
          pubkey: "",
          lockQuote: false,
        };
      }
    },
    changeMintUrl: async function (mintUrl: string) {
      const mintstore = useMintsStore();
      if (!mintstore.mints.find((m) => m.url === mintUrl)) {
        notifyError(
          `Please make sure ${mintUrl} is added to your wallet first!`,
          "Could not update npubx.cash mint"
        );
        return;
      }
      try {
        const res = await this.sendAuthedRequest(
          `${this.npcV2BaseURL}/api/v2/user/mint`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            method: "PATCH",
            body: JSON.stringify({ mint_url: mintUrl }),
          }
        );
        const data = await res.json();
        if (data.error) {
          throw new Error(data.message);
        }
        this.npcV2Mint = data.data.user.mintUrl;
      } catch (e) {
        console.log(e);
        if (e instanceof Error) {
          notifyError(e.message);
        } else {
          notifyError("Something went wrong!");
        }
      }
    },
    getLatestQuotes: async function () {
      if (!this.npcV2Enabled) {
        return;
      }
      const walletStore = useWalletStore();
      const since = this.npcV2LastCheck ? `?since=${this.npcV2LastCheck}` : "";

      const quoteUrl = `${this.npcV2BaseURL}/api/v2/wallet/quotes`;
      try {
        const response = await this.sendAuthedRequest(
          quoteUrl + since,
          undefined,
          quoteUrl
        );
        const resData: NPCQuoteResponse = await response.json();
        if (resData.error) {
          return;
        }
        let latestQuoteTime: number | undefined = undefined;
        resData.data.quotes.forEach(async (quote) => {
          if (
            walletStore.invoiceHistory.find((i) => i.quote === quote.quoteId)
          ) {
            return;
          }
          if (!latestQuoteTime || latestQuoteTime < quote.createdAt) {
            latestQuoteTime = quote.createdAt;
          }
          await walletStore.invoiceHistory.push({
            label: "Zap",
            mint: quote.mintUrl,
            memo: "",
            bolt11: quote.request,
            amount: quote.amount,
            quote: quote.quoteId,
            date: date.formatDate(
              new Date(quote.createdAt * 1000),
              "YYYY-MM-DD HH:mm:ss"
            ),
            status: "pending",
            unit: "sat",
            mintQuote: {
              request: quote.request,
              quote: quote.quoteId,
              state: MintQuoteState.PAID,
              expiry: quote.expiresAt,
              amount: quote.amount,
              unit: "sat",
            },
          });
          if (this.npcV2ClaimAutomatically) {
            await walletStore.mintOnPaid(quote.quoteId);
          }
        });
        if (latestQuoteTime) {
          this.npcV2LastCheck = latestQuoteTime;
        }
      } catch (e) {
        console.error(e);
        return;
      }
    },
    getUsernameQuote: async function (
      username: string
    ): Promise<UsernameQuote> {
      const res = await this.sendAuthedRequest(
        `${this.npcV2BaseURL}/api/v2/user/username`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        }
      );
      const data = (await res.json()) as NPCV2UsernameReponse;
      if (data.error) {
        if (res.status === 402) {
          const paymentHeader = res.headers.get("X-Cashu");
          if (!paymentHeader) {
            throw new Error("Unexpected reply without payment request");
          }
          return { username, creq: paymentHeader };
        }
        throw new Error(data.message);
      }
      throw new Error("Unexpected reply without payment request");
    },
    setUsername: async function (username: string, token: string) {
      try {
        const res = await this.sendAuthedRequest(
          `${this.npcV2BaseURL}/api/v2/user/username`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Cashu": token },
            body: JSON.stringify({ username }),
          }
        );
        const data = (await res.json()) as NPCV2UsernameReponse;
        if (data.error) {
          throw new Error(data.message);
        }
        this.npcV2Address = `${data.data.user.name}@${this.npcV2Domain}`;
      } catch (e) {
        console.log(e);
        if (e instanceof Error) {
          notifyError(e.message);
        }
      }
    },
    sendAuthedRequest: async function (
      url: string,
      opts?: RequestInit,
      authUrl?: string
    ) {
      const authHeader = await this.generateNip98Event(
        authUrl || url,
        opts?.method || "GET"
      );
      return fetch(url, {
        ...opts,
        headers: { ...opts?.headers, authorization: `Nostr ${authHeader}` },
      });
    },
    generateNip98Event: async function (
      url: string,
      method: string
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
      await nip98Event.sign(nostrStore.signer);
      const eventString = JSON.stringify(nip98Event.rawEvent());
      return btoa(eventString);
    },
  },
});
