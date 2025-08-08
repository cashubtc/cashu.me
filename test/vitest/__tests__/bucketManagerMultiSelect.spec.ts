import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { ref } from 'vue';
import BucketManager from '../../../src/components/BucketManager.vue';

const mockBuckets = [
  { id: 'b1', name: 'Alpha', isArchived: false },
  { id: 'b2', name: 'Beta', isArchived: false },
];

vi.mock('../../../src/stores/proofs', () => ({
  useProofsStore: () => ({ moveProofs: vi.fn() }),
}));

vi.mock('../../../src/stores/buckets', () => ({
  useBucketsStore: () => ({
    bucketList: mockBuckets,
    bucketBalances: {},
    addBucket: vi.fn(),
    editBucket: vi.fn(),
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

describe('BucketManager multi-select', () => {
  it('enables selection of multiple buckets', async () => {
    const wrapper = shallowMount(BucketManager);

    expect(wrapper.findAll('bucket-card-stub').length).toBe(2);
    expect((wrapper.vm as any).multiSelectMode).toBe(false);

    (wrapper.vm as any).toggleMultiSelect();
    await wrapper.vm.$nextTick();

    const cards = wrapper.findAll('bucket-card-stub');
    cards.forEach(card => {
      expect(card.attributes('multi-select-mode')).toBe('true');
    });

    (wrapper.vm as any).toggleBucketSelection('b1');
    expect((wrapper.vm as any).selectedBucketIds).toEqual(['b1']);
  });
});
