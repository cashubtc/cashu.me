import { beforeEach, describe, expect, it, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import MoveProofs from '../../src/pages/MoveProofs.vue'

const moveProofsMock = vi.fn()

vi.mock('../../src/stores/proofs', () => ({
  useProofsStore: () => ({ proofs: [], moveProofs: moveProofsMock })
}))

vi.mock('../../src/stores/buckets', () => ({
  useBucketsStore: () => ({
    bucketList: [
      { id: 'b1', name: 'Bucket 1' },
      { id: 'b2', name: 'Bucket 2' },
    ],
  }),
}))

vi.mock('../../src/stores/mints', () => ({
  useMintsStore: () => ({ activeUnit: 'sat' })
}))

vi.mock('../../src/stores/ui', () => ({
  useUiStore: () => ({ formatCurrency: (a: number) => String(a) })
}))

vi.mock('../../src/js/notify', () => ({
  notifyError: vi.fn(),
}))

beforeEach(() => {
  moveProofsMock.mockReset()
})

describe('MoveProofs component', () => {
  it('toggles token selection', () => {
    const wrapper = shallowMount(MoveProofs)
    const vm: any = wrapper.vm

    vm.toggleProof('s1', true)
    expect(vm.selectedSecrets).toContain('s1')

    vm.toggleProof('s1', false)
    expect(vm.selectedSecrets).not.toContain('s1')
  })

  it('moves selected tokens', async () => {
    const wrapper = shallowMount(MoveProofs)
    const vm: any = wrapper.vm
    vm.selectedSecrets = ['a', 'b']
    vm.targetBucketId = 'b2'

    await vm.moveSelected()

    expect(moveProofsMock).toHaveBeenCalledWith(['a', 'b'], 'b2')
    expect(vm.selectedSecrets.length).toBe(0)
  })
})
