import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const CDN_PACKAGES =
  /^(react|react-dom|@emotion\/react|@emotion\/styled|@mui\/material|@mui\/icons-material|@tanstack\/react-query|zod)/;

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: ["**/.claude/**"],
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  build: {
    rollupOptions: {
      external: (id) => CDN_PACKAGES.test(id),
    },
  },
});
