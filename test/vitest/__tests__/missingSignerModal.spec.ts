import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountWithPlugins } from '../test-utils.ts';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';
import MissingSignerModal from '../../../src/components/MissingSignerModal.vue';
import { useSignerStore } from '../../../src/stores/signer';
import { nip19 } from 'nostr-tools';

vi.unmock('../../../src/stores/signer');
vi.unmock('../../../src/stores/ui');

vi.mock('nostr-tools', () => ({
  nip19: {
    decode: vi.fn(),
  },
}));

describe('MissingSignerModal.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const mountComponent = () => {
    const dialogRef = ref({ hide: vi.fn() });
    const wrapper = mountWithPlugins(MissingSignerModal, {
      props: { dialogRef },
      global: {
        stubs: {
          // Local stubs for this specific test file
          QDialog: { name: 'QDialog', template: '<div><slot /></div>' },
          QCard: { name: 'QCard', template: '<div><slot /></div>' },
          QCardSection: { name: 'QCardSection', template: '<div><slot /></div>' },
          QCardActions: { name: 'QCardActions', template: '<div><slot /></div>' },
          QBtn: { name: 'QBtn', template: '<button><slot /></button>' },
          QInput: { name: 'QInput', props: ['modelValue'], template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
        }
      }
    });
    return { wrapper, dialogRef };
  };

  it('chooses local signer with a valid nsec', async () => {
    (nip19.decode as any).mockReturnValue({ type: 'nsec', data: 'decoded-key' });
    const { wrapper, dialogRef } = mountComponent();
    const store = useSignerStore();

    const input = wrapper.findComponent({ name: 'QInput' });
    await input.setValue('nsec1validkey');
    const localSignerButton = wrapper.findAllComponents({ name: 'QBtn' }).at(0);
    await localSignerButton?.trigger('click');

    expect(store.method).toBe('local');
    expect(dialogRef.value.hide).toHaveBeenCalled();
  });
});
