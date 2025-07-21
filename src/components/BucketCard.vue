<template>
  <div class="bucket-card-new" :class="{ 'opacity-50': bucket.isArchived }" :style="{ borderTopColor: bucketColor }" @click="handleClick">
    <div class="row items-start no-wrap q-mb-md">
      <div v-if="multiSelectMode" class="q-mr-sm">
        <q-checkbox :model-value="selected" dark @update:model-value="emitToggle" />
      </div>
      <div :style="{ backgroundColor: bucketColor }" class="bucket-avatar text-white flex-shrink-0">
        {{ bucket.name.charAt(0).toUpperCase() }}
      </div>
      <div class="col q-ml-md" style="min-width: 0;">
        <h3 class="text-xl text-weight-bold text-white ellipsis">{{ bucket.name }}</h3>
        <p class="text-grey-5 text-sm line-clamp-2 q-mt-xs">{{ bucket.description || 'No description provided.' }}</p>
      </div>
      <q-btn v-if="!multiSelectMode && bucket.id !== DEFAULT_BUCKET_ID" flat round dense color="grey-6" icon="more_vert" @click.stop="menu = !menu" />
    </div>

    <div class="col-grow"></div>

    <div class="q-mt-auto">
      <p class="text-lg text-weight-semibold text-white q-mb-sm">{{ formatCurrency(balance || 0, activeUnit) }}</p>
      <div v-if="bucket.goal > 0">
        <p class="text-xs text-grey-5 text-right q-mb-xs">Goal: {{ formatCurrency(bucket.goal, activeUnit) }}</p>
        <div class="progress-bar-container">
          <div class="progress-bar-value" :style="{ width: progress + '%', backgroundColor: bucketColor }"></div>
        </div>
      </div>
    </div>

    <q-menu v-model="menu" anchor="bottom right" self="top right" dark class="bg-slate-800">
      <q-list dense>
        <q-item clickable v-close-popup @click.stop="emitAction('view')">
          <q-item-section avatar><q-icon name="o_visibility" /></q-item-section>
          <q-item-section>View Tokens</q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click.stop="emitAction('edit')">
          <q-item-section avatar><q-icon name="o_edit" /></q-item-section>
          <q-item-section>Edit</q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click.stop="emitAction('archive')">
          <q-item-section avatar><q-icon name="o_archive" /></q-item-section>
          <q-item-section>{{ bucket.isArchived ? 'Unarchive' : 'Archive' }}</q-item-section>
        </q-item>
        <q-separator dark />
        <q-item clickable v-close-popup @click.stop="emitAction('delete')">
          <q-item-section avatar><q-icon name="o_delete" color="red-4" /></q-item-section>
          <q-item-section class="text-red-4">Delete</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </div>
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
    multiSelectMode: { type: Boolean, default: false },
    selected: { type: Boolean, default: false },
  },
  emits: ["menu-action", "toggle-select"],
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

    const progress = computed(() => {
      if (!props.bucket.goal || props.bucket.goal === 0) return 0;
      return Math.min((props.balance / props.bucket.goal) * 100, 100);
    });

    const emitAction = (action: string) => {
      emit("menu-action", { action, bucket: props.bucket });
    };

    const emitToggle = () => {
      emit("toggle-select", props.bucket.id);
    };

    const handleClick = () => {
      if (props.multiSelectMode) emitToggle();
    };

    return {
      formatCurrency,
      menu,
      emitAction,
      emitToggle,
      handleClick,
      bucketColor,
      avatarStyle,
      DEFAULT_BUCKET_ID,
      t,
      progress,
    };
  },
});
</script>

<style scoped>
.bucket-card-new {
  background-color: #1e293b; /* bg-slate-800 */
  padding: 24px;
  border-radius: 16px;
  border-top: 4px solid;
  height: 256px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}
.bucket-card-new:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3), 0 10px 10px -5px rgba(0,0,0,0.2);
}
.bucket-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  max-height: 2.5em; /* Fallback for non-webkit */
}
.progress-bar-container {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  height: 6px;
}
.progress-bar-value {
  height: 6px;
  border-radius: 9999px;
  transition: width 0.5s ease;
}
.col-grow {
  flex-grow: 1;
}
.opacity-50 {
    opacity: 0.5;
}
</style>
