import { beforeEach, describe, expect, it } from 'vitest'
import { useBucketsStore, DEFAULT_BUCKET_ID, DEFAULT_BUCKET_NAME } from '../../../src/stores/buckets'
import { useProofsStore } from '../../../src/stores/proofs'
import { cashuDb } from '../../../src/stores/dexie'

beforeEach(async () => {
  localStorage.clear()
  await cashuDb.delete()
  await cashuDb.open()
})

describe('Buckets store', () => {
  it('creates bucket and keeps default', () => {
    const buckets = useBucketsStore()
    const initial = buckets.bucketList.length
    const defaultBucket = buckets.bucketList.find(b => b.id === DEFAULT_BUCKET_ID)
    expect(defaultBucket?.name).toBe(DEFAULT_BUCKET_NAME)

    const bucket = buckets.addBucket({ name: 'Test bucket' })
    expect(buckets.bucketList.length).toBe(initial + 1)
    expect(buckets.bucketList.find(b => b.id === bucket.id)?.name).toBe('Test bucket')
  })

  it('edits bucket and protects default', () => {
    const buckets = useBucketsStore()
    const bucket = buckets.addBucket({ name: 'Old' })
    buckets.editBucket(bucket.id, { name: 'New' })
    expect(buckets.bucketList.find(b => b.id === bucket.id)?.name).toBe('New')

    const original = buckets.bucketList.find(b => b.id === DEFAULT_BUCKET_ID)?.name
    buckets.editBucket(DEFAULT_BUCKET_ID, { name: 'changed' })
    expect(buckets.bucketList.find(b => b.id === DEFAULT_BUCKET_ID)?.name).toBe(original)
  })

  it('deletes bucket and reassigns proofs', async () => {
    const buckets = useBucketsStore()
    const proofs = useProofsStore()
    const bucket = buckets.addBucket({ name: 'Temp' })

    await proofs.addProofs([
      { id: 'a', amount: 1, C: 'c1', secret: 's1' },
      { id: 'a', amount: 2, C: 'c2', secret: 's2' },
    ], undefined, bucket.id)

    let stored = await cashuDb.proofs.toArray()
    expect(stored.every(p => p.bucketId === bucket.id)).toBe(true)

    await buckets.deleteBucket(bucket.id)
    expect(buckets.bucketList.find(b => b.id === bucket.id)).toBeUndefined()

    stored = await cashuDb.proofs.toArray()
    expect(stored.every(p => p.bucketId === DEFAULT_BUCKET_ID)).toBe(true)
  })

  it('prevents deleting default bucket', async () => {
    const buckets = useBucketsStore()
    const count = buckets.bucketList.length
    await buckets.deleteBucket(DEFAULT_BUCKET_ID)
    expect(buckets.bucketList.length).toBe(count)
  })
})
