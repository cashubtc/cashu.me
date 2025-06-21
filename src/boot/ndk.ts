import { boot } from "quasar/wrappers";
import NDK, {
  NDKNip07Signer,
  NDKPrivateKeySigner,
  NDKSigner,
} from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";
import { bytesToHex } from "@noble/hashes/utils";

export class NdkBootError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NdkBootError";
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
    const signer = new NDKNip07Signer();
    await signer.blockUntilReady();
    return signer;
  }

  const nsec = localStorage.getItem("nsec");
  if (nsec) {
    const data = nip19.decode(nsec).data as Uint8Array;
    const hex = bytesToHex(data);
    return new NDKPrivateKeySigner(hex);
  }

  throw new NdkBootError("No available Nostr signer");
}

async function createNdk(): Promise<NDK> {
  const signer = await resolveSigner();
  const ndk = new NDK({ explicitRelayUrls: DEFAULT_RELAYS, signer });
  await ndk.connect({ timeoutMs: 10000 });
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
