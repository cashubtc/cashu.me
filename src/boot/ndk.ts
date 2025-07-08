import { boot } from "quasar/wrappers";
import { useBootErrorStore } from "stores/bootError";
import NDK, { NDKSigner } from "@nostr-dev-kit/ndk";
import { useNostrStore } from "stores/nostr";
import type { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import { useSettingsStore } from "src/stores/settings";
import { DEFAULT_RELAYS } from "src/config/relays";

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

// Default relay URLs are configured in src/config/relays.ts

export function mergeDefaultRelays(ndk: NDK) {
  for (const url of DEFAULT_RELAYS) {
    if (!ndk.pool.relays.has(url)) {
      ndk.addExplicitRelay(url);
    }
  }
}



let ndkInstance: NDK | undefined;
let ndkPromise: Promise<NDK> | undefined;

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
  const nostrStore = useNostrStore();
  await nostrStore.initSignerIfNotSet();
  const signer = nostrStore.signer;

  if (!signer) {
    console.info("Creating read-only NDK (no signer)");
    return createReadOnlyNdk();
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

export async function ndkSend(
  toNpub: string,
  plaintext: string,
  relays: string[] = [],
) {
  const ndk = await getNdk();
  const selfPub = useNostrStore().pubkey;
  const list = relays.length ? relays : ["wss://relay.damus.io"];
  const f: NDKFilter = { kinds: [4], authors: [selfPub], recipients: [toNpub] };
  const ev = new NDKEvent(ndk);
  ev.kind = 4;
  ev.content = plaintext;
  ev.tags = [
    ["p", toNpub],
    ["p", selfPub],
  ];
  await ev.sign(ndk.signer as NDKSigner);
  await ndk.pool.publish(list, ev);
}

export default boot(async ({ app }) => {
  ndkPromise = getNdk();
  app.provide("$ndkPromise", ndkPromise);
  ndkPromise.catch((e) => useBootErrorStore().set(e as NdkBootError));
});
