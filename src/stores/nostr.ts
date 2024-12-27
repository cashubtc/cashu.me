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
  getEncodedTokenV4,
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

type MintRecommendation = {
  url: string;
  count: number;
};

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
    relays: useSettingsStore().defaultNostrRelays,
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
    mintRecommendations: useLocalStorage<MintRecommendation[]>(
      "cashu.ndk.mintRecommendations",
      []
    ),
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
        await this.initWalletSeedPrivateKeySigner();
      }
      this.initialized = true;
    },
    setSigner: async function (signer: NDKSigner) {
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
      signer.user().then(async (user) => {
        if (!!user.npub) {
          console.log(
            "Permission granted to read their public key:",
            user.npub
          );
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
      await this.setSigner(signer);
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
      await this.setSigner(this.privateKeySigner);
      const publicKeyHex = getPublicKey(privateKeyBytes);
      this.setPubkey(publicKeyHex);
    },
    resetPrivateKeySigner: async function () {
      this.privateKeySignerPrivateKey = "";
      await this.initWalletSeedPrivateKeySigner();
    },
    walletSeedGenerateKeyPair: async function () {
      const walletStore = useWalletStore();
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
    fetchMints: async function () {
      const filter: NDKFilter = { kinds: [38000 as NDKKind], limit: 2000 };
      const events = await this.ndk.fetchEvents(filter);
      let mintUrls: string[] = [];
      events.forEach((event) => {
        if (event.tagValue("k") == "38172" && event.tagValue("u")) {
          const mintUrl = event.tagValue("u");
          if (
            typeof mintUrl === "string" &&
            mintUrl.length > 0 &&
            mintUrl.startsWith("https://")
          ) {
            mintUrls.push(mintUrl);
          }
        }
      });
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
      const result = nip19.decode(nprofile);
      const pubkey: string = (result.data as ProfilePointer).pubkey;
      const relays: string[] | undefined = (result.data as ProfilePointer)
        .relays;
      this.sendNip17DirectMessage(pubkey, message, relays);
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
      const randomPrivateKey = generateSecretKey();
      const randomPublicKey = getPublicKey(randomPrivateKey);

      const dmEvent = new NDKEvent();
      dmEvent.kind = 14;
      dmEvent.content = message;
      dmEvent.tags = [["p", recipient]];
      dmEvent.created_at = Math.floor(Date.now() / 1000);
      dmEvent.pubkey = this.seedSignerPublicKey;
      dmEvent.id = dmEvent.getEventHash();
      const dmEventString = JSON.stringify(await dmEvent.toNostrEvent());

      const seedNdk = new NDK({
        signer: this.seedSigner,
        explicitRelayUrls: this.relays,
      });
      const sealEvent = new NDKEvent(seedNdk);
      sealEvent.kind = 13;
      sealEvent.content = nip44.v2.encrypt(
        dmEventString,
        nip44.v2.utils.getConversationKey(this.seedSignerPrivateKey, recipient)
      );
      sealEvent.created_at = this.randomTimeUpTo2DaysInThePast();
      sealEvent.pubkey = this.seedSignerPublicKey;
      sealEvent.id = sealEvent.getEventHash();
      sealEvent.sig = await sealEvent.sign();
      const sealEventString = JSON.stringify(await sealEvent.toNostrEvent());

      const randomNdk = new NDK({
        explicitRelayUrls: relays ?? this.relays,
        signer: new NDKPrivateKeySigner(bytesToHex(randomPrivateKey)),
      });
      const wrapEvent = new NDKEvent(randomNdk);
      wrapEvent.kind = 1059;
      wrapEvent.tags = [["p", recipient]];
      wrapEvent.content = nip44.v2.encrypt(
        sealEventString,
        nip44.v2.utils.getConversationKey(
          bytesToHex(randomPrivateKey),
          recipient
        )
      );
      wrapEvent.created_at = this.randomTimeUpTo2DaysInThePast();
      wrapEvent.pubkey = randomPublicKey;
      wrapEvent.id = wrapEvent.getEventHash();
      wrapEvent.sig = await wrapEvent.sign();

      try {
        randomNdk.connect();
        await wrapEvent.publish();
      } catch (e) {
        console.error(e);
        notifyError("Could not publish NIP-17 event");
      }
    },
    subscribeToNip17DirectMessages: async function () {
      await this.walletSeedGenerateKeyPair();
      await this.initNdkReadOnly();
      let nip17DirectMessageEvents: Set<NDKEvent> = new Set();
      const fetchEventsPromise = new Promise<Set<NDKEvent>>((resolve) => {
        if (!this.lastEventTimestamp) {
          this.lastEventTimestamp = Math.floor(Date.now() / 1000);
        }
        const since = this.lastEventTimestamp - 172800; // last 2 days
        console.log(
          `### Subscribing to NIP-17 direct messages to ${this.seedSignerPublicKey} since ${since}`
        );
        this.ndk.connect();
        const sub = this.ndk.subscribe(
          {
            kinds: [1059 as NDKKind],
            "#p": [this.seedSignerPublicKey],
            since: since,
          } as NDKFilter,
          { closeOnEose: false, groupable: false }
        );

        sub.on("event", (wrapEvent: NDKEvent) => {
          const eventLog = {
            id: wrapEvent.id,
            created_at: wrapEvent.created_at,
          } as NostrEventLog;
          if (this.nip17EventIdsWeHaveSeen.find((e) => e.id === wrapEvent.id)) {
            // console.log(`### Already seen NIP-17 event ${wrapEvent.id} (time: ${wrapEvent.created_at})`);
            return;
          } else {
            console.log(`### New event ${wrapEvent.id}`);
            this.nip17EventIdsWeHaveSeen.push(eventLog);
            // remove all events older than 10 days to keep the list small
            const fourDaysAgo =
              Math.floor(Date.now() / 1000) - 10 * 24 * 60 * 60;
            this.nip17EventIdsWeHaveSeen = this.nip17EventIdsWeHaveSeen.filter(
              (e) => e.created_at > fourDaysAgo
            );
          }
          let dmEvent: NDKEvent;
          let content: string;
          try {
            const wappedContent = nip44.v2.decrypt(
              wrapEvent.content,
              nip44.v2.utils.getConversationKey(
                this.seedSignerPrivateKey,
                wrapEvent.pubkey
              )
            );
            const sealEvent = JSON.parse(wappedContent) as NostrEvent;
            const dmEventString = nip44.v2.decrypt(
              sealEvent.content,
              nip44.v2.utils.getConversationKey(
                this.seedSignerPrivateKey,
                sealEvent.pubkey
              )
            );
            dmEvent = JSON.parse(dmEventString) as NDKEvent;
            content = dmEvent.content;
            console.log("### NIP-17 DM from", dmEvent.pubkey);
            console.log("Content:", content);
          } catch (e) {
            console.error(e);
            return;
          }
          nip17DirectMessageEvents.add(dmEvent);
          this.lastEventTimestamp = Math.floor(Date.now() / 1000);
          this.parseMessageForEcash(content);
        });
      });
      try {
        nip17DirectMessageEvents = await fetchEventsPromise;
      } catch (error) {
        console.error("Error fetching contact events:", error);
      }
    },
    parseMessageForEcash: async function (message: string) {
      // first check if the message can be converted to a json and then to a PaymentRequestPayload
      try {
        const payload = JSON.parse(message) as PaymentRequestPayload;
        if (payload) {
          const receiveStore = useReceiveTokensStore();
          const prStore = usePRStore();
          const sendTokensStore = useSendTokensStore();
          const tokensStore = useTokensStore();
          const proofs = payload.proofs;
          const mint = payload.mint;
          const unit = payload.unit;
          const token = {
            proofs: proofs,
            mint: mint,
            unit: unit,
          } as Token;

          const tokenStr = getEncodedTokenV4(token);

          const tokenInHistory = tokensStore.tokenAlreadyInHistory(tokenStr);
          if (tokenInHistory && tokenInHistory.amount > 0) {
            console.log("### incoming token already in history");
            return;
          }
          await this.addPendingTokenToHistory(tokenStr, false);
          receiveStore.receiveData.tokensBase64 = tokenStr;
          sendTokensStore.showSendTokens = false;
          if (prStore.receivePaymentRequestsAutomatically) {
            const success = await receiveStore.receiveIfDecodes();
            if (success) {
              prStore.showPRDialog = false;
            } else {
              notifyWarning("Could not receive incoming payment");
            }
          } else {
            prStore.showPRDialog = false;
            receiveStore.showReceiveTokens = true;
          }
          return;
        }
      } catch (e) {
        // console.log("### parsing message for ecash failed");
        return;
      }

      console.log("### parsing message for ecash", message);
      const receiveStore = useReceiveTokensStore();
      const words = message.split(" ");
      const tokens = words.filter((word) => {
        return word.startsWith("cashuA") || word.startsWith("cashuB");
      });
      for (const tokenStr of tokens) {
        receiveStore.receiveData.tokensBase64 = tokenStr;
        receiveStore.showReceiveTokens = true;
        await this.addPendingTokenToHistory(tokenStr);
      }
    },
    addPendingTokenToHistory: function (tokenStr: string, verbose = true) {
      const receiveStore = useReceiveTokensStore();
      const tokensStore = useTokensStore();
      if (tokensStore.tokenAlreadyInHistory(tokenStr)) {
        notifySuccess("Ecash already in history");
        receiveStore.showReceiveTokens = false;
        return;
      }
      const decodedToken = token.decode(tokenStr);
      if (decodedToken == undefined) {
        throw Error("could not decode token");
      }
      // get amount from decodedToken.token.proofs[..].amount
      const amount = token
        .getProofs(decodedToken)
        .reduce((sum, el) => (sum += el.amount), 0);

      tokensStore.addPendingToken({
        amount: amount,
        token: tokenStr,
        mint: token.getMint(decodedToken),
        unit: token.getUnit(decodedToken),
      });
      receiveStore.showReceiveTokens = false;
      // show success notification
      if (verbose) {
        notifySuccess("Ecash added to history.");
      }
    },
  },
});
