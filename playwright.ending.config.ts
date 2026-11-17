import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/ending-e2e",
  timeout: 60000,
  expect: { timeout: 15000 },
  workers: 1,
  outputDir: "ending-artifacts/test-results",
  reporter: [["list"]],
  use: {
    baseURL: process.env.ENDING_TEST_URL ?? "http://127.0.0.1:4246",
    headless: true,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --port 4246 --strictPort",
    url: "http://127.0.0.1:4246",
    reuseExistingServer: true,
  },
});
