import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { useWalletStore } from './wallet'
import { useMintsStore } from './mints'
import { useProofsStore } from './proofs'
import { useLockedTokensStore } from './lockedTokens'
import { DEFAULT_BUCKET_ID } from './buckets'

export type DonationPreset = {
  months: number
}

const DEFAULT_PRESETS: DonationPreset[] = [
  { months: 3 },
  { months: 6 },
  { months: 12 }
]

export const useDonationPresetsStore = defineStore('donationPresets', {
  state: () => ({
    presets: useLocalStorage<DonationPreset[]>(
      'cashu.donationPresets',
      DEFAULT_PRESETS
    )
  }),
  actions: {
    async createDonationPreset(
      months: number,
      amount: number,
      pubkey: string,
      bucketId: string = DEFAULT_BUCKET_ID
    ) {
      const walletStore = useWalletStore()
      const proofsStore = useProofsStore()
      const mintsStore = useMintsStore()
      const lockedStore = useLockedTokensStore()

      const wallet = walletStore.wallet
      const proofs = mintsStore.activeProofs.filter(p => p.bucketId === bucketId)

      for (let i = 0; i < months; i++) {
        const locktime =
          Math.floor(Date.now() / 1000) + (i + 1) * 30 * 24 * 60 * 60
        const { sendProofs } = await walletStore.sendToLock(
          proofs,
          wallet,
          amount,
          pubkey,
          bucketId,
          locktime
        )
        const token = proofsStore.serializeProofs(sendProofs)
        lockedStore.addLockedToken({
          amount,
          token,
          pubkey,
          locktime,
          bucketId
        })
      }
    }
  }
})

export const DEFAULT_DONATION_PRESETS = DEFAULT_PRESETS
