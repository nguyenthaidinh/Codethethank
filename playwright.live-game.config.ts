import { defineConfig } from "@playwright/test";
import gameplay from "./playwright.g2f.config";

/** Verify the same live source URL shared with the player. */
export default defineConfig({
  ...gameplay,
  outputDir: "test-results-live-game",
  use: { ...gameplay.use, baseURL: "http://127.0.0.1:5173", trace: "off" },
  webServer: {
    command: "npm run dev -- --port 5173 --strictPort",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true,
  },
});
