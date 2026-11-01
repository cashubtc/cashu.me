<template>
  <!-- Reka primitives (menus) mirror placement and arrow keys with the locale's direction. -->
  <ConfigProvider :dir="dir">
    <router-view />
    <!-- Every toast (src/js/notify.ts): Sonner as on kelbie.dev, top-centre, our icons and tokens.
         On a phone it starts under the 56px header, clear of its back and close buttons. -->
    <Toaster
      position="top-center"
      :theme="$q.dark.isActive ? 'dark' : 'light'"
      :dir="dir"
      :offset="{ top: 'calc(16px + env(safe-area-inset-top))' }"
      :mobile-offset="{ top: 'calc(60px + env(safe-area-inset-top))' }"
      :container-aria-label="$t('global.notifications')"
    >
      <template #success-icon><CircleCheckIcon :size="16" /></template>
      <template #error-icon><CircleAlertIcon :size="16" /></template>
      <template #warning-icon><TriangleAlertIcon :size="16" /></template>
      <template #info-icon><InfoIcon :size="16" /></template>
    </Toaster>
  </ConfigProvider>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ConfigProvider } from "reka-ui";
import { Toaster } from "vue-sonner";
import "vue-sonner/style.css";
// The callout's glyph for each tone, so a toast and a callout say it the same way.
import {
  CircleAlert as CircleAlertIcon,
  CircleCheck as CircleCheckIcon,
  Info as InfoIcon,
  TriangleAlert as TriangleAlertIcon,
} from "lucide-vue-next";
import { localeDir } from "src/boot/i18n";

// No layout-level transition: FullscreenLayout owns the page transition (on a native wrapper);
// a second out-in handshake around whole layouts only adds a way for Back to land on an empty
// placeholder (owner item 17).
export default defineComponent({
  name: "App",
  components: {
    ConfigProvider,
    Toaster,
    CircleAlertIcon,
    CircleCheckIcon,
    InfoIcon,
    TriangleAlertIcon,
  },
  computed: {
    dir(): "ltr" | "rtl" {
      return localeDir(this.$i18n.locale);
    },
  },
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
