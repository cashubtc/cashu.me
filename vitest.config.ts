// vitest.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'  // if you’re using Quasar

export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    quasar()
  ],
  test: {
    globals: true,                      // allow `describe`/`it` without imports
    environment: 'happy-dom',           // provides window, document, indexedDB, etc.
    setupFiles: ['test/vitest/setup-file.js'],  // loads fake-indexeddb & init Pinia
    coverage: { reporter: ['text', 'lcov'] }
  }
})
