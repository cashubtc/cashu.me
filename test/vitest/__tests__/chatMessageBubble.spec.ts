import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatMessageBubble from '../../../src/components/ChatMessageBubble.vue'
import TokenBubble from '../../../src/components/TokenBubble.vue'

const message = {
  id: '1',
  pubkey: 'pk',
  content: 'hello cashuA123abc there',
  created_at: 0,
  outgoing: false
}

describe('ChatMessageBubble', () => {
  it('renders TokenBubble when message contains token', () => {
    const wrapper = mount(ChatMessageBubble, { props: { message } })
    expect(wrapper.findComponent(TokenBubble).exists()).toBe(true)
  })
})

