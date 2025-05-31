import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useP2PKStore } from '../../src/stores/p2pk'
import { useWalletStore } from '../../src/stores/wallet'
import { useProofsStore } from '../../src/stores/proofs'

beforeEach(() => {
  localStorage.clear()
})

describe('P2PK store', () => {
  it('returns pubkey for future locktime secret', () => {
    const p2pk = useP2PKStore()
    const locktime = Math.floor(Date.now() / 1000) + 1000
    const secret = JSON.stringify([
      'P2PK',
      { data: '02aa', tags: [['locktime', String(locktime)]] }
    ])
    const info = p2pk.getSecretP2PKPubkey(secret)
    expect(info.pubkey).toBe('02aa')
    expect(info.locktime).toBe(locktime)
  })

  it('returns refund key for expired locktime secret', () => {
    const p2pk = useP2PKStore()
    const locktime = Math.floor(Date.now() / 1000) - 1000
    const secret = JSON.stringify([
      'P2PK',
      { data: '02aa', tags: [['locktime', String(locktime)], ['refund', '02bb', '02cc']] }
    ])
    const info = p2pk.getSecretP2PKPubkey(secret)
    expect(info.pubkey).toBe('02bb')
    expect(info.locktime).toBe(locktime)
  })

  it('forwards options in sendToLock', async () => {
    const walletStore = useWalletStore()
    const proofsStore = useProofsStore()
    vi.spyOn(proofsStore, 'removeProofs').mockResolvedValue()
    vi.spyOn(proofsStore, 'addProofs').mockResolvedValue()

    walletStore.spendableProofs = vi.fn(() => [{ secret: 's', amount: 1, id: 'a', C: 'c' } as any])
    walletStore.coinSelect = vi.fn(() => [{ secret: 's', amount: 1, id: 'a', C: 'c' } as any])
    walletStore.getKeyset = vi.fn(() => 'kid')
    const wallet = {
      mint: { mintUrl: 'm' },
      unit: 'sat',
      send: vi.fn(async (_a: number, _p: any, opts: any) => ({ keep: [], send: [] }))
    } as any

    await walletStore.sendToLock([{ secret: 's', amount: 1, id: 'a', C: 'c' } as any], wallet, 1, 'pk', 'b', 123, 'r')
    expect(wallet.send).toHaveBeenCalledWith(1, [{ secret: 's', amount: 1, id: 'a', C: 'c' }], { keysetId: 'kid', pubkey: 'pk', locktime: 123, refund: 'r' })
  })
})
