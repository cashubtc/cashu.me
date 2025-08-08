import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { reactive, ref } from 'vue';
import BucketManager from '../../../src/components/BucketManager.vue';
import BucketCard from '../../../src/components/BucketCard.vue';

const bucketsData = reactive([
  { id: 'b1', name: 'Active', isArchived: false },
  { id: 'b2', name: 'Old', isArchived: true },
]);

const editBucketMock = vi.fn((id: string, updates: any) => {
  const idx = bucketsData.findIndex(b => b.id === id);
  if (idx !== -1) Object.assign(bucketsData[idx], updates);
});

vi.mock('../../../src/stores/proofs', () => ({
  useProofsStore: () => ({ moveProofs: vi.fn(), proofs: [] }),
}));

vi.mock('../../../src/stores/buckets', () => ({
  useBucketsStore: () => ({
    bucketList: bucketsData,
    bucketBalances: {},
    addBucket: vi.fn(),
    editBucket: editBucketMock,
    deleteBucket: vi.fn(),
  }),
  COLOR_PALETTE: ['#fff'],
  hashColor: () => '#fff',
}));

vi.mock('../../../src/constants/buckets', () => ({
  DEFAULT_BUCKET_ID: 'b1',
}));

vi.mock('../../../src/stores/mints', () => ({
  useMintsStore: () => ({ activeUnit: ref('sat') }),
}));

vi.mock('../../../src/stores/ui', () => ({
  useUiStore: () => ({ formatCurrency: (a: number) => String(a) }),
}));

vi.mock('../../../src/js/notify', () => ({
  notifyError: vi.fn(),
}));

const qMenuStub = { template: '<div><slot /></div>' };

describe('BucketManager archive view', () => {
  it('shows only archived buckets when Archived button clicked', async () => {
    const wrapper = mount(BucketManager, {
      global: { stubs: { 'q-menu': qMenuStub } },
    });

    await flushPromises();

    expect(wrapper.findAllComponents(BucketCard).length).toBe(1);

    const toolbar = wrapper.findComponent({ name: 'BucketsToolbar' });
    await toolbar.findAll('button')[1].trigger('click');
    await flushPromises();

    const cards = wrapper.findAllComponents(BucketCard);
    expect(cards.length).toBe(1);
    expect((cards[0].props('bucket') as any).id).toBe('b2');
  });
});
