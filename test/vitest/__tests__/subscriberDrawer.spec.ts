import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { defineComponent, h, ref } from 'vue';
import SubscriberDrawer from 'src/components/subscribers/SubscriberDrawer.vue';

vi.mock('src/utils/clipboard', () => ({ copyNpub: vi.fn() }));
vi.mock('@vueuse/core', () => ({ onKeyStroke: () => {}, useLocalStorage: (_k: any, v: any) => ref(v) }));
vi.mock('src/stores/mints', () => ({ useMintsStore: () => ({ activeUnit: { value: 'sat' } }) }));
vi.mock('src/stores/ui', () => ({ useUiStore: () => ({ formatCurrency: (a: number) => String(a) }) }));
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }));
vi.mock('stores/dexie', () => ({ cashuDb: {} }));

const DrawerStub = defineComponent({
  props: ['modelValue', 'width'],
  emits: ['update:modelValue'],
  setup(props, { slots }) {
    return () =>
      h(
        'div',
        { class: 'q-drawer', style: { width: props.width + 'px' } },
        slots.default ? slots.default() : [],
      );
  },
});

function mountDrawer() {
  const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
  return mount(SubscriberDrawer, {
    props: {
      modelValue: true,
      sub: { subscriberNpub: 'npub', intervalDays: 7 } as any,
    },
    global: {
      plugins: [pinia],
      stubs: {
        'q-drawer': DrawerStub,
        'q-toolbar': { template: '<div><slot /></div>' },
        'q-toolbar-title': { template: '<div><slot /></div>' },
        'q-btn': { template: '<button @click="$emit(\'click\')"></button>' },
        'q-tabs': { template: '<div><slot /></div>' },
        'q-tab': { props: ['name'], template: '<div><slot /></div>' },
        'q-separator': { template: '<hr />' },
        'q-tab-panels': { template: '<div><slot /></div>' },
        'q-tab-panel': { template: '<div><slot /></div>' },
        'q-list': { template: '<div><slot /></div>' },
        'q-item': { template: '<div><slot /></div>' },
        'q-item-section': { template: '<div><slot /></div>' },
        'q-skeleton': { template: '<div></div>' },
        'q-input': { template: '<input />' },
      },
    },
  });
}

describe('SubscriberDrawer', () => {
  it('sets drawer width', () => {
    const wrapper = mountDrawer();
    const el = wrapper.find('.q-drawer').element as HTMLElement;
    expect(el.style.width).toBe('448px');
  });

  it('has sticky header', () => {
    const wrapper = mountDrawer();
    const header = wrapper.find('.drawer-header').element as HTMLElement;
    expect(getComputedStyle(header).position).toBe('sticky');
  });

  it('closes on Escape', async () => {
    const wrapper = mountDrawer();
    const drawer = wrapper.find('.q-drawer');
    await drawer.trigger('keydown', { key: 'Escape' });
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });
});

