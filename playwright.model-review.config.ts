import { defineConfig } from "@playwright/test";
import gameplay from "./playwright.g2f.config";
export default defineConfig({
  ...gameplay,
  outputDir: "docs/model-polish-proof/runner-traces",
  use: { ...gameplay.use, baseURL: "http://127.0.0.1:4216" },
  webServer: {
    command:
      "node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4216 --strictPort --outDir dist-model-review",
    url: "http://127.0.0.1:4216",
    reuseExistingServer: true,
  },
});

