import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    projects: ["packages/*/vitest.config.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "coverage",
      include: ["packages/*/src/**/*.ts"],
      thresholds: {
        lines: 85,
        functions: 85,
        statements: 85,
        branches: 85,
      },
    },
  },
});
