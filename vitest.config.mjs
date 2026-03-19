import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "__tests__/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: [
      { find: "@/graphql", replacement: path.join(__dirname, "graphql") },
      { find: "@", replacement: path.join(__dirname, "src") },
    ],
  },
});
