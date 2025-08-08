<template>
  <q-dialog v-model="model" persistent>
    <q-card class="q-pa-md qcard" style="min-width: 300px">
      <q-card-section class="text-h6">{{
        $t("FindCreators.actions.donate.label")
      }}</q-card-section>
      <q-card-section>
        <q-select
          v-model="bucketId"
          :options="bucketOptions"
          emit-value
          map-options
          outlined
          dense
          :label="$t('bucket.name')"
        />
        <q-input
          v-model.number="amount"
          type="number"
          dense
          outlined
          :label="$t('DonateDialog.inputs.amount')"
          class="q-mt-sm"
        />
        <q-input
          v-model.trim="message"
          dense
          outlined
          :label="$t('DonateDialog.inputs.message')"
          class="q-mt-sm"
        />
        <q-select
          v-model="type"
          :options="typeOptions"
          emit-value
          map-options
          outlined
          dense
          class="q-mt-md"
          :label="$t('DonateDialog.inputs.type')"
        />
        <q-option-group
          v-model="locked"
          :options="lockOptions"
          inline
          class="q-mt-md"
        />
        <q-select
          v-if="type !== 'one-time'"
          v-model="preset"
          :options="presetOptions"
          emit-value
          map-options
          outlined
          dense
          class="q-mt-md"
          :label="$t('DonateDialog.inputs.preset')"
          :hint="$t('DonateDialog.helper.months')"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" @click="cancel">{{
          $t("global.actions.cancel.label")
        }}</q-btn>
        <q-btn flat color="primary" @click="confirm">{{
          $t("global.actions.send.label")
        }}</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useBucketsStore } from "stores/buckets";
import { DEFAULT_BUCKET_ID } from "@/constants/buckets";
import { useMintsStore } from "stores/mints";
import { useUiStore } from "stores/ui";
import { storeToRefs } from "pinia";
import { useDonationPresetsStore } from "stores/donationPresets";

export default defineComponent({
  name: "DonateDialog",
  props: {
    modelValue: Boolean,
    creatorPubkey: { type: String, default: "" },
  },
  emits: ["update:modelValue", "confirm"],
  setup(props, { emit }) {
    const bucketsStore = useBucketsStore();
    const mintsStore = useMintsStore();
    const uiStore = useUiStore();
    const donationStore = useDonationPresetsStore();
    const { bucketList, bucketBalances } = storeToRefs(bucketsStore);
    const { activeUnit } = storeToRefs(mintsStore);

    const bucketId = ref<string>(DEFAULT_BUCKET_ID);
    const locked = ref<"normal" | "locked">("normal");
    const type = ref<"one-time" | "schedule">("one-time");
    const amount = ref<number>(0);
    const message = ref<string>("");
    const preset = ref<number>(donationStore.presets[0]?.months || 0);

    const model = computed({
      get: () => props.modelValue,
      set: (v: boolean) => emit("update:modelValue", v),
    });

    const bucketOptions = computed(() =>
      bucketList.value.map((b) => ({
        label: `${b.name} (${uiStore.formatCurrency(
          bucketBalances.value[b.id] ?? 0,
          activeUnit.value
        )})`,
        value: b.id,
      }))
    );

    const typeOptions = [
      { label: "One-time", value: "one-time" },
      { label: "Scheduled", value: "schedule" },
    ];

    const lockOptions = [
      { label: "Normal", value: "normal" },
      { label: "P2PK Lock", value: "locked" },
    ];

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
      emit("confirm", {
        bucketId: bucketId.value,
        locked: locked.value === "locked",
        type: type.value,
        amount: amount.value,
        months: preset.value,
        message: message.value,
      });
      emit("update:modelValue", false);
    };

    return {
      model,
      bucketId,
      locked,
      type,
      amount,
      message,
      preset,
      bucketOptions,
      typeOptions,
      lockOptions,
      presetOptions,
      cancel,
      confirm,
    };
  },
});
</script>
