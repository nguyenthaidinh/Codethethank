import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

export default defineConfig({
  ...base,
  testMatch: "cinematic-g2-art.spec.ts",
  outputDir: "docs/art2r/proof/after/browser-video",
  use: { ...base.use, video: "off" },
  reporter: [["list"], ["html", { outputFolder: "docs/art2r/proof/after/hero-report", open: "never" }]],
});
