import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "region-kit",
    environment: "node",
    include: ["test/**/*.test.ts", "src/**/*.test.ts"],
  },
});
