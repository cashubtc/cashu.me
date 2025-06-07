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
        <q-input
          v-model="startDate"
          type="date"
          outlined
          dense
          class="q-mt-md"
          label="Start Date"
          :min="today"
          required
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" @click="cancel">{{
          $t("global.actions.cancel.label")
        }}</q-btn>
        <q-btn flat color="primary" @click="confirm">{{
          $t("global.actions.ok.label")
        }}</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from "vue";
import { useDonationPresetsStore } from "stores/donationPresets";

export default defineComponent({
  name: "SubscribeDialog",
  props: {
    modelValue: Boolean,
    tier: { type: Object, required: true },
    supporterPubkey: { type: String, default: "" },
  },
  emits: ["update:modelValue", "confirm"],
  setup(props, { emit }) {
    const donationStore = useDonationPresetsStore();
    const months = ref(donationStore.presets[0]?.months || 0);
    const amount = ref(0);
    const today = new Date().toISOString().slice(0, 10);
    const startDate = ref(today);

    watch(
      () => props.tier,
      (t) => {
        if (t) {
          amount.value = t.price_sats ?? t.price ?? 0;
        }
      },
      { immediate: true, deep: true }
    );

    const model = computed({
      get: () => props.modelValue,
      set: (v: boolean) => emit("update:modelValue", v),
    });

    const presetOptions = computed(() =>
      donationStore.presets.map((p) => ({
        label: `${p.months}m`,
        value: p.months,
      }))
    );

    const cancel = () => {
      emit("update:modelValue", false);
    };

    const confirm = () => {
      if (!startDate.value) {
        return;
      }
      const ts = Math.floor(new Date(startDate.value).getTime() / 1000);
      emit("confirm", {
        months: months.value,
        amount: amount.value,
        startDate: ts,
      });
      emit("update:modelValue", false);
    };

    return {
      model,
      amount,
      months,
      presetOptions,
      startDate,
      today,
      cancel,
      confirm,
    };
  },
});
</script>
