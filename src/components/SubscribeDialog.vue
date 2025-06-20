<template>
  <q-dialog v-model="model" persistent>
    <q-card class="q-pa-md qcard" style="min-width: 300px">
      <q-card-section class="text-h6">
        Subscribe to {{ tier?.name }}
      </q-card-section>
      <q-card-section>
        <q-select
          v-if="showBucketSelect"
          v-model="bucketId"
          :options="bucketOptions"
          emit-value
          map-options
          outlined
          dense
          :label="$t('BucketManager.inputs.name')"
        />
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
        <div class="q-mt-md text-right">Total: {{ total }} sats</div>
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
import { useBucketsStore, DEFAULT_BUCKET_ID } from "stores/buckets";
import { useMintsStore } from "stores/mints";
import { useUiStore } from "stores/ui";
import { fetchNutzapProfile } from "stores/nostr";
import { notifyError } from "src/js/notify";
import { storeToRefs } from "pinia";

export default defineComponent({
  name: "SubscribeDialog",
  props: {
    modelValue: Boolean,
    tier: { type: Object, required: false },
    supporterPubkey: { type: String, default: "" },
    creatorPubkey: { type: String, default: "" },
  },
  emits: ["update:modelValue", "confirm"],
  setup(props, { emit }) {
    const donationStore = useDonationPresetsStore();
    const bucketsStore = useBucketsStore();
    const mintsStore = useMintsStore();
    const uiStore = useUiStore();
    const { bucketList, bucketBalances } = storeToRefs(bucketsStore);
    const { activeUnit } = storeToRefs(mintsStore);

    const months = ref(donationStore.presets[0]?.months || 0);
    const amount = ref(0);
    const bucketId = ref<string>(DEFAULT_BUCKET_ID);
    const today = new Date().toISOString().slice(0, 10);
    const startDate = ref(today);
    const total = computed(() => amount.value * months.value);

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
      set: (v: boolean) => emit("update:modelValue", v),
    });

    const bucketOptions = computed(() =>
      bucketList.value.map((b) => ({
        label: `${b.name} (${uiStore.formatCurrency(
          bucketBalances.value[b.id] ?? 0,
          activeUnit.value,
        )})`,
        value: b.id,
      })),
    );

    const presetOptions = computed(() =>
      donationStore.presets.map((p) => ({
        label: `${p.months}m`,
        value: p.months,
      })),
    );

    const showBucketSelect = computed(() => !props.creatorPubkey);

    const selectCreatorBucket = () => {
      if (!props.creatorPubkey) return;
      const existing = bucketList.value.find(
        (b) => b.creatorPubkey === props.creatorPubkey,
      );
      if (existing) {
        bucketId.value = existing.id;
      } else {
        const created = bucketsStore.addBucket({
          name: props.creatorPubkey.slice(0, 8),
          creatorPubkey: props.creatorPubkey,
        });
        if (created) bucketId.value = created.id;
      }
    };

    watch(
      () => props.modelValue,
      (val) => {
        if (val) selectCreatorBucket();
      },
    );

    watch(
      () => props.creatorPubkey,
      () => {
        if (props.modelValue) selectCreatorBucket();
      },
    );

    const cancel = () => {
      emit("update:modelValue", false);
    };

    const confirm = async () => {
      if (!startDate.value) {
        return;
      }
      const profile = await fetchNutzapProfile(props.creatorPubkey);
      if (!profile) {
        notifyError("Creator has not published a Nutzap profile (kind-10019)");
        return;
      }
      const ts = Math.floor(new Date(startDate.value).getTime() / 1000);
      emit("confirm", {
        bucketId: bucketId.value,
        months: months.value,
        amount: amount.value,
        startDate: ts,
        total: total.value,
      });
      emit("update:modelValue", false);
    };

    return {
      model,
      bucketId,
      bucketOptions,
      showBucketSelect,
      amount,
      months,
      presetOptions,
      startDate,
      today,
      total,
      cancel,
      confirm,
    };
  },
});
</script>
