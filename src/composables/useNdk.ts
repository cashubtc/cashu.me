import NDK, { NDKSigner } from "@nostr-dev-kit/ndk";
import { createNdk,
  createSignedNdk,
  mergeDefaultRelays,
} from "boot/ndk";
import { DEFAULT_RELAYS } from "src/config/relays";
import { useNostrStore } from "stores/nostr";
import { useSettingsStore } from "stores/settings";

let cached: NDK | undefined;

/** Force-rebuild the cached NDK with a new relay set (and optional signer). */
export async function rebuildNdk(relays: string[], signer?: NDKSigner) {
  const { default: NDK } = await import("@nostr-dev-kit/ndk");
  cached = new NDK({ explicitRelayUrls: relays });
  mergeDefaultRelays(cached);
  if (signer) cached.signer = signer;
  await cached.connect({ timeoutMs: 10_000 });
  return cached;
}

export async function useNdk(
  opts: { requireSigner?: boolean } = {},
): Promise<NDK> {
  const { requireSigner = true } = opts;
  const nostr = useNostrStore();
  const settings = useSettingsStore();

  if (cached) {
    if (requireSigner && !cached.signer && nostr.signer) {
      cached = await createSignedNdk(nostr.signer);
    }
    return cached;
  }

  try {
    cached = await createNdk();
  } catch (e: any) {
    if (!requireSigner) {
      if (!Array.isArray(settings.defaultNostrRelays?.value)) {
        settings.defaultNostrRelays.value = DEFAULT_RELAYS;
      }
      const userRelays = Array.isArray(settings.defaultNostrRelays?.value)
        ? settings.defaultNostrRelays.value
        : [];
      const relays = userRelays.length ? userRelays : DEFAULT_RELAYS;
      cached = new NDK({ explicitRelayUrls: relays });
      await cached.connect();
    } else {
      throw e;
    }
  }

  if (requireSigner && !cached.signer && nostr.signer) {
    cached = await createSignedNdk(nostr.signer);
  }

  return cached;
}
