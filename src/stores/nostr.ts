import { debug } from "src/js/logger";
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
  NDKSubscription,
} from "@nostr-dev-kit/ndk";
import {
  nip04,
  nip19,
  nip44,
  SimplePool,
  getEventHash as ntGetEventHash,
  finalizeEvent,
} from "nostr-tools";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils"; // already an installed dependency
import { ensureCompressed } from "src/utils/ecash";
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
import { DEFAULT_BUCKET_ID } from "./buckets";
import { useDmChatsStore } from "./dmChats";
import { cashuDb, type LockedToken } from "./dexie";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "vue-router";
import { useP2PKStore } from "./p2pk";

// --- Nutzap helpers (NIP-61) ----------------------------------------------

import type { NostrEvent } from "@nostr-dev-kit/ndk";

interface NutzapProfile {
  hexPub: string;
  p2pkPubkey: string;
  trustedMints: string[];
  relays: string[];
}

/**
 * Fetches the receiver’s ‘kind:10019’ Nutzap profile.
 */
export async function fetchNutzapProfile(
  npubOrHex: string
): Promise<NutzapProfile | null> {
  const nostr = useNostrStore();
  await nostr.initNdkReadOnly();
  const hex = npubOrHex.startsWith("npub")
    ? nostr.ndk.utils.hexFromBech32
      ? nostr.ndk.utils.hexFromBech32(npubOrHex)
      : (nostr.ndk.utils.nip19.decode(npubOrHex).data as string)
    : npubOrHex;
  const sub = nostr.ndk.subscribe({
    kinds: [10019],
    authors: [hex],
    limit: 1,
  });

  return new Promise((resolve) => {
    sub.on("event", (ev: NostrEvent) => {
      const p2pkPubkey = ev.tags.find((t) => t[0] === "pubkey")?.[1];
      const mints = ev.tags.filter((t) => t[0] === "mint").map((t) => t[1]);
      if (p2pkPubkey) {
        resolve({
          hexPub: hex,
          p2pkPubkey,
          trustedMints: mints,
          relays: ev.tags.filter((t) => t[0] === "relay").map((t) => t[1]),
        });
      } else resolve(null);
      sub.stop();
    });

    // timeout after 10 s
    setTimeout(() => (sub.stop(), resolve(null)), 10_000);
  });
}

/** Publishes a ‘kind:9321’ Nutzap event. */
export async function publishNutzap(opts: {
  content: string;
  receiverHex: string;
  relayHints?: string[];
}) {
  const nostr = useNostrStore();
  await nostr.initSignerIfNotSet();
  const ev: NostrEvent = {
    kind: 9321,
    content: opts.content,
    tags: [["p", opts.receiverHex]],
    created_at: Math.floor(Date.now() / 1000),
  } as NostrEvent;
  const signed = await nostr.ndk.sign(ev);
  await nostr.ndk.publish(
    signed,
    opts.relayHints?.length ? opts.relayHints : undefined
  );
  return signed.id;
}

/** Listens for incoming Nutzaps that reference my pubkey via ‘p’ tag. */
export function subscribeToNutzaps(
  myHex: string,
  onZap: (ev: NostrEvent) => void
): NDKSubscription {
  const nostr = useNostrStore();
  nostr.initNdkReadOnly();
  const sub = nostr.ndk.subscribe({
    kinds: [9321],
    "#p": [myHex],
  });
  sub.on("event", onZap);
  return sub;
}

type MintRecommendation = {
  url: string;
  count: number;
};

type NostrEventLog = {
  id: string;
  created_at: number;
};

