import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import InfoTooltip from '../../src/components/InfoTooltip.vue'

describe('InfoTooltip', () => {
  it('shows tooltip on hover', async () => {
    const wrapper = mount(InfoTooltip, { props: { text: 'Hello' } })
    const icon = wrapper.find('.q-icon')
    const tooltip = wrapper.find('.q-tooltip')
    expect(tooltip.exists()).toBe(true)
    expect(tooltip.isVisible()).toBe(false)
    await icon.trigger('mouseenter')
    await wrapper.vm.$nextTick()
    expect(tooltip.isVisible()).toBe(true)
  })
})
