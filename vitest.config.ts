import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["packages/*", "apps/bot"],
    passWithNoTests: true,
  },
});
