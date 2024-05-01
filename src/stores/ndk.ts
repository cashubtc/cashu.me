import { defineStore } from "pinia";
import NDK, { NDKEvent, NDKNip07Signer, NDKNip46Signer, NDKFilter } from "@nostr-dev-kit/ndk";
import { connected } from "process";
import { min } from "underscore";
import { useLocalStorage } from "@vueuse/core";

type MintRecommendation = {
  url: string;
  count: number;
};

export const useNdkStore = defineStore("ndk", {
  state: () => ({
    connected: false,
    pubkey: "",
    relays: ["wss://relay.snort.social", "wss://relay.damus.io", "wss://nostr.mutinywallet.com"],
    ndk: new NDK(),
    nip07signer: new NDKNip07Signer(),
    nip46signer: {} as NDKNip46Signer,
    mintRecommendations: useLocalStorage<MintRecommendation[]>("cashu.ndk.mintRecommendations", []),
  }),
  getters: {

  },
  actions: {
    init: function () {
      this.ndk = new NDK({ explicitRelayUrls: this.relays });
    },
    connect: function () {
      this.init();
      this.ndk.connect();
      this.connected = true;
    },
    getUserPubkey: async function () {
      if (!this.connected) {
        this.connect();
      }
      if (this.pubkey) {
        return this.pubkey;
      }
      this.nip07signer.user().then(async (user) => {
        if (!!user.npub) {
          console.log("Permission granted to read their public key:", user.npub);
          const me = this.ndk.getUser({
            npub: user.npub,
          });
          console.log("Setting pubkey to", user.pubkey);
          this.pubkey = user.pubkey;
          return user.npub;
        }
      });
    },
    fetchEventsFromUser: async function () {
      const filter: NDKFilter = { kinds: [1], authors: [this.pubkey] };
      return await this.ndk.fetchEvents(filter);
    },
    fetchMints: async function () {
      const filter: NDKFilter = { kinds: [38000], limit: 2000 };
      const events: NDKEvent[] = await this.ndk.fetchEvents(filter);
      let mintUrls: string[] = [];
      events.forEach((event) => {
        if (event.tagValue("k") == "38172" && event.tagValue("u")) {
          const mintUrl = event.tagValue("u");
          if (typeof mintUrl === "string" && mintUrl.length > 0 && mintUrl.startsWith("https://")) {
            mintUrls.push(mintUrl);
          }
        }
      }
      );
      // Count the number of times each mint URL appears
      const mintUrlsSet = new Set(mintUrls);
      const mintUrlsArray = Array.from(mintUrlsSet);
      const mintUrlsCounted = mintUrlsArray.map((url) => {
        return { url: url, count: mintUrls.filter((u) => u === url).length };
      });
      mintUrlsCounted.sort((a, b) => b.count - a.count);
      this.mintRecommendations = mintUrlsCounted;
      return mintUrlsCounted;
    },
  },
});
