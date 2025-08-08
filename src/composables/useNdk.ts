import type NDK from "@nostr-dev-kit/ndk";
import type { NDKSigner } from "@nostr-dev-kit/ndk";
import {
  createNdk,
  createSignedNdk,
  rebuildNdk as bootRebuildNdk,
} from "boot/ndk";
import { useNostrStore } from "stores/nostr";

let cached: NDK | undefined;

/** Force-rebuild the cached NDK with a new relay set (and optional signer). */
export async function rebuildNdk(relays: string[], signer?: NDKSigner) {
  cached = await bootRebuildNdk(relays, signer);
  return cached;
}

export async function useNdk(
  opts: { requireSigner?: boolean } = {},
): Promise<NDK> {
  const { requireSigner = true } = opts;
  const nostr = useNostrStore();

  if (cached) {
    if (requireSigner && !cached.signer && nostr.signer) {
      cached = await createSignedNdk(nostr.signer as any);
    }
    return cached;
  }

  cached = await createNdk();

  if (requireSigner && !cached.signer && nostr.signer) {
    cached = await createSignedNdk(nostr.signer as any);
  }

  return cached;
}
