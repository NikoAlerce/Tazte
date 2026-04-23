import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const srcPath = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.js"],
    globals: true,
    clearMocks: true,
  },
  resolve: {
    alias: {
      "@": srcPath,
    },
  },
});
