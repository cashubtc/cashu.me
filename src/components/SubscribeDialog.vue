<template>
  <q-dialog v-model="model" persistent>
    <q-card class="q-pa-md qcard" style="min-width: 300px">
      <q-card-section class="text-h6">
        Subscribe to {{ tier?.name }}
      </q-card-section>
      <q-card-section>
        <q-input
          v-model.number="amount"
          type="number"
          :label="$t('DonateDialog.inputs.amount')"
          dense
          outlined
          disable
        />
        <q-select
          v-model="months"
          :options="presetOptions"
          emit-value
          map-options
          outlined
          dense
          class="q-mt-md"
          :label="$t('DonateDialog.inputs.preset')"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" @click="cancel">{{
          $t('global.actions.cancel.label')
        }}</q-btn>
        <q-btn flat color="primary" @click="confirm">{{
          $t('global.actions.ok.label')
        }}</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue';
import { useDonationPresetsStore } from 'stores/donationPresets';

export default defineComponent({
  name: 'SubscribeDialog',
  props: {
    modelValue: Boolean,
    tier: { type: Object, required: true },
    supporterPubkey: { type: String, default: '' },
  },
  emits: ['update:modelValue', 'confirm'],
  setup(props, { emit }) {
    const donationStore = useDonationPresetsStore();
    const months = ref(donationStore.presets[0]?.months || 0);
    const amount = ref(0);

    watch(
      () => props.tier,
      (t) => {
        if (t) {
          amount.value = t.price_sats ?? t.price ?? 0;
        }
      },
      { immediate: true, deep: true },
    );

    const model = computed({
      get: () => props.modelValue,
      set: (v: boolean) => emit('update:modelValue', v),
    });

    const presetOptions = computed(() =>
      donationStore.presets.map((p) => ({
        label: `${p.months}m`,
        value: p.months,
      })),
    );

    const cancel = () => {
      emit('update:modelValue', false);
    };

    const confirm = () => {
      emit('confirm', { months: months.value, amount: amount.value });
      emit('update:modelValue', false);
    };

    return {
      model,
      amount,
      months,
      presetOptions,
      cancel,
      confirm,
    };
  },
});
</script>

