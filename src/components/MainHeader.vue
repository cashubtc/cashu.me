<template>
  <q-header class="bg-transparent">
    <q-toolbar class="app-toolbar">
      <q-btn
        flat
        dense
        round
        class="app-icon-btn"
        :aria-label="$t('common.settings')"
        @click="goToSettings"
        :disable="uiStore.globalMutexLock"
      >
        <MenuIcon :size="22" />
      </q-btn>
      <q-toolbar-title></q-toolbar-title>
      <transition
        appear
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <span v-if="g.offline" class="app-badge app-badge--danger q-mr-sm">
          <span>{{ $t("MainHeader.offline.warning.text") }}</span>
        </span>
      </transition>
      <span v-if="isStaging()" class="app-badge app-badge--warning q-mr-sm">
        <span>{{ $t("MainHeader.staging.warning.text") }}</span>
      </span>
      <transition-group appear enter-active-class="animated pulse">
        <button
          v-if="countdown > 0"
          key="reload"
          type="button"
          class="app-badge app-badge--danger q-mr-sm"
          @click="reload"
        >
          {{ $t("MainHeader.reload.warning.text", { countdown }) }}
          <q-spinner size="12px" :thickness="6" />
        </button>
      </transition-group>
      <q-btn
        flat
        dense
        round
        class="app-icon-btn"
        :class="countdown > 0 ? 'text-negative' : ''"
        :aria-label="$t('common.refresh')"
        @click="reload"
        :disable="uiStore.globalMutexLock && countdown === 0"
      >
        <XIcon v-if="countdown > 0" :size="20" />
        <RefreshCwIcon v-else :size="20" />
      </q-btn>
    </q-toolbar>
  </q-header>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { useUiStore } from "src/stores/ui";
import {
  Menu as MenuIcon,
  RefreshCw as RefreshCwIcon,
  X as XIcon,
} from "lucide-vue-next";

export default defineComponent({
  name: "MainHeader",
  mixins: [windowMixin],
  components: { MenuIcon, RefreshCwIcon, XIcon },
  setup() {
    const uiStore = useUiStore();
    const router = useRouter();
    const countdown = ref(0);
    let countdownInterval;

    const goToSettings = () => {
      router.push("/settings");
    };

    const isStaging = () => {
      return location.host.includes("staging");
    };

    const reload = () => {
      if (countdown.value > 0) {
        uiStore.unlockMutex();
        clearInterval(countdownInterval);
        countdown.value = 0;
        return;
      }
      if (uiStore.globalMutexLock) return;
      uiStore.lockMutex();
      countdown.value = 3;
      countdownInterval = setInterval(() => {
        countdown.value--;
        if (countdown.value === 0) {
          clearInterval(countdownInterval);
          uiStore.unlockMutex();
          location.reload();
        }
      }, 1000);
    };

    return {
      goToSettings,
      isStaging,
      reload,
      countdown,
      uiStore,
    };
  },
});
</script>

<style scoped>
.q-header {
  position: relative;
  z-index: auto;
  overflow-x: hidden;
}

.q-toolbar {
  flex-wrap: nowrap;
  min-height: 50px; /* Ensure consistent height */
}

.q-toolbar-title {
  flex: 0 1 auto; /* Allow title to shrink */
}
</style>
