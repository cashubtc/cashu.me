<template>
  <div class="row items-center">
    <q-avatar :size="avatarSize" class="q-mr-sm">
      <transition name="mint-icon" mode="out-in">
        <q-spinner
          v-if="loading"
          key="loading"
          color="grey-5"
          :size="fallbackIconSize"
        />
        <q-img
          v-else-if="iconUrl"
          key="icon"
          :src="iconUrl"
          spinner-color="white"
          spinner-size="xs"
          :style="`height: ${avatarSize}; max-width: ${avatarSize}; font-size: 12px;`"
        >
          <template v-slot:error>
            <div
              class="row items-center justify-center"
              style="height: 100%; width: 100%; padding: 0px"
            >
              <q-icon
                name="account_balance"
                color="grey-7"
                :size="fallbackIconSize"
              />
            </div>
          </template>
        </q-img>
        <q-icon
          v-else
          key="fallback"
          name="account_balance"
          color="grey-7"
          :size="fallbackIconSize"
        />
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
  computed: {
    fallbackIconSize(): string {
      // pick a slightly smaller icon inside the avatar
      const n = parseInt(String(this.avatarSize).replace(/px$/, "")) || 34;
      return Math.max(16, Math.floor(n * 0.6)) + "px";
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

/* Smooth cross-fade between loading spinner, icon and fallback icon */
.mint-icon-enter-active,
.mint-icon-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.mint-icon-enter-from,
.mint-icon-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
