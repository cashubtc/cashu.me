import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/embed/index.ts"),
      name: "CashuPayEmbed",
      formats: ["iife"],
      fileName: () => "embed.js",
    },
    outDir: "public",
    emptyOutDir: false,
  },
});
