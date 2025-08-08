import { describe, it, expect, vi } from 'vitest';
import { mount, shallowMount } from '@vue/test-utils';
import EditBucketModal from '../../../src/components/EditBucketModal.vue';
import BucketManager from '../../../src/components/BucketManager.vue';

const bucket = { id: 'b1', name: 'Bucket', color: '#fff', description: '', goal: null };

vi.mock('../../../src/stores/proofs', () => ({
  useProofsStore: () => ({ moveProofs: vi.fn(), proofs: [] }),
}));

const editBucketMock = vi.fn();

vi.mock('../../../src/stores/buckets', () => ({
  useBucketsStore: () => ({
    bucketList: [bucket],
    bucketBalances: {},
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
  useMintsStore: () => ({ activeUnit: 'sat' }),
}));

vi.mock('../../../src/stores/ui', () => ({
  useUiStore: () => ({ formatCurrency: (a:number) => String(a) }),
}));

vi.mock('../../../src/js/notify', () => ({ notifyError: vi.fn() }));

describe('EditBucketModal', () => {
  it('emits save with form data', () => {
    const wrapper = mount(EditBucketModal, { props: { modelValue: true, bucket } });
    (wrapper.vm as any).onSave();
    expect(wrapper.emitted('save')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });
});

describe('BucketManager modals', () => {
  it('opens edit modal and saves', async () => {
    const wrapper = shallowMount(BucketManager);
    const vm:any = wrapper.vm;
    vm.handleMenuAction({ action: 'edit', bucket });
    await wrapper.vm.$nextTick();
    expect(vm.editModalOpen).toBe(true);
    const modal = wrapper.findComponent(EditBucketModal);
    modal.vm.$emit('save', { name: 'New' });
    await wrapper.vm.$nextTick();
    expect(editBucketMock).toHaveBeenCalled();
    expect(vm.editModalOpen).toBe(false);
  });

  it('opens detail modal on manage', async () => {
    const wrapper = shallowMount(BucketManager);
    const vm:any = wrapper.vm;
    vm.handleMenuAction({ action: 'manage', bucket });
    await wrapper.vm.$nextTick();
    expect(vm.detailModalOpen).toBe(true);
    wrapper.findComponent({ name: 'BucketDetailModal' }).vm.$emit('update:modelValue', false);
    await wrapper.vm.$nextTick();
    expect(vm.detailModalOpen).toBe(false);
  });
});
