<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    position="bottom"
    backdrop-filter="blur(4px) brightness(50%)"
    transition-show="slide-up"
    transition-hide="slide-down"
    @keydown.enter.prevent="$emit('enter')"
  >
    <q-card class="bottom-sheet" :class="isDark ? 'bg-dark' : 'bg-white'">
      <!-- Header -->
      <div v-if="title" class="bottom-sheet-header">
        <q-btn
          flat
          round
          icon="close"
          class="bottom-sheet-close"
          :aria-label="$t('global.actions.close.label')"
          v-close-popup
        />
        <h4 class="bottom-sheet-title q-my-none">{{ title }}</h4>
      </div>

      <!-- Scrollable content -->
      <div class="bottom-sheet-content scroll">
        <slot />
      </div>

      <!-- Fixed action buttons -->
      <div v-if="$slots.actions" class="bottom-sheet-actions q-px-lg">
        <slot name="actions" />
      </div>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "pinia";
import { useUiStore } from "src/stores/ui";

/**
 * Shared bottom sheet shell. Use it for every sheet that slides up from the
 * bottom so all sheets share the same look and behavior:
 * - q-dialog at the bottom with slide-up/slide-down transitions and a
 *   blurred backdrop (Esc and backdrop click work out of the box)
 * - theme-aware background (dark/light)
 * - max-width 500px, rounded top corners, safe-area bottom padding
 * - optional header (title + close button) and a fixed actions bar
 * - registers itself with the ui store so the Android back button closes it
 */
export default defineComponent({
  name: "BottomSheet",
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue", "enter"],
  computed: {
    ...mapState(useUiStore, ["closeLocalSheetsSignal"]),
    isDark(): boolean {
      return this.$q.dark.isActive;
    },
  },
  watch: {
    modelValue: {
      // immediate: the sheet can be mounted while already open (deep links)
      immediate: true,
      handler(open: boolean) {
        const ui = useUiStore();
        ui.openLocalSheets = Math.max(0, ui.openLocalSheets + (open ? 1 : -1));
      },
    },
    closeLocalSheetsSignal() {
      // The ui store asks all open sheets to close (e.g. Android back button)
      if (this.modelValue) {
        this.$emit("update:modelValue", false);
      }
    },
  },
  beforeUnmount() {
    if (this.modelValue) {
      const ui = useUiStore();
      ui.openLocalSheets = Math.max(0, ui.openLocalSheets - 1);
    }
  },
});
</script>

<style scoped>
.bottom-sheet {
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom);
}

/* Header */
/* Same header as every other sheet: close on the leading 6px inset, title centred. */
.bottom-sheet-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 56px;
  padding: 0 56px;
  flex-shrink: 0;
}

.bottom-sheet-title {
  font-size: 1.0625rem;
  font-weight: 600;
  text-align: center;
}

.bottom-sheet-close {
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
}

/* Content */
.bottom-sheet-content {
  flex: 1;
  overflow-y: auto;
}

/* Action buttons */
.bottom-sheet-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  padding-bottom: 16px;
  flex-shrink: 0;
}
</style>
