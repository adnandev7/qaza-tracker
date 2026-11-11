import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["src/engine/__tests__/**/*.test.ts"],
  },
});
