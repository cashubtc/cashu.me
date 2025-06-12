import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MissingSignerModal from '../../../src/components/MissingSignerModal.vue'
import { useSignerStore } from '../../../src/stores/signer'

vi.mock('../../../src/js/notify', () => ({
  notifyError: vi.fn(),
}))
vi.mock('quasar', () => ({ Dialog: { create: vi.fn(() => ({ onOk: vi.fn(), onCancel: vi.fn(), onDismiss: vi.fn() })) }, Notify: { create: vi.fn() } }));

vi.mock('nostr-tools', () => ({
  nip19: { decode: vi.fn() },
}))

const { nip19 } = require('nostr-tools')
const { notifyError } = require('../../../src/js/notify')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('MissingSignerModal', () => {
  it('chooses local signer', () => {
    ;(nip19.decode as any).mockReturnValue({ type: 'nsec', data: 'd' })
    const wrapper = mount(MissingSignerModal)
    const vm: any = wrapper.vm
    vm.nsec = 'nsec123'
    vm.chooseLocal()
    const store = useSignerStore()
    expect(store.method).toBe('local')
    expect(store.nsec).toBe('nsec123')
    expect(notifyError).not.toHaveBeenCalled()
  })

  it('chooses NIP-07 signer', () => {
    const wrapper = mount(MissingSignerModal)
    const vm: any = wrapper.vm
    vm.chooseNip07()
    const store = useSignerStore()
    expect(store.method).toBe('nip07')
  })

  it('chooses NIP-46 signer', () => {
    const wrapper = mount(MissingSignerModal)
    const vm: any = wrapper.vm
    vm.chooseNip46()
    const store = useSignerStore()
    expect(store.method).toBe('nip46')
  })
})
