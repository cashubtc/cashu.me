import { boot } from "quasar/wrappers";
import { useBootErrorStore } from 'stores/bootError'
import NDK, {
  NDKNip07Signer,
  NDKPrivateKeySigner,
  NDKSigner,
} from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";

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

const DEFAULT_RELAYS = [
  "wss://relay.f7z.io/",
  "wss://relay.primal.net/",
  "wss://relay.nostr.band/",
];

let ndkInstance: NDK | undefined;
let ndkPromise: Promise<NDK> | undefined;

async function resolveSigner(): Promise<NDKSigner> {
  // 1 ─ local nsec (strip legacy JSON quotes if present)
  const raw = window.localStorage.getItem('nsec') ?? ''
  const clean = raw.replace(/^"+|"+$/g, '').trim()        // "nsec…"
  // TODO: sanitize quoted legacy values once
  if (clean.startsWith('nsec')) {
    try {
      const { data } = nip19.decode(clean)
      if (typeof data !== 'string') throw new Error('invalid nsec')
      return new NDKPrivateKeySigner(data)
    } catch {
      // fall through to nip07 below
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

  throw new NdkBootError('no-signer', 'No available Nostr signer')
}

async function createNdk(): Promise<NDK> {
  const signer = await resolveSigner();
  const ndk = new NDK({ explicitRelayUrls: DEFAULT_RELAYS, signer });
  try {
    await ndk.connect({ timeoutMs: 10000 });
  } catch (e) {
    throw new NdkBootError("connect-failed", (e as Error).message);
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
  return ndkPromise;
}

export default boot(async ({ app }) => {
  ndkPromise = getNdk();
  app.provide('$ndkPromise', ndkPromise);
  ndkPromise.catch((e) => useBootErrorStore().set(e as NdkBootError));
});
