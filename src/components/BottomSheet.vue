<template>
  <!-- The Send and Receive sheet, shared: same dialog, transitions, backdrop, surface and
       header, so every sheet in the app opens and closes the same way. -->
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    position="bottom"
    transition-show="slide-up"
    transition-hide="slide-down"
    @keydown.enter.prevent="$emit('enter')"
  >
    <q-card class="bottom-sheet" :class="{ 'bottom-sheet--dark': dark }">
      <!-- Header -->
      <div v-if="title" class="bottom-sheet-header">
        <q-btn
          flat
          round
          color="primary"
          class="bottom-sheet-close"
          :aria-label="$t('global.actions.close.label')"
          v-close-popup
        >
          <XIcon />
        </q-btn>
        <h4 class="bottom-sheet-title sheet-title q-my-none">{{ title }}</h4>
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
import { X as XIcon } from "lucide-vue-next";
import { useUiStore } from "src/stores/ui";

/**
 * Shared bottom sheet shell. Use it for every sheet that slides up from the
 * bottom so all sheets share the same look and behavior:
 * - q-dialog at the bottom with slide-up/slide-down transitions and the same
 *   backdrop as Send and Receive (Esc and backdrop click work out of the box)
 * - the raised surface token, so it follows every theme
 * - max-width 500px, rounded top corners, safe-area bottom padding
 * - optional header (title + close button) and a fixed actions bar
 * - registers itself with the ui store so the Android back button closes it
 */
export default defineComponent({
  name: "BottomSheet",
  components: { XIcon },
  props: {
    // Onboarding is designed dark in every mode; its sheets follow it.
    dark: {
      type: Boolean,
      default: false,
    },
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
/* Same backdrop as the Send and Receive sheets. A static blur, not Quasar's backdrop-filter
   prop: that one also dimmed with brightness() and re-rendered the page on every frame of
   the slide, which made sheets like the mint picker stutter. */
:deep(.q-dialog__backdrop) {
  backdrop-filter: blur(8px);
}

.bottom-sheet {
  background: var(--app-raised);
  color: var(--app-text);
  width: 100%;
  max-width: var(--app-content);
  max-height: 80vh;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
}

/* Onboarding sheets: the dark tokens in every app mode. */
.bottom-sheet--dark {
  --app-text: #fff;
  --app-text-muted: rgba(255, 255, 255, 0.72);
  --app-tint: rgba(255, 255, 255, 0.06);
  --app-tint-strong: rgba(255, 255, 255, 0.1);
  --app-border-strong: rgba(255, 255, 255, 0.28);
  background: #1f1f1f;
  color: #fff;
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
  text-align: center;
}

.bottom-sheet-close {
  color: var(--app-text) !important;
  position: absolute;
  inset-inline-start: 6px;
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
