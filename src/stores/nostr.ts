import { defineStore } from "pinia";
import NDK, { NDKEvent, NDKSigner, NDKNip07Signer, NDKNip46Signer, NDKFilter, NDKPrivateKeySigner, NostrEvent, NDKKind, NDKRelaySet, NDKRelay, NDKTag, ProfilePointer } from "@nostr-dev-kit/ndk";
import { nip04, nip19 } from 'nostr-tools'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils' // already an installed dependency
import { useWalletStore } from "./wallet";
import { generateSecretKey, getPublicKey } from 'nostr-tools'
import { useLocalStorage } from "@vueuse/core";
import { useSettingsStore } from "./settings";
import { useReceiveTokensStore } from "./receiveTokensStore";
import { getEncodedTokenV4, PaymentRequestPayload, Token } from "@cashu/cashu-ts";
type MintRecommendation = {
  url: string;
  count: number;
};

export enum SignerType {
  NIP07 = "NIP07",
  NIP46 = "NIP46",
  PRIVATEKEY = "PRIVATEKEY",
  SEED = "SEED"
}

export const useNostrStore = defineStore("nostr", {
  state: () => ({
    connected: false,
    pubkey: useLocalStorage<string>("cashu.ndk.pubkey", ""),
    relays: useSettingsStore().defaultNostrRelays,
    ndk: {} as NDK,
    signerType: useLocalStorage<SignerType>("cashu.ndk.signerType", SignerType.SEED),
    nip07signer: {} as NDKNip07Signer,
    nip46Token: useLocalStorage<string>("cashu.ndk.nip46Token", ""),
    nip46signer: {} as NDKNip46Signer,
    privateKeySignerPrivateKey: useLocalStorage<string>("cashu.ndk.privateKeySignerPrivateKey", ""),
    seedSignerPrivateKey: useLocalStorage<string>("cashu.ndk.seedSignerPrivateKey", ""),
    seedSignerPrivateKeyNsec: "",
    privateKeySigner: {} as NDKPrivateKeySigner,
    signer: {} as NDKSigner,
    mintRecommendations: useLocalStorage<MintRecommendation[]>("cashu.ndk.mintRecommendations", []),
    initialized: false,
    lastEventTimestamp: useLocalStorage<number>("cashu.ndk.lastEventTimestamp", 0),
  }),
  getters: {
    seedSignerPrivateKeyNsec: (state) => {
      const sk = hexToBytes(state.seedSignerPrivateKey);
      return nip19.nsecEncode(sk);
    },
    nprofile: (state) => {
      const profile: ProfilePointer = {
        pubkey: state.pubkey,
        relays: state.relays,
      };
      return nip19.nprofileEncode(profile);
    },
  },
  actions: {
    initNdkReadOnly: function () {
      this.ndk = new NDK({ explicitRelayUrls: this.relays });
      this.ndk.connect();
      this.connected = true;
    },
    initSignerIfNotSet: async function () {
      if (!this.initialized) {
        await this.initSigner();
      }
    },
    initSigner: async function () {
      if (this.signerType === SignerType.NIP07) {
        await this.initNip07Signer();
      } else if (this.signerType === SignerType.NIP46) {
        await this.initNip46Signer();
      } else if (this.signerType === SignerType.PRIVATEKEY) {
        await this.initPrivateKeySigner();
      } else {
        await this.initWalletSeedPrivateKeySigner();
      }
      this.initialized = true;
    },
    setSigner: async function (signer: NDKSigner) {
      this.signer = signer
      this.ndk = new NDK({ signer: signer, explicitRelayUrls: this.relays })
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
    checkNip07Signer: async function (): Promise<boolean> {
      const signer = new NDKNip07Signer()
      try {
        await signer.user();
        return true;
      } catch (e) {
        return false;
      }
    },
    initNip07Signer: async function () {
      const signer = new NDKNip07Signer()
      signer.user().then(async (user) => {
        if (!!user.npub) {
          console.log("Permission granted to read their public key:", user.npub);
          const me = this.ndk.getUser({
            npub: user.npub,
          });
          this.signerType = SignerType.NIP07;
          await this.setSigner(signer);
          this.setPubkey(user.pubkey);
        }
      });
      await signer.blockUntilReady();
    },
    initNip46Signer: async function (nip46Token?: string) {
      const ndk = new NDK({ explicitRelayUrls: this.relays });
      if (!nip46Token && !this.nip46Token.length) {
        nip46Token = await prompt("Enter your NIP-46 connection string") as string;
        if (!nip46Token) {
          return;
        }
        this.nip46Token = nip46Token;
      } else {
        if (nip46Token) {
          this.nip46Token = nip46Token;
        }
      }
      const signer = new NDKNip46Signer(ndk, this.nip46Token)
      this.signerType = SignerType.NIP46;
      await this.setSigner(signer);
      // If the backend sends an auth_url event, open that URL as a popup so the user can authorize the app
      signer.on("authUrl", (url) => { window.open(url, "auth", "width=600,height=600") })
      // wait until the signer is ready
      const loggedinUser = await signer.blockUntilReady()
      alert("You are now logged in as " + loggedinUser.npub)
      this.setPubkey(loggedinUser.pubkey);
    },
    resetNip46Signer: async function () {
      this.nip46Token = "";
      await this.initWalletSeedPrivateKeySigner();
    },
    initPrivateKeySigner: async function (nsec?: string) {
      let privateKeyBytes: Uint8Array;
      if (!nsec && !this.privateKeySignerPrivateKey.length) {
        nsec = await prompt("Enter your nsec") as string;
        if (!nsec) {
          return;
        }
        privateKeyBytes = nip19.decode(nsec).data as Uint8Array
      } else {
        if (nsec) {
          privateKeyBytes = nip19.decode(nsec).data as Uint8Array
        } else {
          privateKeyBytes = hexToBytes(this.privateKeySignerPrivateKey);
        }
      }
      this.privateKeySigner = new NDKPrivateKeySigner(this.privateKeySignerPrivateKey);
      this.privateKeySignerPrivateKey = bytesToHex(privateKeyBytes);
      this.signerType = SignerType.PRIVATEKEY;
      await this.setSigner(this.privateKeySigner);
      const publicKeyHex = getPublicKey(privateKeyBytes);
      this.setPubkey(publicKeyHex);
    },
    resetPrivateKeySigner: async function () {
      this.privateKeySignerPrivateKey = "";
      await this.initWalletSeedPrivateKeySigner();
    },
    initWalletSeedPrivateKeySigner: async function () {
      const walletStore = useWalletStore();
      const sk = walletStore.seed.slice(0, 32)
      const walletPublicKeyHex = getPublicKey(sk) // `pk` is a hex string
      const walletPrivateKeyHex = bytesToHex(sk)
      this.seedSignerPrivateKey = walletPrivateKeyHex;
      this.privateKeySigner = new NDKPrivateKeySigner(walletPrivateKeyHex)
      this.signerType = SignerType.SEED;
      this.setSigner(this.privateKeySigner);
      this.setPubkey(walletPublicKeyHex);
    },
    fetchEventsFromUser: async function () {
      const filter: NDKFilter = { kinds: [1], authors: [this.pubkey] };
      return await this.ndk.fetchEvents(filter);
    },
    fetchMints: async function () {
      const filter: NDKFilter = { kinds: [38000], limit: 2000 };
      const events = await this.ndk.fetchEvents(filter);
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
    sendNip04DirectMessage: async function (recipient: string, message: string) {
      const event = new NDKEvent(this.ndk);
      this.ndk.connect();
      event.kind = NDKKind.EncryptedDirectMessage;
      event.content = await nip04.encrypt(hexToBytes(this.seedSignerPrivateKey), recipient, message);
      event.tags = [['p', recipient]];
      event.publish();
      // TEMP: subscribe
      await this.subscribeToNip04DirectMessages();
    },
    subscribeToNip04DirectMessages: async function () {
      let nip04DirectMessageEvents: Set<NDKEvent> = new Set();
      const fetchEventsPromise = new Promise<Set<NDKEvent>>(resolve => {
        console.log("### Subscribing to NIP-04 direct messages");
        if (!this.lastEventTimestamp) {
          this.lastEventTimestamp = Math.floor(Date.now() / 1000);
        }
        const sub = this.ndk.subscribe(
          {
            kinds: [NDKKind.EncryptedDirectMessage],
            "#p": [this.pubkey],
            since: this.lastEventTimestamp,
          } as NDKFilter,
          { closeOnEose: false, groupable: false },
        );

        sub.on('event', (event: NDKEvent) => {
          nip04.decrypt(hexToBytes(this.seedSignerPrivateKey), event.pubkey, event.content).then((content) => {
            console.log('NIP-04 DM from', event.pubkey);
            console.log("Content:", content);
            nip04DirectMessageEvents.add(event)
            this.lastEventTimestamp = Math.floor(Date.now() / 1000);
            this.parseMessageForEcash(content);
          });
        });

      });
      try {
        nip04DirectMessageEvents = await fetchEventsPromise;
      } catch (error) {
        console.error('Error fetching contact events:', error);
      }
    },
    parseMessageForEcash: async function (message: string) {
      // first check if the message can be converted to a json and then to a PaymentRequestPayload
      try {
        const payload = JSON.parse(message) as PaymentRequestPayload;
        if (payload) {
          const receiveStore = useReceiveTokensStore();
          const proofs = payload.proofs;
          const mint = payload.mint;
          const unit = payload.unit;
          const token = {
            token: [{ proofs: proofs, mint: mint }],
            unit: unit,
          } as Token;
          receiveStore.receiveData.tokensBase64 = getEncodedTokenV4(token);
          receiveStore.showReceiveTokens = true;
        }
      } catch (e) {
        console.log("### parsing message for ecash failed", e);
      }

      console.log("### parsing message for ecash", message);
      const receiveStore = useReceiveTokensStore();
      const words = message.split(" ");
      const tokens = words.filter((word) => {
        return word.startsWith("cashuA") || word.startsWith("cashuB");
      });
      for (const token of tokens) {
        receiveStore.receiveData.tokensBase64 = token;
        receiveStore.showReceiveTokens = true;
      }
    },
  },
});
