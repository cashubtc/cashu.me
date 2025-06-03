import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CreatorProfileCard from '../../../src/components/CreatorProfileCard.vue'

const nostrMock = {
  getProfile: vi.fn().mockResolvedValue({ name: 'Test' }),
  fetchFollowerCount: vi.fn().mockResolvedValue(5),
  fetchFollowingCount: vi.fn().mockResolvedValue(3),
  fetchJoinDate: vi.fn().mockResolvedValue(0)
}

vi.mock('../../../src/stores/nostr', () => ({
  useNostrStore: () => nostrMock
}))

let originalObserver: any

beforeEach(() => {
  originalObserver = global.IntersectionObserver
  global.IntersectionObserver = class {
    callback: any
    constructor(cb: any) { this.callback = cb }
    observe() { this.callback([{ isIntersecting: true }]) }
    disconnect() {}
    unobserve() {}
  } as any
})

afterEach(() => {
  global.IntersectionObserver = originalObserver
})

describe('CreatorProfileCard', () => {
  it('renders follower and following numbers once data is loaded', async () => {
    const wrapper = mount(CreatorProfileCard, {
      props: { creator: { pubkey: 'pk', profile: null, followers: 0, following: 0, joined: null } },
      global: { mocks: { $t: (v: string) => v } }
    })

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Followers: 5')
    expect(wrapper.text()).toContain('Following: 3')
  })
})
