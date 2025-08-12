import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["__never__/**/*.spec.ts"],
    passWithNoTests: true,
    environment: "jsdom",
  },
});
