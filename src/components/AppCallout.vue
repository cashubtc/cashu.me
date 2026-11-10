<template>
  <!-- The standard callout (shadcn Alert with Sonner's rich colours): an icon, an optional
       title and a message on a tone-tinted surface. Styles in src/css/elements.scss. -->
  <div
    class="app-callout"
    :class="`app-callout--${variant}`"
    :role="variant === 'danger' || variant === 'warning' ? 'alert' : 'status'"
  >
    <component :is="iconComponent" :size="18" class="app-callout__icon" />
    <div class="app-callout__body">
      <div v-if="title" class="app-callout__title">{{ title }}</div>
      <div v-if="$slots.default || text" class="app-callout__text">
        <slot>{{ text }}</slot>
      </div>
      <div v-if="$slots.actions" class="app-callout__actions">
        <slot name="actions" />
      </div>
    </div>
    <q-btn
      v-if="dismissible"
      flat
      round
      class="app-callout__close"
      :aria-label="$t('global.actions.close.label')"
      @click="$emit('dismiss')"
    >
      <XIcon :size="16" />
    </q-btn>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import {
  CircleAlert as CircleAlertIcon,
  CircleCheck as CircleCheckIcon,
  Info as InfoIcon,
  Lightbulb as LightbulbIcon,
  TriangleAlert as TriangleAlertIcon,
  X as XIcon,
} from "lucide-vue-next";

export type CalloutVariant =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger";

const ICONS = {
  neutral: LightbulbIcon,
  info: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  danger: CircleAlertIcon,
};

export default defineComponent({
  name: "AppCallout",
  components: { XIcon },
  props: {
    variant: {
      type: String as PropType<CalloutVariant>,
      default: "neutral",
    },
    title: { type: String, default: "" },
    text: { type: String, default: "" },
    dismissible: { type: Boolean, default: false },
  },
  emits: ["dismiss"],
  computed: {
    iconComponent() {
      return ICONS[this.variant] ?? InfoIcon;
    },
  },
});
</script>
