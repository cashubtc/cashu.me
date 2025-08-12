import { useBucketsStore } from "./buckets";
import { debug } from "src/js/logger";
import { defineStore } from "pinia";
import NDK, {
  NDKEvent,
  NDKSigner,
  NDKNip07Signer,
  NDKNip46Signer,
  NDKFilter,
  NDKPrivateKeySigner,
  NDKKind,
  NDKRelaySet,
  NDKRelay,
  NDKTag,
  ProfilePointer,
  NDKSubscription,
} from "@nostr-dev-kit/ndk";
import {
  nip19,
  nip44,
  nip04,
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
import { filterHealthyRelays } from "src/utils/relayHealth";
import {
  notifyApiError,
  notifyError,
  notifySuccess,
  notifyWarning,
  notify,
} from "../js/notify";
import { useNdk } from "src/composables/useNdk";
import { rebuildNdk } from "boot/ndk";
import { useSendTokensStore } from "./sendTokensStore";
import { usePRStore } from "./payment-request";
import token from "../js/token";
import { HistoryToken } from "./tokens";
import { DEFAULT_BUCKET_ID } from "@/constants/buckets";
import { useDmChatsStore } from "./dmChats";
import { cashuDb, type LockedToken } from "./dexie";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "vue-router";
import { useP2PKStore } from "./p2pk";
import { watch } from "vue";
import { useCreatorsStore } from "./creators";
import { frequencyToDays } from "src/constants/subscriptionFrequency";

const STORAGE_SECRET = "cashu_ndk_storage_key";
let cachedKey: CryptoKey | null = null;
const RECONNECT_BACKOFF_MS = 15000; // 15s cooldown after failed attempts

async function getKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  const enc = new TextEncoder();
  const material = await crypto.subtle.importKey(
    "raw",
    enc.encode(STORAGE_SECRET),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );
  cachedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("cashu_ndk_salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
  return cachedKey;
}

async function encryptString(value: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(value),
  );
  const buff = new Uint8Array(iv.length + ciphertext.byteLength);
  buff.set(iv, 0);
  buff.set(new Uint8Array(ciphertext), iv.length);
  return btoa(String.fromCharCode(...buff));
}

async function decryptString(value: string): Promise<string> {
  const bytes = Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
  const iv = bytes.slice(0, 12);
  const ciphertext = bytes.slice(12);
  const key = await getKey();
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext,
  );
  return new TextDecoder().decode(decrypted);
}

async function secureSetItem(key: string, value: string) {
  const enc = await encryptString(value);
  localStorage.setItem(key, enc);
}

async function secureGetItem(key: string): Promise<string | null> {
  const val = localStorage.getItem(key);
  if (!val) return null;
  try {
    return await decryptString(val);
  } catch (e) {
    console.error("Failed to decrypt", e);
    return null;
  }
}

export function npubToHex(s: string): string | null {
  const input = s.trim();
  console.debug("[npubToHex] input", input);
  try {
    const decoded = nip19.decode(input);
    console.debug("[npubToHex] decoded", decoded);
    const { type, data } = decoded;
    if (type !== "npub") return null;
    if (typeof data === "string") {
      if (/^[0-9a-fA-F]{64}$/.test(data)) return data.toLowerCase();
    } else if ((data as any) instanceof Uint8Array) {
      return bytesToHex(data);
    }
  } catch (err) {
    console.error("[npubToHex] decode failed", err);
  }
  return null;
}

// --- Nutzap helpers (NIP-61) ----------------------------------------------

import type { NostrEvent } from "@nostr-dev-kit/ndk";

interface NutzapProfile {
  hexPub: string;
  p2pkPubkey: string;
  trustedMints: string[];
  relays: string[];
}

export class RelayConnectionError extends Error {
  constructor(message?: string) {
    super(message ?? "Unable to connect to Nostr relays");
    this.name = "RelayConnectionError";
  }
}

async function urlsToRelaySet(
  urls?: string[],
): Promise<NDKRelaySet | undefined> {
  if (!urls?.length) return undefined;

  const ndk = await useNdk({ requireSigner: false });
  const set = new NDKRelaySet(new Set(), ndk);
  urls.forEach((u) =>
    set.addRelay(
      ndk.pool.getRelay(u) ?? new NDKRelay(u, undefined as any, ndk as any),
    ),
  );
  return set;
}

