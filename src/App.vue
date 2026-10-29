<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from "vue";

// No layout-level transition: FullscreenLayout owns the page transition (on a native wrapper);
// a second out-in handshake around whole layouts only adds a way for Back to land on an empty
// placeholder (owner item 17).
export default defineComponent({
  name: "App",
  mounted() {
    const splash = document.getElementById("app-splash");
    if (!splash) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        splash.classList.add("app-splash-fade");
        window.setTimeout(() => splash.remove(), 500);
      });
    });
  },
});
</script>
