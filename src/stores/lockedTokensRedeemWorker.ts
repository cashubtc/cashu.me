import { defineStore } from 'pinia'
import { cashuDb } from './dexie'
import { useWalletStore } from './wallet'
import { useReceiveTokensStore } from './receiveTokensStore'
import { useSettingsStore } from './settings'
import token from 'src/js/token'
import { ensureCompressed } from 'src/utils/ecash'

export const useLockedTokensRedeemWorker = defineStore('lockedTokensRedeemWorker', {
  state: () => ({
    checkInterval: 5000,
    worker: null as NodeJS.Timeout | null,
  }),
  actions: {
    startLockedTokensRedeemWorker() {
      if (this.worker) return
      window.addEventListener('message', this.handleMessage)
      this.worker = setInterval(() => this.processTokens(), this.checkInterval)
      // run immediately
      this.processTokens()
    },
    stopLockedTokensRedeemWorker() {
      if (this.worker) {
        clearInterval(this.worker)
        this.worker = null
      }
      window.removeEventListener('message', this.handleMessage)
    },
    handleMessage(event: MessageEvent) {
      if (event.data?.type === 'retry-locked-token') {
        this.processTokens()
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
          const decoded = token.decode(entry.tokenString)
          // normalise secret before redeem
          decoded.proofs.forEach(p => {
            if (typeof p.secret === 'string' && p.secret.startsWith('["P2PK"')) {
              const s = JSON.parse(p.secret)
              if (s[1]?.data) s[1].data = ensureCompressed(s[1].data)
              p.secret = JSON.stringify(s)
            }
          })
          receiveStore.receiveData.tokensBase64 = entry.tokenString
          receiveStore.receiveData.bucketId = entry.tierId
          try {
            await wallet.redeem(entry.tierId)
            await cashuDb.lockedTokens.delete(entry.id)
          } catch (err: any) {
            if (
              typeof err?.message === 'string' &&
              err.message.includes('No private key or remote signer')
            ) {
              postMessage({
                type: 'locked-token-missing-signer',
                tokenId: entry.id,
              })
            } else {
              throw err
            }
          }
        } catch (e) {
          console.error('Failed to auto-redeem locked token', e)
        }
      }
    },
  },
})
