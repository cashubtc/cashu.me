<template>
  <q-card class="shadow-2 rounded-borders bg-grey-9 text-white">
    <router-link
      :to="`/buckets/${bucket.id}`"
      style="text-decoration: none; display: block"
      class="text-white"
    >
      <q-item clickable class="q-pa-md">
        <q-item-section avatar>
          <q-avatar square size="32px" :style="avatarStyle">
            {{ bucket.name.charAt(0).toUpperCase() }}
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-bold row items-center no-wrap">
            <span>{{ bucket.name }}</span>
            <q-icon v-if="bucket.description" name="info" class="q-ml-sm" />
          </q-item-label>
          <q-item-label caption v-if="bucket.description">{{
            bucket.description
          }}</q-item-label>
          <q-item-label caption class="row items-center no-wrap">
            <span>
              {{ formatCurrency(balance || 0, activeUnit) }}
              <span v-if="bucket.goal">
                / {{ formatCurrency(bucket.goal, activeUnit) }}
              </span>
            </span>
            <q-linear-progress
              v-if="bucket.goal"
              :color="bucketColor"
              :value="Math.min((balance || 0) / bucket.goal, 1)"
              style="width: 50px; height: 4px"
              class="q-ml-sm"
            />
          </q-item-label>
        </q-item-section>
        <q-item-section side v-if="bucket.id !== DEFAULT_BUCKET_ID">
          <q-btn
            icon="edit"
            flat
            round
            size="sm"
            @click.stop.prevent="emitEdit"
            aria-label="Edit"
            title="Edit"
          />
          <InfoTooltip
            class="q-ml-xs"
            :text="$t('BucketManager.tooltips.edit_button')"
          />
          <q-btn
            icon="delete"
            flat
            round
            size="sm"
            @click.stop.prevent="emitDelete"
            :aria-label="$t('BucketManager.actions.delete')"
            :title="$t('BucketManager.actions.delete')"
          />
          <InfoTooltip
            class="q-ml-xs"
            :text="$t('BucketManager.tooltips.delete_button')"
          />
        </q-item-section>
      </q-item>
    </router-link>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useI18n } from "vue-i18n";
import InfoTooltip from "./InfoTooltip.vue";
import { DEFAULT_BUCKET_ID } from "stores/buckets";
import { useUiStore } from "stores/ui";
import { DEFAULT_COLOR } from "src/js/constants";

export default defineComponent({
  name: "BucketCard",
  components: { InfoTooltip },
  props: {
    bucket: { type: Object as () => any, required: true },
    balance: { type: Number, default: 0 },
    activeUnit: { type: String, required: true },
  },
  emits: ["edit", "delete"],
  setup(props, { emit }) {
    const uiStore = useUiStore();
    const { t } = useI18n();

    const bucketColor = computed(() => props.bucket.color || DEFAULT_COLOR);

    const isColorDark = (color: string) => {
      const hex = color.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness < 128;
    };

    const avatarStyle = computed(() => ({
      backgroundColor: bucketColor.value,
      color: isColorDark(bucketColor.value) ? "white" : "black",
    }));

    const formatCurrency = (amount: number, unit: string) => {
      return uiStore.formatCurrency(amount, unit);
    };

    const emitEdit = () => emit("edit", props.bucket);
    const emitDelete = () => emit("delete", props.bucket.id);

    return {
      formatCurrency,
      emitEdit,
      emitDelete,
      bucketColor,
      avatarStyle,
      DEFAULT_BUCKET_ID,
      t,
    };
  },
});
</script>
