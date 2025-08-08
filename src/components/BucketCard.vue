<template>
  <div
    class="bucket-card"
    ref="menuTarget"
    :class="{
      'opacity-50': bucket.isArchived,
      selected,
      'drag-over': dragOver,
    }"
    :style="{ borderTopColor: bucketColor }"
    @click="handleClick"
    @dragover.prevent="onDragOver"
    @dragenter.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <div v-if="selected" class="selected-check">
      <q-icon name="check" size="sm" color="white" />
    </div>
    <div class="row items-center no-wrap q-mb-sm">
      <div v-if="multiSelectMode" class="q-mr-sm">
        <q-checkbox :model-value="selected" dark @update:model-value="emitToggle" />
      </div>
      <div :style="avatarStyle" class="bucket-avatar flex-shrink-0">
        {{ bucket.name.charAt(0).toUpperCase() }}
      </div>
      <div class="col q-ml-md" style="min-width: 0;">
        <div class="name-block">
          <h3 class="text-body1 text-weight-bold text-white ellipsis">{{ bucket.name }}</h3>
          <p v-if="bucket.description" class="text-grey-5 text-sm line-clamp-2 q-mt-xs">{{ bucket.description }}</p>
        </div>
      </div>
      <q-btn
        v-if="!multiSelectMode"
        flat
        round
        dense
        color="grey-6"
        icon="more_vert"
        @mousedown.stop
        @click.stop="menu = !menu"
        aria-label="Bucket actions"
        draggable="false"
        data-test="bucket-menu-btn"
      />
    </div>

    <div class="bottom-info q-mt-auto column justify-between">
      <p class="text-h6 text-weight-semibold text-white q-mb-sm">
        {{ formatCurrency(balance || 0, activeUnit) }}
      </p>
      <div data-test="progress-section" class="progress-section q-mt-sm">
        <q-linear-progress
          v-if="bucket.goal"
          :value="progressRatio"
          :color="bucketColor"
          rounded
          size="4px"
        />
        <div v-if="bucket.goal" class="row items-center text-caption q-mt-xs">
          <span>Progress</span>
          <span class="q-ml-auto">Goal: {{ formatCurrency(bucket.goal, activeUnit) }}</span>
        </div>
      </div>
    </div>

    <q-menu
      v-model="menu"
      anchor="top right"
      self="top right"
      :offset="[0, 8]"
      dark
      separate
      class="bg-slate-800 elevated-menu"
      style="min-width: 200px;"
      :target="menuTarget"
    >
      <q-list dense>
        <q-item clickable v-close-popup @click.stop="emitAction('manage')" data-test="manage">
          <q-item-section>{{ t('BucketManager.actions.manage') }}</q-item-section>
        </q-item>
        <template v-if="bucket.id !== DEFAULT_BUCKET_ID">
          <q-item clickable v-close-popup @click.stop="emitAction('edit')" data-test="edit">
            <q-item-section>Edit</q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click.stop="emitAction('archive')" data-test="archive">
            <q-item-section>{{ bucket.isArchived ? 'Unarchive' : 'Archive' }}</q-item-section>
          </q-item>
          <q-separator dark />
          <q-item clickable v-close-popup @click.stop="emitAction('delete')" data-test="delete">
            <q-item-section class="text-red-4">Delete</q-item-section>
          </q-item>
        </template>
        <template v-else>
          <q-item disable>
            <q-item-section>Edit</q-item-section>
          </q-item>
          <q-item disable>
            <q-item-section>Archive</q-item-section>
          </q-item>
          <q-separator dark />
          <q-item disable>
            <q-item-section class="text-red-4">Delete</q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-menu>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { hashColor } from "stores/buckets";
import { DEFAULT_BUCKET_ID } from "@/constants/buckets";
import { useUiStore } from "stores/ui";

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

    const bucketColor = computed(() => props.bucket.color || hashColor(props.bucket.name));

    const adjustColor = (col: string, amt: number) => {
      let color = col.startsWith('#') ? col.slice(1) : col;
      const num = parseInt(color, 16);
      let r = (num >> 16) + amt;
      r = Math.max(Math.min(255, r), 0);
      let g = ((num >> 8) & 0x00ff) + amt;
      g = Math.max(Math.min(255, g), 0);
      let b = (num & 0x00ff) + amt;
      b = Math.max(Math.min(255, b), 0);
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };

    const isColorDark = (color: string) => {
      const hex = color.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness < 128;
    };

    const vibrantColor = computed(() => adjustColor(bucketColor.value, 20));

    const avatarStyle = computed(() => ({
      backgroundColor: vibrantColor.value,
      color: isColorDark(vibrantColor.value) ? "white" : "black",
    }));

    const formatCurrency = (amount: number, unit: string) => {
      return uiStore.formatCurrency(amount, unit);
    };

    const menu = ref(false);
    const menuTarget = ref<HTMLElement | null>(null);
    const dragOver = ref(false);

    const progressRatio = computed(() => {
      if (!props.bucket.goal || props.bucket.goal === 0) return 0;
      return Math.min(props.balance / props.bucket.goal, 1);
    });

    const emitAction = (action: string) => {
      emit("menu-action", { action, bucket: props.bucket });
    };

    const emitToggle = () => {
      emit("toggle-select", props.bucket.id);
    };

    const onDragOver = () => {
      dragOver.value = true;
    };

    const onDragLeave = () => {
      dragOver.value = false;
    };

    const onDrop = () => {
      dragOver.value = false;
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
      onDragOver,
      onDragLeave,
      onDrop,
      bucketColor,
      avatarStyle,
      dragOver,
      DEFAULT_BUCKET_ID,
      t,
      progressRatio,
      menuTarget,
    };
  },
});
</script>

<style scoped>
.bucket-card {
  background-color: var(--bucket-background);
  color: var(--bucket-text-color);
  padding: 12px;
  border-radius: 16px;
  border-top: 4px solid;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 220px;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  cursor: pointer;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}
.bucket-card:hover {
  transform: scale(1.03);
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.4), 0 10px 10px -5px rgba(0,0,0,0.3);
}
.bucket-card.selected {
  border: 3px solid var(--q-primary);
}
.bucket-card.drag-over {
  box-shadow: 0 0 0 3px var(--q-primary) inset;
}
.selected-check {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: var(--q-primary);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}
.bucket-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
}
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  max-height: 2.5em; /* Fallback for non-webkit */
}
.name-block {
  min-height: 40px;
}
.opacity-50 {
    opacity: 0.5;
}
.progress-section {
  min-height: 48px;
}

.bottom-info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
}

@media (max-width: 600px) {
  .bucket-card {
    min-height: 180px;
  }
}
</style>
