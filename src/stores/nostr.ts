import { defineStore } from "pinia";
import NDK, {
  NDKEvent,
  NDKSigner,
  NDKNip07Signer,
  NDKNip46Signer,
  NDKFilter,
  NDKPrivateKeySigner,
  NostrEvent,
  NDKKind,
  NDKRelaySet,
  NDKRelay,
  NDKTag,
  ProfilePointer,
} from "@nostr-dev-kit/ndk";
import { nip04, nip19, nip44 } from "nostr-tools";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils"; // already an installed dependency
import { useWalletStore } from "./wallet";
import { generateSecretKey, getPublicKey } from "nostr-tools";
import { useLocalStorage } from "@vueuse/core";
import { useSettingsStore } from "./settings";
import { useReceiveTokensStore } from "./receiveTokensStore";
import {
  getEncodedToken,
  normalizeProofAmounts,
  PaymentRequestPayload,
  Token,
} from "@cashu/cashu-ts";
import { useTokensStore } from "./tokens";
import {
  notifyApiError,
  notifyError,
  notifySuccess,
  notifyWarning,
  notify,
} from "../js/notify";
import { useSendTokensStore } from "./sendTokensStore";
import { usePRStore } from "./payment-request";
import token from "../js/token";
import { HistoryToken } from "./tokens";
import { decodeRecipient, encodeGiftWrap } from "src/js/paymentRequestProtocol";
import { publishToRelays, resolveInboxRelays } from "src/js/paymentRelay";
import { initializePaymentReceiver } from "src/js/paymentReceiver";
import { usePaymentJobsStore } from "src/stores/paymentJobs";

type NostrEventLog = {
  id: string;
  created_at: number;
};

export enum SignerType {
  NIP07 = "NIP07",
  NIP46 = "NIP46",
  PRIVATEKEY = "PRIVATEKEY",
  SEED = "SEED",
}

