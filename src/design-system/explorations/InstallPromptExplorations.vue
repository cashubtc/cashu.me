<!-- Install prompt explorations for the design system board: seven whole alternative designs
     (1-7) for the "add to home screen" prompt; the board renders the current PwaPrompt (0).
     Each variation shows the same specimen twice, in a small phone frame: Safari on iPhone
     (no install API, so the prompt teaches Share > Add to Home Screen) and Chrome on Android
     (a real Install button). The frame draws the browser's own bars and a hint of the wallet
     so the prompt's placement reads. Board-only; built from the shared tokens only. -->
<template>
  <div class="xi" :class="`xi--v${variant}`">
    <div v-for="p in platforms" :key="p" class="xi-device">
      <div class="xi-device__label">
        {{ p === "ios" ? "iPhone, Safari" : "Android, Chrome" }}
      </div>
      <div class="xi-phone" :class="`xi-phone--${p}`">
        <!-- Chrome's address bar (Android) -->
        <div
          v-if="p === 'android'"
          class="xi-bar xi-bar--top"
          aria-hidden="true"
        >
          <div class="xi-url"><LockIcon :size="12" /> cashu.me</div>
          <span
            class="xi-bar__btn"
            :class="{ 'xi-bar__btn--lit': variant === 4 && isOpen(p) }"
          >
            <EllipsisVerticalIcon :size="18" />
          </span>
        </div>

        <div class="xi-screen">
          <!-- 2: an in-flow banner above the wallet, pushing it down -->
          <div v-if="variant === 2 && isOpen(p)" class="xi-banner">
            <q-btn
              flat
              round
              class="xi-close"
              aria-label="Dismiss"
              @click="close(p)"
            >
              <XIcon :size="16" />
            </q-btn>
            <img :src="appIcon" alt="" class="xi-appicon xi-appicon--sm" />
            <div class="xi-banner__text">
              <div class="xi-title">Cashu.me</div>
              <div v-if="p === 'ios'" class="xi-sub xi-inline">
                Tap
                <span class="xi-key"><ShareIcon :size="14" /></span>
                then Add to Home Screen
              </div>
              <div v-else class="xi-sub">Opens full screen, like an app</div>
            </div>
            <q-btn
              v-if="p === 'android'"
              rounded
              unelevated
              no-caps
              color="primary"
              class="xi-btn xi-btn--compact"
              label="Install"
            />
          </div>

          <!-- 6: a full page in place of the wallet -->
          <div v-if="variant === 6 && isOpen(p)" class="xi-page">
            <q-btn
              flat
              round
              class="xi-close xi-page__close"
              aria-label="Close"
              @click="close(p)"
            >
              <XIcon :size="18" />
            </q-btn>
            <img :src="appIcon" alt="" class="xi-appicon xi-appicon--lg" />
            <div class="xi-page__title">Install Cashu.me</div>
            <div class="xi-sub xi-page__text">
              Opens from your home screen, without the browser bar.
            </div>
            <ol v-if="p === 'ios'" class="xi-steps xi-steps--card">
              <li v-for="(s, i) in iosSteps" :key="s.label" class="xi-step">
                <span class="xi-num">{{ i + 1 }}</span>
                <span class="xi-step__text">
                  {{ s.verb }} <strong>{{ s.label }}</strong>
                </span>
                <span class="xi-key"
                  ><component :is="s.icon" :size="14"
                /></span>
              </li>
            </ol>
            <q-btn
              v-else
              rounded
              unelevated
              no-caps
              color="primary"
              class="xi-btn full-width"
              label="Install"
            />
            <q-btn
              v-if="p === 'android'"
              flat
              rounded
              no-caps
              class="xi-btn xi-btn--quiet"
              label="Continue in browser"
              @click="close(p)"
            />
          </div>

          <!-- the wallet behind every prompt -->
          <div v-else class="xi-wallet" aria-hidden="true">
            <div class="xi-wallet__mint">mint.example.com</div>
            <div class="xi-wallet__amount">₿2,500</div>
            <div class="xi-wallet__actions">
              <span>Receive</span>
              <span>Send</span>
            </div>
          </div>

          <!-- 3: an inline card in the wallet -->
          <div v-if="variant === 3 && isOpen(p)" class="xi-card">
            <div class="xi-card__head">
              <span class="xi-disc"><SmartphoneIcon :size="18" /></span>
              <div class="xi-card__titles">
                <div class="xi-title">Use Cashu like an app</div>
                <div class="xi-sub">One tap from your home screen.</div>
              </div>
              <q-btn
                flat
                round
                class="xi-close"
                aria-label="Dismiss"
                @click="close(p)"
              >
                <XIcon :size="16" />
              </q-btn>
            </div>
            <div v-if="p === 'ios'" class="xi-path">
              <span class="xi-path__step">
                <ShareIcon :size="14" /> Share
              </span>
              <ChevronRightIcon :size="14" class="xi-path__sep" />
              <span class="xi-path__step">
                <SquarePlusIcon :size="14" /> Add to Home Screen
              </span>
            </div>
            <div v-else class="xi-card__actions">
              <q-btn
                rounded
                unelevated
                no-caps
                color="primary"
                class="xi-btn xi-btn--compact"
                label="Install"
              />
              <q-btn
                flat
                rounded
                no-caps
                class="xi-btn xi-btn--compact xi-btn--quiet"
                label="Not now"
                @click="close(p)"
              />
            </div>
          </div>

          <!-- 7: a setup checklist in the wallet, installing is the last task -->
          <div v-if="variant === 7" class="xi-list">
            <div class="xi-list__head">
              <span class="xi-title">Finish setting up</span>
              <span class="xi-sub">{{ doneCount(p) }} of 2</span>
            </div>
            <div class="xi-list__row xi-list__row--done">
              <CircleCheckIcon :size="20" class="xi-list__mark" />
              Back up your seed phrase
            </div>
            <div
              class="xi-list__row"
              :class="{ 'xi-list__row--done': !isOpen(p) }"
            >
              <CircleCheckIcon
                v-if="!isOpen(p)"
                :size="20"
                class="xi-list__mark"
              />
              <CircleIcon v-else :size="20" class="xi-list__mark" />
              <div class="xi-list__body">
                <div>Add to home screen</div>
                <template v-if="isOpen(p)">
                  <div v-if="p === 'ios'" class="xi-sub xi-inline">
                    Tap <span class="xi-key"><ShareIcon :size="14" /></span>
                    then
                    <span class="xi-key"><SquarePlusIcon :size="14" /></span>
                    Add to Home Screen
                  </div>
                  <div class="xi-list__actions">
                    <q-btn
                      v-if="p === 'android'"
                      rounded
                      unelevated
                      no-caps
                      color="primary"
                      class="xi-btn xi-btn--compact"
                      label="Install"
                    />
                    <q-btn
                      flat
                      rounded
                      no-caps
                      class="xi-btn xi-btn--compact xi-btn--quiet"
                      :label="p === 'ios' ? 'Mark as done' : 'Skip'"
                      @click="close(p)"
                    />
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- 1 and 5 dim the wallet; 4 dims it around the highlighted control -->
          <div
            v-if="[1, 4, 5].includes(variant) && isOpen(p)"
            class="xi-scrim"
            @click="close(p)"
          />

          <!-- 1: a bottom sheet with the steps or the Install button -->
          <div v-if="variant === 1 && isOpen(p)" class="xi-sheet">
            <div class="xi-sheet__grip" />
            <div class="xi-sheet__head">
              <img :src="appIcon" alt="" class="xi-appicon" />
              <div class="xi-card__titles">
                <div class="xi-title">Install Cashu.me</div>
                <div class="xi-sub">
                  {{ p === "ios" ? "Two taps in Safari" : "Opens full screen" }}
                </div>
              </div>
              <q-btn
                flat
                round
                class="xi-close"
                aria-label="Close"
                @click="close(p)"
              >
                <XIcon :size="16" />
              </q-btn>
            </div>
            <ol v-if="p === 'ios'" class="xi-steps">
              <li v-for="(s, i) in iosSteps" :key="s.label" class="xi-step">
                <span class="xi-num">{{ i + 1 }}</span>
                <span class="xi-step__text">
                  {{ s.verb }} <strong>{{ s.label }}</strong>
                </span>
                <span class="xi-key"
                  ><component :is="s.icon" :size="14"
                /></span>
              </li>
            </ol>
            <q-btn
              v-else
              rounded
              unelevated
              no-caps
              color="primary"
              class="xi-btn full-width"
              label="Install"
            />
          </div>

          <!-- 4: a coach mark aimed at Share (iPhone) or the browser menu (Android) -->
          <div
            v-if="variant === 4 && isOpen(p)"
            class="xi-tip"
            :class="`xi-tip--${p}`"
            role="dialog"
          >
            <template v-if="p === 'ios'">
              <div class="xi-title">Tap Share below</div>
              <div class="xi-sub xi-inline">
                Then choose
                <span class="xi-key"><SquarePlusIcon :size="14" /></span>
                Add to Home Screen
              </div>
            </template>
            <template v-else>
              <div class="xi-title">Install Cashu.me</div>
              <div class="xi-sub">Later, find Install app in this menu.</div>
            </template>
            <div class="xi-tip__actions">
              <q-btn
                flat
                rounded
                no-caps
                class="xi-btn xi-btn--compact xi-btn--quiet"
                label="Got it"
                @click="close(p)"
              />
              <q-btn
                v-if="p === 'android'"
                rounded
                unelevated
                no-caps
                color="primary"
                class="xi-btn xi-btn--compact"
                label="Install"
              />
            </div>
          </div>

          <!-- 5: a dialog previewing the icon on a home screen -->
          <div v-if="variant === 5 && isOpen(p)" class="xi-dialog">
            <q-btn
              flat
              round
              class="xi-close xi-dialog__close"
              aria-label="Close"
              @click="close(p)"
            >
              <XIcon :size="16" />
            </q-btn>
            <div class="xi-home" aria-hidden="true">
              <span v-for="n in 3" :key="n" class="xi-home__tile" />
              <span class="xi-home__app">
                <img :src="appIcon" alt="" class="xi-appicon" />
                <span class="xi-home__name">Cashu</span>
              </span>
            </div>
            <div class="xi-title">Keep Cashu on your home screen</div>
            <div v-if="p === 'ios'" class="xi-path">
              <span class="xi-path__step">
                <ShareIcon :size="14" /> Share
              </span>
              <ChevronRightIcon :size="14" class="xi-path__sep" />
              <span class="xi-path__step">
                <SquarePlusIcon :size="14" /> Add to Home Screen
              </span>
            </div>
            <q-btn
              v-else
              rounded
              unelevated
              no-caps
              color="primary"
              class="xi-btn full-width"
              label="Install"
            />
          </div>

          <button
            v-if="!isOpen(p) && variant !== 7"
            type="button"
            class="xi-reset"
            @click="reopen(p)"
          >
            Show the prompt again
          </button>
        </div>

        <!-- Safari's toolbar (iPhone); Share sits in the middle -->
        <div
          v-if="p === 'ios'"
          class="xi-bar xi-bar--bottom"
          aria-hidden="true"
        >
          <span class="xi-bar__btn"><ChevronLeftIcon :size="20" /></span>
          <span class="xi-bar__btn"><ChevronRightIcon :size="20" /></span>
          <span
            class="xi-bar__btn"
            :class="{ 'xi-bar__btn--lit': variant === 4 && isOpen(p) }"
          >
            <ShareIcon :size="20" />
          </span>
          <span class="xi-bar__btn"><BookOpenIcon :size="20" /></span>
          <span class="xi-bar__btn"><CopyIcon :size="20" /></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  BookOpen as BookOpenIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Circle as CircleIcon,
  CircleCheck as CircleCheckIcon,
  Copy as CopyIcon,
  EllipsisVertical as EllipsisVerticalIcon,
  Lock as LockIcon,
  Share as ShareIcon,
  Smartphone as SmartphoneIcon,
  SquarePlus as SquarePlusIcon,
  X as XIcon,
} from "lucide-vue-next";