type CachedProfile = {
  profile: any;
  fetchedAt: number;
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
    profiles: useLocalStorage<
      Record<string, { profile: any; fetchedAt: number }>
    >("cashu.ndk.profiles", {}),
  }),
  getters: {
    seedSignerPrivateKeyNsecComputed: (state) => {
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
    npub: (state) => {
      try {
        return nip19.npubEncode(state.pubkey);
      } catch (e) {
        return state.pubkey;
      }
    },
    activePrivateKeyNsec: (state) => {
      const keyHex =
        state.signerType === SignerType.PRIVATEKEY
          ? state.privateKeySignerPrivateKey
          : state.seedSignerPrivateKey;
      if (!keyHex) return "";
      try {
        return nip19.nsecEncode(hexToBytes(keyHex));
      } catch (e) {
        return "";
      }
    },
    privKeyHex: (state) => {
      switch (state.signerType) {
        case SignerType.PRIVATEKEY:
          return state.privateKeySignerPrivateKey;
        case SignerType.SEED:
          return state.seedSignerPrivateKey;
        default:
          return "";
      }
    },
  },
  actions: {
    initNdkReadOnly: function () {
      if (this.connected) {
        return;
      }
      this.ndk = new NDK({ explicitRelayUrls: this.relays });
      this.ndk.connect();
      this.connected = true;
    },
    disconnect: function () {
      if (this.ndk && (this.ndk as any).pool) {
        for (const relay of (this.ndk as any).pool.relays.values()) {
          relay.disconnect && relay.disconnect();
        }
      }
      this.connected = false;
    },
    connect: function (relays?: string[]) {
      if (relays) {
        this.relays = relays as any;
      }
      this.disconnect();
      const opts: any = { explicitRelayUrls: this.relays };
      if (this.signer) {
        opts.signer = this.signer;
      }
      this.ndk = new NDK(opts);
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
      this.ndk.connect();
      this.connected = true;
    },
    signDummyEvent: async function (): Promise<NDKEvent> {
      const ndkEvent = new NDKEvent();
      ndkEvent.kind = 1;
      ndkEvent.content = "Hello, world!";
      const sig = await ndkEvent.sign(this.signer);
      debug(`nostr signature: ${sig})`);
      const eventString = JSON.stringify(ndkEvent.rawEvent());
      debug(`nostr event: ${eventString}`);
      return ndkEvent;
    },
    setPubkey: function (pubkey: string) {
      debug("Setting pubkey to", pubkey);
      this.pubkey = pubkey;
      try {
        const privKey = this.privKeyHex;
        if (privKey && privKey.length) {
          const p2pkStore = useP2PKStore();
          // ensureCompressed() so P2PK keys are always in SEC form
          const pk66 = ensureCompressed(
            "02" + getPublicKey(hexToBytes(privKey))
          );
          if (!p2pkStore.haveThisKey(pk66)) {
            const keyPair = {
              publicKey: pk66,
              privateKey: privKey,
              used: false,
              usedCount: 0,
            };
            p2pkStore.p2pkKeys = p2pkStore.p2pkKeys.concat(keyPair);
          }
        }
      } catch (e) {
        console.error(e);
      }
    },
    resolvePubkey: function (pk: string): string {
      if (/^[0-9a-fA-F]{64}$/.test(pk)) {
        return pk.toLowerCase();
      }
      try {
        const decoded = nip19.decode(pk);
        if (decoded.type === "npub") {
          return typeof decoded.data === "string"
            ? (decoded.data as string)
            : pk;
        }
        if (decoded.type === "nprofile") {
          return (decoded.data as ProfilePointer).pubkey;
        }
      } catch (e) {
        console.error("Failed to decode pubkey", pk, e);
      }
      return pk;
    },
    getProfile: async function (pubkey: string): Promise<any> {
      pubkey = this.resolvePubkey(pubkey);
      const now = Math.floor(Date.now() / 1000);
      let cached = this.profiles[pubkey] as CachedProfile | undefined;

      if (!cached) {
        const dbEntry = await cashuDb.profiles.get(pubkey);
        if (dbEntry) {
          this.profiles[pubkey] = {
            profile: dbEntry.profile,
            fetchedAt: dbEntry.fetchedAt,
          };
          cached = this.profiles[pubkey] as CachedProfile;
        }
      }

      if (cached && now - cached.fetchedAt < 24 * 60 * 60) {
        return cached.profile;
      }

      await this.initNdkReadOnly();
      try {
        const user = this.ndk.getUser({ pubkey });
        await user.fetchProfile();
        const entry: CachedProfile = { profile: user.profile, fetchedAt: now };
        this.profiles[pubkey] = entry;
        await cashuDb.profiles.put({ pubkey, ...entry });
        return user.profile;
      } catch (e) {
        console.error(e);
        return cached ? cached.profile : null;
      }
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
      const user = await signer.user();
      if (user?.npub) {
        debug("Permission granted to read their public key:", user.npub);
        this.signerType = SignerType.NIP07;
        await this.setSigner(signer);
        this.ndk.getUser({ npub: user.npub });
        this.setPubkey(user.pubkey);
      }
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

    fetchFollowerCount: async function (pubkey: string): Promise<number> {
      pubkey = this.resolvePubkey(pubkey);
      await this.initNdkReadOnly();
      const filter: NDKFilter = { kinds: [3], "#p": [pubkey] };
      const events = await this.ndk.fetchEvents(filter);
      const authors = new Set<string>();
      events.forEach((ev) => authors.add(ev.pubkey));
      return authors.size;
    },

    fetchFollowingCount: async function (pubkey: string): Promise<number> {
      pubkey = this.resolvePubkey(pubkey);
      await this.initNdkReadOnly();
      const filter: NDKFilter = { kinds: [3], authors: [pubkey] };
      const events = await this.ndk.fetchEvents(filter);
      let latest: NDKEvent | undefined;
      events.forEach((ev) => {
        if (!latest || ev.created_at > (latest.created_at || 0)) {
          latest = ev;
        }
      });
      if (!latest) return 0;
      const following = new Set<string>();
      latest.tags.forEach((tag: NDKTag) => {
        if (tag[0] === "p" && tag[1]) {
          following.add(tag[1] as string);
        }
      });
      return following.size;
    },

    fetchJoinDate: async function (pubkey: string): Promise<number | null> {
      pubkey = this.resolvePubkey(pubkey);
      await this.initNdkReadOnly();
      const filter: NDKFilter = { kinds: [0, 1], authors: [pubkey] };
      const events = await this.ndk.fetchEvents(filter);
      let earliest: number | null = null;
      events.forEach((ev) => {
        if (earliest === null || ev.created_at < earliest) {
          earliest = ev.created_at;
        }
      });
      if (earliest !== null) {
        const now = Math.floor(Date.now() / 1000);
        if (earliest > now) {
          earliest = null;
        }
      }
      return earliest;
    },

    fetchMostRecentPost: async function (
      pubkey: string
    ): Promise<string | null> {
      pubkey = this.resolvePubkey(pubkey);
      await this.initNdkReadOnly();
      const filter: NDKFilter = { kinds: [1], authors: [pubkey], limit: 1 };
      const events = await this.ndk.fetchEvents(filter);
      let latest: NDKEvent | null = null;
      events.forEach((ev) => {
        if (!latest || ev.created_at > (latest.created_at || 0)) {
          latest = ev as NDKEvent;
        }
      });
      return latest ? (latest.content as string) : null;
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
    encryptNip04: async function (
      privKey: string | undefined,
      recipient: string,
      message: string
    ): Promise<string> {
      if (
        (!privKey || privKey.length === 0) &&
        (this.signerType === SignerType.NIP07 ||
          this.signerType === SignerType.NIP46) &&
        (window as any)?.nostr?.nip04?.encrypt
      ) {
        return await (window as any).nostr.nip04.encrypt(recipient, message);
      }
      if (!privKey) {
        throw new Error("No private key for encryption");
      }
      return await nip04.encrypt(privKey, recipient, message);
    },
    decryptNip04: async function (
      privKey: string | undefined,
      sender: string,
      content: string
    ): Promise<string> {
      if (
        (!privKey || privKey.length === 0) &&
        (this.signerType === SignerType.NIP07 ||
          this.signerType === SignerType.NIP46) &&
        (window as any)?.nostr?.nip04?.decrypt
      ) {
        return await (window as any).nostr.nip04.decrypt(sender, content);
      }
      if (!privKey) {
        throw new Error("No private key for decryption");
      }
      try {
        return await nip04.decrypt(privKey, sender, content);
      } catch (e) {
        const key = nip44.v2.utils.getConversationKey(privKey, sender);
        return await nip44.v2.decrypt(content, key);
      }
    },
    sendNip04DirectMessage: async function (
      recipient: string,
      message: string,
      privKey?: string,
      pubKey?: string
    ): Promise<{ success: boolean; event: NDKEvent | null }> {
      recipient = this.resolvePubkey(recipient);
      if (pubKey) {
        pubKey = this.resolvePubkey(pubKey);
      }
      await this.initSignerIfNotSet();
      const external =
        this.signerType === SignerType.NIP07 ||
        this.signerType === SignerType.NIP46;
      const key = privKey || this.privKeyHex;
      if (!key && !external) {
        notifyError("No private key available for messaging");
        return { success: false, event: null };
      }
      const signer = privKey ? new NDKPrivateKeySigner(privKey) : this.signer;
      const senderPubkey =
        pubKey || (privKey ? getPublicKey(hexToBytes(privKey)) : this.pubkey);
      const ndk = new NDK({ signer });
      const event = new NDKEvent(ndk);
      event.kind = NDKKind.EncryptedDirectMessage;
      event.content = await this.encryptNip04(key, recipient, message);
      event.tags = [
        ["p", recipient],
        ["p", senderPubkey],
      ];
      await event.sign(signer);

      const pool = new SimplePool();
      const nostrEvent = await event.toNostrEvent();
      try {
        await pool.publish(this.relays, nostrEvent);
        notifySuccess("NIP-04 event published");
        return { success: true, event };
      } catch (e) {
        console.error(e);
        notifyError("Could not publish NIP-04 event");
        return { success: false, event: null };
      }
    },
    subscribeToNip04DirectMessages: async function () {
      await this.initSignerIfNotSet();
      await this.initNdkReadOnly();
      const privKey = this.privKeyHex;
      const pubKey = this.pubkey;
      let nip04DirectMessageEvents: Set<NDKEvent> = new Set();
      const fetchEventsPromise = new Promise<Set<NDKEvent>>((resolve) => {
        if (!this.lastEventTimestamp) {
          this.lastEventTimestamp = Math.floor(Date.now() / 1000);
        }
        debug(
          `### Subscribing to NIP-04 direct messages to ${pubKey} since ${this.lastEventTimestamp}`
        );
        this.ndk.connect();
        const sub = this.ndk.subscribe(
          {
            kinds: [NDKKind.EncryptedDirectMessage],
            "#p": [pubKey],
            since: this.lastEventTimestamp,
          } as NDKFilter,
          { closeOnEose: false, groupable: false }
        );
        sub.on("event", (event: NDKEvent) => {
          debug("event");
          this.decryptNip04(privKey, event.pubkey, event.content).then(
            (content) => {
              debug("NIP-04 DM from", event.pubkey);
              debug("Content:", content);
              nip04DirectMessageEvents.add(event);
              this.lastEventTimestamp = Math.floor(Date.now() / 1000);
              this.parseMessageForEcash(content, event.pubkey);
              try {
                const chatStore = useDmChatsStore();
                chatStore.addIncoming(event);
              } catch {}
            }
          );
        });
      });
      try {
        nip04DirectMessageEvents = await fetchEventsPromise;
      } catch (error) {
        console.error("Error fetching contact events:", error);
      }
    },
    subscribeToNip04DirectMessagesCallback: async function (
      privKey: string | undefined,
      pubKey: string,
      cb: (event: NostrEvent, decrypted: string) => void,
      since?: number
    ) {
      pubKey = this.resolvePubkey(pubKey);
      await this.initNdkReadOnly();
      if (since === undefined) {
        if (!this.lastEventTimestamp) {
          this.lastEventTimestamp = Math.floor(Date.now() / 1000);
        }
        since = this.lastEventTimestamp;
      }
      const filter: NDKFilter = {
        kinds: [NDKKind.EncryptedDirectMessage],
        "#p": [pubKey],
        since,
      };
      const sub = this.ndk.subscribe(filter, {
        closeOnEose: false,
        groupable: false,
      });
      sub.on("event", async (ev: NDKEvent) => {
        const decrypted = await this.decryptNip04(
          privKey,
          ev.pubkey,
          ev.content
        );
        const raw = await ev.toNostrEvent();
        this.lastEventTimestamp = Math.floor(Date.now() / 1000);
        cb(raw, decrypted);
      });
    },
    sendNip17DirectMessageToNprofile: async function (
      nprofile: string,
      message: string
    ): Promise<NDKEvent | null> {
      const result = nip19.decode(nprofile);
      const pubkey: string = (result.data as ProfilePointer).pubkey;
      const relays: string[] | undefined = (result.data as ProfilePointer)
        .relays;
      return await this.sendNip17DirectMessage(pubkey, message, relays);
    },
    randomTimeUpTo2DaysInThePast: function () {
      return Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 172800);
    },
    sendNip17DirectMessage: async function (
      recipient: string,
      message: string,
      relays?: string[]
    ): Promise<NDKEvent | null> {
      recipient = this.resolvePubkey(recipient);
      await this.initSignerIfNotSet();
      const privKey = this.privKeyHex;
      if (!privKey) {
        notifyError("No private key available for messaging");
        return null;
      }
      const randomPrivateKey = generateSecretKey();
      const randomPublicKey = getPublicKey(randomPrivateKey);

      const dmEvent = new NDKEvent();
      dmEvent.kind = 14;
      dmEvent.content = message;
      dmEvent.tags = [["p", recipient]];
      dmEvent.created_at = Math.floor(Date.now() / 1000);
      dmEvent.pubkey = this.pubkey;
      await dmEvent.sign(this.signer);
      dmEvent.id = dmEvent.getEventHash();
      const dmEventString = JSON.stringify(await dmEvent.toNostrEvent());

      const seedNdk = new NDK({
        signer: this.signer,
        explicitRelayUrls: this.relays,
      });
      const sealEvent = new NDKEvent(seedNdk);
      sealEvent.kind = 13;
      sealEvent.content = nip44.v2.encrypt(
        dmEventString,
        nip44.v2.utils.getConversationKey(privKey, recipient)
      );
      sealEvent.created_at = this.randomTimeUpTo2DaysInThePast();
      sealEvent.pubkey = this.pubkey;
      sealEvent.id = sealEvent.getEventHash();
      sealEvent.sig = await sealEvent.sign();
      const sealEventString = JSON.stringify(await sealEvent.toNostrEvent());

      const randomNdk = new NDK({
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

      const pool = new SimplePool();
      const nostrEvent = await wrapEvent.toNostrEvent();
      try {
        await pool.publish(relays ?? this.relays, nostrEvent);
        const chatStore = useDmChatsStore();
        chatStore.addOutgoing(dmEvent);
        const router = useRouter();
        router.push("/nostr-messenger");
        notifySuccess("NIP-17 event published");
        return dmEvent;
      } catch (e) {
        console.error(e);
        notifyError("Could not publish NIP-17 event");
        return null;
      }
    },
    subscribeToNip17DirectMessages: async function () {
      await this.initSignerIfNotSet();
      await this.initNdkReadOnly();
      const privKey = this.privKeyHex;
      const pubKey = this.pubkey;
      let nip17DirectMessageEvents: Set<NDKEvent> = new Set();
      const fetchEventsPromise = new Promise<Set<NDKEvent>>((resolve) => {
        if (!this.lastEventTimestamp) {
          this.lastEventTimestamp = Math.floor(Date.now() / 1000);
        }
        const since = this.lastEventTimestamp - 172800; // last 2 days
        debug(
          `### Subscribing to NIP-17 direct messages to ${pubKey} since ${since}`
        );
        this.ndk.connect();
        const sub = this.ndk.subscribe(
          {
            kinds: [1059 as NDKKind],
            "#p": [pubKey],
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
            // debug(`### Already seen NIP-17 event ${wrapEvent.id} (time: ${wrapEvent.created_at})`);
            return;
          } else {
            debug(`### New event ${wrapEvent.id}`);
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
              nip44.v2.utils.getConversationKey(privKey || "", wrapEvent.pubkey)
            );
            const sealEvent = JSON.parse(wappedContent) as NostrEvent;
            const dmEventString = nip44.v2.decrypt(
              sealEvent.content,
              nip44.v2.utils.getConversationKey(privKey || "", sealEvent.pubkey)
            );
            dmEvent = JSON.parse(dmEventString) as NDKEvent;
            content = dmEvent.content;
            debug("### NIP-17 DM from", dmEvent.pubkey);
            debug("Content:", content);
          } catch (e) {
            console.error(e);
            return;
          }
          nip17DirectMessageEvents.add(dmEvent);
          this.lastEventTimestamp = Math.floor(Date.now() / 1000);
          this.parseMessageForEcash(content, dmEvent.pubkey);
          try {
            const chatStore = useDmChatsStore();
            chatStore.addIncoming(dmEvent);
          } catch {}
        });
      });
      try {
        nip17DirectMessageEvents = await fetchEventsPromise;
      } catch (error) {
        console.error("Error fetching contact events:", error);
      }
    },
    parseMessageForEcash: async function (message: string, sender?: string) {
      if (sender && sender === this.pubkey) return;
      // first check if the message can be converted to a json and then to a PaymentRequestPayload
      try {
        const payload = JSON.parse(message) as any;
        if (payload && payload.proofs) {
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
            debug("### incoming token already in history");
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

        // check for locked token format
        if (payload && payload.token && payload.referenceId) {
          const buckets = useBucketsStore();
          if (!buckets.bucketList.find((b) => b.id === payload.bucketId)) {
            buckets.buckets.push({
              id: payload.bucketId,
              name: payload.bucketId.slice(0, 8),
              creatorPubkey: sender,
            });
          }

          let amount = payload.amount;
          if (amount === undefined) {
            try {
              const decoded = token.decode(payload.token);
              amount = decoded
                ? token.getProofs(decoded).reduce((s, p) => (s += p.amount), 0)
                : 0;
            } catch {}
          }

          const entry: LockedToken = {
            id: uuidv4(),
            tokenString: payload.token,
            amount: amount || 0,
            owner: "creator",
            creatorNpub: this.pubkey,
            subscriberNpub: sender,
            tierId: payload.bucketId,
            intervalKey: payload.referenceId,
            unlockTs: payload.unlockTime || 0,
            refundUnlockTs: 0,
            status:
              payload.unlockTime &&
              payload.unlockTime > Math.floor(Date.now() / 1000)
                ? "pending"
                : "unlockable",
            subscriptionEventId: null,
            label: "Locked tokens",
          };
          await cashuDb.lockedTokens.put(entry);
          return;
        }
      } catch (e) {
        // debug("### parsing message for ecash failed");
        return;
      }

      debug("### parsing message for ecash", message);
      const receiveStore = useReceiveTokensStore();
      const words = message.split(" ");
      const tokens = words.filter((word) => {
        return word.startsWith("cashu");
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
        label: "",
        bucketId: DEFAULT_BUCKET_ID,
      });
      receiveStore.showReceiveTokens = false;
      // show success notification
      if (verbose) {
        notifySuccess("Ecash added to history.");
      }
    },
  },
});

export function getEventHash(event: NostrEvent): string {
  try {
    return ntGetEventHash(event);
  } catch (e) {
    console.error("Failed to hash event", e);
    throw e;
  }
}

export async function signEvent(
  event: NostrEvent,
  privkey: string
): Promise<string> {
  try {
    const signed = finalizeEvent(event as any, hexToBytes(privkey));
    Object.assign(event, signed);
    return event.sig as string;
  } catch (e) {
    console.error("Failed to sign event", e);
    throw e;
  }
}

export async function publishEvent(event: NostrEvent): Promise<void> {
  const relays = useSettingsStore().defaultNostrRelays;
  const pool = new SimplePool();
  try {
    await Promise.any(pool.publish(relays, event));
  } catch (e) {
    console.error("Failed to publish event", e);
  }
}

export function subscribeToNostr(filter: any, cb: (ev: NostrEvent) => void) {
  const relays = useSettingsStore().defaultNostrRelays;
  const pool = new SimplePool();
  try {
    pool.subscribeMany(relays, [filter], { onevent: cb });
  } catch (e) {
    console.error("Failed to subscribe", e);
  }
}
