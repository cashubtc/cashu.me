import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";
import jsconfigPaths from "./vitest-jsconfig-paths";
import path from "path";

export default defineConfig({
  build: {
    target: "esnext",
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
    },
  },
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./test/vitest/setup-file.js"],
    exclude: [
      "src/lib/cashu-ts/test/integration.test.ts",
      "src/lib/cashu-ts/test/auth.test.ts",
    ],
    include: [
      "src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "test/creatorSubscribers-page.spec.ts",
      "test/vitest/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],
  },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        src: path.resolve(__dirname, "src"),
        app: path.resolve(__dirname),
        components: path.resolve(__dirname, "src/components"),
      layouts: path.resolve(__dirname, "src/layouts"),
      pages: path.resolve(__dirname, "src/pages"),
      assets: path.resolve(__dirname, "src/assets"),
      boot: path.resolve(__dirname, "src/boot"),
      stores: path.resolve(__dirname, "src/stores"),
      "@cashu/cashu-ts": path.resolve(__dirname, "src/lib/cashu-ts/src/index.ts"),
    },
  },
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    quasar({
      sassVariables: "src/quasar-variables.scss",
    }),
    jsconfigPaths(),
  ],
});
