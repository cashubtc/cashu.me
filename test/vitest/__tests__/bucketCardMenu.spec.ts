import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import BucketCard from '../../../src/components/BucketCard.vue';

const bucket = { id: 'b1', name: 'Bucket', isArchived: false };

describe('BucketCard menu actions', () => {
  it('emits menu-action for each option', async () => {
    const wrapper = mount(BucketCard, {
      props: { bucket, balance: 0, activeUnit: 'sat' },
      global: {
        stubs: { 'q-menu': { template: '<div><slot /></div>' } }
      }
    });

    await wrapper.find('[data-test="bucket-menu-btn"]').trigger('click');
    await wrapper.find('[data-test="view"]').trigger('click');
    await wrapper.find('[data-test="edit"]').trigger('click');
    await wrapper.find('[data-test="archive"]').trigger('click');
    await wrapper.find('[data-test="delete"]').trigger('click');

    const events = wrapper.emitted('menu-action');
    expect(events).toHaveLength(4);
    expect(events?.[0][0].action).toBe('view');
    expect(events?.[1][0].action).toBe('edit');
    expect(events?.[2][0].action).toBe('archive');
    expect(events?.[3][0].action).toBe('delete');
  });
});
