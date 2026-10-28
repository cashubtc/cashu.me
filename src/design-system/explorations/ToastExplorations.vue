<!-- Toast explorations for the design system board: seven whole alternatives (1-7) to the
     current raised card, which the board renders itself (0). Each shows the same specimen
     (every kind, a description, an Undo action), then three toasts at once on a small screen
     with the pinned action, so placement and stacking compare too. Board-only: nothing in the
     app uses these until one is chosen and moved into notify.ts and app.scss. Tokens only. -->
<template>
  <div v-if="variant > 0" class="xt" :class="`xt--v${variant}`">
    <section v-for="g in groups" :key="g.key" class="xt-group">
      <div class="xt-label">{{ g.label }}</div>
      <div :class="g.key === 'stack' ? 'xt-screen' : 'xt-frame'">
        <template v-if="g.key === 'stack'">
          <div class="xt-balance">
            <div class="xt-balance__label">Balance</div>
            <div class="xt-balance__value">₿12,400</div>
          </div>
          <div class="xt-pinned">Receive</div>
        </template>
        <div :class="g.key === 'stack' ? 'xt-stack' : 'xt-items'">
          <!-- 5: several toasts at once merge into one summary card -->
          <div
            v-if="g.key === 'stack' && variant === 5"
            class="xt-toast xt-toast--neutral"
            role="status"
          >
            <span class="xt-disc xt-disc--count">3</span>
            <div class="xt-body">
              <div class="xt-msg">3 updates</div>
              <div class="xt-desc">
                Received ₿500, copied to clipboard, mint is offline
              </div>
            </div>
            <q-btn flat no-caps class="xt-action">View</q-btn>
          </div>
          <div
            v-for="t in g.items"
            v-else
            :key="t.msg"
            class="xt-toast"
            :class="`xt-toast--${t.tone}`"
            :role="t.tone === 'danger' ? 'alert' : 'status'"
          >
            <!-- 4: a tone dot; 7: no icon, the countdown line carries the tone;
                 2 and 5: the icon in a tinted disc; others: the bare tone icon -->
            <span v-if="variant === 4" class="xt-dot" />
            <span v-else-if="variant === 2 || variant === 5" class="xt-disc">
              <component :is="icon(t.tone)" :size="variant === 2 ? 16 : 18" />
            </span>
            <component
              :is="icon(t.tone)"
              v-else-if="variant !== 7"
              :size="18"
              class="xt-icon"
            />
            <div class="xt-body">
              <div class="xt-msg">{{ t.msg }}</div>
              <div v-if="t.desc" class="xt-desc">{{ t.desc }}</div>
            </div>
            <span v-if="t.more" class="xt-count">+{{ t.more }}</span>
            <q-btn v-if="t.action" flat no-caps class="xt-action">{{
              t.action
            }}</q-btn>
            <q-btn
              v-else-if="closable"
              flat
              round
              class="xt-close"
              aria-label="Dismiss"
            >
              <XIcon :size="16" />
            </q-btn>
            <span v-if="variant === 7" class="xt-track">
              <span class="xt-timer" :style="{ width: t.left }" />
            </span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  CircleAlert as CircleAlertIcon,
  CircleCheck as CircleCheckIcon,
  Info as InfoIcon,
  Trash2 as Trash2Icon,
  TriangleAlert as TriangleAlertIcon,
  X as XIcon,
} from "lucide-vue-next";

export const toastVariants = [
  "Current: raised card",
  "Ink capsule",
  "Top island",
  "Docked bar",
  "Quiet line",
  "Icon disc card",
  "Tone tint",
  "Countdown line",
];

type Tone = "success" | "danger" | "warning" | "info" | "neutral";
type Toast = {
  tone: Tone;
  msg: string;
  desc?: string;
  action?: string;
  left: string;
  more?: number;
};

const ICONS = {
  success: CircleCheckIcon,
  danger: CircleAlertIcon,
  warning: TriangleAlertIcon,
  info: InfoIcon,
  neutral: Trash2Icon,
};

