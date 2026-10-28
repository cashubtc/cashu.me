<!-- Callout explorations for the design system board: the current AppCallout (0) and seven
     whole alternative designs (1-7), each showing the same specimen (every tone, a titled
     warning, and the dismissible mint message). Board-only: nothing in the app uses these
     until one is chosen and moved into AppCallout. Built from the shared tokens only. -->
<template>
  <div class="xc" :class="`xc--v${variant}`">
    <template v-if="variant === 0">
      <AppCallout
        v-for="c in specimen"
        :key="c.tone + c.text"
        :variant="c.tone"
        :title="c.title"
        :text="c.text"
        :dismissible="c.dismiss"
      />
    </template>
    <template v-else-if="variant === 4">
      <!-- 4: a tone header strip (icon and title or tone name), then the message. -->
      <div
        v-for="c in specimen"
        :key="c.tone + c.text"
        class="xc-item xc-card"
        :class="`xc-item--${c.tone}`"
      >
        <div class="xc-head">
          <component :is="icon(c.tone)" :size="16" class="xc-icon" />
          <span class="xc-head__title">{{ c.title || toneName(c.tone) }}</span>
          <q-btn
            v-if="c.dismiss"
            flat
            round
            dense
            class="xc-head__close"
            aria-label="Dismiss"
          >
            <XIcon :size="16" />
          </q-btn>
        </div>
        <div class="xc-text">{{ c.text }}</div>
      </div>
    </template>
    <template v-else>
      <div
        v-for="c in specimen"
        :key="c.tone + c.text"
        class="xc-item"
        :class="`xc-item--${c.tone}`"
        :role="c.tone === 'danger' || c.tone === 'warning' ? 'alert' : 'status'"
      >
        <!-- 5: a tone label instead of an icon -->
        <span v-if="variant === 5" class="xc-label">{{
          toneName(c.tone)
        }}</span>
        <!-- 6: the icon in a tinted disc; others: the bare tone icon -->
        <span v-else-if="variant === 6" class="xc-disc">
          <component :is="icon(c.tone)" :size="18" />
        </span>
        <component
          :is="icon(c.tone)"
          v-else
          :size="variant === 3 ? 16 : 18"
          class="xc-icon"
        />
        <div class="xc-body">
          <div v-if="c.title" class="xc-title">{{ c.title }}</div>
          <div class="xc-text">{{ c.text }}</div>
        </div>
        <q-btn
          v-if="c.dismiss"
          flat
          round
          class="xc-close"
          aria-label="Dismiss"
        >
          <XIcon :size="16" />
        </q-btn>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  CircleAlert as CircleAlertIcon,
  CircleCheck as CircleCheckIcon,
  Info as InfoIcon,
  Lightbulb as LightbulbIcon,
  TriangleAlert as TriangleAlertIcon,
  X as XIcon,
} from "lucide-vue-next";
import AppCallout, { type CalloutVariant } from "src/components/AppCallout.vue";

export const calloutVariants = [
  "Current: neutral card, tinted edge",
  "Leading bar",
  "Soft tint",
  "Inline note",
  "Tone header",
  "Tone label",
  "Icon disc",
  "Edge-to-edge banner",
];

const ICONS = {
  neutral: LightbulbIcon,
  info: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  danger: CircleAlertIcon,
};

export default defineComponent({
  name: "CalloutExplorations",
  components: { AppCallout, XIcon },
  props: {
    variant: { type: Number, default: 0 },
  },
  data() {
    return {
      specimen: [
        { tone: "neutral", text: "Neutral advice for the next step." },
        { tone: "info", text: "Swapping costs a small Lightning fee." },
        { tone: "success", text: "Backup confirmed." },
        {
          tone: "warning",
          title: "Experimental feature",
          text: "Paying from several mints can fail part way.",
        },
        { tone: "danger", text: "This token is locked to a different key." },
        {
          tone: "info",
          title: "Mint message",
          text: "Maintenance tonight from 22:00 UTC.",
          dismiss: true,
        },
      ] as {
        tone: CalloutVariant;
        title?: string;
        text: string;
        dismiss?: boolean;
      }[],
    };
  },
  methods: {
    icon(tone: CalloutVariant) {
      return ICONS[tone];
    },
    toneName(tone: CalloutVariant): string {
      return {
        neutral: "Tip",
        info: "Info",
        success: "Done",
        warning: "Warning",
        danger: "Error",
      }[tone];
    },
  },
});
</script>

<style scoped>
.xc {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}
.xc-item {
  --tone: var(--app-text-muted);
  align-items: flex-start;
  color: var(--app-text);
  display: flex;
  font-size: 14px;
  gap: 10px;
  line-height: 1.45;
  position: relative;
  text-align: start;
}
.xc-item--info {
  --tone: var(--app-info);
}
.xc-item--success {
  --tone: var(--app-success);
}
.xc-item--warning {
  --tone: var(--app-warning);
}
.xc-item--danger {
  --tone: var(--app-danger);
}
.xc-icon {
  color: var(--tone);
  flex-shrink: 0;
  margin-top: 1px;
}
.xc-body {
  flex: 1;
  min-width: 0;
}
.xc-title {
  font-weight: 600;
}
.xc-text {
  color: var(--app-text-muted);
}
.xc-title + .xc-text {
  margin-top: 2px;
}
.xc-close {
  color: var(--app-text-muted);
  height: 40px;
  margin: -10px -14px -10px 0;
  min-height: 40px;
  min-width: 40px;
  width: 40px;
}

