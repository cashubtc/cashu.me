<template>
  <!-- The one sheet in the app (Send, Receive, every picker and form sheet): same dialog,
       transitions, backdrop, surface, header (close, centred title, optional trailing action)
       and content inset, so every sheet opens, closes and lines up the same way. -->
  <!-- inline renders the open sheet in place, without the dialog (the design system board). -->
  <component
    :is="inline ? 'div' : QDialog"
    v-bind="inline ? { class: 'bottom-sheet--inline' } : dialogProps"
    @keydown.enter="onEnter"
  >
    <q-card class="bottom-sheet">
      <!-- Header -->
      <div v-if="title" class="bottom-sheet-header">
        <IconButton
          v-if="back"
          :label="back"
          @click="$emit('back')"
          floating
          class="bottom-sheet-close"
        >
          <ChevronLeftIcon />
        </IconButton>
        <IconButton
          v-else
          :label="$t('global.actions.close.label')"
          close-popup
          floating
          class="bottom-sheet-close"
        >
          <XIcon />
        </IconButton>
        <h4 class="bottom-sheet-title sheet-title q-my-none">{{ title }}</h4>
        <div v-if="$slots.trailing" class="bottom-sheet-trailing">
          <slot name="trailing" />
        </div>
      </div>

      <!-- Scrollable content -->
      <div class="bottom-sheet-content scroll">
        <slot />
      </div>

      <!-- Fixed action buttons -->
      <div v-if="$slots.actions" class="bottom-sheet-actions">
        <slot name="actions" />
      </div>
    </q-card>
  </component>
</template>

<script lang="ts">
import IconButton from "src/components/ui/IconButton.vue";
import { defineComponent } from "vue";
import { QDialog } from "quasar";
import { mapState } from "pinia";
import { ChevronLeft as ChevronLeftIcon, X as XIcon } from "lucide-vue-next";
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
  components: { IconButton, ChevronLeftIcon, XIcon },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    inline: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "",
    },
    // A stacked sheet leads with a back chevron instead of close; the value names where it
    // goes (its accessible label), and the sheet emits "back" for the parent to handle.
    back: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue", "enter", "back"],
  setup() {
    return { QDialog };
  },
  computed: {
    ...mapState(useUiStore, ["closeLocalSheetsSignal"]),
    dialogProps(): Record<string, unknown> {
      const wide = this.$q.screen.gt.sm;
      return {
        modelValue: this.modelValue,
        "onUpdate:modelValue": (v: boolean) =>
          this.$emit("update:modelValue", v),
        position: wide ? "standard" : "bottom",
        transitionShow: wide ? "scale" : "slide-up",
        transitionHide: wide ? "scale" : "slide-down",
      };
    },
  },
  watch: {
    modelValue: {
      // immediate: the sheet can be mounted while already open (deep links)
      immediate: true,
      handler(open: boolean) {
        if (this.inline) return;
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
  methods: {
    // Enter anywhere in the sheet is its primary action (the "enter" event), except on a
    // control that Enter activates itself: there the key keeps its own meaning.
    onEnter(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target?.closest?.(
          "button, a, [role=button], [role=option], [role=radio], summary, select, textarea"
        )
      )
        return;
      event.preventDefault();
      this.$emit("enter");
    },
  },
  beforeUnmount() {
    if (this.modelValue && !this.inline) {
      const ui = useUiStore();
      ui.openLocalSheets = Math.max(0, ui.openLocalSheets - 1);
    }
  },
});
</script>

<style scoped>
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

/* In place on the board: the open sheet's card, full width, with all four corners rounded. */
.bottom-sheet--inline .bottom-sheet {
  border-radius: 20px;
  max-height: none;
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

/* The trailing header action (Send and Receive: scan) mirrors the close button's inset. */
.bottom-sheet-trailing {
  inset-inline-end: 6px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

/* Content: one inset for every sheet, on the 16px gutter. */
.bottom-sheet-content {
  flex: 1;
  overflow-y: auto;
  padding: 4px 16px 16px;
}
/* Without an actions bar the list scrolls to the sheet's own bottom edge, and the bottom
   inset (safe area included) is inside the scroll: a long list (Language) is cut by the
   sheet's edge, which reads as scrollable, never a row clipped 8px above it. */
.bottom-sheet:not(:has(> .bottom-sheet-actions)) {
  padding-bottom: 0;
}
.bottom-sheet:not(:has(> .bottom-sheet-actions)) > .bottom-sheet-content {
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
}

/* Action buttons */
.bottom-sheet-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px 16px;
  flex-shrink: 0;
}
</style>