type Platform = "ios" | "android";

export const installPromptVariants = [
  "Current (was: bubble over the browser bar; now ships V1)",
  "Bottom sheet with steps",
  "Slim top banner",
  "Inline wallet card",
  "Coach mark on Share",
  "Home screen preview",
  "Full-screen page",
  "Setup checklist",
];

export default defineComponent({
  name: "InstallPromptExplorations",
  components: {
    BookOpenIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CircleIcon,
    CircleCheckIcon,
    CopyIcon,
    EllipsisVerticalIcon,
    LockIcon,
    ShareIcon,
    SmartphoneIcon,
    SquarePlusIcon,
    XIcon,
  },
  props: {
    variant: { type: Number, default: 0 },
  },
  data() {
    return {
      platforms: ["ios", "android"] as Platform[],
      appIcon: "/icons/apple-icon-180x180.png",
      closed: { ios: false, android: false } as Record<Platform, boolean>,
      iosSteps: [
        { verb: "Tap", label: "Share", icon: ShareIcon },
        { verb: "Choose", label: "Add to Home Screen", icon: SquarePlusIcon },
      ],
    };
  },
  watch: {
    variant() {
      this.closed = { ios: false, android: false };
    },
  },
  methods: {
    isOpen(p: Platform): boolean {
      return !this.closed[p];
    },
    close(p: Platform) {
      this.closed[p] = true;
    },
    reopen(p: Platform) {
      this.closed[p] = false;
    },
    doneCount(p: Platform): number {
      return this.closed[p] ? 2 : 1;
    },
  },
});
</script>

