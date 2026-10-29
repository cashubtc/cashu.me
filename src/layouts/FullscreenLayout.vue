<template>
  <q-layout view="lHh Lpr lFf">
    <FullscreenHeader />
    <q-page-container>
      <!-- The transition animates a native wrapper, never the page component itself: a page whose
           template compiles to a fragment (a leading comment in dev builds) never finishes its
           out-in leave, so Back used to land on the empty placeholder (owner item 17). -->
      <router-view v-slot="{ Component, route }">
        <transition :name="transitionName" mode="out-in">
          <div
            v-if="Component"
            :key="route.path"
            class="fullscreen-route"
            data-testid="fullscreen-route"
            :data-route-path="route.path"
          >
            <component :is="Component" />
          </div>
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import FullscreenHeader from "src/components/FullscreenHeader.vue";

const historyPosition = () =>
  typeof window.history.state?.position === "number"
    ? window.history.state.position
    : null;

export default defineComponent({
  name: "FullscreenLayout",
  mixins: [windowMixin],
  components: {
    FullscreenHeader,
  },
  data() {
    return {
      transitionName: "page-fade",
      lastHistoryPosition: historyPosition(),
    };
  },
  watch: {
    $route() {
      const position = historyPosition();
      if (position === null || this.lastHistoryPosition === null) {
        this.transitionName = "page-fade";
      } else if (position > this.lastHistoryPosition) {
        this.transitionName = "page-slide-left";
      } else if (position < this.lastHistoryPosition) {
        this.transitionName = "page-slide-right";
      } else {
        this.transitionName = "page-fade";
      }
      this.lastHistoryPosition = position;
    },
  },
});
</script>

<style>
.fullscreen-route {
  min-width: 0;
  width: 100%;
}

.page-slide-left-enter-active,
.page-slide-left-leave-active,
.page-slide-right-enter-active,
.page-slide-right-leave-active,
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.page-slide-left-enter-from {
  opacity: 0;
  transform: translateX(16px);
}

.page-slide-left-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

.page-slide-right-enter-from {
  opacity: 0;
  transform: translateX(-16px);
}

.page-slide-right-leave-to {
  opacity: 0;
  transform: translateX(16px);
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .page-slide-left-enter-active,
  .page-slide-left-leave-active,
  .page-slide-right-enter-active,
  .page-slide-right-leave-active,
  .page-fade-enter-active,
  .page-fade-leave-active {
    transition: none;
  }

  .page-slide-left-enter-from,
  .page-slide-left-leave-to,
  .page-slide-right-enter-from,
  .page-slide-right-leave-to,
  .page-fade-enter-from,
  .page-fade-leave-to {
    opacity: 1;
    transform: none;
  }
}
</style>