const SUCCESS: Toast = { tone: "success", msg: "Received ₿500", left: "72%" };
const WARNING: Toast = { tone: "warning", msg: "Mint is offline", left: "18%" };
const INFO: Toast = { tone: "info", msg: "Copied to clipboard", left: "46%" };

export default defineComponent({
  name: "ToastExplorations",
  components: { XIcon },
  props: {
    variant: { type: Number, default: 0 },
  },
  computed: {
    groups(): { key: string; label: string; items: Toast[] }[] {
      const kinds: Toast[] = [
        SUCCESS,
        {
          tone: "danger",
          msg: "Payment failed",
          desc: "The mint didn't respond. Try again.",
          left: "88%",
        },
        WARNING,
        INFO,
        { tone: "neutral", msg: "Mint removed", action: "Undo", left: "60%" },
      ];
      // Oldest first, so the newest sits nearest the pinned action. The island shows only
      // the newest and counts the rest.
      const stack =
        this.variant === 2
          ? [{ ...SUCCESS, more: 2 }]
          : [WARNING, INFO, SUCCESS];
      return [
        { key: "kinds", label: "Each kind", items: kinds },
        { key: "stack", label: "Three at once", items: stack },
      ];
    },
    closable(): boolean {
      return [5, 6, 7].includes(this.variant);
    },
  },
  methods: {
    icon(tone: Tone) {
      return ICONS[tone];
    },
  },
});
</script>