/* 1 Leading bar: no box; a 3px tone bar on the start edge carries the meaning. */
.xc--v1 .xc-item {
  border-inline-start: 3px solid var(--tone);
  padding: 2px 0 2px 12px;
}
.xc--v1 .xc-item--neutral {
  border-inline-start-color: var(--app-border-strong);
}
.xc--v1 {
  gap: 16px;
}

/* 2 Soft tint: the tone tints the whole surface, no edge; text stays ink. */
.xc--v2 .xc-item {
  background: color-mix(in srgb, var(--tone) 12%, var(--app-surface));
  border-radius: var(--app-radius-lg);
  padding: 12px 14px;
}
.xc--v2 .xc-item--neutral {
  background: var(--app-group-fill);
}
.xc--v2 .xc-text {
  color: color-mix(in srgb, var(--app-text) 80%, transparent);
}

/* 3 Inline note: no container at all, a quiet footnote line with a small tone icon. */
.xc--v3 {
  gap: 14px;
}
.xc--v3 .xc-item {
  font-size: 13px;
  gap: 8px;
}
.xc--v3 .xc-icon {
  margin-top: 2px;
}
.xc--v3 .xc-title {
  display: inline;
  margin-inline-end: 4px;
}
.xc--v3 .xc-title + .xc-text {
  display: inline;
}

/* 4 Tone header: a neutral card with a tinted header strip naming the tone. */
.xc--v4 .xc-card {
  background: var(--app-group-fill);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-lg);
  flex-direction: column;
  gap: 0;
  overflow: hidden;
}
.xc--v4 .xc-head {
  align-items: center;
  background: color-mix(in srgb, var(--tone) 14%, transparent);
  color: var(--tone);
  display: flex;
  font-size: 12px;
  font-weight: 600;
  gap: 8px;
  letter-spacing: 0.04em;
  min-height: 32px;
  padding: 0 14px;
  text-transform: uppercase;
  width: 100%;
}
.xc--v4 .xc-item--neutral .xc-head {
  background: var(--app-tint);
  color: var(--app-text-muted);
}
.xc--v4 .xc-head__title {
  flex: 1;
}
.xc--v4 .xc-head__close {
  color: var(--app-text-muted);
  margin-inline-end: -8px;
}
.xc--v4 .xc-text {
  color: var(--app-text);
  padding: 10px 14px 12px;
}

/* 5 Tone label: a neutral card led by a small tone pill ("Warning") instead of an icon. */
.xc--v5 .xc-item {
  background: var(--app-group-fill);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-lg);
  flex-wrap: wrap;
  padding: 12px 14px;
}
.xc--v5 .xc-label {
  background: color-mix(in srgb, var(--tone) 16%, transparent);
  border-radius: var(--app-radius-pill);
  color: var(--tone);
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  line-height: 20px;
  padding: 0 8px;
}
.xc--v5 .xc-item--neutral .xc-label {
  background: var(--app-tint-strong);
  color: var(--app-text);
}
.xc--v5 .xc-text {
  color: var(--app-text);
}

/* 6 Icon disc: the app's icon-circle language; a tinted 36px disc, then the message. */
.xc--v6 .xc-item {
  align-items: center;
  background: var(--app-group-fill);
  border-radius: var(--app-radius-lg);
  gap: 12px;
  padding: 12px 14px;
}
.xc--v6 .xc-disc {
  align-items: center;
  background: color-mix(in srgb, var(--tone) 16%, transparent);
  border-radius: 50%;
  color: var(--tone);
  display: inline-flex;
  flex-shrink: 0;
  height: 36px;
  justify-content: center;
  width: 36px;
}
.xc--v6 .xc-item--neutral .xc-disc {
  background: var(--app-tint-strong);
  color: var(--app-text);
}
.xc--v6 .xc-close {
  margin: -10px -14px -10px 0;
}

/* 7 Edge-to-edge banner: square, full-bleed, hairlines above and below, tone tint. */
.xc--v7 {
  gap: 0;
  margin-inline: -24px;
  width: calc(100% + 48px);
}
.xc--v7 .xc-item {
  background: color-mix(in srgb, var(--tone) 8%, transparent);
  border-block: 1px solid color-mix(in srgb, var(--tone) 30%, var(--app-border));
  padding: 12px 24px;
}
.xc--v7 .xc-item + .xc-item {
  border-top: 0;
}
.xc--v7 .xc-item--neutral {
  background: var(--app-tint);
  border-color: var(--app-border);
}
.xc--v7 .xc-close {
  margin: -10px -14px -10px 0;
}
</style>
