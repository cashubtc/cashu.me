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
                  "USD"
                )
              }}
              /
              {{
                formatCurrency(
                  (bitcoinPrice / 100000000) * localTier.price_sats,
                  "EUR"
                )
              }}
            </div>
          </template>
        </q-input>
        <q-select
          v-model="localTier.frequency"
          :options="frequencyOptions"
          emit-value
          map-options
          outlined
          dense
          class="q-mb-sm"
          label="Interval"
        />
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
        <div class="q-mt-md">
          <div class="row items-center justify-between q-mb-sm">
            <div class="row items-center">
              <div class="text-subtitle2">Media Preview</div>
              <HelpPopup
                class="q-ml-xs"
                :text="$t('AddTierDialog.helper.media_preview')"
                :close-label="$t('global.actions.close.label')"
              />
              <a
                href="https://github.com/cashu-community/cashu.me/blob/main/README.md#media-previews-for-tiers"
                target="_blank"
                class="text-primary text-caption q-ml-sm"
                >Learn more</a
              >
            </div>
            <q-btn flat dense icon="add" label="Add Media" @click="addMedia" />
          </div>
          <div v-for="(m, idx) in localTier.media" :key="idx" class="q-mb-md">
            <div class="row items-center q-col-gutter-sm">
              <q-select
                v-model="m.type"
                :options="mediaTypes"
                dense
                outlined
                class="col-2"
              />
              <q-input
                v-model="m.url"
                label="URL"
                outlined
                dense
                class="col"
                :error="m.url ? !isTrustedUrl(m.url) : false"
                error-message="Invalid URL"
              />
              <q-input
                v-model="m.title"
                label="Title"
                outlined
                dense
                class="col-3"
              />
              <q-icon
                name="delete"
                class="cursor-pointer"
                @click="removeMedia(idx)"
              />
            </div>
            <MediaPreview
              v-if="m.url && isTrustedUrl(m.url)"
              :url="m.url"
              class="q-mt-sm"
            />
          </div>
        </div>
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
import MediaPreview from "./MediaPreview.vue";
import {
  type SubscriptionFrequency,
  frequencyToDays,
} from "src/constants/subscriptionFrequency";
import { filterValidMedia, isTrustedUrl } from "src/utils/validateMedia";

export default defineComponent({
  name: "AddTierDialog",
  components: { MediaPreview },
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

    const localTier = reactive<Partial<Tier>>({
      media: [],
      frequency: "monthly" as SubscriptionFrequency,
      intervalDays: 30,
      ...props.tier,
    });

    const frequencyOptions = [
      { label: "Weekly", value: "weekly" },
      { label: "Twice Monthly", value: "biweekly" },
      { label: "Monthly", value: "monthly" },
    ] as const;

    const mediaTypes = ["image", "video", "audio"] as const;

    function addMedia() {
      if (!localTier.media) localTier.media = [];
      localTier.media.push({ url: "", type: "image", title: "" });
    }

    function removeMedia(idx: number) {
      if (!localTier.media) return;
      localTier.media.splice(idx, 1);
    }

    watch(
      () => props.tier,
      (val) => {
        Object.assign(localTier, val);
        if (!val.media) {
          localTier.media = [];
        }
        if (!val.frequency) {
          localTier.frequency = "monthly";
        }
        localTier.intervalDays = frequencyToDays(
          (localTier.frequency as SubscriptionFrequency) || "monthly"
        );
      },
      { immediate: true, deep: true }
    );

    watch(
      () => localTier.frequency,
      (val) => {
        localTier.intervalDays = frequencyToDays(
          (val as SubscriptionFrequency) || "monthly"
        );
      }
    );

    const save = async () => {
      if (!localTier.name || !localTier.name.trim()) {
        notifyError("Tier name is required");
        return;
      }
      if (!localTier.description || !localTier.description.trim()) {
        notifyError("Description is required");
        return;
      }
      if (!localTier.price_sats || localTier.price_sats <= 0) {
        notifyError("Price must be a positive number");
        return;
      }
      localTier.intervalDays = frequencyToDays(
        (localTier.frequency as SubscriptionFrequency) || "monthly"
      );
      try {
        await nostr.initSignerIfNotSet();
        if (!nostr.signer) {
          notifyError(
            "Please unlock or connect your Nostr signer before saving tiers"
          );
          return;
        }
        if (localTier.media) {
          localTier.media = filterValidMedia(localTier.media);
        }
        await creatorHub.addOrUpdateTier({
          ...localTier,
          media: localTier.media,
        });
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

    return {
      showLocal,
      localTier,
      save,
      bitcoinPrice,
      formatCurrency,
      addMedia,
      removeMedia,
      mediaTypes,
      frequencyOptions,
      isTrustedUrl,
    };
  },
});
</script>