<style scoped>
.xi {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}
.xi-device__label {
  color: var(--app-text-muted);
  font-size: 12px;
  margin-bottom: 6px;
  text-align: center;
}

/* The phone: the wallet on the app surface, the browser's own bars in group fill. */
.xi-phone {
  background: var(--app-surface);
  border: 1px solid var(--app-border-strong);
  border-radius: var(--app-radius-xl);
  color: var(--app-text);
  display: flex;
  flex-direction: column;
  height: 320px;
  margin-inline: auto;
  max-width: 360px;
  overflow: hidden;
  position: relative;
  width: 100%;
}
.xi-bar {
  align-items: center;
  background: var(--app-group-fill);
  color: var(--app-text-muted);
  display: flex;
  flex-shrink: 0;
}
.xi-bar--top {
  border-bottom: 1px solid var(--app-border);
  gap: 4px;
  height: 48px;
  padding-inline: 12px 8px;
}
.xi-bar--bottom {
  border-top: 1px solid var(--app-border);
  height: 48px;
  justify-content: space-around;
  padding-inline: 8px;
}
.xi-url {
  align-items: center;
  background: var(--app-tint);
  border-radius: var(--app-radius-pill);
  display: flex;
  flex: 1;
  font-size: 12px;
  gap: 6px;
  height: 32px;
  padding-inline: 12px;
}
.xi-bar__btn {
  align-items: center;
  border-radius: 50%;
  display: inline-flex;
  height: 40px;
  justify-content: center;
  position: relative;
  width: 40px;
}
.xi-screen {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

/* The wallet behind the prompt: just enough to place it. */
.xi-wallet {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 20px 16px 12px;
}
.xi-wallet__mint {
  color: var(--app-text-muted);
  font-size: 12px;
}
.xi-wallet__amount {
  font-size: 32px;
  font-weight: 600;
  line-height: 1.2;
}
.xi-wallet__actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
.xi-wallet__actions span {
  align-items: center;
  border: 1px solid var(--app-border-strong);
  border-radius: var(--app-radius-pill);
  color: var(--app-text-muted);
  display: inline-flex;
  font-size: 13px;
  height: 36px;
  justify-content: center;
  width: 104px;
}

/* Shared prompt parts */
.xi-title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.35;
}
.xi-sub {
  color: var(--app-text-muted);
  font-size: 13px;
  line-height: 1.4;
}
.xi-inline {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.xi-appicon {
  border-radius: 22%;
  flex-shrink: 0;
  height: 40px;
  width: 40px;
}
.xi-appicon--sm {
  height: 32px;
  width: 32px;
}
.xi-appicon--lg {
  height: 56px;
  width: 56px;
}
/* A small keycap for Safari's own glyphs (Share, Add to Home Screen). */
.xi-key {
  align-items: center;
  background: var(--app-tint);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-sm);
  color: var(--app-text);
  display: inline-flex;
  flex-shrink: 0;
  height: 24px;
  justify-content: center;
  width: 24px;
}
.xi-close {
  color: var(--app-text-muted);
  flex-shrink: 0;
  height: 40px;
  min-height: 40px;
  min-width: 40px;
  width: 40px;
}
.xi-btn {
  font-weight: 600;
  min-height: 44px;
}
.xi-btn--compact {
  min-height: 40px;
  padding-inline: 8px;
}
.xi-btn--quiet {
  color: var(--app-text-muted);
}
.xi-card__titles {
  flex: 1;
  min-width: 0;
}
.xi-disc {
  align-items: center;
  background: var(--app-tint-strong);
  border-radius: 50%;
  color: var(--app-text);
  display: inline-flex;
  flex-shrink: 0;
  height: 36px;
  justify-content: center;
  width: 36px;
}
.xi-steps {
  display: flex;
  flex-direction: column;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
}
.xi-step {
  align-items: center;
  display: flex;
  font-size: 14px;
  gap: 10px;
  min-height: 32px;
}
.xi-step__text {
  flex: 1;
}
.xi-num {
  align-items: center;
  border: 1px solid var(--app-border-strong);
  border-radius: 50%;
  color: var(--app-text-muted);
  display: inline-flex;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  height: 24px;
  justify-content: center;
  width: 24px;
}
/* A one-line path: Share > Add to Home Screen. */
.xi-path {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  font-size: 13px;
  gap: 6px;
}
.xi-path__step {
  align-items: center;
  background: var(--app-tint);
  border-radius: var(--app-radius-pill);
  display: inline-flex;
  gap: 6px;
  height: 30px;
  padding-inline: 10px;
}
.xi-path__sep {
  color: var(--app-text-subtle);
}
.xi-scrim {
  background: color-mix(in srgb, var(--app-surface) 70%, transparent);
  inset: 0;
  position: absolute;
}
.xi-reset {
  background: none;
  border: 0;
  bottom: 8px;
  color: var(--app-text-muted);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  inset-inline: 0;
  min-height: 40px;
  position: absolute;
  text-decoration: underline;
}

