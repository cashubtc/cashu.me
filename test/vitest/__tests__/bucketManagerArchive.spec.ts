import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { reactive, ref } from 'vue';
import BucketManager from '../../../src/components/BucketManager.vue';
import BucketCard from '../../../src/components/BucketCard.vue';

const bucketsData = reactive([
  { id: 'b1', name: 'Bucket', isArchived: false },
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
  DEFAULT_BUCKET_ID: 'b1',
  COLOR_PALETTE: ['#fff'],
  hashColor: () => '#fff',
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

describe('BucketManager archive action', () => {
  it('archives bucket through menu action', async () => {
    const wrapper = mount(BucketManager, {
      global: { stubs: { 'q-menu': qMenuStub, BucketsToolbar: { template: '<div></div>' } } },
    });
    await wrapper.vm.$nextTick();

    (wrapper.vm as any).handleMenuAction({ action: 'archive', bucket: bucketsData[0] });

    expect(editBucketMock).toHaveBeenCalledWith('b1', { isArchived: true });
    expect(bucketsData[0].isArchived).toBe(true);
  });

  it('filters archived buckets when viewMode is set', async () => {
    const wrapper = mount(BucketManager, {
      global: { stubs: { 'q-menu': qMenuStub, BucketsToolbar: { template: '<div></div>' } } },
    });
    await wrapper.vm.$nextTick();

    (wrapper.vm as any).viewMode = 'archived';
    await wrapper.vm.$nextTick();

    const cards = wrapper.findAllComponents(BucketCard);
    expect(cards.length).toBeGreaterThan(0);
    cards.forEach(c => {
      const bucket = c.props('bucket') as any;
      expect(bucket.isArchived).toBe(true);
    });
  });
});