/** Wraps relay.connect() in a timeout (ms) so it never hangs forever */
function connectWithTimeout(relay: any, ms = 6000): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(
      () => reject(new Error(`[nostr] timeout ${relay?.url ?? ""}`)),
      ms,
    );
    relay
      .connect()
      .then(() => {
        clearTimeout(t);
        resolve();
      })
      .catch((err) => {
        clearTimeout(t);
        reject(err);
      });
  });
}

export class PublishTimeoutError extends Error {
  constructor(message = "Publish timed out") {
    super(message);
    this.name = "PublishTimeoutError";
  }
}

export async function publishWithTimeout(
  ev: NDKEvent,
  relays?: NDKRelaySet,
  timeoutMs = 30000,
): Promise<void> {
  await Promise.race([
    ev.publish(relays),
    new Promise<void>((_, reject) =>
      setTimeout(() => reject(new PublishTimeoutError()), timeoutMs),
    ),
  ]);
}

/** Resolves once any relay in `ndk.pool` has `connected === true`. */
export function ensureRelayConnectivity(ndk: NDK): Promise<void> {
  const isConnected = () =>
    Array.from(ndk.pool.relays.values()).some((r: any) => r.connected === true);

  if (isConnected()) return Promise.resolve();

  const timeoutMs = 4000;

  return new Promise((resolve, reject) => {
    const expiry = Date.now() + timeoutMs;
    const interval = setInterval(() => {
      if (isConnected()) {
        clearInterval(interval);
        resolve();
      } else if (Date.now() > expiry) {
        clearInterval(interval);
        reject(new Error("No relay connected"));
      }
    }, 100);
  });
}

/**
 * Fetches the receiver’s ‘kind:10019’ Nutzap profile.
 */