export const useNostrStore = defineStore("nostr", {
  state: () => ({
    connected: false,
    pubkey: useLocalStorage<string>("cashu.ndk.pubkey", ""),
    relays: useLocalStorage<string[]>(
      "cashu.nostr.relays",
      useSettingsStore().defaultNostrRelays
    ),
    ndk: {} as NDK,
    signerType: useLocalStorage<SignerType>(
      "cashu.ndk.signerType",
      SignerType.SEED
    ),
    nip07signer: {} as NDKNip07Signer,
    nip46Token: useLocalStorage<string>("cashu.ndk.nip46Token", ""),
    nip46signer: {} as NDKNip46Signer,
    privateKeySignerPrivateKey: useLocalStorage<string>(
      "cashu.ndk.privateKeySignerPrivateKey",
      ""
    ),
    seedSignerPrivateKey: useLocalStorage<string>(
      "cashu.ndk.seedSignerPrivateKey",
      ""
    ),
    seedSignerPublicKey: useLocalStorage<string>(
      "cashu.ndk.seedSignerPublicKey",
      ""
    ),
    seedSigner: {} as NDKPrivateKeySigner,
    seedSignerPrivateKeyNsec: "",
    privateKeySigner: {} as NDKPrivateKeySigner,
    signer: {} as NDKSigner,
    initialized: false,
    lastEventTimestamp: useLocalStorage<number>(
      "cashu.ndk.lastEventTimestamp",
      0
    ),
    nip17EventIdsWeHaveSeen: useLocalStorage<NostrEventLog[]>(
      "cashu.ndk.nip17EventIdsWeHaveSeen",
      []
    ),
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
    seedSignerNprofile: (state) => {
      const profile: ProfilePointer = {
        pubkey: state.seedSignerPublicKey,
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
        if (!useWalletStore().mnemonic) return;
        await this.initWalletSeedPrivateKeySigner();
      }
      this.initialized = true;
    },
    setSigner: function (signer: NDKSigner) {
      this.signer = signer;
      this.ndk = new NDK({ signer: signer, explicitRelayUrls: this.relays });
    },
    signDummyEvent: async function (): Promise<NDKEvent> {
      const ndkEvent = new NDKEvent();
      ndkEvent.kind = 1;
      ndkEvent.content = "Hello, world!";
      const sig = await ndkEvent.sign(this.signer);
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
      const signer = new NDKNip07Signer();
      try {
        await signer.user();
        return true;
      } catch (e) {
        return false;
      }
    },
    initNip07Signer: async function () {
      const signer = new NDKNip07Signer();
      const user = await signer.blockUntilReady();
      this.signerType = SignerType.NIP07;
      this.setSigner(signer);
      this.setPubkey(user.pubkey);
    },
    initNip46Signer: async function (nip46Token?: string) {
      const ndk = new NDK({ explicitRelayUrls: this.relays });
      if (!nip46Token && !this.nip46Token.length) {
        nip46Token = (await prompt(
          "Enter your NIP-46 connection string"
        )) as string;
        if (!nip46Token) {
          return;
        }
        this.nip46Token = nip46Token;
      } else {
        if (nip46Token) {
          this.nip46Token = nip46Token;
        }
      }
      const signer = new NDKNip46Signer(ndk, this.nip46Token);
      this.signerType = SignerType.NIP46;
      this.setSigner(signer);
      // If the backend sends an auth_url event, open that URL as a popup so the user can authorize the app
      signer.on("authUrl", (url) => {
        window.open(url, "auth", "width=600,height=600");
      });
      // wait until the signer is ready
      const loggedinUser = await signer.blockUntilReady();
      alert("You are now logged in as " + loggedinUser.npub);
      this.setPubkey(loggedinUser.pubkey);
    },
    resetNip46Signer: async function () {
      this.nip46Token = "";
      await this.initWalletSeedPrivateKeySigner();
    },
    initPrivateKeySigner: async function (nsec?: string) {
      let privateKeyBytes: Uint8Array;
      if (!nsec && !this.privateKeySignerPrivateKey.length) {
        nsec = (await prompt("Enter your nsec")) as string;
        if (!nsec) {
          return;
        }
        privateKeyBytes = nip19.decode(nsec).data as Uint8Array;
      } else {
        if (nsec) {
          privateKeyBytes = nip19.decode(nsec).data as Uint8Array;
        } else {
          privateKeyBytes = hexToBytes(this.privateKeySignerPrivateKey);
        }
      }
      this.privateKeySigner = new NDKPrivateKeySigner(
        this.privateKeySignerPrivateKey
      );
      this.privateKeySignerPrivateKey = bytesToHex(privateKeyBytes);
      this.signerType = SignerType.PRIVATEKEY;
      this.setSigner(this.privateKeySigner);
      const publicKeyHex = getPublicKey(privateKeyBytes);
      this.setPubkey(publicKeyHex);
    },
    resetPrivateKeySigner: async function () {
      this.privateKeySignerPrivateKey = "";
      await this.initWalletSeedPrivateKeySigner();
    },
    walletSeedGenerateKeyPair: async function () {
      const walletStore = useWalletStore();
      if (!walletStore.mnemonic)
        throw new Error(
          "Initialize the wallet before creating a Nostr identity"
        );
      const sk = walletStore.seed.slice(0, 32);
      const walletPublicKeyHex = getPublicKey(sk); // `pk` is a hex string
      const walletPrivateKeyHex = bytesToHex(sk);
      this.seedSignerPrivateKey = walletPrivateKeyHex;
      this.seedSignerPublicKey = walletPublicKeyHex;
      this.seedSigner = new NDKPrivateKeySigner(this.seedSignerPrivateKey);
    },
    initWalletSeedPrivateKeySigner: async function () {
      await this.walletSeedGenerateKeyPair();
      // TODO: remove duplicate privateKeysigner
      this.privateKeySigner = this.seedSigner;
      this.signerType = SignerType.SEED;
      this.setSigner(this.privateKeySigner);
      this.setPubkey(this.seedSignerPublicKey);
    },
    fetchEventsFromUser: async function () {
      const filter: NDKFilter = { kinds: [1], authors: [this.pubkey] };
      return await this.ndk.fetchEvents(filter);
    },

    sendNip04DirectMessage: async function (
      recipient: string,
      message: string
    ) {
      const randomPrivateKey = generateSecretKey();
      const randomPublicKey = getPublicKey(randomPrivateKey);
      // const randomPrivateKey = hexToBytes(this.seedSignerPrivateKey);
      // const randomPublicKey = this.pubkey;
      const ndk = new NDK({
        explicitRelayUrls: this.relays,
        signer: new NDKPrivateKeySigner(bytesToHex(randomPrivateKey)),
      });
      const event = new NDKEvent(ndk);
      ndk.connect();
      event.kind = NDKKind.EncryptedDirectMessage;
      event.content = await nip04.encrypt(randomPrivateKey, recipient, message);
      event.tags = [["p", recipient]];
      event.sign();
      try {
        await event.publish();
        notifySuccess("NIP-04 event published");
      } catch (e) {
        console.error(e);
        notifyError("Could not publish NIP-04 event");
      }
    },
    subscribeToNip04DirectMessages: async function () {
      await this.walletSeedGenerateKeyPair();
      await this.initNdkReadOnly();
      let nip04DirectMessageEvents: Set<NDKEvent> = new Set();
      const fetchEventsPromise = new Promise<Set<NDKEvent>>((resolve) => {
        if (!this.lastEventTimestamp) {
          this.lastEventTimestamp = Math.floor(Date.now() / 1000);
        }
        console.log(
          `### Subscribing to NIP-04 direct messages to ${this.seedSignerPublicKey} since ${this.lastEventTimestamp}`
        );
        this.ndk.connect();
        const sub = this.ndk.subscribe(
          {
            kinds: [NDKKind.EncryptedDirectMessage],
            "#p": [this.seedSignerPublicKey],
            since: this.lastEventTimestamp,
          } as NDKFilter,
          { closeOnEose: false, groupable: false }
        );
        sub.on("event", (event: NDKEvent) => {
          console.log("event");
          nip04
            .decrypt(
              hexToBytes(this.seedSignerPrivateKey),
              event.pubkey,
              event.content
            )
            .then((content) => {
              console.log("NIP-04 DM from", event.pubkey);
              console.log("Content:", content);
              nip04DirectMessageEvents.add(event);
              this.lastEventTimestamp = Math.floor(Date.now() / 1000);
              this.parseMessageForEcash(content);
            });
        });
      });
      try {
        nip04DirectMessageEvents = await fetchEventsPromise;
      } catch (error) {
        console.error("Error fetching contact events:", error);
      }
    },
    sendNip17DirectMessageToNprofile: async function (
      nprofile: string,
      message: string
    ) {
      const recipient = decodeRecipient(nprofile);
      const relays = await resolveInboxRelays(
        recipient.pubkey,
        recipient.relays,
        this.relays
      );
      return this.sendNip17DirectMessage(recipient.pubkey, message, relays);
    },
    randomTimeUpTo2DaysInThePast: function () {
      return Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 172800);
    },
    sendNip17DirectMessage: async function (
      recipient: string,
      message: string,
      relays?: string[]
    ) {
      await this.walletSeedGenerateKeyPair();
      const event = encodeGiftWrap(
        message,
        hexToBytes(this.seedSignerPrivateKey),
        recipient
      );
      return publishToRelays(event, relays ?? this.relays);
    },
    subscribeToNip17DirectMessages: async function () {
      return initializePaymentReceiver();
    },
    parseMessageForEcash: async function (message: string) {
      return usePaymentJobsStore().ingestContent(message);
    },
    addPendingTokenToHistory: function (
      tokenStr: string,
      verbose = true,
      paymentRequestId?: string
    ): string | undefined {
      const receiveStore = useReceiveTokensStore();
      const tokensStore = useTokensStore();
      if (tokensStore.tokenAlreadyInHistory(tokenStr)) {
        notifySuccess("Ecash already in history");
        receiveStore.showReceiveTokens = false;
        return undefined;
      }
      const decodedToken = token.decodeMeta(tokenStr);
      if (decodedToken == undefined) {
        throw Error("could not decode token");
      }
      const id = tokensStore.addPendingToken({
        amount: decodedToken.amount,
        token: tokenStr,
        mint: token.getMint(decodedToken),
        unit: token.getUnit(decodedToken),
        paymentRequestId,
      });
      receiveStore.showReceiveTokens = false;
      // show success notification
      if (verbose) {
        notifySuccess("Ecash added to history.");
      }
      return id;
    },
  },
});
