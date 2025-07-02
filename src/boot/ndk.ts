import { boot } from "quasar/wrappers";
import { useBootErrorStore } from "stores/bootError";
import NDK, {
  NDKNip07Signer,
  NDKPrivateKeySigner,
  NDKSigner,
} from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";
import { bytesToHex } from "@noble/hashes/utils";
import { useSettingsStore } from "src/stores/settings";

export type NdkBootErrorReason =
  | "no-signer"
  | "connect-failed"
  | "nip07-locked"
  | "unknown";

export class NdkBootError extends Error {
  reason: NdkBootErrorReason;
  constructor(reason: NdkBootErrorReason, message?: string) {
    super(message ?? reason);
    this.name = "NdkBootError";
    this.reason = reason;
  }
}

export const DEFAULT_RELAYS = [
  "wss://relay.damus.io/",
  "wss://relay.primal.net/",
  "wss://eden.nostr.land/",
  "wss://nos.lol/",
  "wss://nostr-pub.wellorder.net/",
  "wss://nostr.bitcoiner.social/",
  "wss://relay.nostr.band/",
  "wss://relay.snort.social/",
];

export function mergeDefaultRelays(ndk: NDK) {
  for (const url of DEFAULT_RELAYS) {
    if (!ndk.pool.relays.has(url)) {
      ndk.addExplicitRelay(url);
    }
  }
}

// ensure there is at least one relay configured at runtime
if (DEFAULT_RELAYS.length === 0) {
  DEFAULT_RELAYS.push("wss://relay.damus.io/");
}

let ndkInstance: NDK | undefined;
let ndkPromise: Promise<NDK> | undefined;

async function resolveSigner(): Promise<NDKSigner> {
  // 1 ─ local nsec (strip legacy JSON quotes if present)
  const raw = window.localStorage.getItem("nsec") ?? "";
  const clean = raw.replace(/^"+|"+$/g, "").trim(); // "nsec…"
  // TODO: sanitize quoted legacy values once
  if (clean.startsWith("nsec")) {
    try {
      const { data } = nip19.decode(clean); // Uint8Array
      const hex = bytesToHex(data); // 64-char hex
      return new NDKPrivateKeySigner(hex);
    } catch (e) {
      throw new NdkBootError("unknown", (e as Error).message);
    }
  }

  if (typeof window !== "undefined" && (window as any).nostr) {
    try {
      const signer = new NDKNip07Signer();
      await signer.user();
      await signer.blockUntilReady();
      return signer;
    } catch (err: any) {
      const msg = (err as Error).message;
      if (
        msg?.includes("There is no active private key") ||
        msg?.includes("User rejected")
      ) {
        throw new NdkBootError("nip07-locked", msg);
      }
      throw new NdkBootError("unknown", msg);
    }
  }

  throw new NdkBootError("no-signer", "No available Nostr signer");
}

async function pingRelay(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const ws = new WebSocket(url);
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        try {
          ws.close();
        } catch {}
        resolve(false);
      }
    }, 4000);
    ws.onopen = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        ws.close();
        resolve(true);
      }
    };
    ws.onerror = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(false);
      }
    };
  });
}

async function filterHealthyRelays(relays: string[]): Promise<string[]> {
  const results = await Promise.all(
    relays.map(async (u) => ((await pingRelay(u)) ? u : null)),
  );
  return results.filter((u): u is string => !!u);
}

export async function safeConnect(ndk: NDK): Promise<Error | null> {
  try {
    await ndk.connect({ timeoutMs: 10_000 });
    return null;
  } catch (e: any) {
    console.warn(
      "[NDK] connect failed, continuing in offline mode:",
      e?.message,
    );
    return e as Error;
  }
}

async function createReadOnlyNdk(): Promise<NDK> {
  const settings = useSettingsStore();
  if (!Array.isArray(settings.defaultNostrRelays?.value)) {
    settings.defaultNostrRelays.value = DEFAULT_RELAYS;
  }
  const userRelays = Array.isArray(settings.defaultNostrRelays?.value)
    ? settings.defaultNostrRelays.value
    : [];
  const relays = userRelays.length ? userRelays : DEFAULT_RELAYS;
  const healthy = await filterHealthyRelays(relays);
  const relayUrls = healthy.length ? healthy : [relays[0]];
  const ndk = new NDK({ explicitRelayUrls: relayUrls });
  mergeDefaultRelays(ndk);
  await safeConnect(ndk);
  await new Promise((r) => setTimeout(r, 3000));
  if (![...ndk.pool.relays.values()].some((r: any) => r.connected)) {
    mergeDefaultRelays(ndk);
    await ndk.connect({ timeoutMs: 8000 });
  }
  return ndk;
}

export async function createSignedNdk(signer: NDKSigner): Promise<NDK> {
  const settings = useSettingsStore();
  const relays = settings.defaultNostrRelays.value.length
    ? settings.defaultNostrRelays.value
    : DEFAULT_RELAYS;
  const ndk = new NDK({ explicitRelayUrls: relays });
  mergeDefaultRelays(ndk);
  ndk.signer = signer;
  await ndk.connect();
  await new Promise((r) => setTimeout(r, 3000));
  if (![...ndk.pool.relays.values()].some((r: any) => r.connected)) {
    mergeDefaultRelays(ndk);
    await ndk.connect({ timeoutMs: 8000 });
  }
  return ndk;
}

export async function createNdk(): Promise<NDK> {
  let signer: NDKSigner | undefined;
  try {
    signer = await resolveSigner();
  } catch (e: any) {
    if (e.reason === "no-signer" || e.reason === "nip07-locked") {
      console.info("Creating read-only NDK (no signer)");
      return createReadOnlyNdk();
    } else {
      throw e;
    }
  }

  const settings = useSettingsStore();
  if (!Array.isArray(settings.defaultNostrRelays?.value)) {
    settings.defaultNostrRelays.value = DEFAULT_RELAYS;
  }
  const userRelays = Array.isArray(settings.defaultNostrRelays?.value)
    ? settings.defaultNostrRelays.value
    : [];
  const relays = userRelays.length ? userRelays : DEFAULT_RELAYS;
  const healthy = await filterHealthyRelays(relays);
  const relayUrls = healthy.length ? healthy : [relays[0]];
  const ndk = new NDK({ signer, explicitRelayUrls: relayUrls });
  mergeDefaultRelays(ndk);
  await safeConnect(ndk);
  await new Promise((r) => setTimeout(r, 3000));
  if (![...ndk.pool.relays.values()].some((r: any) => r.connected)) {
    mergeDefaultRelays(ndk);
    await ndk.connect({ timeoutMs: 8000 });
  }
  return ndk;
}

export async function getNdk(): Promise<NDK> {
  if (ndkInstance) return ndkInstance;
  if (!ndkPromise) {
    ndkPromise = createNdk().then((ndk) => {
      ndkInstance = ndk;
      return ndk;
    });
  }
  const ndk = await ndkPromise;
  if (!ndk) {
    throw new NdkBootError("unknown", "NDK failed to initialize");
  }
  return ndk;
}

export default boot(async ({ app }) => {
  ndkPromise = getNdk();
  app.provide("$ndkPromise", ndkPromise);
  ndkPromise.catch((e) => useBootErrorStore().set(e as NdkBootError));
});
