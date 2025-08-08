import { boot } from "quasar/wrappers";
import { useBootErrorStore } from "stores/bootError";
import NDK, { NDKSigner } from "@nostr-dev-kit/ndk";
import { useNostrStore } from "stores/nostr";
import { NDKEvent, type NDKFilter } from "@nostr-dev-kit/ndk";
import { useSettingsStore } from "src/stores/settings";
import { DEFAULT_RELAYS, FREE_RELAYS } from "src/config/relays";
import { filterHealthyRelays } from "src/utils/relayHealth";

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

export async function safeConnect(ndk: NDK): Promise<Error | null> {
  try {
    await ndk.connect(10_000);
    return null;
  } catch (e: any) {
    console.warn(
      "[NDK] connect failed, continuing in offline mode:",
      e?.message
    );
    return e as Error;
  }
}

async function createReadOnlyNdk(): Promise<NDK> {
  const settings = useSettingsStore();
  if (!Array.isArray(settings.defaultNostrRelays)) {
    settings.defaultNostrRelays = DEFAULT_RELAYS;
  }
  const userRelays = Array.isArray(settings.defaultNostrRelays)
    ? settings.defaultNostrRelays
    : [];
  const relays = userRelays.length ? userRelays : DEFAULT_RELAYS;
  const healthy = await filterHealthyRelays(relays);
  const relayUrls = healthy.length ? healthy : FREE_RELAYS;
  const ndk = new NDK({ explicitRelayUrls: relayUrls });
  mergeDefaultRelays(ndk);
  await safeConnect(ndk);
  await new Promise((r) => setTimeout(r, 3000));
  if (![...ndk.pool.relays.values()].some((r: any) => r.connected)) {
    mergeDefaultRelays(ndk);
    await ndk.connect(8000);
  }
  return ndk;
}

export async function createSignedNdk(signer: NDKSigner): Promise<NDK> {
  const settings = useSettingsStore();
  const relays = settings.defaultNostrRelays.length
    ? settings.defaultNostrRelays
    : DEFAULT_RELAYS;
  const ndk = new NDK({ explicitRelayUrls: relays });
  mergeDefaultRelays(ndk);
  ndk.signer = signer;
  await ndk.connect();
  await new Promise((r) => setTimeout(r, 3000));
  if (![...ndk.pool.relays.values()].some((r: any) => r.connected)) {
    mergeDefaultRelays(ndk);
    await ndk.connect(8000);
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
  if (!Array.isArray(settings.defaultNostrRelays)) {
    settings.defaultNostrRelays = DEFAULT_RELAYS;
  }
  const userRelays = Array.isArray(settings.defaultNostrRelays)
    ? settings.defaultNostrRelays
    : [];
  const relays = userRelays.length ? userRelays : DEFAULT_RELAYS;
  const healthy = await filterHealthyRelays(relays);
  const relayUrls = healthy.length ? healthy : FREE_RELAYS;
  const ndk = new NDK({ signer: signer as any, explicitRelayUrls: relayUrls });
  mergeDefaultRelays(ndk);
  await safeConnect(ndk);
  await new Promise((r) => setTimeout(r, 3000));
  if (![...ndk.pool.relays.values()].some((r: any) => r.connected)) {
    mergeDefaultRelays(ndk);
    await ndk.connect(8000);
  }
  return ndk;
}

export async function rebuildNdk(
  relays: string[],
  signer?: NDKSigner
): Promise<NDK> {
  const ndk = new NDK({ explicitRelayUrls: relays });
  mergeDefaultRelays(ndk);
  if (signer) ndk.signer = signer;
  await ndk.connect(10_000);
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
  relays: string[] = []
): Promise<boolean> {
  const nostr = useNostrStore();
  await nostr.initSignerIfNotSet();
  const ndk = await getNdk();
  if (!ndk.signer) {
    throw new NdkBootError(
      "no-signer",
      "Nostr identity required to send a direct message"
    );
  }
  const list = relays.length ? relays : ["wss://relay.damus.io"];
  const { success } = await nostr.sendNip04DirectMessage(
    toNpub,
    plaintext,
    undefined,
    undefined,
    list
  );
  return success;
}

export default boot(async ({ app }) => {
  ndkPromise = getNdk();
  app.provide("$ndkPromise", ndkPromise);
  ndkPromise.catch((e) => useBootErrorStore().set(e as NdkBootError));
});
