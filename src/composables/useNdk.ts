import NDK from '@nostr-dev-kit/ndk'
import { DEFAULT_RELAYS, createNdk, createSignedNdk } from 'boot/ndk'
import { useNostrStore } from 'stores/nostr'

let cached: NDK | undefined

export async function useNdk (opts: { requireSigner?: boolean } = {}): Promise<NDK> {
  const { requireSigner = true } = opts
  const nostr = useNostrStore()

  if (cached) {
    if (requireSigner && !cached.signer && nostr.signer) {
      cached = await createSignedNdk(nostr.signer)
    }
    return cached
  }

  try {
    cached = await createNdk()
  } catch (e: any) {
    if (!requireSigner) {
      cached = new NDK({ explicitRelayUrls: DEFAULT_RELAYS })
      await cached.connect()
    } else {
      throw e
    }
  }

  if (requireSigner && !cached.signer && nostr.signer) {
    cached = await createSignedNdk(nostr.signer)
  }

  return cached
}
