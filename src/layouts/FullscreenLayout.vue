<template>
  <q-layout view="lHh Lpr lFf">
    <FullscreenHeader />
    <q-page-container>
      <router-view v-slot="{ Component }">
        <transition :name="transitionName" mode="out-in">
          <component :is="Component" :key="$route.path" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import FullscreenHeader from "components/FullscreenHeader.vue";

const pathDepth = (path: string) =>
  path.split("/").filter((segment) => segment.length > 0).length;

export default defineComponent({
  name: "FullscreenLayout",
  mixins: [windowMixin],
  components: {
    FullscreenHeader,
  },
  data() {
    return {
      transitionName: "page-fade",
    };
  },
  watch: {
    $route(to, from) {
      const toDepth = pathDepth(to.path);
      const fromDepth = pathDepth(from.path);
      if (toDepth > fromDepth) {
        this.transitionName = "page-slide-left";
      } else if (toDepth < fromDepth) {
        this.transitionName = "page-slide-right";
      } else {
        this.transitionName = "page-fade";
      }
    },
  },
});
</script>

<style>
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
</style>
