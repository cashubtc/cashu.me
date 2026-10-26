<template>
  <q-header class="bg-transparent">
    <q-toolbar class="main-toolbar">
      <q-btn
        flat
        dense
        round
        class="main-toolbar-btn"
        aria-label="Settings"
        @click="goToSettings"
        :disable="uiStore.globalMutexLock"
      >
        <MenuIcon :size="22" />
      </q-btn>
      <q-toolbar-title></q-toolbar-title>
      <transition
        appear
        enter-active-class="animated wobble"
        leave-active-class="animated fadeOut"
      >
        <q-badge
          v-if="g.offline"
          color="red"
          text-color="black"
          class="q-mr-sm"
        >
          <span>{{ $t("MainHeader.offline.warning.text") }}</span>
        </q-badge>
      </transition>
      <q-badge
        v-if="isStaging()"
        color="yellow"
        text-color="black"
        class="q-mr-sm"
      >
        <span>{{ $t("MainHeader.staging.warning.text") }}</span>
      </q-badge>
      <!-- <q-badge color="yellow" text-color="black" class="q-mr-sm">
        <span v-if="!isStaging()">Beta</span>
        <span v-else>Staging – don't use with real funds!</span>
      </q-badge> -->
      <transition-group appear enter-active-class="animated pulse">
        <q-badge
          v-if="countdown > 0"
          color="negative"
          text-color="white"
          class="q-mr-sm"
          @click="reload"
        >
          {{ $t("MainHeader.reload.warning.text", { countdown }) }}
          <q-spinner
            v-if="countdown > 0"
            size="0.8em"
            :thickness="10"
            class="q-ml-sm"
            color="white"
          />
        </q-badge>
      </transition-group>
      <q-btn
        flat
        dense
        round
        class="main-toolbar-btn"
        :class="countdown > 0 ? 'text-negative' : ''"
        aria-label="Refresh"
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
/* Keep header controls over the wallet column on wide screens. */
.main-toolbar {
  margin: 0 auto;
  max-width: 560px;
  padding: 0 5px;
}

.main-toolbar-btn {
  color: var(--app-text);
  height: 44px;
  width: 44px;
}

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

/* Make badges container handle overflow properly */
.q-toolbar > .q-badge {
  flex-shrink: 0;
}
</style>