<style scoped>
.xt {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
}
.xt-label {
  color: var(--app-text-muted);
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 10px;
}
.xt-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* The small screen: a balance, the pinned action, and the toasts above it. */
.xt-screen {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-xl);
  height: 360px;
  overflow: hidden;
  position: relative;
}
.xt-balance {
  inset-inline: 0;
  position: absolute;
  text-align: center;
  top: 40px;
}
.xt-balance__label {
  color: var(--app-text-muted);
  font-size: 13px;
}
.xt-balance__value {
  color: var(--app-text);
  font-size: 32px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.xt-pinned {
  align-items: center;
  background: var(--q-primary);
  border-radius: var(--app-radius-pill);
  bottom: 16px;
  color: var(--app-on-primary);
  display: flex;
  font-size: 15px;
  font-weight: 600;
  height: 48px;
  inset-inline: 16px;
  justify-content: center;
  position: absolute;
}
.xt-stack {
  bottom: 76px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  inset-inline: 16px;
  position: absolute;
}

/* One toast: tone icon, message (and description), then an action or a dismiss. */
.xt-toast {
  --tone: var(--app-text-muted);
  align-items: center;
  color: var(--app-text);
  display: flex;
  font-size: 14px;
  font-weight: 500;
  gap: 10px;
  line-height: 1.35;
  min-height: 44px;
  position: relative;
  text-align: start;
}
.xt-toast--success {
  --tone: var(--app-success);
}
.xt-toast--danger {
  --tone: var(--app-danger);
}
.xt-toast--warning {
  --tone: var(--app-warning);
}
.xt-toast--info {
  --tone: var(--app-info);
}
.xt-icon {
  color: var(--tone);
  flex-shrink: 0;
}
.xt-body {
  flex: 1;
  min-width: 0;
}
.xt-desc {
  color: var(--app-text-muted);
  font-size: 13px;
  font-weight: 400;
  margin-top: 1px;
}
.xt-action {
  color: var(--app-text);
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 600;
  min-height: 40px;
  padding: 0 12px;
}
.xt-close {
  color: var(--app-text-muted);
  flex-shrink: 0;
  height: 40px;
  min-height: 40px;
  min-width: 40px;
  width: 40px;
}
.xt-disc {
  align-items: center;
  background: color-mix(in srgb, var(--tone) 16%, transparent);
  border-radius: 50%;
  color: var(--tone);
  display: inline-flex;
  flex-shrink: 0;
  justify-content: center;
}
.xt-toast--neutral .xt-disc {
  background: var(--app-tint-strong);
  color: var(--app-text);
}

/* 1 Ink capsule: an inverse pill that hugs its text, centred; the tone icon is mixed toward
   the page colour so it reads on the ink in both modes. Several line up as capsules. */
.xt--v1 .xt-items,
.xt--v1 .xt-stack {
  align-items: center;
}
.xt--v1 .xt-toast {
  background: var(--app-text);
  border-radius: var(--app-radius-pill);
  color: var(--app-surface);
  max-width: 100%;
  padding-inline: 14px 18px;
  width: fit-content;
}
.xt--v1 .xt-icon {
  color: color-mix(in srgb, var(--tone) 60%, var(--app-surface));
}
.xt--v1 .xt-toast--neutral .xt-icon {
  color: color-mix(in srgb, var(--app-surface) 70%, var(--app-text));
}
.xt--v1 .xt-toast:has(.xt-desc) {
  border-radius: var(--app-radius-xl);
  padding-block: 10px;
}
.xt--v1 .xt-desc {
  color: color-mix(in srgb, var(--app-surface) 72%, var(--app-text));
}
.xt--v1 .xt-toast:has(.xt-action) {
  padding-inline-end: 4px;
}
.xt--v1 .xt-action {
  border-inline-start: 1px solid
    color-mix(in srgb, var(--app-surface) 25%, var(--app-text));
  border-radius: 0;
  color: var(--app-surface);
  margin-inline-start: 6px;
  min-height: 24px;
}
.xt--v1 .xt-stack .xt-toast:not(:last-child) {
  background: color-mix(in srgb, var(--app-text) 78%, var(--app-surface));
  transform: scale(0.96);
}

/* 2 Top island: a raised capsule at the top of the screen, led by a tone disc; when several
   arrive it keeps the newest and counts the rest. */
.xt--v2 .xt-items {
  align-items: center;
}
.xt--v2 .xt-toast {
  background: var(--app-raised);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-pill);
  max-width: 100%;
  padding: 5px 18px 5px 5px;
  padding-inline: 5px 18px;
  width: fit-content;
}
.xt--v2 .xt-disc {
  height: 32px;
  width: 32px;
}
.xt--v2 .xt-toast:has(.xt-desc) {
  border-radius: var(--app-radius-xl);
}
.xt--v2 .xt-toast:has(.xt-action) {
  padding-inline-end: 4px;
}
.xt--v2 .xt-action {
  border-radius: var(--app-radius-pill);
  min-height: 34px;
}
.xt--v2 .xt-stack {
  align-items: center;
  bottom: auto;
  top: 12px;
}
.xt--v2 .xt-balance {
  top: 92px;
}
.xt--v2 .xt-count {
  background: var(--app-tint-strong);
  border-radius: var(--app-radius-pill);
  color: var(--app-text-muted);
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  line-height: 22px;
  margin-inline-end: -8px;
  padding: 0 8px;
}

/* 3 Docked bar: a square, full-width bar docked above the pinned action, a tone rule on the
   start edge; several form one tray split by hairlines. */
.xt--v3 .xt-toast {
  background: var(--app-group-fill);
  border-block: 1px solid var(--app-border);
  border-inline-start: 3px solid var(--tone);
  min-height: 52px;
  padding-inline: 13px 8px;
}
.xt--v3 .xt-toast--neutral {
  border-inline-start-color: var(--app-border-strong);
}
.xt--v3 .xt-toast:has(.xt-desc) {
  padding-block: 8px;
}
.xt--v3 .xt-stack {
  gap: 0;
  inset-inline: 0;
}
.xt--v3 .xt-stack .xt-toast + .xt-toast {
  border-top: 0;
}
.xt--v3 .xt-action {
  color: var(--q-primary);
}

/* 4 Quiet line: no container, a centred line of text with a tone dot, just above the
   action; older lines fade as newer ones arrive beneath them. */
