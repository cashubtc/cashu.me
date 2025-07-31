<template>
  <q-dialog
    v-model="showLocal"
    persistent
    backdrop-filter="blur(2px) brightness(60%)"
  >
    <q-card class="q-pa-md" style="min-width: 350px">
      <q-card-section>
        <div class="row items-center">
          <div class="text-h6 q-mr-xs">
            {{ $t("CreatorHub.dashboard.add_tier") }}
          </div>
          <HelpPopup
            text="Create a tier with a price and optional welcome message for your supporters."
            :close-label="$t('global.actions.close.label')"
          />
        </div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-input
          v-model="localTier.name"
          :label="$t('CreatorHub.dashboard.inputs.title.label')"
          outlined
          dense
          class="q-mb-sm"
        />
        <q-input
          v-model.number="localTier.price_sats"
          type="number"
          :label="$t('CreatorHub.dashboard.inputs.price.label')"
          outlined
          dense
          class="q-mb-sm"
        >
          <template #hint>
            <div v-if="bitcoinPrice">
              ~{{
                formatCurrency(
                  (bitcoinPrice / 100000000) * localTier.price_sats,
                  "USD",
                )
              }}
              /
              {{
                formatCurrency(
                  (bitcoinPrice / 100000000) * localTier.price_sats,
                  "EUR",
                )
              }}
            </div>
          </template>
        </q-input>
        <q-input
          v-model="localTier.description"
          type="textarea"
          autogrow
          :label="$t('CreatorHub.dashboard.inputs.description.label')"
          outlined
          dense
          class="q-mb-sm"
        />
        <div class="text-caption text-grey q-mb-sm">
          Markdown formatting is supported.
        </div>
        <q-input
          v-model="localTier.welcomeMessage"
          type="textarea"
          autogrow
          :label="$t('CreatorHub.dashboard.welcome_message')"
          outlined
          dense
          class="q-mb-sm"
        />
      </q-card-section>
      <q-card-actions align="between" class="q-pt-none">
        <q-btn flat color="primary" @click="save">{{
          $t("CreatorHub.dashboard.save_tier")
        }}</q-btn>
        <q-btn flat color="grey" v-close-popup>{{
          $t("global.actions.cancel.label")
        }}</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, watch } from "vue";
import { useCreatorHubStore } from "stores/creatorHub";
import type { Tier } from "stores/types";
import { notifySuccess, notifyError } from "src/js/notify";
import { useNostrStore } from "stores/nostr";
import { usePriceStore } from "stores/price";
import { useUiStore } from "stores/ui";

export default defineComponent({
  name: "AddTierDialog",
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    tier: {
      type: Object as () => Partial<Tier>,
      required: true,
    },
  },
  emits: ["update:modelValue", "save"],
  setup(props, { emit }) {
    const priceStore = usePriceStore();
    const uiStore = useUiStore();
    const creatorHub = useCreatorHubStore();
    const nostr = useNostrStore();

    const showLocal = computed({
      get: () => props.modelValue,
      set: (val) => emit("update:modelValue", val),
    });

    const localTier = reactive<Partial<Tier>>({ ...props.tier });

    watch(
      () => props.tier,
      (val) => {
        Object.assign(localTier, val);
      },
      { immediate: true, deep: true },
    );

    const save = async () => {
      try {
        await nostr.initSignerIfNotSet();
        if (!nostr.signer) {
          notifyError(
            "Please unlock or connect your Nostr signer before saving tiers",
          );
          return;
        }
        await creatorHub.addOrUpdateTier({ ...localTier });
        await creatorHub.publishTierDefinitions();
        notifySuccess("Tier saved & published");
        emit("update:modelValue", false);
      } catch (e: any) {
        notifyError(e.message);
      }
    };

    const bitcoinPrice = computed(() => priceStore.bitcoinPrice);

    const formatCurrency = (amount: number, unit: string) =>
      uiStore.formatCurrency(amount, unit);

    return { showLocal, localTier, save, bitcoinPrice, formatCurrency };
  },
});
</script>
