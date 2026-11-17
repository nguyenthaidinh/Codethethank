import { defineConfig } from "@playwright/test";
import gameplay from "./playwright.g2f.config";
export default defineConfig({
  ...gameplay,
  outputDir: "docs/hand-face-proof/runner-traces",
  use: {
    ...gameplay.use,
    baseURL: "http://127.0.0.1:4217",
    // Runtime video is recorded separately; retain API/DOM error traces without
    // a second continuous screencast on the shared integrated GPU.
    trace: {
      mode: "retain-on-failure",
      screenshots: false,
      snapshots: true,
      sources: true,
    },
  },
  webServer: {
    command:
      "node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4217 --strictPort --outDir dist-acting-review",
    url: "http://127.0.0.1:4217",
    reuseExistingServer: true,
  },
});
