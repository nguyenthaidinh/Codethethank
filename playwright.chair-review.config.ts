import { defineConfig } from "@playwright/test";
import gameplay from "./playwright.g2f.config";
export default defineConfig({
  ...gameplay,
  outputDir: "docs/ui-chair-polish-proof/runner-traces",
  use: { ...gameplay.use, baseURL: "http://127.0.0.1:4191" },
  webServer: {
    command:
      "node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4191 --strictPort --outDir dist-chair-review",
    url: "http://127.0.0.1:4191",
    reuseExistingServer: true,
  },
});
