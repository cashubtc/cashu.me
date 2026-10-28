<template>
  <div class="row items-center">
    <q-skeleton
      v-if="skeleton"
      type="QAvatar"
      :size="avatarSize"
      class="q-mr-md"
    />
    <q-avatar v-else :size="avatarSize" class="q-mr-md mint-avatar">
      <q-img
        v-if="iconUrl && !imgError"
        :src="iconUrl"
        :style="`height: ${avatarSize}; max-width: ${avatarSize}; font-size: 12px;`"
        @load="imgLoaded = true"
        @error="imgError = true"
      >
        <!-- suppress the default inner spinner; the overlay spinner below
             already covers the image download -->
        <template v-slot:loading />
      </q-img>
      <LandmarkIcon
        v-else-if="!loading || imgError"
        :size="fallbackIconSize"
        class="mint-avatar-fallback text-app-muted mint-glyph"
      />
      <!-- Single spinner for the whole network chain: mint info fetch
           and icon image download. The transition wraps a plain div on
           purpose: transitioning a q-spinner directly breaks Vue's
           transition timing because of its infinite CSS animation. -->
      <transition name="mint-avatar-fade">
        <div v-if="showSpinner" class="mint-avatar-spinner">
          <PendingDots :size="fallbackIconSize" />
        </div>
      </transition>
    </q-avatar>

    <div class="mint-info-container">
      <!-- While the mint's info loads, a placeholder holds the name line and the host stays on
           its own line, so the card keeps one height and the title fills in instead of changing. -->
      <template v-if="skeleton">
        <div class="mint-name"><q-skeleton type="text" width="96px" /></div>
        <div class="mint-url"><q-skeleton type="text" width="140px" /></div>
      </template>
      <div v-else-if="loading && !name" class="mint-name">
        <q-skeleton type="text" width="96px" />
      </div>
      <!-- Every mint has the same two lines in lists that pass unnamedLabel: a mint without
           its own name takes its host as the title (in the normal colour, so it never reads
           as disabled) over a muted "unnamed" line. -->
      <div v-else class="mint-name">{{ name || host }}</div>
      <div
        v-if="
          !skeleton &&
          ((loading && !name) ||
            (name && name !== host) ||
            (unnamedLabel && (!name || name === host)))
        "
        class="mint-url"
      >
        {{
          (loading && !name) || (name && name !== host) ? host : unnamedLabel
        }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import PendingDots from "src/components/ui/PendingDots.vue";
import { Landmark as LandmarkIcon } from "lucide-vue-next";
import { defineComponent } from "vue";

export default defineComponent({
  name: "MintInfoContainer",
  components: { PendingDots, LandmarkIcon },
  props: {
    url: { type: String, default: "" },
    name: { type: String, required: false },
    iconUrl: { type: String, required: false },
    avatarSize: { type: String, default: "34px" },
    loading: { type: Boolean, default: false },
    unnamedLabel: { type: String, default: "" },
    /** A placeholder in the same boxes: avatar, name line and host line. */
    skeleton: { type: Boolean, default: false },
  },
  data() {
    return {
      imgLoaded: false,
      imgError: false,
    };
  },
  computed: {
    host(): string {
      return this.url.replace(/^https?:\/\//, "");
    },
    fallbackIconSize(): string {
      // pick a slightly smaller icon inside the avatar
      const n = parseInt(String(this.avatarSize).replace(/px$/, "")) || 34;
      return Math.max(16, Math.floor(n * 0.6)) + "px";
    },
    // The spinner represents the full network delay: while the mint info
    // is being fetched (loading) and while the icon image is downloading.
    showSpinner(): boolean {
      return (
        this.loading || (!!this.iconUrl && !this.imgLoaded && !this.imgError)
      );
    },
  },
  watch: {
    iconUrl() {
      this.imgLoaded = false;
      this.imgError = false;
    },
  },
});
</script>

<style scoped>
.mint-avatar {
  background: var(--app-tint-strong);
}

/* Self-contained styles (mirrors src/css/mintlist.css) so this component
   renders correctly even when that global stylesheet is not loaded. */
.mint-info-container {
  display: flex;
  flex-direction: column;
  min-width: 0;
  /* This is crucial for text wrapping */
  flex: 1;
}

.mint-name {
  text-align: start;
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
  white-space: normal;
  max-width: 100%;
}

.mint-url {
  text-align: start;
  font-size: 13px;
  line-height: 18px;
  color: var(--app-text-muted);
  margin-top: 4px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-all;
  /* For URLs, break-all is better */
  white-space: normal;
  max-width: 100%;
}

/* Avatar states */
.mint-avatar {
  position: relative;
}

.mint-avatar-fallback {
  animation: mint-avatar-fade-in 0.3s ease;
}

.mint-avatar-spinner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Fade for the spinner overlay */
.mint-avatar-fade-enter-active,
.mint-avatar-fade-leave-active {
  transition: opacity 0.3s ease;
}

.mint-avatar-fade-enter-from,
.mint-avatar-fade-leave-to {
  opacity: 0;
}

@keyframes mint-avatar-fade-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
