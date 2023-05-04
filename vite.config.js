// ~~/vite.config.js

// imports
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";
import electron from "vite-plugin-electron";
import jsconfigPaths from "vite-jsconfig-paths";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";
import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [
    process.env.BUILD_TARGET == "electron"
      ? electron({
          entry: "electron/main.js",
          vite: { build: { outDir: "dist" } },
        })
      : void 0,
    process.env.BUILD_TARGET == "pwa"
      ? VitePWA({
          manifest: {
            name: "Cashu",
            short_name: "Cashu",
            description: "Cashu Wallet",
            display: "standalone",
            orientation: "portrait",
            background_color: "#12091f",
            theme_color: "#12091f",
            protocol_handlers: [
              {
                protocol: "web+cashu",
                url: "/?token=%s",
              },
              {
                protocol: "web+lightning",
                url: "/?lightning=%s",
              },
            ],
            icons: [
              {
                src: "icons/icon-128x128.png",
                sizes: "128x128",
                type: "image/png",
              },
              {
                src: "icons/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
              },
              {
                src: "icons/icon-256x256.png",
                sizes: "256x256",
                type: "image/png",
              },
              {
                src: "icons/icon-384x384.png",
                sizes: "384x384",
                type: "image/png",
              },
              {
                src: "icons/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
              },
            ],
          },
        })
      : void 0,
    vue({
      template: transformAssetUrls,
    }),
    quasar({
      sassVariables: "src/assets/css/quasar.variables.scss",
    }),
    jsconfigPaths(),
  ],
  preview: { port: 3000 },
  resolve: {
    alias: {
      assets: fileURLToPath(new URL("./src/assets", import.meta.url)),
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
