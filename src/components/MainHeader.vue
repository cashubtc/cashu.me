<template>
  <q-header class="bg-transparent">
    <q-toolbar class="app-toolbar">
      <IconButton
        :label="$t('common.settings')"
        @click="goToSettings"
        :disable="uiStore.globalMutexLock"
      >
        <MenuIcon :size="24" />
      </IconButton>
      <q-toolbar-title></q-toolbar-title>
      <transition
        appear
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <AppBadge v-if="g.offline" tone="danger" class="q-mr-sm">
          <span>{{ $t("MainHeader.offline.warning.text") }}</span>
        </AppBadge>
      </transition>
      <AppBadge v-if="isStaging()" tone="warning" class="q-mr-sm">
        <span>{{ $t("MainHeader.staging.warning.text") }}</span>
      </AppBadge>
      <transition-group appear enter-active-class="animated pulse">
        <AppBadge
          v-if="countdown > 0"
          key="reload"
          tag="button"
          tone="danger"
          class="q-mr-sm"
          @click="reload"
        >
          {{ $t("MainHeader.reload.warning.text", { countdown }) }}
          <PendingDots size="14px" />
        </AppBadge>
      </transition-group>
      <IconButton
        :class="countdown > 0 ? 'text-negative' : ''"
        :label="$t('common.refresh')"
        @click="reload"
        :disable="uiStore.globalMutexLock && countdown === 0"
      >
        <XIcon v-if="countdown > 0" :size="20" />
        <RefreshCwIcon v-else :size="20" />
      </IconButton>
    </q-toolbar>
  </q-header>
</template>

<script lang="ts">
import IconButton from "src/components/ui/IconButton.vue";
import AppBadge from "src/components/ui/AppBadge.vue";
import PendingDots from "src/components/ui/PendingDots.vue";
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
  components: {
    PendingDots,
    IconButton,
    AppBadge,
    MenuIcon,
    RefreshCwIcon,
    XIcon,
  },
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
  /* clip, not hidden: hidden made the header a scroll box that cut 1px off the top and
     bottom of its buttons' focus rings (hover audit F6). */
  overflow-x: clip;
}

.q-toolbar {
  flex-wrap: nowrap;
  min-height: 50px; /* Ensure consistent height */
}

.q-toolbar-title {
  flex: 0 1 auto; /* Allow title to shrink */
}
</style>
