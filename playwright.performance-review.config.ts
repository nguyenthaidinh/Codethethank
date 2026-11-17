import { defineConfig } from "@playwright/test";
import gameplay from "./playwright.g2f.config";
export default defineConfig({
  ...gameplay,
  outputDir: "docs/character-performance-proof/runner-traces",
  use: { ...gameplay.use, baseURL: "http://127.0.0.1:4215" },
  webServer: {
    command:
      "node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4215 --strictPort --outDir dist-performance-review",
    url: "http://127.0.0.1:4215",
    reuseExistingServer: true,
  },
});