/* 1 Bottom sheet: rises from the bottom of the page, numbered steps or one Install button. */
.xi-sheet {
  background: var(--app-raised);
  border-top: 1px solid var(--app-border-strong);
  border-radius: var(--app-radius-xl) var(--app-radius-xl) 0 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  inset-inline: 0;
  padding: 8px 16px 16px;
  position: absolute;
}
.xi-sheet__grip {
  align-self: center;
  background: var(--app-border-strong);
  border-radius: var(--app-radius-pill);
  height: 4px;
  width: 36px;
}
.xi-sheet__head {
  align-items: center;
  display: flex;
  gap: 12px;
}
.xi-sheet__head .xi-close {
  margin-inline-end: -10px;
}

/* 2 Slim top banner: in the page flow, a hairline under it; the wallet moves down. */
.xi-banner {
  align-items: center;
  background: var(--app-group-fill);
  border-bottom: 1px solid var(--app-border);
  display: flex;
  gap: 8px;
  min-height: 60px;
  padding: 8px 12px 8px 2px;
}
.xi-banner__text {
  flex: 1;
  min-width: 0;
}
.xi-banner .xi-title {
  font-size: 13px;
}
.xi-banner .xi-sub {
  font-size: 12px;
}
.xi-banner .xi-key {
  height: 20px;
  width: 20px;
}
.xi--v2 .xi-btn--compact {
  padding-inline: 14px;
}

