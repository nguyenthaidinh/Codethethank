import { defineConfig } from "@playwright/test";
import menuConfig from "./playwright.menu.config";
export default defineConfig({
  ...menuConfig,
  testDir: "tests/e2e",
  testMatch: "cinematic-input.spec.ts",
  outputDir: "menu-artifacts/regression-results",
});
