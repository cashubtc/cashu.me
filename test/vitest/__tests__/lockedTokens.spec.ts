import { beforeEach, describe, expect, it } from 'vitest'
import { useDexieLockedTokensStore } from '../../../src/stores/lockedTokensDexie'
import { cashuDb } from '../../../src/stores/dexie'

beforeEach(async () => {
  localStorage.clear()
  await cashuDb.delete()
  await cashuDb.open()
})

describe('LockedTokens store', () => {
  it('adds and retrieves tokens', async () => {
    const store = useDexieLockedTokensStore()
    const t = await store.addLockedToken({
      tokenString: 'tok',
      amount: 1,
      owner: 'creator',
      creatorNpub: 'pk',
      tierId: 'b1',
      intervalKey: '',
      unlockTs: 0,
      refundUnlockTs: 0,
      status: 'unlockable',
      subscriptionEventId: null,
    })
    await Promise.resolve()
    expect(store.lockedTokens.length).toBe(1)
    expect(store.lockedTokens[0].id).toBe(t.id)
  })

  it('deletes token', async () => {
    const store = useDexieLockedTokensStore()
    const t = await store.addLockedToken({
      tokenString: 'tok',
      amount: 1,
      owner: 'creator',
      creatorNpub: 'pk',
      tierId: 'b1',
      intervalKey: '',
      unlockTs: 0,
      refundUnlockTs: 0,
      status: 'unlockable',
      subscriptionEventId: null,
    })
    await store.deleteLockedToken(t.id)
    await Promise.resolve()
    expect(store.lockedTokens.length).toBe(0)
  })

  it('returns valid tokens for tier', async () => {
    const store = useDexieLockedTokensStore()
    const past = Math.floor(Date.now() / 1000) - 10
    const future = Math.floor(Date.now() / 1000) + 100
    const t1 = await store.addLockedToken({
      tokenString: 'a',
      amount: 1,
      owner: 'creator',
      creatorNpub: 'pk',
      tierId: 'b',
      intervalKey: '',
      unlockTs: past,
      refundUnlockTs: 0,
      status: 'unlockable',
      subscriptionEventId: null,
    })
    await store.addLockedToken({
      tokenString: 'b',
      amount: 1,
      owner: 'creator',
      creatorNpub: 'pk',
      tierId: 'b',
      intervalKey: '',
      unlockTs: future,
      refundUnlockTs: 0,
      status: 'pending',
      subscriptionEventId: null,
    })
    await store.addLockedToken({
      tokenString: 'c',
      amount: 1,
      owner: 'creator',
      creatorNpub: 'other',
      tierId: 'b',
      intervalKey: '',
      unlockTs: 0,
      refundUnlockTs: 0,
      status: 'unlockable',
      subscriptionEventId: null,
    })
    await Promise.resolve()
    const now = Math.floor(Date.now() / 1000)
    const tokens = store.lockedTokens.filter(
      (t) =>
        t.tierId === 'b' && t.creatorNpub === 'pk' && (!t.unlockTs || t.unlockTs <= now)
    )
    expect(tokens.length).toBe(1)
    expect(tokens[0].id).toBe(t1.id)
  })
})