/* 3 Inline wallet card: a quiet card under the balance, part of the page. */
.xi-card {
  background: var(--app-group-fill);
  border: 1px solid var(--app-group-edge);
  border-radius: var(--app-radius-lg);
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 4px 12px 0;
  padding: 12px 4px 12px 12px;
}
.xi-card__head {
  align-items: flex-start;
  display: flex;
  gap: 12px;
}
.xi-card__head .xi-close {
  margin-top: -8px;
}
.xi--v3 .xi-wallet__actions {
  display: none;
}
.xi--v3 .xi-path {
  gap: 4px;
  margin-inline-end: 8px;
}
.xi--v3 .xi-path__step {
  padding-inline: 8px;
}
.xi-card__actions {
  margin-inline-start: 40px;
}
.xi-card__actions {
  display: flex;
  gap: 4px;
}
.xi--v3 .xi-card__actions .xi-btn--compact:first-child {
  padding-inline: 16px;
}

/* 4 Coach mark: the page dims, the browser's own control is ringed, a bubble points at it. */
.xi--v4 .xi-bar__btn--lit {
  box-shadow: inset 0 0 0 2px var(--q-primary),
    0 0 0 4px color-mix(in srgb, var(--q-primary) 22%, transparent);
  color: var(--app-text);
}
.xi-tip {
  background: var(--app-raised);
  border: 1px solid var(--app-border-strong);
  border-radius: var(--app-radius-lg);
  box-shadow: var(--app-shadow-md);
  display: flex;
  flex-direction: column;
  gap: 4px;
  inset-inline: 24px;
  padding: 12px 14px 4px;
  position: absolute;
}
.xi-tip::after {
  background: var(--app-raised);
  border: 1px solid var(--app-border-strong);
  content: "";
  height: 12px;
  position: absolute;
  transform: rotate(45deg);
  width: 12px;
}
.xi-tip--ios {
  bottom: 14px;
}
.xi-tip--ios::after {
  border-left-color: transparent;
  border-top-color: transparent;
  bottom: -7px;
  inset-inline-start: calc(50% - 6px);
}
.xi-tip--android {
  top: 12px;
  inset-inline-start: 56px;
  inset-inline-end: 8px;
}
.xi-tip--android::after {
  border-bottom-color: transparent;
  border-right-color: transparent;
  inset-inline-end: 14px;
  top: -7px;
}
.xi-tip__actions {
  display: flex;
  gap: 4px;
  margin-top: -2px;
  justify-content: flex-end;
  margin-inline-end: -6px;
}
.xi-tip--android .xi-btn--compact:last-child {
  padding-inline: 16px;
}