.xt--v4 .xt-items {
  gap: 4px;
}
.xt--v4 .xt-toast {
  gap: 8px;
  justify-content: center;
  min-height: 36px;
}
.xt--v4 .xt-body {
  flex: 0 1 auto;
}
.xt--v4 .xt-toast:has(.xt-desc) {
  align-items: flex-start;
}
.xt--v4 .xt-toast:has(.xt-desc) .xt-dot {
  margin-top: 6px;
}
.xt--v4 .xt-dot {
  background: var(--tone);
  border-radius: 50%;
  flex-shrink: 0;
  height: 7px;
  width: 7px;
}
.xt--v4 .xt-toast--neutral .xt-dot {
  background: var(--app-text-subtle);
}
.xt--v4 .xt-action {
  margin-inline-start: -6px;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.xt--v4 .xt-stack {
  gap: 0;
}
.xt--v4 .xt-stack .xt-toast:nth-last-child(2) {
  opacity: 0.55;
}
.xt--v4 .xt-stack .xt-toast:nth-last-child(3) {
  opacity: 0.28;
}

/* 5 Icon disc card: the app's icon-circle language in a filled card with a dismiss; several
   at once merge into one summary card. */
.xt--v5 .xt-toast {
  background: var(--app-group-fill);
  border: 1px solid var(--app-group-edge);
  border-radius: var(--app-radius-xl);
  gap: 12px;
  padding: 10px 6px 10px 10px;
  padding-inline: 10px 6px;
}
.xt--v5 .xt-disc {
  height: 36px;
  width: 36px;
}
.xt--v5 .xt-disc--count {
  font-size: 15px;
  font-weight: 600;
}

/* 6 Tone tint: the tone washes the whole card, no shadow, ink text; several collapse
   into a deck, the newest in front and the older ones' tinted edges showing above it. */
.xt--v6 .xt-toast {
  background: color-mix(in srgb, var(--tone) 14%, var(--app-surface));
  border: 1px solid color-mix(in srgb, var(--tone) 30%, transparent);
  border-radius: var(--app-radius-lg);
  min-height: 48px;
  padding-inline: 14px 4px;
}
.xt--v6 .xt-toast--neutral {
  background: color-mix(in srgb, var(--app-text) 7%, var(--app-surface));
  border-color: var(--app-border);
}
.xt--v6 .xt-toast:has(.xt-desc) {
  padding-block: 8px;
}
.xt--v6 .xt-desc {
  color: color-mix(in srgb, var(--app-text) 78%, transparent);
}
.xt--v6 .xt-stack {
  height: 48px;
}
.xt--v6 .xt-stack .xt-toast {
  bottom: 0;
  inset-inline: 0;
  position: absolute;
  z-index: 3;
}
.xt--v6 .xt-stack .xt-toast:nth-last-child(2) {
  transform: translateY(-10px) scale(0.95);
  z-index: 2;
}
.xt--v6 .xt-stack .xt-toast:nth-last-child(3) {
  transform: translateY(-20px) scale(0.9);
  z-index: 1;
}

/* 7 Countdown line: a flat card with no icon; a thin tone line along the bottom edge shrinks
   as the toast times out, so each one shows how long it stays. */
.xt--v7 .xt-toast {
  background: var(--app-group-fill);
  border: 1px solid var(--app-group-edge);
  border-radius: var(--app-radius-lg);
  min-height: 48px;
  overflow: hidden;
  padding-inline: 16px 4px;
}
.xt--v7 .xt-toast:has(.xt-desc) {
  padding-block: 8px 14px;
}
.xt--v7 .xt-track {
  background: var(--app-tint-strong);
  border-radius: var(--app-radius-pill);
  bottom: 7px;
  height: 2px;
  inset-inline: 16px;
  position: absolute;
}
.xt--v7 .xt-timer {
  background: var(--tone);
  border-radius: inherit;
  display: block;
  height: 100%;
}
.xt--v7 .xt-toast--neutral .xt-timer {
  background: var(--app-text);
}
.xt--v7 .xt-stack {
  gap: 6px;
}
</style>