export async function fetchNutzapProfile(
  npubOrHex: string,
): Promise<NutzapProfile | null> {
  const nostr = useNostrStore();
  await nostr.initNdkReadOnly();
  const ndk = await useNdk();
  if (!ndk) {
    throw new Error(
      "NDK not initialised \u2013 call initSignerIfNotSet() first",
    );
  }
  try {
    await ensureRelayConnectivity(ndk);
  } catch (e: any) {
    throw new RelayConnectionError(e?.message);
  }
  const hex = npubOrHex.startsWith("npub") ? npubToHex(npubOrHex) : npubOrHex;
  if (!hex) throw new Error("Invalid npub");
  const sub = ndk.subscribe({
    kinds: [10019],
    authors: [hex],
    limit: 1,
  });

  return new Promise((resolve) => {
    sub.on("event", (ev: NostrEvent) => {
      let p2pkPubkey = ev.tags.find((t) => t[0] === "pubkey")?.[1];
      const mints = ev.tags.filter((t) => t[0] === "mint").map((t) => t[1]);
      if (p2pkPubkey) {
        if (p2pkPubkey.startsWith("npub")) {
          const hx = npubToHex(p2pkPubkey);
          if (hx) p2pkPubkey = hx;
        }
        try {
          p2pkPubkey = ensureCompressed(p2pkPubkey);
        } catch (e) {
          console.error("Invalid P2PK pubkey", e);
          p2pkPubkey = "";
        }
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

/** Publishes a ‘kind:10019’ Nutzap profile event. */
export async function publishNutzapProfile(opts: {
  p2pkPub: string;
  mints: string[];
  relays?: string[];
}) {
  const nostr = useNostrStore();
  if (!nostr.signer) {
    throw new Error("Signer required to publish Nutzap profile");
  }
  await nostr.ensureNdkConnected(opts.relays);
  const tags: NDKTag[] = [["pubkey", opts.p2pkPub]];
  for (const url of opts.mints) tags.push(["mint", url]);
  if (opts.relays) for (const r of opts.relays) tags.push(["relay", r]);

  const ndk = await useNdk();
  if (!ndk) {
    throw new Error(
      "NDK not initialised \u2013 call initSignerIfNotSet() first",
    );
  }
  const ev = new NDKEvent(ndk);
  ev.kind = 10019;
  ev.content = "";
  ev.tags = tags;
  ev.created_at = Math.floor(Date.now() / 1000);
  await ev.sign();
  const relaySet = await urlsToRelaySet(opts.relays);
  try {
    await ensureRelayConnectivity(ndk);
  } catch (e: any) {
    notifyWarning("Relay connection failed", e?.message ?? String(e));
  }
  try {
    await publishWithTimeout(ev, relaySet);
  } catch (e: any) {
    notifyError(e?.message ?? String(e));
    throw e;
  }
  return ev.id!;
}

/**
 * Publishes a complete, discoverable user profile to Nostr.
 * This includes kind 0 (metadata), kind 10002 (relay list), and kind 10019 (payment profile).
 * This single action ensures a user's identity is consistent and findable.
 */
export async function publishDiscoveryProfile(opts: {
  profile: { display_name?: string; picture?: string; about?: string };
  p2pkPub: string;
  mints: string[];
  relays: string[];
}) {
  const nostr = useNostrStore();
  if (!nostr.signer) {
    throw new Error("Signer required to publish a discoverable profile.");
  }
  // Ensure we are connected to the relays we want to publish to.
  await nostr.ensureNdkConnected(opts.relays);
  const ndk = await useNdk();
  if (!ndk) {
    throw new Error("NDK not initialized. Cannot publish profile.");
  }

  // --- 1. Prepare Kind 0 (Profile Metadata) ---
  const kind0Event = new NDKEvent(ndk);
  kind0Event.kind = 0;
  kind0Event.content = JSON.stringify(opts.profile);

  // --- 2. Prepare Kind 10002 (Relay List) ---
  const kind10002Event = new NDKEvent(ndk);
  kind10002Event.kind = 10002;
  kind10002Event.tags = opts.relays.map((r) => ["r", r]); // 'r' tag for each relay URL

  // --- 3. Prepare Kind 10019 (Nutzap/Payment Profile) ---
  const kind10019Event = new NDKEvent(ndk);
  kind10019Event.kind = 10019;
  kind10019Event.tags = [
    ["pubkey", opts.p2pkPub],
    ...opts.mints.map((m) => ["mint", m]),
    ...opts.relays.map((r) => ["relay", r]),
  ];

  const eventsToPublish = [kind0Event, kind10002Event, kind10019Event];

  // Sign all events
  await Promise.all(eventsToPublish.map((ev) => ev.sign()));

  // Publish all events
  const relaySet = await urlsToRelaySet(opts.relays);
  try {
    await ensureRelayConnectivity(ndk);
  } catch (e: any) {
    notifyWarning("Relay connection failed", e?.message ?? String(e));
  }
  try {
    await Promise.all(
      eventsToPublish.map((ev) => publishWithTimeout(ev, relaySet)),
    );
    notifySuccess("Profile published successfully to your relays!");
  } catch (e: any) {
    notifyError(e?.message ?? String(e));
    throw e;
  }
  return eventsToPublish.map((ev) => ev.id);
}

/** Publishes a ‘kind:9321’ Nutzap event. */
export async function publishNutzap(opts: {
  content: string;
  receiverHex: string;
  relayHints?: string[];
}) {
  const nostr = useNostrStore();
  await nostr.initSignerIfNotSet();
  await nostr.ensureNdkConnected(opts.relayHints);
  const ndk = await useNdk();
  if (!ndk) {
    throw new Error(
      "NDK not initialised \u2013 call initSignerIfNotSet() first",
    );
  }
  const ev = new NDKEvent(ndk);
  ev.kind = 9321;
  ev.content = opts.content;
  ev.tags = [["p", opts.receiverHex]];
  ev.created_at = Math.floor(Date.now() / 1000);
  await ev.sign();
  const relaySet = await urlsToRelaySet(opts.relayHints);
  try {
    await ensureRelayConnectivity(ndk);
  } catch (e: any) {
    notifyWarning("Relay connection failed", e?.message ?? String(e));
  }
  try {
    await ev.publish(relaySet);
  } catch (e: any) {
    notifyError(e?.message ?? String(e));
    throw e;
  }
  return ev.id!;
}

/** Listens for incoming Nutzaps that reference my pubkey via ‘p’ tag. */
export async function subscribeToNutzaps(
  myHex: string,
  onZap: (ev: NostrEvent) => void,
): Promise<NDKSubscription> {
  const nostr = useNostrStore();
  await nostr.initNdkReadOnly();
  const ndk = await useNdk();
  if (!ndk) {
    throw new Error(
      "NDK not initialised \u2013 call initSignerIfNotSet() first",
    );
  }
  const sub = ndk.subscribe({
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
  state: () => {
    const lastEventTimestamp = useLocalStorage<number>(
      "cashu.ndk.lastEventTimestamp",
      0,
    );
    const now = Math.floor(Date.now() / 1000);
    if (lastEventTimestamp.value > now) {
      lastEventTimestamp.value = now;
    }
    return {
      connected: false,
      pubkey: "",
      relays: useSettingsStore().defaultNostrRelays ?? ([] as string[]),
      signerType: SignerType.SEED,
      nip07signer: {} as NDKNip07Signer,
      nip46Token: "",
      nip46signer: {} as NDKNip46Signer,
      privateKeySignerPrivateKey: "",
      seedSignerPrivateKey: "",
      seedSignerPublicKey: "",
      seedSigner: {} as NDKPrivateKeySigner,
      seedSignerPrivateKeyNsec: "",
      privateKeySigner: {} as NDKPrivateKeySigner,
      signer: undefined as unknown as NDKSigner | undefined,
      nip07SignerAvailable: true,
      nip07Checked: false,
      nip07Warned: false,
      mintRecommendations: useLocalStorage<MintRecommendation[]>(
        "cashu.ndk.mintRecommendations",
        [],
      ),
      initialized: false,
      secureStorageLoaded: false,
      lastError: "" as string | null,
      reconnectBackoffUntil: 0,
      lastEventTimestamp,
      nip17EventIdsWeHaveSeen: useLocalStorage<NostrEventLog[]>(
        "cashu.ndk.nip17EventIdsWeHaveSeen",
        [],
      ),
      profiles: useLocalStorage<
        Record<string, { profile: any; fetchedAt: number }>
      >("cashu.ndk.profiles", {}),
    };
  },
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
    loadKeysFromStorage: async function () {
      if (this.secureStorageLoaded) return;
      const pk = await secureGetItem("cashu.ndk.pubkey");
      if (pk) this.pubkey = pk;
      const st = await secureGetItem("cashu.ndk.signerType");
      if (st) this.signerType = st as SignerType;
      const nip46 = await secureGetItem("cashu.ndk.nip46Token");
      if (nip46) this.nip46Token = nip46;
      const pks = await secureGetItem("cashu.ndk.privateKeySignerPrivateKey");
      if (pks) this.privateKeySignerPrivateKey = pks;
      const seedSk = await secureGetItem("cashu.ndk.seedSignerPrivateKey");
      if (seedSk) this.seedSignerPrivateKey = seedSk;
      const seedPk = await secureGetItem("cashu.ndk.seedSignerPublicKey");
      if (seedPk) this.seedSignerPublicKey = seedPk;
      watch(
        () => this.pubkey,
        (v) => {
          secureSetItem("cashu.ndk.pubkey", v);
        },
      );
      watch(
        () => this.signerType,
        (v) => {
          secureSetItem("cashu.ndk.signerType", v.toString());
        },
      );
      watch(
        () => this.nip46Token,
        (v) => {
          secureSetItem("cashu.ndk.nip46Token", v);
        },
      );
      watch(
        () => this.privateKeySignerPrivateKey,
        (v) => {
          secureSetItem("cashu.ndk.privateKeySignerPrivateKey", v);
        },
      );
      watch(
        () => this.seedSignerPrivateKey,
        (v) => {
          secureSetItem("cashu.ndk.seedSignerPrivateKey", v);
        },
      );
      watch(
        () => this.seedSignerPublicKey,
        (v) => {
          secureSetItem("cashu.ndk.seedSignerPublicKey", v);
        },
      );
      this.secureStorageLoaded = true;
    },
    initNdkReadOnly: async function () {
      await this.loadKeysFromStorage();
      const ndk = await useNdk({ requireSigner: false });
      if (this.connected) return;
      try {
        await ndk.connect();
        this.connected = true;
        this.lastError = null;
      } catch (e: any) {
        console.warn("[nostr] read-only connect failed", e);
        notifyWarning(`Failed to connect to relays`, e?.message ?? String(e));
        this.connected = false;
        this.lastError = e?.message ?? String(e);
      }
    },
    disconnect: async function () {
      const ndk = await useNdk();
      for (const relay of ndk.pool.relays.values()) relay.disconnect();
      this.signer = undefined;
      this.connected = false;
    },
    async connectBrowserSigner() {
      const nip07 = new NDKNip07Signer();
      try {
        await nip07.user();
        this.signer = nip07;
        this.signerType = SignerType.NIP07;
        await useNdk({ requireSigner: true });
      } catch (e) {
        throw new Error("The signer request was rejected or blocked.");
      }
    },
    connect: async function (relays?: string[]) {
      // respect cooldown if previous attempt failed
      if (
        this.reconnectBackoffUntil &&
        Date.now() < this.reconnectBackoffUntil
      ) {
        return;
      }

      // 1. remember desired relay set
      if (relays) this.relays = relays as any;

      // 2. build a *new* NDK whose pool contains only those relays
      const ndk = await rebuildNdk(this.relays, this.signer);

      // 3. connect every relay with a 6-second guard, but do not await ndk.connect() again
      const relaysArr = Array.from(ndk.pool.relays.values());
      const connectPromises = relaysArr.map((r) => connectWithTimeout(r, 6000));

      // flip Online as soon as one opens
      try {
        await Promise.any(connectPromises);
        this.connected = true;
        this.lastError = null;
        this.reconnectBackoffUntil = 0;
      } catch (e: any) {
        this.connected = false;
        this.lastError = e?.message ?? String(e);
        this.reconnectBackoffUntil = Date.now() + RECONNECT_BACKOFF_MS;
        notifyError(this.lastError);
      }

      // 4. keep icons in RelayManager.vue fresh
      ndk.pool.on("relay:connect", () => {
        this.relays = [...this.relays];
      });
      ndk.pool.on("relay:disconnect", () => {
        this.relays = [...this.relays];
      });

      // 5. background logging – never throw
      Promise.allSettled(connectPromises).then((res) =>
        res.forEach((r, i) => {
          if (r.status === "rejected") {
            console.warn("[nostr] relay", relaysArr[i].url, "failed", r.reason);
            notifyWarning(
              `Relay ${relaysArr[i].url} failed`,
              (r.reason as any)?.message ?? String(r.reason),
            );
          }
        }),
      );
    },
    ensureNdkConnected: async function (relays?: string[]) {
      const ndk = await useNdk();
      if (!this.connected) {
        try {
          await ndk.connect();
          this.connected = true;
        } catch (e: any) {
          notifyWarning("Failed to connect to relays", e?.message ?? String(e));
        }
      }
      if (relays?.length) {
        const added = await urlsToRelaySet(relays);
        if (added) {
          try {
            await ndk.connect();
          } catch (e: any) {
            notifyWarning(
              "Failed to connect to additional relays",
              e?.message ?? String(e),
            );
          }
        }
      }
    },
    initSignerIfNotSet: async function () {
      await this.loadKeysFromStorage();
      if (!this.signer) {
        if (
          this.signerType === SignerType.NIP07 &&
          this.nip07Checked &&
          !this.nip07SignerAvailable
        ) {
          if (!this.initialized) {
            await this.initNdkReadOnly();
            this.initialized = true;
          }
          return;
        }
        this.initialized = false; // force re-initialisation
      }
      if (!this.initialized) {
        await this.initSigner();
        await this.ensureNdkConnected();
      }
    },
    initSigner: async function () {
      if (this.signerType === SignerType.NIP07) {
        await this.initNip07Signer();
      } else if (this.signerType === SignerType.PRIVATEKEY) {
        await this.initPrivateKeySigner();
      } else {
        await this.initWalletSeedPrivateKeySigner();
      }
      this.initialized = true;
    },
    setSigner: async function (signer: NDKSigner) {
      this.signer = signer;
      await this.connect();
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
            "02" + getPublicKey(hexToBytes(privKey)),
          );
          if (!p2pkStore.haveThisKey(pk66) && p2pkStore.p2pkKeys.length === 0) {
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
        const ndk = await useNdk();
        const user = ndk.getUser({ pubkey });
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
    checkNip07Signer: async function (force = false): Promise<boolean> {
      if (this.nip07Checked && !force) return this.nip07SignerAvailable;
      const signer = new NDKNip07Signer();
      try {
        await signer.user();
        this.nip07SignerAvailable = true;
      } catch (e) {
        this.nip07SignerAvailable = false;
      }
      this.nip07Checked = true;
      return this.nip07SignerAvailable;
    },
    initNip07Signer: async function () {
      const available = await this.checkNip07Signer();
      if (!available) {
        if (!this.nip07Warned) {
          notifyWarning(
            "Nostr extension locked or unavailable",
            "Unlock your NIP-07 extension to enable signing",
          );
          this.nip07Warned = true;
        }
        this.initialized = true;
        return;
      }
      try {
        const signer = new NDKNip07Signer();
        await signer.blockUntilReady();
        const user = await signer.user();
        if (user?.npub) {
          this.signerType = SignerType.NIP07;
          this.setPubkey(user.pubkey);
          await this.setSigner(signer);
        }
      } catch (e) {
        console.error("Failed to init NIP07 signer:", e);
      }
    },
    initNip46Signer: async function (nip46Token?: string) {
      const ndk = await useNdk();
      if (!nip46Token && !this.nip46Token.length) {
        nip46Token = (await prompt(
          "Enter your NIP-46 connection string",
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
      const privateKeyHex = bytesToHex(privateKeyBytes);
      const signer = new NDKPrivateKeySigner(privateKeyHex);
      this.privateKeySignerPrivateKey = privateKeyHex;
      this.signerType = SignerType.PRIVATEKEY;
      this.setPubkey(getPublicKey(privateKeyBytes));
      await this.setSigner(signer);
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
      const signer = new NDKPrivateKeySigner(this.seedSignerPrivateKey);
      this.signerType = SignerType.SEED;
      this.setPubkey(this.seedSignerPublicKey);
      await this.setSigner(signer);
    },
    fetchEventsFromUser: async function () {
      const filter: NDKFilter = { kinds: [1], authors: [this.pubkey] };
      const ndk = await useNdk();
      return await ndk.fetchEvents(filter);
    },

    fetchFollowerCount: async function (pubkey: string): Promise<number> {
      pubkey = this.resolvePubkey(pubkey);
      await this.initNdkReadOnly();
      const filter: NDKFilter = { kinds: [3], "#p": [pubkey] };
      const ndk = await useNdk();
      const events = await ndk.fetchEvents(filter);
      const authors = new Set<string>();
      events.forEach((ev) => authors.add(ev.pubkey));
      return authors.size;
    },

    fetchFollowingCount: async function (pubkey: string): Promise<number> {
      pubkey = this.resolvePubkey(pubkey);
      await this.initNdkReadOnly();
      const filter: NDKFilter = { kinds: [3], authors: [pubkey] };
      const ndk = await useNdk();
      const events = await ndk.fetchEvents(filter);
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
      const ndk = await useNdk();
      const events = await ndk.fetchEvents(filter);
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
      pubkey: string,
    ): Promise<string | null> {
      pubkey = this.resolvePubkey(pubkey);
      await this.initNdkReadOnly();
      const filter: NDKFilter = { kinds: [1], authors: [pubkey], limit: 1 };
      const ndk = await useNdk();
      const events = await ndk.fetchEvents(filter);
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
      const ndk = await useNdk();
      const events = await ndk.fetchEvents(filter);
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
      message: string,
      useNip04 = false,
    ): Promise<string> {
      if (
        (!privKey || privKey.length === 0) &&
        (this.signerType === SignerType.NIP07 ||
          this.signerType === SignerType.NIP46) &&
        (window as any)?.nostr?.[useNip04 ? "nip04" : "nip44"]?.encrypt
      ) {
        return await (window as any).nostr[
          useNip04 ? "nip04" : "nip44"
        ].encrypt(recipient, message);
      }
      if (!privKey) {
        throw new Error("No private key for encryption");
      }
      if (useNip04) {
        return await nip04.encrypt(privKey, recipient, message);
      }
      return await nip44.v2.encrypt(
        message,
        nip44.v2.utils.getConversationKey(privKey as any, recipient as any),
      );
    },
    decryptNip04: async function (
      privKey: string | undefined,
      sender: string,
      content: string,
    ): Promise<string> {
      if (
        (!privKey || privKey.length === 0) &&
        (this.signerType === SignerType.NIP07 ||
          this.signerType === SignerType.NIP46)
      ) {
        if ((window as any)?.nostr?.nip44?.decrypt) {
          try {
            return await (window as any).nostr.nip44.decrypt(sender, content);
          } catch (e) {
            if ((window as any)?.nostr?.nip04?.decrypt) {
              try {
                return await (window as any).nostr.nip04.decrypt(
                  sender,
                  content,
                );
              } catch {}
            }
            const shared = await (window as any).nostr.getSharedSecret(sender);
            try {
              return await nip44.v2.decrypt(content, shared);
            } catch (err) {
              throw err;
            }
          }
        } else if ((window as any)?.nostr?.nip04?.decrypt) {
          return await (window as any).nostr.nip04.decrypt(sender, content);
        }
      }
      if (!privKey) {
        throw new Error("No private key for decryption");
      }
      const nip44Key = nip44.v2.utils.getConversationKey(
        privKey as any,
        sender as any,
      );
      try {
        return await nip44.v2.decrypt(content, nip44Key);
      } catch (e) {
        try {
          return await nip04.decrypt(privKey, sender, content);
        } catch {
          // fallback to nip44 decrypt just in case
          return await nip44.v2.decrypt(content, nip44Key);
        }
      }
    },
    sendNip04DirectMessage: async function (
      recipient: string,
      message: string,
      privKey?: string,
      pubKey?: string,
      relays?: string[],
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
      const ndk = await useNdk();
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
        await pool.publish(relays ?? this.relays, nostrEvent as any);
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
      const fetchEventsPromise = new Promise<Set<NDKEvent>>(async (resolve) => {
        if (!this.lastEventTimestamp) {
          this.lastEventTimestamp = Math.floor(Date.now() / 1000);
        }
        const now = Math.floor(Date.now() / 1000);
        if (this.lastEventTimestamp > now) {
          this.lastEventTimestamp = now;
        }
        debug(
          `### Subscribing to NIP-04 direct messages to ${pubKey} since ${this.lastEventTimestamp}`,
        );
        const ndk = await useNdk();
        try {
          await ndk.connect();
        } catch (e: any) {
          notifyWarning("Relay connection failed", e?.message ?? String(e));
        }
        const sub = ndk.subscribe(
          {
            kinds: [NDKKind.EncryptedDirectMessage],
            "#p": [pubKey],
            since: this.lastEventTimestamp,
          } as NDKFilter,
          { closeOnEose: false, groupable: false },
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
                chatStore.addIncoming(event.rawEvent() as any);
              } catch {}
            },
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
      since?: number,
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
      const ndk = await useNdk();
      const sub = ndk.subscribe(filter, {
        closeOnEose: false,
        groupable: false,
      });
      sub.on("event", async (ev: NDKEvent) => {
        const decrypted = await this.decryptNip04(
          privKey,
          ev.pubkey,
          ev.content,
        );
        const raw = await ev.toNostrEvent();
        this.lastEventTimestamp = Math.floor(Date.now() / 1000);
        cb(raw, decrypted);
      });
    },
    sendNip17DirectMessageToNprofile: async function (
      nprofile: string,
      message: string,
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
      relays?: string[],
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

      const sealEvent = new NDKEvent();
      sealEvent.kind = 13;
      sealEvent.content = nip44.v2.encrypt(
        dmEventString,
        nip44.v2.utils.getConversationKey(privKey as any, recipient as any),
      );
      sealEvent.created_at = this.randomTimeUpTo2DaysInThePast();
      sealEvent.pubkey = this.pubkey;
      sealEvent.id = sealEvent.getEventHash();
      sealEvent.sig = await sealEvent.sign();
      const sealEventString = JSON.stringify(await sealEvent.toNostrEvent());

      const wrapEvent = new NDKEvent();
      wrapEvent.kind = 1059;
      wrapEvent.tags = [["p", recipient]];
      wrapEvent.content = nip44.v2.encrypt(
        sealEventString,
        nip44.v2.utils.getConversationKey(randomPrivateKey, recipient),
      );
      wrapEvent.created_at = this.randomTimeUpTo2DaysInThePast();
      wrapEvent.pubkey = randomPublicKey;
      wrapEvent.id = wrapEvent.getEventHash();
      wrapEvent.sig = await wrapEvent.sign();

      const pool = new SimplePool();
      const nostrEvent = await wrapEvent.toNostrEvent();
      try {
        await pool.publish(relays ?? this.relays, nostrEvent as any);
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
      const fetchEventsPromise = new Promise<Set<NDKEvent>>(async (resolve) => {
        if (!this.lastEventTimestamp) {
          this.lastEventTimestamp = Math.floor(Date.now() / 1000);
        }
        const now = Math.floor(Date.now() / 1000);
        if (this.lastEventTimestamp > now) {
          this.lastEventTimestamp = now;
        }
        const since = this.lastEventTimestamp - 172800; // last 2 days
        debug(
          `### Subscribing to NIP-17 direct messages to ${pubKey} since ${since}`,
        );
        const ndk = await useNdk();
        try {
          await ndk.connect();
        } catch (e: any) {
          notifyWarning("Relay connection failed", e?.message ?? String(e));
        }
        const sub = ndk.subscribe(
          {
            kinds: [1059 as NDKKind],
            "#p": [pubKey],
            since: since,
          } as NDKFilter,
          { closeOnEose: false, groupable: false },
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
              (e) => e.created_at > fourDaysAgo,
            );
          }
          let dmEvent: NDKEvent;
          let content: string;
          try {
            const wappedContent = nip44.v2.decrypt(
              wrapEvent.content,
              nip44.v2.utils.getConversationKey(
                privKey || ("" as any),
                wrapEvent.pubkey as any,
              ),
            );
            const sealEvent = JSON.parse(wappedContent) as NostrEvent;
            const dmEventString = nip44.v2.decrypt(
              sealEvent.content,
              nip44.v2.utils.getConversationKey(
                privKey || ("" as any),
                sealEvent.pubkey as any,
              ),
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
            chatStore.addIncoming(dmEvent as any);
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
        if (
          payload &&
          payload.type === "cashu_subscription_payment" &&
          payload.token
        ) {
          const decoded = token.decode(payload.token);
          const amount = decoded
            ? token.getProofs(decoded).reduce((s, p) => s + p.amount, 0)
            : 0;
          const unlockTs = payload.unlock_time ?? payload.unlockTime ?? 0;
          const creatorsStore = useCreatorsStore();
          const tierName = creatorsStore.tiersMap[this.pubkey || ""]?.find(
            (t) => t.id === payload.tier_id,
          )?.name;
          const entry = {
            id: uuidv4(),
            tokenString: payload.token,
            amount,
            owner: "creator",
            creatorNpub: this.pubkey,
            subscriberNpub: sender,
            tierId: payload.tier_id ?? "",
            ...(tierName ? { tierName } : {}),
            intervalKey: payload.subscription_id ?? "",
            unlockTs,
            autoRedeem: true,
            status:
              unlockTs && unlockTs > Math.floor(Date.now() / 1000)
                ? "pending"
                : "unlockable",
            subscriptionEventId: null,
            subscriptionId: payload.subscription_id,
            monthIndex: payload.month_index,
            totalPeriods: payload.total_months,
            frequency: (payload as any).frequency || "monthly",
            intervalDays:
              (payload as any).interval_days ||
              frequencyToDays(((payload as any).frequency as any) || "monthly"),
            label: "Subscription payment",
          };
          await cashuDb.lockedTokens.put(entry as any);
          const receiveStore = useReceiveTokensStore();
          receiveStore.receiveData.tokensBase64 = payload.token;
          await receiveStore.enqueue(() =>
            receiveStore.receiveToken(payload.token, DEFAULT_BUCKET_ID),
          );
          return;
        }
        if (payload && payload.type === "cashu_subscription_claimed") {
          const sub = await cashuDb.subscriptions.get(payload.subscription_id);
          const idx = sub?.intervals.findIndex(
            (i) => i.monthIndex === payload.month_index,
          );
          if (sub && idx !== undefined && idx >= 0) {
            sub.intervals[idx].status = "claimed";
            await cashuDb.subscriptions.update(sub.id, {
              intervals: sub.intervals,
            });
            notifySuccess("Subscription payment claimed");
          }
          return;
        }
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
        if (
          payload.token &&
          payload.bucketId &&
          (payload.unlockTime !== undefined ||
            payload.unlock_time !== undefined)
        ) {
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

          const unlockTs = payload.unlock_time ?? payload.unlockTime ?? 0;
          const entry = {
            id: uuidv4(),
            tokenString: payload.token,
            amount: amount || 0,
            owner: "creator",
            creatorNpub: this.pubkey,
            subscriberNpub: sender,
            tierId: payload.bucketId,
            intervalKey: payload.referenceId,
            unlockTs,
            autoRedeem: true,
            status:
              unlockTs && unlockTs > Math.floor(Date.now() / 1000)
                ? "pending"
                : "unlockable",
            subscriptionEventId: null,
            label: "Locked tokens",
          };
          await cashuDb.lockedTokens.put(entry as any);
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
        tokenStr: tokenStr,
        mint: token.getMint(decodedToken),
        unit: token.getUnit(decodedToken),
        label: "",
        description: receiveStore.receiveData.description ?? "",
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
    return ntGetEventHash(event as any);
  } catch (e) {
    console.error("Failed to hash event", e);
    throw e;
  }
}

export async function signEvent(
  event: NostrEvent,
  privkey: string,
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
    await Promise.any(pool.publish(relays, event as any));
  } catch (e) {
    console.error("Failed to publish event", e);
  }
}

export async function subscribeToNostr(
  filter: any,
  cb: (ev: NostrEvent) => void,
  relays?: string[],
): Promise<boolean> {
  const relayUrls =
    relays && relays.length > 0
      ? relays
      : useSettingsStore().defaultNostrRelays;
  if (!relayUrls || relayUrls.length === 0) {
    console.warn("[nostr] subscribeMany called with empty relay list");
    return false;
  }

  // Ensure at least one relay is reachable before subscribing
  const healthy = await filterHealthyRelays(relayUrls);
  if (healthy.length === 0) {
    console.error("[nostr] subscription failed: all relays unreachable");
    return false;
  }

  const pool = new SimplePool();
  try {
    pool.subscribeMany(healthy, [filter], { onevent: cb });
    return true;
  } catch (e) {
    console.error("Failed to subscribe", e);
    return false;
  }
}
