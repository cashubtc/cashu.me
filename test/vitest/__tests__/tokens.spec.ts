import { beforeEach, describe, expect, it } from 'vitest'
import { useTokensStore } from '../../../src/stores/tokens'
import { cashuDb } from '../../../src/stores/dexie'

beforeEach(async () => {
  localStorage.clear()
  await cashuDb.delete()
  await cashuDb.open()
})

describe('Tokens store', () => {
  it('edits token label', () => {
    const store = useTokensStore()
    store.addPaidToken({ amount: 1, token: 't1', mint: 'm1', unit: 'sat' })
    store.editHistoryToken('t1', { newLabel: 'new name' })
    expect(store.historyTokens[0].label).toBe('new name')
  })
})
