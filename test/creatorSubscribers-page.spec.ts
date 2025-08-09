import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

vi.mock('@vueuse/core', () => ({ useDebounceFn: (fn: any) => fn }));
vi.mock('quasar', () => ({ copyToClipboard: vi.fn() }));
vi.mock('src/utils/subscriberCsv', () => ({ default: vi.fn() }));

import downloadCsv from 'src/utils/subscriberCsv';
import CreatorSubscribersPage from '../src/pages/CreatorSubscribersPage.vue';
import { useCreatorSubscribersStore } from '../src/stores/creatorSubscribers';

const stubs = {
  'q-page': { template: '<div><slot /></div>' },
  'q-input': {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
  'q-btn': {
    props: ['label'],
    template: '<button :data-label="label" @click="$emit(\'click\')"><slot /></button>',
  },
  'q-menu': { template: '<div><slot /></div>' },
  'q-chip': { template: '<div class="q-chip" @click="$emit(\'click\')"><slot /></div>' },
  'q-select': {
    props: ['modelValue', 'options'],
    emits: ['update:model-value'],
    template:
      '<select @change="$emit(\'update:model-value\', $event.target.value)"><option v-for="o in options" :value="o.value">{{o.label}}</option></select>',
  },
  'q-tabs': { template: '<div class="q-tabs"><slot /></div>' },
  'q-tab': { props: ['name'], template: '<div class="q-tab" :data-name="name"><slot /></div>' },
  'q-badge': { template: '<span class="q-badge"><slot /></span>' },
  'q-table': {
    props: ['rows'],
    template:
      '<div class="q-table"><div v-for="r in rows" :key="r.id" class="tbody-row">{{ r.name }}</div></div>',
  },
  'q-avatar': { template: '<span class="q-avatar"><slot /></span>' },
  'q-td': { template: '<td><slot /></td>' },
  'q-drawer': {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<div class="drawer" v-show="modelValue"><slot /></div>',
  },
  'q-space': { template: '<span class="q-space"></span>' },
};

function mountPage() {
  return mount(CreatorSubscribersPage, {
    global: {
      plugins: [createTestingPinia({ createSpy: vi.fn })],
      stubs,
    },
  });
}

describe('CreatorSubscribersPage', () => {
  it('shows correct tab counts', () => {
    const wrapper = mountPage();
    const badges = wrapper.findAll('.q-badge');
    expect(badges.map((b) => b.text())).toEqual(['6', '2', '2', '2', '2', '1']);
  });

  it('filters by search, status and tier', async () => {
    const wrapper = mountPage();
    const rows = () => wrapper.findAll('.tbody-row').map((r) => r.text());

    wrapper.vm.search = 'bob';
    await wrapper.vm.$nextTick();
    expect(rows()).toEqual(['Bob']);

    wrapper.vm.search = '';
    await wrapper.vm.$nextTick();

    wrapper.vm.toggleStatus('pending');
    await wrapper.vm.$nextTick();
    expect(rows()).toEqual(['Bob', 'Frank']);

    wrapper.vm.toggleTier('t3');
    await wrapper.vm.$nextTick();
    expect(rows()).toEqual(['Frank']);
  });

  it('sorts subscribers', async () => {
    const wrapper = mountPage();
    const rows = () => wrapper.findAll('.tbody-row').map((r) => r.text());

    wrapper.vm.sort = 'first';
    await wrapper.vm.$nextTick();
    expect(rows()[0]).toBe('Dave');

    wrapper.vm.sort = 'amount';
    await wrapper.vm.$nextTick();
    expect(rows()[0]).toBe('Eve');
  });

  it('computes progress and dueSoon correctly', () => {
    vi.useFakeTimers();
    const wrapper = mountPage();
    const store = useCreatorSubscribersStore();
    const alice = store.subscribers[0];
    const start = alice.nextRenewal! * 1000 - 7 * 86400000;

    vi.setSystemTime(start + 3.5 * 86400000);
    expect(wrapper.vm.progressPercent(alice)).toBe(50);

    vi.setSystemTime(alice.nextRenewal! * 1000 - 2 * 86400000);
    expect(wrapper.vm.dueSoon(alice)).toBe(true);

    vi.setSystemTime(alice.nextRenewal! * 1000 - 5 * 86400000);
    expect(wrapper.vm.dueSoon(alice)).toBe(false);
    vi.useRealTimers();
  });

  it('exports all or selected rows to CSV', async () => {
    const wrapper = mountPage();
    const store = useCreatorSubscribersStore();
    (downloadCsv as unknown as vi.Mock).mockClear();

    await wrapper.find('button[data-label="Export CSV"]').trigger('click');
    expect(downloadCsv).toHaveBeenCalledWith();

    (downloadCsv as unknown as vi.Mock).mockClear();
    wrapper.vm.selected = [store.subscribers[0]];
    await wrapper.vm.$nextTick();
    await wrapper.find('button[data-label="Export selection"]').trigger('click');
    expect(downloadCsv).toHaveBeenCalledWith([store.subscribers[0]]);
  });
});

