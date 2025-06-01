<template>
  <q-dialog v-model="model" persistent>
    <q-card class="q-pa-md qcard" style="min-width: 300px">
      <q-card-section class="text-h6">{{ $t('FindCreators.actions.donate.label') }}</q-card-section>
      <q-card-section>
        <q-select
          v-model="bucketId"
          :options="bucketOptions"
          emit-value
          map-options
          outlined
          dense
          :label="$t('BucketManager.inputs.name')"
        />
        <q-option-group
          v-model="locked"
          :options="lockOptions"
          inline
          class="q-mt-md"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" @click="cancel">{{ $t('global.actions.cancel.label') }}</q-btn>
        <q-btn flat color="primary" @click="confirm">{{ $t('global.actions.send.label') }}</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { useBucketsStore, DEFAULT_BUCKET_ID } from 'stores/buckets';
import { useMintsStore } from 'stores/mints';
import { useUiStore } from 'stores/ui';
import { storeToRefs } from 'pinia';

export default defineComponent({
  name: 'DonateDialog',
  props: {
    modelValue: Boolean,
  },
  emits: ['update:modelValue', 'confirm'],
  setup(props, { emit }) {
    const bucketsStore = useBucketsStore();
    const mintsStore = useMintsStore();
    const uiStore = useUiStore();
    const { bucketList, bucketBalances } = storeToRefs(bucketsStore);
    const { activeUnit } = storeToRefs(mintsStore);

    const bucketId = ref<string>(DEFAULT_BUCKET_ID);
    const locked = ref<'normal' | 'locked'>('normal');

    const model = computed({
      get: () => props.modelValue,
      set: (v: boolean) => emit('update:modelValue', v),
    });

    const bucketOptions = computed(() =>
      bucketList.value.map(b => ({
        label: `${b.name} (${uiStore.formatCurrency(
          bucketBalances.value[b.id] ?? 0,
          activeUnit.value
        )})`,
        value: b.id,
      }))
    );

    const lockOptions = [
      { label: 'Normal', value: 'normal' },
      { label: 'P2PK Lock', value: 'locked' },
    ];

    const cancel = () => {
      emit('update:modelValue', false);
    };

    const confirm = () => {
      emit('confirm', { bucketId: bucketId.value, locked: locked.value === 'locked' });
    };

    return { model, bucketId, locked, bucketOptions, lockOptions, cancel, confirm };
  },
});
</script>
