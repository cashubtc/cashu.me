<template>
  <!-- Full-screen dialog header: a close button pinned to the leading edge, the centred title
       and optional trailing actions, bound to the app column (.sheet-column-header). The title
       keeps clear of both: it stays centred while it fits between the wider side, and moves
       toward the narrower side (then ends in an ellipsis) when it doesn't
       (src/css/app.scss .sheet-header__title). -->
  <div
    class="row items-center q-pa-md sheet-column-header"
    :style="{ '--sheet-header-actions': `${actionsWidth}px` }"
  >
    <IconButton
      close-popup
      :label="$t('global.actions.close.label')"
      @click="$emit('close')"
      floating
    >
      <XIcon :size="24" />
    </IconButton>
    <div class="col text-center fixed-title-height sheet-header__title">
      <slot name="title">
        <q-item-label
          class="sheet-title"
          :class="{ 'dialog-header': balanced }"
        >
          <span class="sheet-header__text">{{ title }}</span>
        </q-item-label>
      </slot>
    </div>
    <div ref="actions" class="row items-center no-wrap sheet-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script lang="ts">
import IconButton from "src/components/ui/IconButton.vue";
import { X as XIcon } from "lucide-vue-next";
import { defineComponent } from "vue";

export default defineComponent({
  name: "FullscreenDialogHeader",
  components: { IconButton, XIcon },
  props: {
    title: { type: String, default: "" },
    // Balance the title's lines when it wraps (the global .dialog-header rule adds
    // text-wrap: balance on top of the shared title style).
    balanced: { type: Boolean, default: false },
  },
  emits: ["close"],
  data() {
    return {
      // The trailing group's width (lock, unit toggle, …), which the title keeps clear of.
      actionsWidth: 0,
      observer: null as ResizeObserver | null,
    };
  },
  mounted() {
    const actions = this.$refs.actions as HTMLElement | undefined;
    if (!actions || typeof ResizeObserver === "undefined") return;
    this.observer = new ResizeObserver(() => {
      this.actionsWidth = Math.ceil(actions.getBoundingClientRect().width);
    });
    this.observer.observe(actions);
  },
  beforeUnmount() {
    this.observer?.disconnect();
  },
});
</script>
