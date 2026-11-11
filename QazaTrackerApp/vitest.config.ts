import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // mirror the "@/*" tsconfig paths so store/data modules resolve in tests
      "@": path.resolve(process.cwd(), "src"),
    },
  },
  test: {
    globals: true,
    include: ["src/**/__tests__/**/*.test.ts"],
  },
});
