<template>
  <q-card class="shadow-2 rounded-borders bucket-card text-white q-pa-md">
    <div class="row items-center">
      <router-link
        :to="`/buckets/${bucket.id}`"
        style="text-decoration: none"
        class="row items-center text-white ellipsis"
      >
        <q-avatar square size="42px" :style="avatarStyle" class="q-mr-md">
          {{ bucket.name.charAt(0).toUpperCase() }}
        </q-avatar>
        <div class="column items-start">
          <div class="text-weight-bold row items-center no-wrap">
            <span>{{ bucket.name }}</span>
            <q-icon v-if="bucket.description" name="info" class="q-ml-sm" />
          </div>
          <div class="text-caption" v-if="bucket.description">{{
            bucket.description
          }}</div>
          <div class="text-caption row items-center no-wrap">
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
              style="width: 60px; height: 4px"
              class="q-ml-sm"
            />
          </div>
        </div>
      </router-link>
      <div class="q-ml-auto" v-if="bucket.id !== DEFAULT_BUCKET_ID">
        <q-btn
          dense
          flat
          round
          icon="more_vert"
          @click.stop="menu = true"
          aria-label="Options"
          data-test="bucket-menu-btn"
        />
        <q-menu v-model="menu" anchor="bottom right" self="top right">
          <q-list style="min-width: 150px">
            <q-item clickable v-close-popup @click.stop="emitAction('view')" data-test="view">
              <q-item-section>{{ t('BucketManager.view_tokens') }}</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click.stop="emitAction('edit')" data-test="edit">
              <q-item-section>{{ t('global.actions.edit.label') }}</q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              @click.stop="emitAction('archive')"
              data-test="archive"
            >
              <q-item-section>
                {{ bucket.isArchived ? t('BucketManager.actions.unarchive') : t('BucketManager.actions.archive') }}
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click.stop="emitAction('delete')" data-test="delete">
              <q-item-section>{{ t('BucketManager.actions.delete') }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </div>
    </div>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { DEFAULT_BUCKET_ID } from "stores/buckets";
import { useUiStore } from "stores/ui";
import { DEFAULT_COLOR } from "src/js/constants";

export default defineComponent({
  name: "BucketCard",
  components: {},
  props: {
    bucket: { type: Object as () => any, required: true },
    balance: { type: Number, default: 0 },
    activeUnit: { type: String, required: true },
  },
  emits: ["menu-action"],
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

    const menu = ref(false);

    const emitAction = (action: string) => {
      emit("menu-action", { action, bucket: props.bucket });
    };

    return {
      formatCurrency,
      menu,
      emitAction,
      bucketColor,
      avatarStyle,
      DEFAULT_BUCKET_ID,
      t,
    };
  },
});
</script>
