import { getCurrentInstance } from 'vue'
import type NDK from '@nostr-dev-kit/ndk'
import { NdkBootError } from 'boot/ndk'

export function useNdk(): Promise<NDK> {
  const vm = getCurrentInstance()?.proxy as any
  const ndkPromise: Promise<NDK> | undefined = vm?.$ndkPromise
  if (!ndkPromise) {
    return Promise.reject(new NdkBootError('unknown'))
  }
  return ndkPromise
}
