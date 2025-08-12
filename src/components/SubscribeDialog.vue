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
          :label="$t('bucket.name')"
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
        <div class="q-mt-sm text-caption">
          {{ frequencyLabel }}
        </div>
        <div class="q-mt-md text-right">Total: {{ total }} sats</div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" @click="cancel">{{
          $t("global.actions.cancel.label")
        }}</q-btn>
        <q-btn flat color="primary" @click="confirm" :disable="!hasSigner">{{
          $t("global.actions.ok.label")
        }}</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from "vue";
import { useDonationPresetsStore } from "stores/donationPresets";
import { useBucketsStore } from "stores/buckets";
import { DEFAULT_BUCKET_ID } from "@/constants/buckets";
import { useMintsStore } from "stores/mints";
import { useUiStore } from "stores/ui";
import {
  fetchNutzapProfile,
  npubToHex,
  RelayConnectionError,
  useNostrStore,
} from "stores/nostr";
import { notifySuccess, notifyError } from "src/js/notify";
import { storeToRefs } from "pinia";
import { useNutzapStore } from "stores/nutzap";
import { useI18n } from "vue-i18n";
import { NdkBootError } from "boot/ndk";
import { useBootErrorStore } from "stores/bootError";
import type { CreatorIdentity } from "src/types/creator";
import {
  frequencyToDays,
  type SubscriptionFrequency,
} from "src/constants/subscriptionFrequency";

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
    const nutzap = useNutzapStore();
    const nostr = useNostrStore();
    const { t } = useI18n();
    const { bucketList, bucketBalances } = storeToRefs(bucketsStore);
    const { activeUnit } = storeToRefs(mintsStore);

    const months = ref(donationStore.presets[0]?.months || 0);
    const tierPrice = computed(
      () => props.tier?.price_sats ?? (props.tier as any)?.price ?? 0
    );
    const frequency = computed<SubscriptionFrequency>(
      () => (props.tier?.frequency as SubscriptionFrequency) || "monthly"
    );
    const intervalDays = computed(() =>
      props.tier?.intervalDays !== undefined
        ? props.tier.intervalDays
        : frequencyToDays(frequency.value)
    );
    const frequencyLabel = computed(() => {
      switch (frequency.value) {
        case "weekly":
          return "Every week";
        case "biweekly":
          return "Twice a month";
        default:
          return "Every month";
      }
    });
    const bucketId = ref<string>(DEFAULT_BUCKET_ID);
    const today = new Date().toISOString().slice(0, 10);
    const startDate = ref(today);
    const total = computed(() => tierPrice.value * months.value);

    const hasSigner = computed(() => !!nostr.signer);

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

    const presetOptions = computed(() =>
      donationStore.presets.map((p) => ({
        label: `${p.months}m`,
        value: p.months,
      }))
    );

    const showBucketSelect = computed(() => !props.creatorPubkey);

    const selectCreatorBucket = () => {
      if (!props.creatorPubkey) return;
      const existing = bucketList.value.find(
        (b) => b.creatorPubkey === props.creatorPubkey
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
      async (val) => {
        if (val) {
          await nostr.initSignerIfNotSet();
          if (!nostr.signer) {
            useBootErrorStore().set(new NdkBootError("no-signer"));
          }
          selectCreatorBucket();
        }
      }
    );

    watch(
      () => props.creatorPubkey,
      () => {
        if (props.modelValue) selectCreatorBucket();
      }
    );

    const cancel = () => {
      emit("update:modelValue", false);
    };

    const confirm = async () => {
      if (!startDate.value) {
        return;
      }
      await nostr.initSignerIfNotSet();
      if (!nostr.signer) {
        useBootErrorStore().set(new NdkBootError("no-signer"));
        return;
      }
      try {
        const creatorHex = props.creatorPubkey.startsWith("npub")
          ? npubToHex(props.creatorPubkey)
          : props.creatorPubkey;
        if (!creatorHex) {
          notifyError("Error: Could not decode creator's public key.");
          return;
        }
        let profile = null;
        try {
          profile = await fetchNutzapProfile(creatorHex);
        } catch (e: any) {
          if (e instanceof RelayConnectionError) {
            console.error("Relay connection error", e);
            notifyError("Unable to connect to Nostr relays");
            return;
          }
          console.error("Failed to fetch Nutzap profile", e);
          throw e;
        }
        if (!profile) {
          notifyError(
            "Creator has not published a Nutzap profile (kind-10019)"
          );
          return;
        }
        const creator: CreatorIdentity = {
          nostrPubkey: creatorHex,
          cashuP2pk: profile.p2pkPubkey,
        };
        const success = await nutzap.subscribeToTier({
          creator,
          tierId: props.tier?.id ?? props.tier?.name ?? "tier",
          price: tierPrice.value,
          months: months.value,
          startDate: Math.floor(new Date(startDate.value).getTime() / 1000),
          relayList: profile.relays ?? [],
          frequency: frequency.value,
          intervalDays: intervalDays.value,
          tierName: props.tier?.name,
          benefits: props.tier?.benefits,
          creatorName: profile?.name,
          creatorAvatar: profile?.picture,
        });
        if (success) {
          notifySuccess(t("FindCreators.notifications.subscription_success"));
          emit("confirm", {
            bucketId: bucketId.value,
            months: months.value,
            startDate: Math.floor(new Date(startDate.value).getTime() / 1000),
            total: total.value,
          });
          emit("update:modelValue", false);
        } else {
          notifyError(t("FindCreators.notifications.subscription_failed"));
        }
      } catch (e: any) {
        console.error("Subscription failed", e);
        if (e instanceof NdkBootError && e.reason === "no-signer") {
          useBootErrorStore().set(e);
        } else {
          notifyError(
            e.message || t("FindCreators.notifications.subscription_failed")
          );
        }
      }
    };

    return {
      model,
      bucketId,
      bucketOptions,
      showBucketSelect,
      months,
      presetOptions,
      intervalDays,
      frequency,
      frequencyLabel,
      startDate,
      today,
      total,
      hasSigner,
      cancel,
      confirm,
    };
  },
});
</script>
