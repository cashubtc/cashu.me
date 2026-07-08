<template>
  <router-view v-slot="{ Component }">
    <transition name="layout-fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
});
</script>

<style>
.layout-fade-enter-active,
.layout-fade-leave-active {
  transition: opacity 0.15s ease;
}

.layout-fade-enter-from,
.layout-fade-leave-to {
  opacity: 0;
}
</style>
