import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { defineComponent, h } from 'vue';
import SubscribersToolbar from 'src/components/subscribers/SubscribersToolbar.vue';
import { useSubscribersStore } from 'src/stores/subscribersStore';

const QInputStub = defineComponent({
  props: ['modelValue', 'debounce'],
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    let timer: any;
    const onInput = (e: any) => {
      const val = e.target.value;
      const delay = Number(props.debounce) || 0;
      clearTimeout(timer);
      if (delay > 0) {
        timer = setTimeout(() => emit('update:modelValue', val), delay);
      } else {
        emit('update:modelValue', val);
      }
    };
    return () => h('input', { value: props.modelValue, onInput });
  },
});

const QChipStub = defineComponent({
  emits: ['remove'],
  setup(_props, { emit, slots }) {
    return () =>
      h(
        'div',
        { class: 'filter-chip', onClick: () => emit('remove') },
        slots.default ? slots.default() : [],
      );
  },
});

function mountToolbar(overrides: Record<string, any> = {}) {
  const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
  return mount(SubscribersToolbar, {
    props: {
      total: 0,
      dateRange: '7d',
      search: '',
      filters: [],
      ...overrides,
    },
    global: {
      plugins: [pinia],
      stubs: {
        'q-toolbar': { template: '<div><slot /></div>' },
        'q-space': { template: '<span />' },
        'q-btn': { template: '<button><slot /></button>' },
        'q-btn-dropdown': { template: '<div><slot /><slot name="label" /></div>' },
        'q-list': { template: '<div><slot /></div>' },
        'q-item': { template: '<div><slot /></div>' },
        'q-item-section': { template: '<div><slot /></div>' },
        'q-item-label': { template: '<div><slot /></div>' },
        'q-separator': { template: '<hr />' },
        DisplayMenu: { template: '<div />' },
        'q-input': QInputStub,
        'q-chip': QChipStub,
      },
    },
  });
}

describe('SubscribersToolbar', () => {
  it('debounces search updates', async () => {
    vi.useFakeTimers();
    const wrapper = mountToolbar();
    const input = wrapper.find('input');
    await input.setValue('hello');
    expect(wrapper.emitted('update:search')).toBeFalsy();
    vi.advanceTimersByTime(249);
    expect(wrapper.emitted('update:search')).toBeFalsy();
    vi.advanceTimersByTime(1);
    expect(wrapper.emitted('update:search')).toEqual([['hello']]);
    vi.useRealTimers();
  });

  it('removes filter chips', async () => {
    const wrapper = mountToolbar({
      filters: [{ key: 'status-active', label: 'Active' }],
    });
    const store = useSubscribersStore(wrapper.vm.$pinia);
    store.status = new Set(['active']);
    const clearFilters = vi.spyOn(store, 'clearFilters');
    await wrapper.find('.filter-chip').trigger('click');
    expect(clearFilters).toHaveBeenCalled();
  });
});

