import { boot } from "quasar/wrappers";
import NDK, {
  NDKNip07Signer,
  NDKPrivateKeySigner,
  NDKSigner,
  nip07,
} from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";
import { bytesToHex } from "@noble/hashes/utils";

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
  if (typeof window !== "undefined" && (window as any).nostr) {
    try {
      await nip07.user();
      await nip07.blockUntilReady();
      return nip07;
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

  const nsec = localStorage.getItem("nsec");
  if (nsec) {
    const data = nip19.decode(nsec).data as Uint8Array;
    const hex = bytesToHex(data);
    return new NDKPrivateKeySigner(hex);
  }

  throw new NdkBootError("no-signer", "No available Nostr signer");
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
  app.config.globalProperties.$ndkPromise = ndkPromise;
});
