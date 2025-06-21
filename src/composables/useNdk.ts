import { getCurrentInstance } from 'vue'
import type NDK from '@nostr-dev-kit/ndk'
import { NdkBootError } from 'boot/ndk'
import { useNdkBootStore } from 'src/stores/ndkBoot'

export function useNdk(): Promise<NDK> {
  const vm = getCurrentInstance()?.proxy as any
  const ndkPromise: Promise<NDK> | undefined = vm?.$ndkPromise
  const store = useNdkBootStore()
  if (!ndkPromise) {
    const err = new NdkBootError('unknown')
    store.setError(err)
    return Promise.reject(err)
  }
  return ndkPromise.catch((e) => {
    if (e instanceof NdkBootError) {
      store.setError(e)
    } else {
      store.setError(new NdkBootError('unknown', (e as any)?.message))
    }
    return Promise.reject(e)
  })
}
