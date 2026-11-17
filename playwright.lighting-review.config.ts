import { defineConfig } from "@playwright/test";
import gameplay from "./playwright.g2f.config";
export default defineConfig({
  ...gameplay,
  outputDir: "docs/classroom-lighting-proof/runner-traces",
  use: { ...gameplay.use, baseURL: "http://127.0.0.1:4192" },
  webServer: {
    command:
      "node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4192 --strictPort --outDir dist-lighting-review",
    url: "http://127.0.0.1:4192",
    reuseExistingServer: true,
  },
});
