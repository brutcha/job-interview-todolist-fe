import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: "./src/test/setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules",
        "src/test/",
        "**/*.test.ts",
        "**/*.test.tsx",
        "src/components/ui/**",
        "src/lib/utils.ts",
        "src/schemas/**",
        "src/test/**",
      ],
    },
  },
});
