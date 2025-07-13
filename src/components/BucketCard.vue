<template>
  <q-card
    class="shadow-2 rounded-borders text-white"
    :style="{ backgroundColor: bucket.color || DEFAULT_COLOR }"
  >
    <router-link
      :to="`/buckets/${bucket.id}`"
      style="text-decoration: none; display: block"
      class="text-white"
    >
      <q-item clickable class="q-pa-md">
        <q-item-section avatar>
          <q-avatar square size="32px" class="bg-primary text-white">
            {{ bucket.name.charAt(0).toUpperCase() }}
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-bold row items-center no-wrap">
            <span>{{ bucket.name }}</span>
            <q-icon v-if="bucket.description" name="info" class="q-ml-sm" />
          </q-item-label>
          <q-item-label caption v-if="bucket.description">{{ bucket.description }}</q-item-label>
          <q-item-label caption class="row items-center no-wrap">
            <span>
              {{ formatCurrency(balance || 0, activeUnit) }}
              <span v-if="bucket.goal">
                / {{ formatCurrency(bucket.goal, activeUnit) }}
              </span>
            </span>
            <q-circular-progress
              v-if="bucket.goal"
              :value="Math.min((balance || 0) / bucket.goal, 1) * 100"
              size="28px"
              track-color="grey-5"
              :color="bucket.color || 'primary'"
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
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import InfoTooltip from './InfoTooltip.vue';
import { DEFAULT_BUCKET_ID } from 'stores/buckets';
import { useUiStore } from 'stores/ui';
import { DEFAULT_COLOR } from 'src/js/constants';

export default defineComponent({
  name: 'BucketCard',
  components: { InfoTooltip },
  props: {
    bucket: { type: Object as () => any, required: true },
    balance: { type: Number, default: 0 },
    activeUnit: { type: String, required: true }
  },
  emits: ['edit', 'delete'],
  setup(props, { emit }) {
    const uiStore = useUiStore();
    const { t } = useI18n();

    const formatCurrency = (amount: number, unit: string) => {
      return uiStore.formatCurrency(amount, unit);
    };

    const emitEdit = () => emit('edit', props.bucket);
    const emitDelete = () => emit('delete', props.bucket.id);

    return {
      formatCurrency,
      emitEdit,
      emitDelete,
      DEFAULT_BUCKET_ID,
      DEFAULT_COLOR,
      t,
    };
  }
});
</script>

