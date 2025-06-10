import { defineStore } from 'pinia'
import { cashuDb } from './dexie'
import { useWalletStore } from './wallet'
import { useReceiveTokensStore } from './receiveTokensStore'
import { useSettingsStore } from './settings'

export const useLockedTokensRedeemWorker = defineStore('lockedTokensRedeemWorker', {
  state: () => ({
    checkInterval: 5000,
    worker: null as NodeJS.Timeout | null,
  }),
  actions: {
    startLockedTokensRedeemWorker() {
      if (this.worker) return
      this.worker = setInterval(() => this.processTokens(), this.checkInterval)
      // run immediately
      this.processTokens()
    },
    stopLockedTokensRedeemWorker() {
      if (this.worker) {
        clearInterval(this.worker)
        this.worker = null
      }
    },
    async processTokens() {
      const settingsStore = useSettingsStore()
      if (!settingsStore.autoRedeemLockedTokens) return
      const now = Math.floor(Date.now() / 1000)
      const entries = await cashuDb.lockedTokens
        .where('unlockTs')
        .belowOrEqual(now)
        .toArray()
      if (!entries.length) return
      const wallet = useWalletStore()
      const receiveStore = useReceiveTokensStore()
      for (const entry of entries) {
        try {
          receiveStore.receiveData.tokensBase64 = entry.tokenString
          receiveStore.receiveData.bucketId = entry.tierId
          await wallet.redeem(entry.tierId)
          await cashuDb.lockedTokens.delete(entry.id)
        } catch (e) {
          console.error('Failed to auto-redeem locked token', e)
        }
      }
    },
  },
})