/* 5 Home screen preview: a centred dialog showing the icon among other apps. */
.xi-dialog {
  align-items: center;
  background: var(--app-raised);
  border: 1px solid var(--app-border-strong);
  border-radius: var(--app-radius-xl);
  box-shadow: var(--app-shadow-md);
  display: flex;
  flex-direction: column;
  gap: 12px;
  inset-inline: 20px;
  padding: 16px;
  position: absolute;
  text-align: center;
  top: 50%;
  transform: translateY(-50%);
}
.xi-dialog__close {
  inset-inline-end: 4px;
  position: absolute;
  top: 4px;
}
.xi-home {
  align-items: flex-start;
  background: var(--app-tint);
  border-radius: var(--app-radius-lg);
  display: flex;
  gap: 14px;
  justify-content: center;
  padding: 12px 16px 6px;
}
.xi-home__tile {
  background: var(--app-tint-strong);
  border-radius: 22%;
  height: 40px;
  width: 40px;
}
.xi-home__app {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.xi-home__app .xi-appicon {
  box-shadow: 0 0 0 2px var(--q-primary);
}
.xi-home__name {
  font-size: 12px;
}

/* 6 Full-screen page: the prompt is the page, centred like an onboarding slide. */
.xi-page {
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  padding: 16px 24px 4px;
  position: relative;
  text-align: center;
}
.xi-page__close {
  inset-inline-end: 4px;
  position: absolute;
  top: 4px;
}
.xi-page__title {
  font-size: 18px;
  font-weight: 600;
  margin-top: 2px;
}
.xi-page__text {
  margin-bottom: auto;
  max-width: 280px;
}
.xi-steps--card {
  background: var(--app-group-fill);
  border-radius: var(--app-radius-lg);
  padding: 8px 12px;
  text-align: start;
  width: 100%;
}
.xi-phone--ios .xi-page {
  padding-bottom: 12px;
}
.xi--v6 .xi-btn--quiet {
  min-height: 40px;
}

/* 7 Setup checklist: installing is the last setup task, not an interruption. */
.xi--v7 .xi-wallet {
  padding-bottom: 4px;
}
.xi--v7 .xi-wallet__actions {
  display: none;
}
.xi-list {
  background: var(--app-group-fill);
  border: 1px solid var(--app-group-edge);
  border-radius: var(--app-radius-lg);
  margin: 4px 12px 0;
  padding: 4px 0;
}
.xi-list__head {
  align-items: baseline;
  display: flex;
  justify-content: space-between;
  padding: 8px 14px 4px;
}
.xi-list__row {
  align-items: flex-start;
  display: flex;
  font-size: 14px;
  gap: 10px;
  padding: 8px 14px;
}
.xi-list__row + .xi-list__row {
  border-top: 1px solid var(--app-border);
}
.xi-list__mark {
  color: var(--app-text-subtle);
  flex-shrink: 0;
}
.xi-list__row--done {
  color: var(--app-text-muted);
}
.xi-list__row--done .xi-list__mark {
  color: var(--app-success);
}
.xi-list__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
}
.xi-list__body .xi-key {
  height: 22px;
  width: 22px;
}
.xi-list__actions {
  display: flex;
  gap: 4px;
  margin-inline-start: -8px;
}
.xi-list__actions .xi-btn--compact:first-child:not(.xi-btn--quiet) {
  margin-inline-start: 8px;
  padding-inline: 16px;
}
</style>
