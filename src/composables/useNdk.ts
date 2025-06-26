import NDK from '@nostr-dev-kit/ndk'
import { DEFAULT_RELAYS, createNdk } from 'boot/ndk'

let cached: NDK | undefined

export async function useNdk (opts: { requireSigner?: boolean } = {}): Promise<NDK> {
  const { requireSigner = true } = opts
  if (cached) return cached

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

  return cached
}
