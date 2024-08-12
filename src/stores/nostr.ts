import { defineStore } from "pinia";
import NDK, { NDKEvent, NDKSigner, NDKNip07Signer, NDKNip46Signer, NDKFilter, NDKPrivateKeySigner, NostrEvent } from "@nostr-dev-kit/ndk";
import { nip19 } from 'nostr-tools'
import { bytesToHex } from '@noble/hashes/utils' // already an installed dependency

import { useLocalStorage } from "@vueuse/core";
import { useSettingsStore } from "./settings";
type MintRecommendation = {
  url: string;
  count: number;
};

export const useNostrStore = defineStore("nostr", {
  state: () => ({
    connected: false,
    pubkey: "",
    relays: useSettingsStore().defaultNostrRelays,
    ndk: new NDK(),
    nip07signer: {} as NDKNip07Signer,
    nip46signer: {} as NDKNip46Signer,
    privateKeySigner: {} as NDKPrivateKeySigner,
    signer: {} as NDKSigner,
    mintRecommendations: useLocalStorage<MintRecommendation[]>("cashu.ndk.mintRecommendations", []),
  }),
  getters: {

  },
  actions: {
    initNdkReadOnly: function () {
      this.ndk = new NDK({ explicitRelayUrls: this.relays });
      this.ndk.connect();
      this.connected = true;
    },
    setSigner: async function (signer: NDKSigner) {
      this.signer = signer
      this.ndk = new NDK({ signer: signer, explicitRelayUrls: this.relays })
      const ndkEvent = await this.signDummyEvent()
      // ndkEvent.publish()
    },
    signDummyEvent: async function (): Promise<NDKEvent> {
      const ndkEvent = new NDKEvent();
      ndkEvent.kind = 1;
      ndkEvent.content = "Hello, world!";
      const sig = await ndkEvent.sign(this.signer)
      console.log(`nostr signature: ${sig})`);
      const eventString = JSON.stringify(ndkEvent.rawEvent());
      console.log(`nostr event: ${eventString}`);
      return ndkEvent;
    },
    setPubkey: function (pubkey: string) {
      console.log("Setting pubkey to", pubkey);
      this.pubkey = pubkey;
    },
    initNip07Signer: async function () {
      const signer = new NDKNip07Signer()
      signer.user().then(async (user) => {
        if (!!user.npub) {
          console.log("Permission granted to read their public key:", user.npub);
          const me = this.ndk.getUser({
            npub: user.npub,
          });
          this.setPubkey(user.pubkey);
          await this.setSigner(signer);
        }
      });
    },
    initNip46Signer: async function (nip46Token?: string) {
      const ndk = new NDK({ explicitRelayUrls: this.relays });
      if (!nip46Token) {
        nip46Token = await prompt("enter your nip-46 token") as string;
      }
      const signer = new NDKNip46Signer(ndk, nip46Token)
      // If the backend sends an auth_url event, open that URL as a popup so the user can authorize the app
      signer.on("authUrl", (url) => { window.open(url, "auth", "width=600,height=600") })
      // wait until the signer is ready
      const loggedinUser = await signer.blockUntilReady()
      alert("You are now logged in as " + loggedinUser.npub)
      signer.user().then(async (user) => {
        if (!!user.npub) {
          console.log("Permission granted to read their public key:", user.npub);
          const me = this.ndk.getUser({
            npub: user.npub,
          });
          this.setPubkey(user.pubkey);
          await this.setSigner(signer);
        }
      });
    },
    initPrivateKeySigner: async function (nsec?: string) {
      if (!nsec) {
        nsec = await prompt("enter your nsec") as string;
      }
      const privateKey = bytesToHex(nip19.decode(nsec).data as Uint8Array);
      this.privateKeySigner = new NDKPrivateKeySigner(privateKey);
      await this.setSigner(this.privateKeySigner);
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
