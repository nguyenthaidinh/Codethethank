import { defineConfig } from "@playwright/test";
import gameplay from "./playwright.g2f.config";

// A fixed build keeps cinematic timing checks independent of live source reloads.
export default defineConfig({
  ...gameplay,
  outputDir: "test-results-classroom-preview",
  use: { ...gameplay.use, baseURL: "http://127.0.0.1:5184", trace: "off" },
  webServer: {
    command:
      "npm run preview -- --outDir dist-classroom-setback-review --port 5184 --strictPort",
    url: "http://127.0.0.1:5184",
    reuseExistingServer: true,
  },
});
