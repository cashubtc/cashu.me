<template>
  <div class="row items-center">
    <q-avatar :size="avatarSize" class="q-mr-sm mint-avatar">
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
      <q-icon
        v-else-if="!loading || imgError"
        name="account_balance"
        color="grey-7"
        :size="fallbackIconSize"
        class="mint-avatar-fallback"
      />
      <!-- Single spinner for the whole network chain: mint info fetch
           and icon image download. The transition wraps a plain div on
           purpose: transitioning a q-spinner directly breaks Vue's
           transition timing because of its infinite CSS animation. -->
      <transition name="mint-avatar-fade">
        <div v-if="showSpinner" class="mint-avatar-spinner">
          <q-spinner color="grey-5" :size="fallbackIconSize" />
        </div>
      </transition>
    </q-avatar>

    <div class="mint-info-container">
      <div v-if="name" class="mint-name">{{ name }}</div>
      <div class="text-grey-6 mint-url">{{ url }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "MintInfoContainer",
  props: {
    url: { type: String, required: true },
    name: { type: String, required: false },
    iconUrl: { type: String, required: false },
    avatarSize: { type: String, default: "34px" },
    loading: { type: Boolean, default: false },
  },
  data() {
    return {
      imgLoaded: false,
      imgError: false,
    };
  },
  computed: {
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
  text-align: left;
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
  text-align: left;
  font-size: 12px;
  line-height: 16px;
  font-family: monospace !important;
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
