import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/menu-e2e",
  timeout: 60000,
  workers: 1,
  outputDir: "menu-artifacts/test-results",
  use: {
    baseURL: process.env.MENU_TEST_URL ?? "http://127.0.0.1:4187",
    headless: true,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --port 4187 --strictPort",
    url: "http://127.0.0.1:4187",
    reuseExistingServer: true,
  },
  reporter: [["list"]],
});
