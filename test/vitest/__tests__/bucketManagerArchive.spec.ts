import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { reactive, ref } from 'vue';
import BucketManager from '../../../src/components/BucketManager.vue';
import BucketCard from '../../../src/components/BucketCard.vue';

const bucketsData = reactive([
  { id: 'b1', name: 'Bucket', isArchived: false },
  { id: 'b2', name: 'Old Bucket', isArchived: true }
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

beforeEach(() => {
  bucketsData[0].isArchived = false;
  bucketsData[1].isArchived = true;
});

describe('BucketManager archive action', () => {
  it('opens menu and archives bucket', async () => {
    const wrapper = mount(BucketManager, {
      global: { stubs: { 'q-menu': qMenuStub } },
    });

    const card = wrapper.findComponent(BucketCard);
    expect((card.vm as any).menu).toBe(false);

    await wrapper.find('[data-test="bucket-menu-btn"]').trigger('click');
    expect((card.vm as any).menu).toBe(true);

    await wrapper.find('[data-test="archive"]').trigger('click');

    expect(editBucketMock).toHaveBeenCalledWith('b1', { isArchived: true });
    expect(bucketsData[0].isArchived).toBe(true);
  });

  it('filters to archived buckets when toggle clicked', async () => {
    const wrapper = mount(BucketManager, {
      global: { stubs: { 'q-menu': qMenuStub } },
    });

    await wrapper.find('button[aria-label="Archived"]').trigger('click');
    const cards = wrapper.findAllComponents(BucketCard);
    expect(cards.length).toBeGreaterThan(0);
    cards.forEach(card => {
      expect((card.props('bucket') as any).isArchived).toBe(true);
    });
  });
});
