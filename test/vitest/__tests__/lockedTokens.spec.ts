import { beforeEach, describe, expect, it } from 'vitest'
import { useLockedTokensStore } from '../../../src/stores/lockedTokens'

beforeEach(() => {
  localStorage.clear()
})

describe('LockedTokens store', () => {
  it('adds and retrieves tokens', () => {
    const store = useLockedTokensStore()
    const t = store.addLockedToken({ amount: 1, token: 'tok', pubkey: 'pk', bucketId: 'b1' })
    expect(store.lockedTokens.length).toBe(1)
    expect(store.tokensByBucket('b1')[0].id).toBe(t.id)
  })

  it('deletes token', () => {
    const store = useLockedTokensStore()
    const t = store.addLockedToken({ amount: 1, token: 'tok', pubkey: 'pk', bucketId: 'b1' })
    store.deleteLockedToken(t.id)
    expect(store.lockedTokens.length).toBe(0)
  })
})
