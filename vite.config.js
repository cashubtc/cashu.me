// ~~/vite.config.js

// imports
import { defineConfig } from "vite";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";
import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [
    vue({
      template: transformAssetUrls,
    }),
    quasar({
      sassVariables: "src/css/quasar.variables.scss",
    }),
  ],
  preview: { port: 8080 },
  resolve: {
    alias: {
      boot: fileURLToPath(new URL("./src/boot", import.meta.url)),
      components: fileURLToPath(new URL("./src/components", import.meta.url)),
      js: fileURLToPath(new URL("./src/js", import.meta.url)),
      layouts: fileURLToPath(new URL("./src/layouts", import.meta.url)),
      pages: fileURLToPath(new URL("./src/pages", import.meta.url)),
      stores: fileURLToPath(new URL("./src/stores", import.meta.url)),
    },
  },
  server: { port: 8080 },
  ssr: false,
});
