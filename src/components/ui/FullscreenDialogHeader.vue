<template>
  <!-- Full-screen dialog header: a close button pinned to the leading edge, the centred title
       and optional trailing actions, bound to the app column (.sheet-column-header). -->
  <div class="row items-center q-pa-md sheet-column-header">
    <q-btn
      v-close-popup
      flat
      round
      icon="close"
      color="grey"
      class="floating-close-btn app-icon-btn"
      :aria-label="$t('global.actions.close.label')"
      @click="$emit('close')"
    />
    <div class="col text-center fixed-title-height">
      <slot name="title">
        <q-item-label
          class="sheet-title"
          :class="{ 'dialog-header': balanced }"
        >
          {{ title }}
        </q-item-label>
      </slot>
    </div>
    <slot name="actions" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "FullscreenDialogHeader",
  props: {
    title: { type: String, default: "" },
    // Balance the title's lines when it wraps (the global .dialog-header rule adds
    // text-wrap: balance on top of the shared title style).
    balanced: { type: Boolean, default: false },
  },
  emits: ["close"],
});
</script>
